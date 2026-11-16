import type { Metadata } from "next";
import { AboutUs } from "@/components/sections/AboutUs";
import { Visit } from "@/components/sections/Visit";
import { aboutPage } from "@/data/copy";

export const metadata: Metadata = {
  title: aboutPage.metaTitle,
  description: aboutPage.description,
  alternates: { canonical: "/sobre" },
};

export default function AboutPage() {
  return (
    <div className="pt-24 md:pt-28">
      <h1 className="sr-only">{aboutPage.title}</h1>
      <AboutUs />
      <Visit />
    </div>
  );
}
