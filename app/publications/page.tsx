import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../site-chrome";
import { publicationStatusLabel, publications } from "../publications-data";

export const metadata: Metadata = { title: "Publications" };

function AuthorList({ authors }: { authors: string }) {
  return <>{authors.split(/(J\. I\. Chalif|J\. Chalif)/g).map((part, index) =>
    part === "J. I. Chalif" || part === "J. Chalif"
      ? <strong className="publication-self" key={`${part}-${index}`}>{part}</strong>
      : part
  )}</>;
}

export default function Publications() {
  const pubs = publications.filter((publication) => publication.showWebsite);
  return <main><SiteHeader />
    <section className="page-hero compact publications-hero wrap"><h1>Publications</h1></section>
    <section className="publication-list wrap">{pubs.map((p) => <article className="publication" key={p.title}>
      <div><span>{p.year}</span>{publicationStatusLabel[p.status] && <small>{publicationStatusLabel[p.status]}</small>}</div>
      {p.doi ? <a className="doi-link" href={p.doi} aria-label={`Open DOI for ${p.title}`}>↗︎</a> : <span className="doi-spacer" />}
      <div>{p.doi ? <h2><a href={p.doi}>{p.title}</a></h2> : <h2>{p.title}</h2>}<p><AuthorList authors={p.authors} /></p><em>{p.journal}{p.highlightHref && <> · <a className="publication-highlight" href={p.highlightHref}>Editor’s Highlight</a></>}</em></div>
    </article>)}</section>
    <SiteFooter />
  </main>;
}
