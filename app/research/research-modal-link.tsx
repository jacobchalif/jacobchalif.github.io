"use client";

import type { MouseEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { researchProjects } from "../site-data";
import { researchStrands } from "./strand-data";

const modalProjects = [...researchStrands, ...researchProjects].map((project) => project.slug === "methods" ? {
  ...project,
  title: "Melting ice, analyzing geochemistry, and running models",
  summary: "My research navigates ice-core melter systems, trace metal and isotope geochemistry, large climate datasets, and atmospheric chemistry models.",
} : project);

function ProjectParagraph({ text }: { text: string }) {
  const parts = text.split("Figure 1");
  return <>{parts.map((part, index) => <span key={index}>{index > 0 && <strong>Figure 1</strong>}{part}</span>)}</>;
}

function FigureCaption({ text }: { text: string }) {
  const citation = "(Kirkpatrick et al., in prep)";
  const [caption, remainder] = text.split(citation);
  return <>{caption}{remainder !== undefined && <em>{citation}</em>}</>;
}

export function ResearchModalLink({ slug, id, className, children }: { slug: string; id?: string; className?: string; children: ReactNode }) {
  const project = modalProjects.find((item) => item.slug === slug)!;
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLAnchorElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const savedScrollPosition = useRef(0);
  const closeModal = () => {
    setOpen(false);
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: savedScrollPosition.current, behavior: "auto" })));
  };

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    const closeFromKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", closeFromKeyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeFromKeyboard);
      trigger.current?.focus({ preventScroll: true });
    };
  }, [open]);

  const openModal = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    savedScrollPosition.current = window.scrollY;
    setOpen(true);
  };

  return <>
    <a ref={trigger} id={id} className={className} href={`/research/${slug}`} onClick={openModal}>{children}</a>
    {open && <div className="research-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
      <section className={`research-modal research-modal-${slug}`} role="dialog" aria-modal="true" aria-labelledby={`research-modal-${slug}`}>
        <button ref={closeButton} className="research-modal-close" type="button" aria-label="Close research details" onClick={closeModal}>×</button>
        <header className="research-modal-header">
          <div>
            <p className="eyebrow"><span />{project.tag}</p>
            <h2 id={`research-modal-${slug}`}>{project.title}</h2>
            <p>{project.summary}</p>
          </div>
          <figure className="research-modal-thumbnail">
            <img src={project.image} alt={project.imageAlt} />
            {project.imageCaption && <figcaption>{project.imageCaption}</figcaption>}
          </figure>
        </header>
        <div className="research-modal-body">
          <aside>{project.kicker}</aside>
          <div>{project.body.map((paragraph, index) => <p key={index}><ProjectParagraph text={paragraph} /></p>)}</div>
        </div>
        {project.relatedPublications && <section className="research-citations">
          <p className="eyebrow"><span />Related publications</p>
          <div className="research-citation-grid">{project.relatedPublications.map((publication) => {
            const citation = <><div><strong>{publication.authors} ({publication.year})</strong>{publication.href && <span>↗</span>}</div><h3>{publication.title}</h3><p>{publication.journal}</p></>;
            return publication.href
              ? <a href={publication.href} target="_blank" rel="noreferrer" key={publication.href}>{citation}</a>
              : <article key={publication.title}>{citation}</article>;
          })}</div>
        </section>}
        {project.figure && <figure className="research-modal-figure">
          <img src={project.figure} alt={project.figureAlt} />
          <figcaption>{project.figureCaption ? <><strong>Figure 1.</strong> <FigureCaption text={project.figureCaption} /></> : project.credit}</figcaption>
        </figure>}
      </section>
    </div>}
  </>;
}
