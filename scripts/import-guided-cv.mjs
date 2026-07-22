import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.resolve(process.env.CV_SOURCE_TEX || "/Users/jacobchalif/Downloads/main.tex");
const source = await readFile(sourcePath, "utf8");

function section(name, nextName) {
  const startToken = `\\section{\\textbf{${name}}`;
  const start = source.indexOf(startToken);
  const end = nextName ? source.indexOf(`\\section{\\textbf{${nextName}}`, start + 1) : source.indexOf("\\end{document}", start);
  return source.slice(start, end < 0 ? source.length : end);
}

function argsAt(text, position, count) {
  const args = [];
  let cursor = text.indexOf("{", position);
  while (args.length < count && cursor >= 0) {
    let depth = 0;
    const start = cursor + 1;
    for (; cursor < text.length; cursor += 1) {
      if (text[cursor] === "{" && text[cursor - 1] !== "\\") depth += 1;
      if (text[cursor] === "}" && text[cursor - 1] !== "\\") depth -= 1;
      if (depth === 0) { args.push(text.slice(start, cursor)); cursor += 1; break; }
    }
    while (/\s/.test(text[cursor] || "")) cursor += 1;
    if (args.length < count && text[cursor] !== "{") cursor = text.indexOf("{", cursor);
  }
  return { args, end: cursor };
}

function clean(value = "") {
  let result = value;
  result = result.replace(/\\href\{([^{}]+)\}\{([^{}]+)\}/g, "[$2]($1)");
  result = result.replace(/\\(?:vspace|hspace)\*?\{[^}]*\}/g, "");
  for (let i = 0; i < 5; i += 1) result = result.replace(/\\(?:textbf|textit|small|footnotesize)\{([^{}]*)\}/g, "$1");
  result = result.replace(/SO\$_4\$/g, "SO4").replace(/\\&/g, "&").replace(/\\%/g, "%").replace(/\\\$/g, "$");
  result = result.replace(/\\textgreater\{\}/g, ">").replace(/[{}]/g, "");
  result = result.replace(/\\[a-zA-Z]+/g, "");
  return result.replace(/(\d{4})\s*-\s*(\d{4}|Present)/g, "$1–$2").replace(/\s+/g, " ").trim();
}

function commands(text, command, count) {
  const results = [];
  let cursor = 0;
  while ((cursor = text.indexOf(`\\${command}`, cursor)) >= 0) {
    const parsed = argsAt(text, cursor + command.length + 1, count);
    if (parsed.end <= cursor || parsed.args.length !== count) break;
    results.push({ position: cursor, end: parsed.end, args: parsed.args.map(clean) });
    cursor = parsed.end;
  }
  return results;
}

function bulletsBetween(text, start, end) {
  const area = text.slice(start, end);
  return [...area.matchAll(/\\item\s+([\s\S]*?)(?=\\item|\\resumeItemListEnd)/g)].map((match) => clean(match[1])).filter(Boolean);
}

function timeline(text, command) {
  const items = commands(text, command, 4);
  return items.map((item, index) => ({
    id: `${command}-${index + 1}`,
    organization: item.args[0], location: item.args[1], role: item.args[2], date: item.args[3],
    bullets: bulletsBetween(text, item.end, items[index + 1]?.position ?? text.length),
  }));
}

function paired(text, prefix) {
  return commands(text, "resumeSubItem", 2).map((item, index) => ({ id: `${prefix}-${index + 1}`, label: item.args[0], text: item.args[1] }));
}

function numbered(text, prefix) {
  const matches = [...text.matchAll(/\\item\[\\textbf\{([^}]*)\}\]\s*([\s\S]*?)(?=\\item\[|\\end\{enumerate\})/g)];
  return matches.map((match, index) => ({ id: `${prefix}-${index + 1}`, label: clean(match[1]), text: clean(match[2]) }));
}

function abstracts(text) {
  text = text.slice(0, text.indexOf("\\end{enumerate}") + "\\end{enumerate}".length);
  const markers = [...text.matchAll(/\\item(?:\[([^\]]*)\])?\s*/g)];
  let year = "";
  return markers.map((marker, index) => {
    const label = clean(marker[1] || "");
    if (/^\d{4}$/.test(label)) year = label;
    return { id: `abstract-${index + 1}`, year, citation: clean(text.slice(marker.index + marker[0].length, markers[index + 1]?.index ?? text.indexOf("\\end{enumerate}", marker.index))) };
  }).filter((entry) => entry.citation);
}

const fieldwork = timeline(section("Field Research", "Professional Service"), "resumeProject").map((entry) => ({
  id: entry.id, location: entry.organization, date: entry.role || entry.date, bullets: entry.bullets,
}));
const headerArea = source.slice(source.indexOf("\\begin{document}"), source.indexOf("\\section{\\textbf{Education}"));
const name = clean(headerArea.match(/\\Huge\\textbf\{([^}]*)\}/)?.[1] || "Jacob Chalif");
const links = [...headerArea.matchAll(/\\href\{([^}]*)\}\{([^}]*)\}/g)];

const data = {
  version: 2,
  profile: { name, email: links.find((match) => match[1].startsWith("mailto:"))?.[1].replace("mailto:", "") || "", website: links.find((match) => match[1].startsWith("http"))?.[1] || "" },
  education: timeline(section("Education", "Research Experience"), "resumeSubheading"),
  researchExperience: timeline(section("Research Experience", "Publications"), "resumeSubheading"),
  funding: numbered(section("Research Funding", "Field Research"), "funding"),
  fieldwork,
  service: paired(section("Professional Service", "Honors and Awards"), "service"),
  awards: paired(section("Honors and Awards", "Science Outreach"), "award"),
  outreach: paired(section("Science Outreach", "Skills and Certifications"), "outreach"),
  skills: paired(section("Skills and Certifications", "Local Climate and Environment Engagement"), "skill"),
  engagement: paired(section("Local Climate and Environment Engagement", "Undergraduate Student Mentoring"), "engagement"),
  mentoring: paired(section("Undergraduate Student Mentoring", "Conference Abstracts"), "mentoring").map((entry) => {
    const combined = entry.label || entry.text;
    const [name, ...details] = combined.split(",");
    return { id: entry.id, name: name.trim(), details: details.join(",").trim().replace(/Dartmouth'(\d{2})/g, "Dartmouth ’$1") };
  }),
  conferenceAbstracts: abstracts(section("Conference Abstracts")),
};

await writeFile(path.join(root, "content", "cv.json"), `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(`Imported guided CV content from ${sourcePath}`);
console.log(Object.entries(data).filter(([, value]) => Array.isArray(value)).map(([key, value]) => `${key}: ${value.length}`).join(", "));
