import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../site-chrome";
import { FieldMap } from "./field-map";

export const metadata: Metadata = { title: "Fieldwork" };

const trips = [
  {
    place: "Eclipse Icefield",
    region: "St. Elias Mountains · Yukon, Canada",
    date: "May–June 2026",
    latitude: 60.8343,
    longitude: -139.8406,
    view: "eclipse" as const,
    images: [
      { src: "/images/eclipse-field-4997.jpeg", alt: "Evening light over the Eclipse Icefield" },
      { src: "/images/eclipse-field-5164.jpeg", alt: "Fieldwork on the Eclipse Icefield" },
      { src: "/images/eclipse-field-5136.jpeg", alt: "Field camp on the Eclipse Icefield" },
      { src: "/images/eclipse-field-5092.jpeg", alt: "Ice-core field operations at Eclipse Icefield" },
      { src: "/images/eclipse-field-5210.jpeg", alt: "Field camp in the St. Elias Mountains" },
    ],
    purpose: "Developing a new high-resolution ice-core record of North Pacific aerosol transport",
    whatWeDid: "We recovered four shallow firn cores (up to 20 m deep) and snowpit samples that preserve a high-resolution record of atmospheric deposition. These samples will be analyzed for a wide range of natural and human-made aerosols—including dust, wildfire soot, industrial pollution, marine aerosols, and emerging contaminants such as PFAS (\"forever chemicals\")—to better understand how the atmosphere over the North Pacific has changed in recent years. At the same time, other members of the team mapped the glacier's internal structure and ice flow using multiple radar systems, providing critical context for interpreting the ice-core records.",
  },
  {
    place: "Allan Hills",
    region: "Victoria Land, East Antarctica",
    date: "November 2024–January 2025",
    latitude: -76.73243,
    longitude: 159.3562,
    view: "antarctica" as const,
    images: [
      { src: "/images/allan-field-8790.jpeg", alt: "COLDEX operations on the Allan Hills blue ice" },
      { src: "/images/allan-field-8817.jpeg", alt: "COLDEX fieldwork at Allan Hills" },
      { src: "/images/allan-field-9561.jpeg", alt: "Ice-core recovery at Allan Hills" },
      { src: "/images/allan-field-7537.jpeg", alt: "Field operations in the Allan Hills blue-ice area" },
      { src: "/images/allan-field-9708.jpeg", alt: "Antarctic fieldwork at Allan Hills" },
    ],
    purpose: <>Recovering the oldest ice ever found with the <a href="https://coldex.org/" target="_blank" rel="noreferrer">NSF Center for Oldest Ice Exploration (COLDEX)</a></>,
    whatWeDid: "We drilled ancient ice from the Allan Hills blue ice area in Antarctica, where the movement of the ice sheet naturally exposes some of Earth's oldest ice at the surface. We used three drill systems — the blue ice, eclipse, and sidewinder drills — to recover over 10,000 lbs of ice. The samples we collected will be analyzed for atmospheric gases, water isotopes, aerosols, and other climate tracers to reconstruct past environments and better understand how Earth's climate has changed over millions of years. Our team also conducted radar and GPS surveys to map the internal structure and motion of the ice, helping answer why such old ice is here and guiding the search for even older ice.",
  },
];

export default function Fieldwork() {
  return <main>
    <SiteHeader />
    <section className="page-hero fieldwork-hero wrap">
      <h1>Science in<br /><em>snowy places</em></h1>
    </section>

    <section className="fieldwork-list">
      {trips.map((trip) => <article className="fieldwork-feature wrap" key={trip.place}>
        <header className="fieldwork-heading">
          <div className="fieldwork-meta">
            <p>{trip.date}</p>
            <p>{trip.region}</p>
          </div>
          <div>
            <h2>{trip.place}</h2>
            <p>{trip.purpose}</p>
          </div>
        </header>

        <div className="fieldwork-collage" aria-label={`Field photographs from ${trip.place}`}>
          {trip.images.map((image, index) => <img className={index === 0 ? "fieldwork-collage-primary" : ""} src={image.src} alt={image.alt} key={image.src} />)}
        </div>

        <div className="fieldwork-details">
          <div className="fieldwork-map-cell">
            <span>Location</span>
            <FieldMap latitude={trip.latitude} longitude={trip.longitude} location={trip.place} view={trip.view} />
          </div>
          <div className="fieldwork-activity"><span>What we did</span><p>{trip.whatWeDid}</p></div>
        </div>
      </article>)}
    </section>
    <SiteFooter />
  </main>;
}
