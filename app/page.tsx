import Link from "next/link";
import { SiteFooter, SiteHeader } from "./site-chrome";
import { ResearchModalLink } from "./research/research-modal-link";

const selectedResearch = [
  { title: "Siberian wildfire", tag: "Paleo-aerosols", href: "/research/southeastern-siberian-wildfire", modalSlug: "southeastern-siberian-wildfire" },
  { title: "Marine sulfur cycle", tag: "Atmospheric chemistry", href: "/research/marine-sulfur-cycle", modalSlug: "marine-sulfur-cycle" },
  { title: "Oldest ice", tag: "COLDEX", href: "/research/impurity-geochemistry-blue-ice", modalSlug: "impurity-geochemistry-blue-ice" },
  { title: "Polar jet stream", tag: "Climate dynamics", href: "/research/polar-jet-stream-waviness", modalSlug: "polar-jet-stream-waviness" },
];

export default function Home() {
  return (
    <main>
      <section className="home-hero">
        <img className="home-hero-image" src="/images/eclipse-hero.webp" alt="" width="2560" height="1920" fetchPriority="high" decoding="async" />
        <SiteHeader inverse />
        <div className="hero-location">Eclipse Icefield · Yukon, Canada</div>
        <div className="hero-grid wrap">
          <div className="hero-name-block reveal">
            <h1>Jacob <em>Chalif</em></h1>
            <div className="hero-role hero-role-mobile">PhD Student <span>•</span> University of Washington <span>•</span> Atmospheric and Climate Sciences</div>
          </div>
          <div className="hero-statement reveal delay-1">
            <div className="hero-role hero-role-desktop">PhD Student <span>•</span> University of Washington <span>•</span> Atmospheric and Climate Sciences</div>
            <p>Reading the atmosphere&apos;s past to better understand our changing climate.</p>
          </div>
        </div>
      </section>

      <section className="home-intro">
        <div className="portrait-panel">
          <img src="/images/jacob-lab.webp" alt="Jacob Chalif beside an ice-core melter in the laboratory" width="800" height="1200" loading="lazy" decoding="async" />
        </div>
        <div className="premise-panel">
          <h2>How can past changes in atmospheric composition inform modern climate change?</h2>
          <p className="intro-copy">I use ice cores, atmospheric models, and climate observations to investigate how fire, pollution, and circulation have shaped Earth&apos;s atmosphere. At the University of Washington, I am a PhD student co-advised by Becky Alexander and Alex Turner. Before that, I worked with Erich Osterberg in the <a href="https://icecore.host.dartmouth.edu/">Dartmouth ice core lab</a>.</p>
          <div className="intro-actions">
            <Link className="text-link" href="/research">Explore my research <span>↗︎</span></Link>
            <Link className="text-link" href="/cv">View CV <span>↗︎</span></Link>
          </div>
        </div>
        <div className="research-index">
          <div className="index-heading"><span>Selected research</span><Link href="/research">View all projects ↗︎</Link></div>
          {selectedResearch.map((project) => {
            const content = <>
              <strong>{project.title}</strong>
              <span className="index-tag">{project.tag}</span>
              <span className="index-arrow">↗︎</span>
            </>;
            return project.modalSlug
              ? <ResearchModalLink className="index-row" slug={project.modalSlug} key={project.title}>{content}</ResearchModalLink>
              : <Link className="index-row" href={project.href} key={project.title}>{content}</Link>;
          })}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
