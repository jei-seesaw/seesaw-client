import { HomeHero } from "@/widgets/home-hero";
import { FeaturedVote } from "@/widgets/featured-vote";
import { VoteEventBoard } from "@/widgets/vote-event-board";
import { CreateVoteFab } from "@/widgets/create-vote-fab";

export default function MainPage() {
  return (
    <div className="flex flex-col gap-8">
      <HomeHero />
      <FeaturedVote />
      <VoteEventBoard />
      <CreateVoteFab />
    </div>
  );
}
