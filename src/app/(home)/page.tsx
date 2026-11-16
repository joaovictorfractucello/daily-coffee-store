import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { AboutUs } from "@/components/sections/AboutUs";
import { Promotion } from "@/components/sections/Promotion";
import { Favorites } from "@/components/sections/Favorites";
import { Visit } from "@/components/sections/Visit";

export default function Home() {
  return (
    <>
      <Hero />
      <Favorites />
      <Promotion />
      <AboutUs />
      <Visit />
      <FinalCta />
    </>
  );
}
