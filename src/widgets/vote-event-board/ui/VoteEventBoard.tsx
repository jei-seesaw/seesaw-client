import { useMemo, useState } from "react";
import {
  useCompletedVoteEventsQuery,
  useOngoingVoteEventsQuery,
  VoteEventCard,
  type VoteEventListItem,
} from "@/entities/vote-event";

type Tab = "ongoing" | "completed";

const CATEGORY_CHIPS = [
  { label: "전체", emoji: "" },
  { label: "배팅", emoji: "🎯" },
  { label: "일상", emoji: "☀️" },
  { label: "밸런스", emoji: "⚖️" },
  { label: "업무", emoji: "💼" },
];

export function VoteEventBoard() {
  const [tab, setTab] = useState<Tab>("ongoing");
  const [category, setCategory] = useState("전체");

  const ongoing = useOngoingVoteEventsQuery();
  const completed = useCompletedVoteEventsQuery();

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
      category === "전체"
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
        {CATEGORY_CHIPS.map((chip) => (
          <button
            key={chip.label}
            onClick={() => setCategory(chip.label)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              category === chip.label
                ? "bg-amber-100 text-amber-700"
                : "bg-surface text-muted hover:bg-gray-100"
            }`}
          >
            {chip.emoji && <span className="mr-1">{chip.emoji}</span>}
            {chip.label}
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
