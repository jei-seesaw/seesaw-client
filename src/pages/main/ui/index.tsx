import { HomeHero } from "@/widgets/home-hero";
import { FeaturedVote } from "@/widgets/featured-vote";

export default function MainPage() {
  return (
    <div className="flex flex-col gap-8">
      <HomeHero />
      <FeaturedVote />
    </div>
  );
}
