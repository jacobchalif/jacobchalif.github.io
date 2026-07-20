import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../site-chrome";
import { researchProjects } from "../site-data";
import { ResearchModalLink } from "./research-modal-link";

export const metadata: Metadata = { title: "Research" };

const project = (slug: string) => researchProjects.find((item) => item.slug === slug)!;
const denali = {
  ...project("denali-begguya"),
  title: "North Pacific aerosol archives",
};
const oldest = {
  ...project("oldest-ice"),
  title: "Earth’s oldest ice",
  summary: "The NSF Center for Oldest Ice Exploration (COLDEX) is building a climate archive that reaches back millions of years before the 800,000-year continuous Antarctic ice core record.",
};
const extremes = {
  ...project("weather-extremes"),
  title: "U.S. climate variability",
  summary: "Long observational and reanalysis records shed light on how shifts in atmospheric circulation shape regional weather extremes and variability.",
};
const methods = {
  ...project("methods"),
  title: "Melting ice, analyzing geochemistry, and running models",
  summary: "My research navigates ice-core melter systems, trace metal and isotope geochemistry, large climate datasets, and atmospheric chemistry models.",
};

export default function Research() {
  return <main>
    <SiteHeader />
    <section className="page-hero research-hero wrap">
      <h1>Atmospheric change<br /><em>across timescales</em></h1>
      <p>Understanding how the atmosphere has changed over centuries to millennia provides context for the rapid changes occurring today. I use ice cores alongside atmospheric observations and models to interpret past environmental conditions, atmospheric chemistry, and climate variability.</p>
    </section>

    <section className="research-program research-program-north-pacific wrap">
      <div className="research-program-feature">
        <div className="research-program-copy">
          <h2>{denali.title}</h2>
          <p className="research-program-summary">{denali.summary}</p>
        </div>
        <figure>
          <img src={denali.image} alt={denali.imageAlt} />
          <figcaption>Eclipse Icefield, Yukon • 2026</figcaption>
        </figure>
      </div>

      <div className="research-strands">
        <ResearchModalLink slug="southeastern-siberian-wildfire">
          <h3>Siberian wildfire</h3>
          <p>Reconstructing 1,200 years of southeastern Siberian fire and the seasonal climate dynamics that control burning.</p>
          <b className="strand-action">Read more here <span>→</span></b>
        </ResearchModalLink>
        <ResearchModalLink slug="marine-sulfur-cycle">
          <h3>Marine sulfur cycle</h3>
          <p>Separating biological change from pollution-driven shifts in atmospheric oxidation and methanesulfonic acid (MSA).</p>
          <b className="strand-action">Read more here <span>→</span></b>
        </ResearchModalLink>
        <ResearchModalLink slug="anthropogenic-pollution">
          <h3>Anthropogenic pollution</h3>
          <p>Tracing industrial emissions (Pb, nitrate, PFAS) that reach the remote North Pacific atmosphere.</p>
          <b className="strand-action">Read more here <span>→</span></b>
        </ResearchModalLink>
      </div>
    </section>

    <section id="oldest-ice" className="research-program research-program-oldest wrap">
      <div className="research-program-feature">
        <figure>
          <img src={oldest.image} alt={oldest.imageAlt} />
          <figcaption>Allan Hills, Antarctica • 2024</figcaption>
        </figure>
        <div className="research-program-copy">
          <h2>{oldest.title}</h2>
          <p className="research-program-summary">{oldest.summary}</p>
        </div>
      </div>

      <div className="research-strands">
        <ResearchModalLink id="impurity-geochemistry" slug="impurity-geochemistry-blue-ice">
          <h3>Impurity geochemistry at blue ice areas</h3>
          <p>Performing a variety of chemical measurements to evaluate how blue ice areas archive climate information.</p>
          <b className="strand-action">Read more here <span>→</span></b>
        </ResearchModalLink>
        <ResearchModalLink slug="fine-scale-layering-oldest-ice">
          <h3>Fine-scale layering in oldest ice</h3>
          <p>Resolving cm-scale stratigraphy to understand how folding and basal processes alter climate signals in ancient ice.</p>
          <b className="strand-action">Read more here <span>→</span></b>
        </ResearchModalLink>
      </div>
    </section>

    <section className="research-program research-program-extremes wrap">
      <div className="research-program-feature">
        <div className="research-program-copy">
          <h2>{extremes.title}</h2>
          <p className="research-program-summary">{extremes.summary}</p>
        </div>
        <figure>
          <video className="research-program-video" autoPlay muted loop playsInline preload="metadata" poster="/images/jet-stream-print-res.jpg">
            <source src="/videos/jetstream-loop.mp4" type="video/mp4" />
          </video>
          <img className="research-program-video-fallback" src="/images/jet-stream-print-res.jpg" alt="Polar jet stream flowing across North America" />
          <figcaption>NASA • Jet Stream</figcaption>
        </figure>
      </div>

      <div className="research-strands">
        <ResearchModalLink slug="polar-jet-stream-waviness">
          <h3>Jet stream waviness</h3>
          <p>Reconstructing changes in polar jet stream waviness to understand how jet stream variability enhanced the U.S. winter &ldquo;warming hole.&rdquo;</p>
          <b className="strand-action">Read more here <span>→</span></b>
        </ResearchModalLink>
        <ResearchModalLink slug="northeastern-temperature-extremes">
          <h3>Northeastern temperature extremes</h3>
          <p>Understanding how winter cold snaps and summer heat waves are changing across the northeastern United States.</p>
          <b className="strand-action">Read more here <span>→</span></b>
        </ResearchModalLink>
      </div>
    </section>

    <SiteFooter />
  </main>;
}
