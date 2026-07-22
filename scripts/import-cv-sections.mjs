import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.resolve(process.env.CV_SOURCE_TEX || "/Users/jacobchalif/Downloads/main.tex");
const outputPath = path.join(projectRoot, "content", "cv-sections.json");
const source = await readFile(sourcePath, "utf8");
const matches = [...source.matchAll(/^[ \t]*\\section\{\\textbf\{([^}]+)\}.*$/gm)]
  .filter((match) => !source.slice(Math.max(0, match.index - 2), match.index).includes("%"));

const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const sections = [{
  id: "document-profile",
  title: "Document setup & profile",
  content: source.slice(0, matches[0].index),
}];

let publicationPlaceholderAdded = false;
for (let index = 0; index < matches.length; index += 1) {
  const match = matches[index];
  const next = matches[index + 1];
  const title = match[1];
  const content = source.slice(match.index, next?.index ?? source.length);
  if (title === "Publications" || title === "Publications in Review/Prep") {
    if (!publicationPlaceholderAdded) {
      sections.push({ id: "publications", title: "Publications", content: "{{PUBLICATIONS}}\n" });
      publicationPlaceholderAdded = true;
    }
    continue;
  }
  sections.push({ id: slug(title), title, content });
}

await writeFile(outputPath, `${JSON.stringify({ version: 1, sourcePath, sections }, null, 2)}\n`, "utf8");
console.log(`Imported ${sections.length - 1} CV sections plus the document profile into ${outputPath}`);
