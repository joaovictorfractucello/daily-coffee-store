import { Categories } from "@/components/sections/Categories";
import { Favorites } from "@/components/sections/Favorites";
import { Hero } from "@/components/sections/Hero";
import { HeroCarousel } from "@/components/HeroCarousel";

export default function Home() {
  return (
    <>
      <HeroCarousel
        slides={[
          { name: "tart", content: <Hero banner="tart" /> },
          { name: "frappe", content: <Hero banner="frappe" /> },
        ]}
      />
      <Categories />
      <Favorites />
    </>
  );
}
