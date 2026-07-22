import rawPublications from "../content/publications.json";

export type PublicationStatus = "published" | "in_review" | "in_preparation";

export type Publication = {
  id: string;
  year: string;
  status: PublicationStatus;
  title: string;
  authors: string;
  journal: string;
  doi: string;
  highlightHref: string;
  showWebsite: boolean;
  showCv: boolean;
};

export const publications = rawPublications as Publication[];

export const publicationStatusLabel: Record<PublicationStatus, string> = {
  published: "",
  in_review: "In review",
  in_preparation: "In preparation",
};
