import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useHomeSummaryQuery } from "@/entities/home";
import {
  CATEGORY_LABELS,
  getCategoryEmoji,
  useCompletedVoteEventsQuery,
  useMyCreatedVoteEventsQuery,
  useMyParticipatedVoteEventsQuery,
  useOngoingVoteEventsQuery,
  VOTE_CATEGORIES,
  VoteEventCard,
  type MyVoteSort,
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

const SORT_OPTIONS: { key: MyVoteSort; label: string }[] = [
  { key: "latest", label: "최근 등록순" },
  { key: "deadline", label: "마감 임박순" },
  { key: "participants", label: "참여자순" },
];

export function VoteEventBoard() {
  const [tab, setTab] = useState<Tab>("ongoing");
  const [category, setCategory] = useState<string>(ALL_CATEGORY);
  const [sort, setSort] = useState<MyVoteSort>("latest");

  const { data: home } = useHomeSummaryQuery();
  const isLoggedIn = home?.isLoggedIn ?? false;

  const tabs = isLoggedIn ? [...BASE_TABS, ...MY_TABS] : BASE_TABS;
  // 로그아웃 등으로 현재 탭이 사라지면 첫 탭으로 폴백
  const activeTab = tabs.some((t) => t.key === tab) ? tab : "ongoing";

  const categoryCode =
    category === ALL_CATEGORY
      ? undefined
      : VOTE_CATEGORIES.find((c) => c.label === category)?.code;

  const ongoing = useOngoingVoteEventsQuery();
  const completed = useCompletedVoteEventsQuery(activeTab === "completed");
  // 내 목록은 서버가 sort·category를 지원하므로 파라미터로 전달
  const created = useMyCreatedVoteEventsQuery(
    { sort, category: categoryCode },
    activeTab === "created",
  );
  const participated = useMyParticipatedVoteEventsQuery(
    { sort, category: categoryCode },
    activeTab === "participated",
  );

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
      return [ongoing.data.mainVote, ...ongoing.data.otherVoteEvents].filter(
        (v): v is VoteEventListItem => v !== null,
      );
    }
    if (activeTab === "completed") return completed.data?.voteEvents ?? [];
    if (activeTab === "created") return created.data?.voteEvents ?? [];
    return participated.data?.voteEvents ?? [];
  }, [activeTab, ongoing.data, completed.data, created.data, participated.data]);

  const visible = useMemo(() => {
    const byCategory =
      category === ALL_CATEGORY
        ? items
        : items.filter((item) => item.categoryName === category);
    // 공개 목록은 서버 정렬 미지원 → 참여자순만 클라이언트 정렬로 보정
    if (sort === "participants") {
      return [...byCategory].sort(
        (a, b) => b.totalParticipantCount - a.totalParticipantCount,
      );
    }
    return byCategory;
  }, [items, category, sort]);

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

      {/* 카테고리 + 정렬 */}
      <div className="flex items-center justify-between gap-3">
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

        <div className="relative shrink-0">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as MyVoteSort)}
            className="appearance-none rounded-full bg-surface py-1.5 pl-3 pr-8 text-sm font-medium text-muted outline-none transition hover:bg-gray-100"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
          />
        </div>
      </div>

      {/* 그리드 */}
      {query.isLoading ? (
        <p className="py-10 text-center text-sm text-muted">불러오는 중…</p>
      ) : visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">
          표시할 투표가 없어요.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visible.map((item) => (
            <VoteEventCard
              key={item.id}
              item={item}
              revealResults={activeTab === "completed"}
            />
          ))}
        </div>
      )}
    </section>
  );
}
