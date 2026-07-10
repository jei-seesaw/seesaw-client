import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLiveRemaining } from "@/shared/lib";
import {
  CategoryBadge,
  VoteOptionPair,
  useOngoingVoteEventsQuery,
  type VoteEventListItem,
} from "@/entities/vote-event";

export function FeaturedVote() {
  const { data, isLoading, dataUpdatedAt } = useOngoingVoteEventsQuery();

  if (isLoading) {
    return <div className="h-52 animate-pulse rounded-3xl bg-surface" />;
  }

  const vote = data?.pages[0]?.mainVote;
  if (!vote) {
    return (
      <div className="rounded-3xl bg-surface p-10 text-center text-sm text-muted">아직 진행중인 투표가 없어요.</div>
    );
  }

  return <FeaturedVoteCard vote={vote} anchorMs={dataUpdatedAt} />;
}

function FeaturedVoteCard({ vote, anchorMs }: { vote: VoteEventListItem; anchorMs: number }) {
  const remaining = useLiveRemaining(vote.remainingTime, anchorMs);

  return (
    <Link
      to={`/votes/${vote.id}`}
      className="flex flex-col gap-6 rounded-3xl bg-surface p-7 shadow-sm transition hover:shadow-md"
    >
      <header className="flex items-center justify-between">
        <CategoryBadge categoryName={vote.categoryName} />
        <span className={`text-sm ${remaining.urgent ? "font-semibold text-red-500" : "text-muted"}`}>
          🕒 {remaining.label}
        </span>
      </header>

      <h2 className="text-2xl font-bold text-heading">{vote.title}</h2>

      <VoteOptionPair item={vote} size="lg" />

      <footer className="flex items-center justify-between border-t border-border pt-4 text-sm">
        <span className="text-muted">👥 {vote.totalParticipantCount.toLocaleString()}명 참여</span>
        {vote.totalTokenAmount != null && (
          <span className="font-semibold text-emerald-600">🪙 {vote.totalTokenAmount.toLocaleString()} 토큰</span>
        )}
        <span className="flex items-center gap-1 font-semibold text-primary">
          투표하기 <ArrowRight size={16} />
        </span>
      </footer>
    </Link>
  );
}
