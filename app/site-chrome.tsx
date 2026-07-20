"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const nav = [
  ["Home", "/"], ["Research", "/research"], ["Fieldwork", "/fieldwork"], ["Publications", "/publications"],
  ["News", "/news"], ["CV", "/cv"],
];

export function SiteHeader({ inverse = false }: { inverse?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateHeader = () => {
      const threshold = inverse ? (window.innerWidth > 900 ? 180 : 120) : 48;
      setScrolled(window.scrollY > threshold);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  return <header className={`site-header wrap ${inverse ? "inverse" : ""} ${scrolled ? "is-scrolled" : ""} ${menuOpen ? "menu-open" : ""}`}>
    <Link className="header-name" href="/"><strong>Jacob</strong> <span>Chalif</span></Link>
    <button className="mobile-menu-toggle" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
      <span /><span /><span />
    </button>
    <nav aria-label="Primary navigation">{nav.map(([label, href]) => <Link href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</Link>)}</nav>
  </header>;
}

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="wrap footer-grid">
      <div><p className="eyebrow light"><span />Get in touch</p><a className="footer-email" href="mailto:jchalif@uw.edu">jchalif@uw.edu</a></div>
      <div className="footer-links">
        <a href="https://scholar.google.com/citations?user=z3tFqOAAAAAJ">Google Scholar ↗︎</a>
        <a href="https://sites.uw.edu/beckya/">Alexander Group ↗︎</a>
        <a href="https://alexjturner.github.io/">Turner Group ↗︎</a>
        <a href="https://icecore.host.dartmouth.edu/">Dartmouth Ice Core Lab ↗︎</a>
      </div>
      <div className="footer-note">PhD student<br />Atmospheric &amp; Climate Sciences<br />University of Washington</div>
    </div>
    <blockquote className="wrap footer-quote">
      <p>“The more one learns of this intricate interplay of soil, altitude, weather, and the living tissues of plant and insect… the more the mystery deepens.”</p>
      <cite>— Nan Shepherd (<a href="https://bookshop.org/p/books/the-living-mountain-nan-shepherd/9d410ba39fcc9579" target="_blank" rel="noreferrer">The Living Mountain</a>)</cite>
    </blockquote>
    <div className="wrap footer-bottom"><span>© 2026 Jacob Chalif</span><span>Seattle, Washington</span></div>
  </footer>;
}
