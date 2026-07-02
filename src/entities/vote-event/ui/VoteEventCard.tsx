import { Link } from "react-router-dom";
import type { VoteEventListItem } from "../model/types";
import { CategoryBadge } from "./CategoryBadge";
import { VoteOptionPair } from "./VoteOptionPair";

interface VoteEventCardProps {
  item: VoteEventListItem;
  /** 완료된 투표처럼 결과가 이미 공개된 경우 true. */
  revealResults?: boolean;
}

/** 목록 그리드용 투표 카드. */
export function VoteEventCard({
  item,
  revealResults = false,
}: VoteEventCardProps) {
  return (
    <Link
      to={`/votes/${item.id}`}
      className="flex flex-col gap-4 rounded-2xl bg-surface p-5 shadow-sm transition hover:shadow-md"
    >
      <header className="flex items-center justify-between">
        <CategoryBadge categoryName={item.categoryName} />
        <span className="text-xs text-muted">🕒 {item.remainingTime}</span>
      </header>

      <h3 className="text-base font-bold text-heading">{item.title}</h3>

      <div className="flex flex-col gap-2">
        <VoteOptionPair item={item} />
        {!revealResults && !item.isParticipated && (
          <p className="text-center text-xs text-muted">
            🔒 투표 참여 후 결과 공개
          </p>
        )}
      </div>

      <footer className="flex items-center gap-4 border-t border-border pt-3 text-xs text-muted">
        <span>👥 {item.totalParticipantCount.toLocaleString()}명 참여</span>
        {item.totalTokenAmount != null && (
          <span className="ml-auto font-semibold text-emerald-600">
            🪙 {item.totalTokenAmount.toLocaleString()} 토큰
          </span>
        )}
      </footer>
    </Link>
  );
}
