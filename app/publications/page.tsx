import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../site-chrome";

export const metadata: Metadata = { title: "Publications" };

const pubs = [
  {
    year: "2026", status: "In review",
    title: "Seasonal climate drivers of southeastern Siberian wildfire over the last 1,200 years",
    authors: "J. I. Chalif, E. C. Osterberg, J. E. Dibb, R. Edwards, D. G. Ferris, C. H. Guiterman, S. Hantson, J. R. Jasmann, U. A. Jongebloed, J. O. Kaplan, L. R. Kirkpatrick, B. G. Koffman, K. J. Kreutz, M. T. Leung, M. Lonergan, M. L. Schachterle, E. Scheuer, N. M. Kehrwald, E. S. Saltzman, C. P. Wake, and D. A. Winski",
    journal: "In review",
  },
  {
    year: "2026", status: "In review",
    title: "Dust Record from Allan Hills Blue Ice: Towards Extending the Archive to 4000 ka",
    authors: "A. Choi, A. J. Carter, J. Marks-Peterson, S. Shackleton, J. Higgins, E. J. Brook, L. Kirkpatrick, J. Chalif, and S. M. Aarons",
    journal: "In review",
  },
  {
    year: "2026", status: "In review",
    title: "Fidelity and stratigraphy of the Antarctic Allan Hills old ice archive from Continuous Flow Analysis",
    authors: "A. Hudak, A. Banerjee, C. Buizert, E. Brook, M. Kalk, L. Davidge, A. J. Schauer, E. J. Steig, N. Brown, L. Kirkpatrick, J.-M. Manos, J. I. Chalif, E. Osterberg, M. H. M. Miranda, E. Saltzman, Y. Yan, V. Hishamunda, and J. Higgins",
    journal: "In review",
  },
  {
    year: "2026", status: "In review",
    title: "Disentangling source versus transport effects on atmospheric dust in alpine ice and snow",
    authors: "B. G. Koffman, J. I. Chalif, S. Birkel, H. L. Brooks, D. A. Winski, G. Lewis, D. Polashenski, and E. C. Osterberg",
    journal: "In review",
  },
  {
    year: "2025",
    title: "A wavier polar jet stream contributed to the mid-20th century winter warming hole in the United States",
    authors: "J. I. Chalif, E. C. Osterberg, and T. L. Partridge",
    journal: "AGU Advances 6, e2024AV001399",
    doi: "https://doi.org/10.1029/2024AV001399",
    highlightHref: "https://eos.org/editor-highlights/the-mid-20th-century-winter-cooling-in-the-eastern-u-s-explained",
  },
  {
    year: "2025",
    title: "Dimethyl sulfide chemistry over the industrial era: comparison of key oxidation mechanisms and long-term observations",
    authors: "U. A. Jongebloed, J. I. Chalif, L. Tashmim, W. C. Porter, K. H. Bates, Q. Chen, E. C. Osterberg, B. G. Koffman, J. Cole-Dai, D. A. Winski, D. G. Ferris, K. J. Kreutz, C. P. Wake, and B. Alexander",
    journal: "Atmospheric Chemistry and Physics 25, 4083–4106",
    doi: "https://doi.org/10.5194/acp-25-4083-2025",
  },
  {
    year: "2025",
    title: "Measurement of snowpack density, grain size, and black carbon concentration using time-domain diffuse optics",
    authors: "C. A. Henley, C. R. Meyer, J. I. Chalif, J. L. Hollmann, and R. Raskar",
    journal: "Journal of Glaciology 71, e6",
    doi: "https://doi.org/10.1017/jog.2024.81",
  },
  {
    year: "2024",
    title: "Pollution drives multidecadal decline in subarctic methanesulfonic acid",
    authors: "J. I. Chalif, U. A. Jongebloed, E. C. Osterberg, B. G. Koffman, B. Alexander, D. A. Winski, D. J. Polashenski, K. Stamieszkin, D. G. Ferris, K. J. Kreutz, C. P. Wake, and J. Cole-Dai",
    journal: "Nature Geoscience 17, 1016–1021",
    doi: "https://doi.org/10.1038/s41561-024-01543-w",
  },
];

function AuthorList({ authors }: { authors: string }) {
  return <>{authors.split(/(J\. I\. Chalif|J\. Chalif)/g).map((part, index) =>
    part === "J. I. Chalif" || part === "J. Chalif"
      ? <strong className="publication-self" key={`${part}-${index}`}>{part}</strong>
      : part
  )}</>;
}

export default function Publications() {
  return <main><SiteHeader />
    <section className="page-hero compact publications-hero wrap"><h1>Publications</h1></section>
    <section className="publication-list wrap">{pubs.map((p) => <article className="publication" key={p.title}>
      <div><span>{p.year}</span>{p.status && <small>{p.status}</small>}</div>
      {p.doi ? <a className="doi-link" href={p.doi} aria-label={`Open DOI for ${p.title}`}>↗</a> : <span className="doi-spacer" />}
      <div>{p.doi ? <h2><a href={p.doi}>{p.title}</a></h2> : <h2>{p.title}</h2>}<p><AuthorList authors={p.authors} /></p><em>{p.journal}{p.highlightHref && <> · <a className="publication-highlight" href={p.highlightHref}>Editor’s Highlight</a></>}</em></div>
    </article>)}</section>
    <SiteFooter />
  </main>;
}
