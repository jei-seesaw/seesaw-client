import { Link } from "react-router-dom";
import {
  useOngoingVoteEventsQuery,
  type VoteEventListItem,
} from "@/entities/vote-event";

const CATEGORY_EMOJI: Record<string, string> = {
  배팅: "🎯",
  일상: "☀️",
  밸런스: "⚖️",
  업무: "💼",
};

export function FeaturedVote() {
  const { data, isLoading } = useOngoingVoteEventsQuery();

  if (isLoading) {
    return <div className="h-52 animate-pulse rounded-3xl bg-surface" />;
  }

  const vote = data?.mainVote;
  if (!vote) {
    return (
      <div className="rounded-3xl bg-surface p-10 text-center text-sm text-muted">
        아직 진행중인 투표가 없어요.
      </div>
    );
  }

  return <FeaturedVoteCard vote={vote} />;
}

function FeaturedVoteCard({ vote }: { vote: VoteEventListItem }) {
  return (
    <article className="flex flex-col gap-6 rounded-3xl bg-surface p-7 shadow-sm">
      <header className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
          {CATEGORY_EMOJI[vote.categoryName] ?? "🗳️"} {vote.categoryName}
        </span>
        <span className="text-sm text-muted">🕒 {vote.remainingTime}</span>
      </header>

      <h2 className="text-2xl font-bold text-heading">{vote.title}</h2>

      <div className="flex items-stretch gap-3">
        <OptionBox side="A" label={vote.optionA} ratio={vote.optionARatio} />
        <span className="self-center text-xs font-semibold text-muted">vs</span>
        <OptionBox side="B" label={vote.optionB} ratio={vote.optionBRatio} />
      </div>

      <footer className="flex items-center justify-between border-t border-border pt-4 text-sm">
        <span className="text-muted">
          👥 {vote.totalParticipantCount.toLocaleString()}명 참여
        </span>
        {vote.totalTokenAmount != null && (
          <span className="font-semibold text-emerald-600">
            🪙 {vote.totalTokenAmount.toLocaleString()} 토큰
          </span>
        )}
        <Link
          to={`/votes/${vote.id}`}
          className="font-semibold text-primary hover:underline"
        >
          투표하기 →
        </Link>
      </footer>
    </article>
  );
}

function OptionBox({
  side,
  label,
  ratio,
}: {
  side: "A" | "B";
  label: string;
  ratio: number | null;
}) {
  const tone =
    side === "A" ? "bg-blue-50 text-blue-500" : "bg-red-50 text-red-400";

  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-7 ${tone}`}
    >
      <span className="text-xl font-bold">
        {ratio != null ? `${ratio}%` : "?"}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
