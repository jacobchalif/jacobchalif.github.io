import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Jacob Chalif", template: "%s · Jacob Chalif" },
  description: "Jacob Chalif is an atmospheric scientist and PhD student at the University of Washington studying ice cores, atmospheric chemistry, paleoclimate, and weather extremes.",
  metadataBase: new URL("https://jacobchalif.github.io"),
  openGraph: { title: "Jacob Chalif", description: "Ice cores, atmospheric chemistry, paleoclimate, and weather extremes.", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Jacob Chalif" }] },
  twitter: { card: "summary_large_image", title: "Jacob Chalif", description: "Ice cores, atmospheric chemistry, paleoclimate, and weather extremes.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
