import { useEffect, useMemo, useRef, useState } from "react";
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

/** 목록 한 페이지당 불러올 투표 수. */
const PAGE_SIZE = 4;

export function VoteEventBoard() {
  const [tab, setTab] = useState<Tab>("ongoing");
  const [category, setCategory] = useState<string>(ALL_CATEGORY);
  const [sort, setSort] = useState<MyVoteSort>("latest");

  const { data: home } = useHomeSummaryQuery();
  const isLoggedIn = home?.isLoggedIn ?? false;

  const tabs = isLoggedIn ? [...BASE_TABS, ...MY_TABS] : BASE_TABS;
  // 로그아웃 등으로 현재 탭이 사라지면 첫 탭으로 폴백
  const activeTab = tabs.some((t) => t.key === tab) ? tab : "ongoing";

  const categoryCode = category === ALL_CATEGORY ? undefined : VOTE_CATEGORIES.find((c) => c.label === category)?.code;

  // 모든 목록 엔드포인트가 sort·category를 지원하므로 서버 파라미터로 전달.
  // 네 탭 모두 미리 조회(프리페치)해 두어 탭 전환 시 캐시에서 즉시 표시된다.
  const params = { sort, category: categoryCode, limit: PAGE_SIZE };
  const ongoing = useOngoingVoteEventsQuery(params);
  const completed = useCompletedVoteEventsQuery(params);
  const created = useMyCreatedVoteEventsQuery(params);
  const participated = useMyParticipatedVoteEventsQuery(params);

  const query =
    activeTab === "ongoing"
      ? ongoing
      : activeTab === "completed"
        ? completed
        : activeTab === "created"
          ? created
          : participated;

  // 탭에 맞는 목록을 단일 배열로 평탄화 (무한 스크롤의 모든 페이지 병합)
  const items = useMemo<VoteEventListItem[]>(() => {
    // 핫한 투표(mainVote)는 위 히어로에서 보여주므로 목록엔 나머지만 노출
    if (activeTab === "ongoing") return ongoing.data?.pages.flatMap((p) => p.otherVoteEvents) ?? [];
    if (activeTab === "completed") return completed.data?.pages.flatMap((p) => p.voteEvents) ?? [];
    if (activeTab === "created") return created.data?.pages.flatMap((p) => p.voteEvents) ?? [];
    return participated.data?.pages.flatMap((p) => p.voteEvents) ?? [];
  }, [activeTab, ongoing.data, completed.data, created.data, participated.data]);

  // 목록 하단 센티넬이 보이면 다음 페이지를 자동으로 불러온다.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "80px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
                category === label ? "bg-amber-100 text-amber-700" : "bg-surface text-muted hover:bg-gray-100"
              }`}
            >
              {label !== ALL_CATEGORY && <span className="mr-1">{getCategoryEmoji(label)}</span>}
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
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
        </div>
      </div>

      {/* 그리드 */}
      {query.isLoading ? (
        <p className="py-10 text-center text-sm text-muted">불러오는 중…</p>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">표시할 투표가 없어요.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <VoteEventCard
                key={item.id}
                item={item}
                revealResults={activeTab === "completed"}
                anchorMs={query.dataUpdatedAt}
              />
            ))}
          </div>
          {/* 무한 스크롤 감지용 센티넬 */}
          <div ref={sentinelRef} className="h-px" />
          {isFetchingNextPage && <p className="py-4 text-center text-sm text-muted">불러오는 중…</p>}
        </>
      )}
    </section>
  );
}
