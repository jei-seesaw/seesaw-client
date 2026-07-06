import { useMemo, useState } from "react";
import { useHomeSummaryQuery } from "@/entities/home";
import {
  CATEGORY_LABELS,
  getCategoryEmoji,
  useCompletedVoteEventsQuery,
  useMyCreatedVoteEventsQuery,
  useMyParticipatedVoteEventsQuery,
  useOngoingVoteEventsQuery,
  VoteEventCard,
  type VoteEventListItem,
} from "@/entities/vote-event";

type Tab = "ongoing" | "completed" | "created" | "participated";

const BASE_TABS: { key: Tab; label: string }[] = [
  { key: "ongoing", label: "진행중인 투표" },
  { key: "completed", label: "완료된 투표" },
];
const MY_TABS: { key: Tab; label: string }[] = [
  { key: "created", label: "내가 만든 투표" },
  { key: "participated", label: "내가 참여한 투표" },
];

const ALL_CATEGORY = "전체";
const CATEGORY_FILTERS = [ALL_CATEGORY, ...CATEGORY_LABELS];

export function VoteEventBoard() {
  const [tab, setTab] = useState<Tab>("ongoing");
  const [category, setCategory] = useState<string>(ALL_CATEGORY);

  const { data: home } = useHomeSummaryQuery();
  const isLoggedIn = home?.isLoggedIn ?? false;

  const tabs = isLoggedIn ? [...BASE_TABS, ...MY_TABS] : BASE_TABS;
  // 로그아웃 등으로 현재 탭이 사라지면 첫 탭으로 폴백
  const activeTab = tabs.some((t) => t.key === tab) ? tab : "ongoing";

  const ongoing = useOngoingVoteEventsQuery();
  const completed = useCompletedVoteEventsQuery(activeTab === "completed");
  const created = useMyCreatedVoteEventsQuery({}, activeTab === "created");
  const participated = useMyParticipatedVoteEventsQuery({}, activeTab === "participated");

  const query =
    activeTab === "ongoing"
      ? ongoing
      : activeTab === "completed"
        ? completed
        : activeTab === "created"
          ? created
          : participated;

  // 탭에 맞는 목록을 단일 배열로 평탄화
  const items = useMemo<VoteEventListItem[]>(() => {
    if (activeTab === "ongoing") {
      if (!ongoing.data) return [];
      return [ongoing.data.mainVote, ...ongoing.data.otherVoteEvents].filter((v): v is VoteEventListItem => v !== null);
    }
    if (activeTab === "completed") return completed.data?.voteEvents ?? [];
    if (activeTab === "created") return created.data?.voteEvents ?? [];
    return participated.data?.voteEvents ?? [];
  }, [activeTab, ongoing.data, completed.data, created.data, participated.data]);

  const filtered = useMemo(
    () => (category === ALL_CATEGORY ? items : items.filter((item) => item.categoryName === category)),
    [items, category],
  );

  return (
    <section className="flex flex-col gap-5">
      {/* 탭 */}
      <div className="flex flex-wrap items-center gap-3 text-lg font-bold">
        {tabs.map((t, i) => (
          <div key={t.key} className="flex items-center gap-3">
            {i > 0 && <span className="text-border">|</span>}
            <button
              onClick={() => setTab(t.key)}
              className={`transition ${activeTab === t.key ? "text-heading" : "text-muted hover:text-heading"}`}
            >
              {t.label}
            </button>
          </div>
        ))}
      </div>

      {/* 카테고리 칩 */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map((label) => (
          <button
            key={label}
            onClick={() => setCategory(label)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              category === label ? "bg-amber-100 text-amber-700" : "bg-surface text-muted hover:bg-gray-100"
            }`}
          >
            {label !== ALL_CATEGORY && <span className="mr-1">{getCategoryEmoji(label)}</span>}
            {label}
          </button>
        ))}
      </div>

      {/* 그리드 */}
      {query.isLoading ? (
        <p className="py-10 text-center text-sm text-muted">불러오는 중…</p>
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">표시할 투표가 없어요.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((item) => (
            <VoteEventCard key={item.id} item={item} revealResults={activeTab === "completed"} />
          ))}
        </div>
      )}
    </section>
  );
}
