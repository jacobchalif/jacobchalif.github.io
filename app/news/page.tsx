import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../site-chrome";

export const metadata: Metadata = { title: "News" };

const news = [
  {
    date: "Apr 2026",
    title: "Despite Big Storms, U.S. Winters Are Still Warming",
    source: "Climate.us",
    href: "https://www.climate.us/news-features/understanding-climate/despite-big-storms-us-winters-are-still-warming",
  },
  {
    date: "Jan 2026",
    title: "Extreme Winter Weather in a Human-Heated Climate",
    source: "Sustain What? with Andy Revkin",
    href: "https://revkin.substack.com/p/extreme-winter-weather-in-a-human",
  },
  {
    date: "Jan 2026",
    title: "Yes, Climate Change Can Supercharge a Winter Storm. Here’s How.",
    source: "Grist",
    href: "https://grist.org/climate/yes-climate-change-can-supercharge-a-winter-storm-heres-how/",
  },
  {
    date: "Jan 2026",
    title: "Why Is It So Cold? Some Researchers Say There May Be a Surprising Culprit: Climate Change",
    source: "The Boston Globe",
    href: "https://www.bostonglobe.com/2026/01/03/science/new-england-cold-climate-change",
  },
  {
    date: "Jul 2025",
    title: "The Mid-20th Century Winter Cooling in the Eastern U.S. Explained",
    source: "Eos",
    href: "https://eos.org/editor-highlights/the-mid-20th-century-winter-cooling-in-the-eastern-u-s-explained",
  },
  {
    date: "Jun 2025",
    title: "Study: Winter Jet Stream Was Erratic Before Climate Change",
    source: "Dartmouth News",
    href: "https://home.dartmouth.edu/news/2025/06/study-winter-jet-stream-was-erratic-climate-change",
  },
  {
    date: "Jun 2025",
    title: "Extreme Winter Weather Isn’t Down to a Wavier Jet Stream",
    source: "New Scientist",
    href: "https://www.newscientist.com/article/2485835-extreme-winter-weather-isnt-down-to-a-wavier-jet-stream/",
  },
  {
    date: "Jan 2025",
    title: "Winter in Florida? This Vermonter Has Reason to Travel Farther South—to Antarctica",
    source: "VTDigger",
    href: "https://vtdigger.org/2025/01/19/winter-in-florida-this-vermonter-has-reason-to-travel-farther-south-to-antarctica/",
  },
  {
    date: "Jan 2025",
    title: "Hunting for Ancient Antarctic Ice to Understand Climate Change",
    source: "Newsday",
    href: "https://www.newsday.com/long-island/environment/antarctica-ice-climate-change-huntington-man-ipn0sgmd",
  },
  {
    date: "Dec 2024",
    title: "A Dartmouth Grad Student Is in Antarctica This Winter on a Mission to Find the World’s Oldest Ice",
    source: "NHPR",
    href: "https://www.nhpr.org/nh-news/2024-12-29/a-dartmouth-grad-student-is-in-antarctica-this-winter-on-a-mission-to-find-the-worlds-oldest-ice",
  },
  {
    date: "Dec 2024",
    title: "A Dartmouth Grad Student Is in Antarctica This Winter on a Mission to Find the World’s Oldest Ice",
    source: "Valley News",
    href: "https://www.vnews.com/A-Dartmouth-grad-student-is-in-Antarctica-this-winter-on-a-mission-to-find-the-world-s-oldest-ice-58689922",
  },
  {
    date: "Dec 2024",
    title: "Dartmouth Grad Student in Antarctica to Collect the Planet’s Oldest Ice Cores",
    source: "WCAX",
    href: "https://www.wcax.com/2024/12/05/dartmouth-grad-student-antarctica-collect-planets-oldest-ice-cores/",
  },
  {
    date: "Sep 2024",
    title: "Ice Cores Show Pollution’s Impact on Arctic Atmosphere",
    source: "Dartmouth News",
    href: "https://home.dartmouth.edu/news/2024/09/ice-cores-show-pollutions-impact-arctic-atmosphere",
  },
  {
    date: "Sep 2024",
    title: "Ice Core Analysis Uncovers Historic Human Impact on Arctic Atmosphere",
    source: "Newsweek",
    href: "https://www.newsweek.com/ice-core-analysis-uncovers-human-impact-arctic-atmosphere-1959702",
  },
];

export default function News() {
  return <main>
    <SiteHeader />
    <section className="page-hero compact wrap">
      <h1>News &amp; Outreach</h1>
    </section>
    <section className="news-list wrap">
      {news.map((item) => {
        return <a className="news-row" href={item.href} key={item.href}>
          <div className="news-year">{item.date}</div>
          <span className="news-link-arrow" aria-hidden="true">↗︎</span>
          <div className="news-entry">
            <h2>{item.title}</h2>
            <p>{item.source}</p>
          </div>
        </a>;
      })}
    </section>
    <SiteFooter />
  </main>;
}
