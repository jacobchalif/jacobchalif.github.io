import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(projectRoot, "content", "publications.json");
const sectionsPath = path.join(projectRoot, "content", "cv-sections.json");
const cvPath = path.join(projectRoot, "content", "cv.json");
const outputDir = path.join(projectRoot, "cv", "generated");
const outputPath = path.join(outputDir, "main.tex");

const escapeLatex = (value = "") => [...value].map((character) => ({
  "\\": "\\textbackslash{}", "&": "\\&", "%": "\\%", "$": "\\$", "#": "\\#", "_": "\\_",
  "{": "\\{", "}": "\\}", "~": "\\textasciitilde{}", "^": "\\textasciicircum{}",
  "–": "--", "—": "---", "“": "``", "”": "''", "’": "'", "•": "\\textbullet{}",
}[character] ?? character)).join("");

function richText(value = "") {
  let output = "";
  let cursor = 0;
  for (const match of value.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)) {
    output += escapeLatex(value.slice(cursor, match.index));
    output += `\\href{${match[2]}}{${escapeLatex(match[1])}}`;
    cursor = match.index + match[0].length;
  }
  return output + escapeLatex(value.slice(cursor));
}

function emphasizeSelf(value) {
  const escaped = richText(value);
  return escaped.replace(/J\. I\. Chalif|J\. Chalif/g, (name) => `\\textbf{${name}}`);
}

const asSentence = (value) => /[.!?]$/.test(value) ? value : `${value}.`;

function publishedEntry(publication, number) {
  const title = publication.doi
    ? `\\href{${publication.doi}}{\\textbf{${escapeLatex(publication.title)}}}`
    : `\\textbf{${escapeLatex(publication.title)}}`;
  const highlight = publication.highlightHref
    ? ` (Selected for an \\href{${publication.highlightHref}}{Editor's Highlight}.)`
    : "";
  return `\\item[\\textbf{${number}}] ${emphasizeSelf(publication.authors)} (${escapeLatex(publication.year)}). ${title}. In \\textit{\\textbf{${escapeLatex(publication.journal)}}}.${highlight}`;
}

function pendingEntry(publication) {
  const label = publication.status === "in_review" ? "R" : `P${publication.year.slice(-2)}`;
  const note = publication.journal || (publication.status === "in_review" ? "In review" : "In preparation");
  return `\\item[\\textbf{${label}}] ${asSentence(emphasizeSelf(publication.authors))} \\textbf{${asSentence(escapeLatex(publication.title))}} \\textit{${asSentence(escapeLatex(note))}}`;
}

const publications = JSON.parse(await readFile(dataPath, "utf8")).filter((entry) => entry.showCv);
const published = publications.filter((entry) => entry.status === "published");
const pending = publications.filter((entry) => entry.status !== "published");
const generatedSection = String.raw`\section{\textbf{Publications}}
\begin{enumerate}[leftmargin=*, labelsep=0.5em, align=left, widest={[\textbf{S.1}]}, itemindent=0em, label={\textbf{[\arabic*]}]}]

${published.map((entry, index) => publishedEntry(entry, published.length - index)).join("\n\n")}

\end{enumerate}

\section{\textbf{Publications in Review/Prep} \hfill \textcolor{gray}{\scriptsize R=In review/revision, Pxx=In prep for submission in 20xx}}
\begin{enumerate}[leftmargin=*, labelsep=0.5em, align=left, widest={[\textbf{S.1}]}, itemindent=0em, label={\textbf{[\arabic*]}]}]

${pending.map(pendingEntry).join("\n\n")}

\end{enumerate}

`;

const cv = JSON.parse(await readFile(cvPath, "utf8"));
const legacyDocument = JSON.parse(await readFile(sectionsPath, "utf8"));
const profileTemplate = legacyDocument.sections.find((section) => section.id === "document-profile").content;
const preamble = profileTemplate.slice(0, profileTemplate.indexOf("\\begin{document}"))
  .replace("\\usepackage{fontawesome5}\n", "")
  .replace("\\geometry{left=1.4cm, top=0.8cm, right=1.2cm, bottom=1.2cm}", "\\geometry{left=1.4cm, top=1.55cm, right=1.2cm, bottom=2.2cm}")
  .replace("\\setlength{\\footskip}{5pt}", "\\setlength{\\footskip}{12pt}\n\\setlength{\\headheight}{14pt}")
  .replace(
    "\\fancyfoot[R]{\\small\\textcolor{gray}{\\lastupdated}}",
    [
      "\\usepackage{eso-pic}",
      "% Place the visible update stamp about 8 mm below the top edge.",
      "\\AddToShipoutPictureFG{%",
      "  \\AtPageUpperLeft{%",
      "    \\put(\\LenToUnit{\\dimexpr\\paperwidth-1.2cm\\relax},\\LenToUnit{-10mm}){%",
      "      \\makebox(0,0)[r]{\\small\\textcolor{gray}{\\textsc{\\lastupdated}}}%",
      "    }%",
      "  }%",
      "}",
    ].join("\n"),
  )
  .replace(
    "\\fancyfoot[L]{\\small\\textcolor{black}{Page \\thepage\\ of \\pageref{LastPage}}}",
    [
      "% Mirror the update stamp at the physical bottom edge and center it.",
      "\\AddToShipoutPictureFG{%",
      "  \\AtPageLowerLeft{%",
      "    \\put(\\LenToUnit{\\dimexpr\\paperwidth/2\\relax},\\LenToUnit{10mm}){%",
      "      \\makebox(0,0)[c]{\\small\\textcolor{gray}{\\textsc{Page \\thepage\\ of \\pageref*{LastPage}}}}%",
      "    }%",
      "  }%",
      "}",
    ].join("\n"),
  )
  .replace("\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}\\vspace{2mm}}", "\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}")
  .replace("\\newcommand{\\resumeHeadingSkillEnd}{\\end{itemize}\\vspace{-2mm}}", "\\newcommand{\\resumeHeadingSkillEnd}{\\end{itemize}}")
  .concat("\n% One spacing rule for every CV section.\n\\titleformat{\\section}{\\scshape\\raggedright\\large}{}{0em}{}[\\color{black}\\titlerule]\n\\titlespacing*{\\section}{0pt}{5mm}{2mm}\n");
const bullets = (items) => items.length ? `\\small{\n\\resumeItemListStart\n${items.map((item) => `  \\item ${richText(item)}`).join("\n")}\n\\resumeItemListEnd\n}` : "";
const timelineSection = (title, items) => `\\section{\\textbf{${title}}}\n\\begin{itemize}[leftmargin=0pt,label={},labelsep=0pt]\n${items.map((item) => `\\resumeSubheading\n{${richText(item.organization)}}{${richText(item.location)}}\n{${richText(item.role)}}{${richText(item.date)}}\n${bullets(item.bullets)}`).join("\n\n")}\n\\end{itemize}\n`;
const pairedSection = (title, items) => `\\section{\\textbf{${title}}}\n\\resumeHeadingSkillStart\n${items.map((item) => `  \\resumeSubItem{${richText(item.label.replace(/[:,;]\\s*$/, ""))}:}\n    {${richText(item.text)}}`).join("\n")}\n\\resumeHeadingSkillEnd\n`;
const numberedSection = (title, items) => `\\section{\\textbf{${title}}}\n\\begin{enumerate}[leftmargin=*, labelsep=0.5em, align=left, widest={[\\textbf{S.1}]}, itemindent=0em, label={\\textbf{[\\arabic*]}]}]\n${items.map((item) => `\\item[\\textbf{${richText(item.label)}}] ${richText(item.text)}`).join("\n\n")}\n\\end{enumerate}\n`;
const profile = `\\begin{document}\n\\headerfontiii\n\\begin{center}\n    {\\Huge\\textbf{${richText(cv.profile.name)}}}\n\\end{center}\n\\vspace{-6mm}\n\\begin{center}\n    \\small{\\href{mailto:${cv.profile.email}}{${escapeLatex(cv.profile.email)}} \\;\\textbullet{}\\; \\href{${cv.profile.website}}{${escapeLatex(cv.profile.website.replace("https://", "").replace("http://", ""))}}}\n\\end{center}\n\\vspace{-4mm}\n`;
const fieldwork = `\\section{\\textbf{Field Research}}\n\\resumeSubHeadingListStart\n${cv.fieldwork.map((item) => `\\resumeProject\n  {${richText(item.location)}}{}\n  {${richText(item.date)}}{}\n\\vspace{-4mm}\n${bullets(item.bullets)}`).join("\n")}\n\\resumeSubHeadingListEnd\n`;
const mentoring = `\\section{\\textbf{Undergraduate Student Mentoring}}\n\\resumeHeadingSkillStart\n${cv.mentoring.map((item) => `  \\resumeSubItem{${richText(item.name)}:}\n    {${richText(item.details)}}`).join("\n")}\n\\resumeHeadingSkillEnd\n`;
const skills = `\\section{\\textbf{Skills and Certifications}}\n\\resumeHeadingSkillStart\n${cv.skills.map((item) => `  \\resumeSubItem{${richText(item.label.replace(/[:,;]\\s*$/, ""))}:}\n    {${richText(item.text)}}`).join("\n")}\n\\resumeHeadingSkillEnd\n`;
const abstractCitation = (item) => {
  const event = [item.conference, item.location].filter(Boolean).join(", ");
  const type = item.presentationType ? ` (${item.presentationType})` : "";
  return `${item.authors}, ${item.year}. ${asSentence(item.title)} ${event}.${type}`;
};
const abstracts = `\\section{\\textbf{Conference Abstracts}}\n\\small{\n\\begin{enumerate}[leftmargin=*, labelsep=0.5em, align=left, widest={[\\textbf{S.1}]}, itemindent=0em, label={\\textbf{[\\arabic*]}]}]\n${cv.conferenceAbstracts.map((item, index, list) => `\\item${index === 0 || item.year !== list[index - 1].year ? `[\\textbf{${escapeLatex(item.year)}}]` : "[]"} ${emphasizeSelf(abstractCitation(item))}`).join("\n\n")}\n\\end{enumerate}\n}\n`;
const source = [preamble, profile,
  timelineSection("Education", cv.education),
  timelineSection("Research Experience", cv.researchExperience),
  generatedSection,
  numberedSection("Research Funding", cv.funding),
  fieldwork,
  pairedSection("Professional Service", cv.service),
  pairedSection("Honors and Awards", cv.awards),
  pairedSection("Science Outreach", cv.outreach),
  skills,
  pairedSection("Local Climate and Environment Engagement", cv.engagement),
  mentoring, abstracts, "\\end{document}\n",
].join("\n");
if (!source.includes("\\begin{document}") || !source.includes("\\end{document}")) throw new Error("The saved CV sections do not form a complete LaTeX document.");
await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, source, "utf8");
console.log(`Generated ${outputPath}`);
console.log(`${published.length} published and ${pending.length} pending publications included.`);
console.log("Compile cv/generated/main.tex in your LaTeX editor to produce the PDF.");
