import { memo } from "react";
import { Link } from "react-router-dom";
import { useLiveRemaining } from "@/shared/lib";
import type { VoteEventListItem } from "../model/types";
import { CategoryBadge } from "./CategoryBadge";
import { VoteOptionPair } from "./VoteOptionPair";

interface VoteEventCardProps {
  item: VoteEventListItem;
  /** 완료된 투표처럼 결과가 이미 공개된 경우 true. */
  revealResults?: boolean;
  /** 목록을 받은 시각(ms) — 타이머 앵커용. */
  anchorMs?: number;
  /** 카드 클릭 핸들러. preventDefault로 이동을 막을 수 있다. */
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

/**
 * 목록 그리드용 투표 카드.
 * memo: 탭/카테고리 변경 시 리스트가 재렌더돼도 props가
 * 그대로면 카드는 재렌더되지 않는다. (item은 쿼리 캐시에서 안정적 참조)
 */
export const VoteEventCard = memo(function VoteEventCard({
  item,
  revealResults = false,
  anchorMs,
  onClick,
}: VoteEventCardProps) {
  const remaining = useLiveRemaining(item.remainingTime, anchorMs);

  return (
    <Link
      to={`/votes/${item.id}`}
      onClick={onClick}
      className="flex flex-col gap-4 rounded-2xl bg-surface p-5 shadow-sm transition hover:shadow-md"
    >
      <header className="flex items-center justify-between">
        <CategoryBadge categoryName={item.categoryName} />
        <span className={`text-xs ${remaining.urgent ? "font-semibold text-red-500" : "text-muted"}`}>
          🕒 {remaining.label}
        </span>
      </header>

      <h3 className="line-clamp-2 min-h-12 text-base font-bold text-heading">{item.title}</h3>

      <div className="flex flex-col gap-2">
        <VoteOptionPair item={item} />
        <p className={`text-center text-xs text-muted ${!revealResults && !item.isParticipated ? "" : "invisible"}`}>
          🔒 투표 참여 후 결과 공개
        </p>
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
});
