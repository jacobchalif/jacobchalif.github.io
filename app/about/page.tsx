import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../site-chrome";

export const metadata: Metadata = { title: "About" };

const personalNotes = [
  {
    label: "Outside the lab",
    title: "The rest of the story",
    body: "A place for the interests, routines, and small obsessions that fill the hours when I am not melting ice, working with data, or thinking about the atmosphere.",
  },
  {
    label: "Places",
    title: "Landscapes that stay with me",
    body: "Fieldwork has taken me to remarkable snowy places. This section can also hold the places closer to home—the mountains, neighborhoods, and familiar routes I return to.",
  },
  {
    label: "On the shelf",
    title: "Books, music, and other recommendations",
    body: "An evolving collection of things worth reading, listening to, watching, cooking, or sharing. More personal than a CV, and intentionally less complete.",
  },
];

export default function About() {
  return <main>
    <SiteHeader />
    <section className="about-hero wrap">
      <div>
        <p className="eyebrow"><span />About me</p>
        <h1>A life beyond<br /><em>the ice.</em></h1>
      </div>
      <p>Science is one part of how I move through the world. This page is a home for the places, people, interests, and stories that sit alongside the research.</p>
    </section>

    <section className="about-photo-story wrap" aria-label="Personal photographs">
      <figure className="about-photo-primary">
        <img src="/images/eclipse-field-5154.jpeg" alt="A mountain landscape at Eclipse Icefield" />
        <figcaption>Eclipse Icefield, Yukon</figcaption>
      </figure>
      <figure className="about-photo-secondary">
        <img src="/images/jacob-lab.jpg" alt="Jacob Chalif working with ice in the laboratory" />
        <figcaption>In the laboratory</figcaption>
      </figure>
      <figure className="about-photo-tertiary">
        <img src="/images/allan-team.jpeg" alt="Field team at Allan Hills, Antarctica" />
        <figcaption>Allan Hills, Antarctica</figcaption>
      </figure>
    </section>

    <section className="about-notes wrap">
      {personalNotes.map((note) => <article key={note.label}>
        <p>{note.label}</p>
        <h2>{note.title}</h2>
        <div>{note.body}</div>
      </article>)}
    </section>

    <section className="about-invitation wrap">
      <p className="eyebrow"><span />Still taking shape</p>
      <p>This page is intentionally a framework for now. Personal details, photographs, favorites, and stories can be added as the right tone comes into focus.</p>
    </section>
    <SiteFooter />
  </main>;
}
