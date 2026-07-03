import { useMemo, useState } from "react";
import {
  CATEGORY_LABELS,
  getCategoryEmoji,
  useCompletedVoteEventsQuery,
  useOngoingVoteEventsQuery,
  VoteEventCard,
  type VoteEventListItem,
} from "@/entities/vote-event";

type Tab = "ongoing" | "completed";

const ALL_CATEGORY = "전체";
const CATEGORY_FILTERS = [ALL_CATEGORY, ...CATEGORY_LABELS];

export function VoteEventBoard() {
  const [tab, setTab] = useState<Tab>("ongoing");
  const [category, setCategory] = useState<string>(ALL_CATEGORY);

  const ongoing = useOngoingVoteEventsQuery();
  // 완료 목록은 완료 탭을 실제로 열었을 때만 요청 (초기 로드 네트워크 절약)
  const completed = useCompletedVoteEventsQuery(tab === "completed");

  // 탭에 맞는 목록을 단일 배열로 평탄화
  const items = useMemo<VoteEventListItem[]>(() => {
    if (tab === "ongoing") {
      if (!ongoing.data) return [];
      return [ongoing.data.mainVote, ...ongoing.data.otherVoteEvents].filter(
        (v): v is VoteEventListItem => v !== null,
      );
    }
    return completed.data?.voteEvents ?? [];
  }, [tab, ongoing.data, completed.data]);

  const filtered = useMemo(
    () =>
      category === ALL_CATEGORY
        ? items
        : items.filter((item) => item.categoryName === category),
    [items, category],
  );

  const isLoading = tab === "ongoing" ? ongoing.isLoading : completed.isLoading;

  return (
    <section className="flex flex-col gap-5">
      {/* 탭 */}
      <div className="flex items-center gap-3 text-lg font-bold">
        <button
          onClick={() => setTab("ongoing")}
          className={tab === "ongoing" ? "text-heading" : "text-muted"}
        >
          진행중인 투표
        </button>
        <span className="text-border">|</span>
        <button
          onClick={() => setTab("completed")}
          className={tab === "completed" ? "text-heading" : "text-muted"}
        >
          완료된 투표
        </button>
      </div>

      {/* 카테고리 칩 */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map((label) => (
          <button
            key={label}
            onClick={() => setCategory(label)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              category === label
                ? "bg-amber-100 text-amber-700"
                : "bg-surface text-muted hover:bg-gray-100"
            }`}
          >
            {label !== ALL_CATEGORY && (
              <span className="mr-1">{getCategoryEmoji(label)}</span>
            )}
            {label}
          </button>
        ))}
      </div>

      {/* 그리드 */}
      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted">불러오는 중…</p>
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">
          표시할 투표가 없어요.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((item) => (
            <VoteEventCard
              key={item.id}
              item={item}
              revealResults={tab === "completed"}
            />
          ))}
        </div>
      )}
    </section>
  );
}
