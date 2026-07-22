import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cvPath = path.join(root, "content", "cv.json");
const cv = JSON.parse(await readFile(cvPath, "utf8"));

const corrections = [
  [/Worskhop/g, "Workshop"],
  [/Seatle/g, "Seattle"],
  [/Jongbeloed/g, "Jongebloed"],
  [/Stamieszkim/g, "Stamieszkin"],
  [/Chalif\., J\./g, "Chalif, J."],
  [/Chen, O\./g, "Chen, Q."],
  [/\bMatlab\b/g, "MATLAB"],
  [/re-interpreting/g, "reinterpreting"],
  [/\bfield work\b/g, "fieldwork"],
  [/minority serving/g, "minority-serving"],
  [/UGAR funded/g, "UGAR-funded"],
  [/\bLab assistant\b/g, "lab assistant"],
];

function normalizeText(value) {
  if (typeof value !== "string") return value;
  let result = value.replace(/(\d{4})\s*-\s*(\d{4}|Present)/g, "$1–$2");
  for (const [pattern, replacement] of corrections) result = result.replace(pattern, replacement);
  return result;
}

function visit(value) {
  if (Array.isArray(value)) return value.map(visit);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, visit(item)]));
  return normalizeText(value);
}

const normalized = visit(cv);
normalized.mentoring = normalized.mentoring.map((entry) => {
  if (entry.name || !entry.details.includes(",")) return entry;
  const [name, ...details] = entry.details.split(",");
  return { ...entry, name: name.trim(), details: details.join(",").trim().replace(/Dartmouth'(\d{2})/g, "Dartmouth ’$1") };
});
for (const section of ["service", "awards", "outreach", "skills", "engagement"]) {
  normalized[section] = normalized[section].map((entry) => ({ ...entry, label: entry.label.replace(/[:,;]\s*$/, "") }));
}

await writeFile(cvPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
console.log("Normalized CV names, date ranges, capitalization, and known spelling errors.");
