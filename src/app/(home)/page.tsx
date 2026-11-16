import { Categories } from "@/components/sections/Categories";
import { Favorites } from "@/components/sections/Favorites";
import { Hero } from "@/components/sections/Hero";

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <Favorites />
    </>
  );
}
