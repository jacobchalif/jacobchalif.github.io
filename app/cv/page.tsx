import type {Metadata} from "next";
import {SiteFooter,SiteHeader} from "../site-chrome";

export const metadata:Metadata={title:"CV"};

const cvPages=Array.from({length:6},(_,index)=>index+1);

export default function CV(){return <main><SiteHeader/><section className="cv-heading wrap"><h1>Curriculum Vitae</h1><a href="/documents/Jacob_Chalif_CV.pdf" target="_blank">Open PDF in a new tab ↗︎</a></section><div className="pdf-frame wrap"><iframe title="Jacob Chalif curriculum vitae" src="/documents/Jacob_Chalif_CV.pdf"/></div><div className="cv-mobile-pages wrap" aria-label="Jacob Chalif curriculum vitae">{cvPages.map((page)=><img key={page} src={`/documents/cv-pages/page-${page}.webp`} alt={`Curriculum vitae, page ${page} of ${cvPages.length}`} width="1241" height="1754" loading={page===1?"eager":"lazy"}/>)}</div><SiteFooter/></main>}
