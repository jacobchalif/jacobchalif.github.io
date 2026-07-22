import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cvPath = path.join(projectRoot, "content", "cv.json");
const cv = JSON.parse(await readFile(cvPath, "utf8"));
const conferenceStart = /[.!?] (?=(?:International Partnerships|Goldschmidt|EGU General Assembly|AGU \d{4} Fall Meeting|ICECAP Workshop|\d+(?:st|nd|rd|th) Annual US Ice Core|GEOS-Chem Meeting|\d+(?:st|nd|rd|th) International Arctic Workshop|\d+(?:st|nd|rd|th) US Ice Core|\d+(?:st|nd|rd|th) Open Science Meeting))/;

function parseCitation(entry) {
  if (!entry.citation) {
    const embeddedLocation = entry.conference.match(/^(.*)\. ([^,]+, (?:[A-Z]{2}|Canada|Austria|Switzerland))$/);
    return embeddedLocation ? { ...entry, conference: embeddedLocation[1], location: embeddedLocation[2] } : entry;
  }
  const yearMarker = entry.citation.match(/^(.*?), (20\d{2})\. (.*)$/);
  if (!yearMarker) throw new Error(`Could not find authors/year in ${entry.id}`);
  const [, authors, year, remainder] = yearMarker;
  const split = remainder.search(conferenceStart);
  if (split < 0) throw new Error(`Could not find conference in ${entry.id}`);
  const titleEnd = remainder[split] === "." ? split : split + 1;
  const title = remainder.slice(0, titleEnd);
  let event = remainder.slice(split + 2).replace(/\.$/, "");
  let presentationType = "";
  const typeMatch = event.match(/\. \((Talk|Poster)\)$/);
  if (typeMatch) {
    presentationType = typeMatch[1];
    event = event.slice(0, typeMatch.index);
  }
  let location = "";
  const locationMatch = event.match(/, ([^,]+, (?:[A-Z]{2}|Canada|Austria|Switzerland))$/);
  if (locationMatch) {
    location = locationMatch[1];
    event = event.slice(0, locationMatch.index);
  } else if (event.endsWith(", virtual")) {
    location = "Virtual";
    event = event.slice(0, -9);
  }
  return { id: entry.id, year, authors, title, conference: event, location, presentationType };
}

cv.conferenceAbstracts = cv.conferenceAbstracts.map(parseCitation);
await writeFile(cvPath, `${JSON.stringify(cv, null, 2)}\n`, "utf8");
console.log(`Migrated ${cv.conferenceAbstracts.length} conference abstracts to guided fields.`);
