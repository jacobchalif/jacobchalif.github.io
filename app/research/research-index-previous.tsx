import Link from "next/link";
import { SiteFooter, SiteHeader } from "../site-chrome";
import { researchProjects } from "../site-data";

/** Preserved Research index used before the July 2026 editorial redesign. */
export function PreviousResearchIndex() {
  return <main><SiteHeader />
    <section className="page-hero wrap"><p className="eyebrow"><span />Research</p><h1>Atmospheric histories,<br /><em>held in ice.</em></h1><p>Past changes in atmospheric composition offer a way to understand today&apos;s climate—and the processes that will shape its future.</p></section>
    <section className="project-list wrap">{researchProjects.map((project) => <Link href={`/research/${project.slug}`} className="project-row" key={project.slug}><div><p>{project.kicker}</p><h2>{project.title}</h2><span>{project.summary}</span></div><img src={project.image} alt={project.imageAlt} /><b>↗</b></Link>)}</section>
    <SiteFooter />
  </main>;
}
