import type { Metadata } from "next";
import StudioClient from "./studio-client";

export const metadata: Metadata = {
  title: { absolute: "CV Studio" },
};

export default function OnlineCvStudio() {
  return <StudioClient />;
}
