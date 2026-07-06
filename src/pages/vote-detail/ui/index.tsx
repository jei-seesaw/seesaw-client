import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useLiveRemaining } from "@/shared/lib";
import {
  AffiliationStats,
  CategoryBadge,
  useVoteEventDetailQuery,
  VoteResult,
  type VoteEventDetail,
} from "@/entities/vote-event";
import { VotePanel } from "@/features/cast-vote";

export default function VoteDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const {
    data: detail,
    isLoading,
    isError,
    dataUpdatedAt,
  } = useVoteEventDetailQuery(id);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 flex items-center border-b border-border bg-surface px-4 py-3.5">
        <button
          onClick={() => navigate(-1)}
          aria-label="뒤로"
          className="-ml-2 rounded-full p-2 text-heading transition hover:bg-gray-100"
        >
          <ChevronLeft size={24} />
        </button>
      </header>

      <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-5">
        {isLoading && (
          <p className="py-20 text-center text-sm text-muted">불러오는 중…</p>
        )}
        {isError && (
          <p className="py-20 text-center text-sm text-muted">
            투표를 불러오지 못했어요.
          </p>
        )}
        {detail && (
          <VoteDetailContent
            voteEventId={id}
            detail={detail}
            anchorMs={dataUpdatedAt}
          />
        )}
      </main>
    </div>
  );
}

function VoteDetailContent({
  voteEventId,
  detail,
  anchorMs,
}: {
  voteEventId: string;
  detail: VoteEventDetail;
  anchorMs: number;
}) {
  const isBetting = detail.categoryName === "배팅";
  const amountUnit = isBetting ? "토큰" : "표";
  const hasVoted = detail.isParticipated;
  const remaining = useLiveRemaining(detail.remainingTime ?? "", anchorMs);

  return (
    <>
      {/* 제목 카드 */}
      <section className="rounded-2xl bg-surface p-5">
        <CategoryBadge categoryName={detail.categoryName} />
        <h1 className="mt-3 text-xl font-bold text-heading">{detail.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span>👥 {detail.totalParticipantCount.toLocaleString()}명 참여</span>
          {detail.remainingTime && (
            <span className={remaining.urgent ? "font-semibold text-red-500" : undefined}>
              🕒 {remaining.label}
            </span>
          )}
          {isBetting && detail.totalTokenAmount != null && (
            <span className="font-semibold text-emerald-600">
              🪙 {detail.totalTokenAmount.toLocaleString()} 토큰
            </span>
          )}
        </div>
      </section>

      {/* 투표 전: 선택 패널 / 투표 후: 결과 */}
      {hasVoted ? (
        <VoteResult detail={detail} amountUnit={amountUnit} />
      ) : (
        <VotePanel voteEventId={voteEventId} detail={detail} isBetting={isBetting} />
      )}

      {/* 소속별 통계 (참여 후) */}
      {hasVoted && detail.affiliationStats && detail.affiliationStats.length > 0 && (
        <AffiliationStats stats={detail.affiliationStats} />
      )}

      {/* 배당 (배팅 + 참여 후) */}
      {hasVoted && isBetting && <Payout detail={detail} />}

      {/* 익명 토론 */}
      <Discussion locked={!hasVoted} />
    </>
  );
}

function Payout({ detail }: { detail: VoteEventDetail }) {
  const a = detail.optionAResultAmount ?? 0;
  const b = detail.optionBResultAmount ?? 0;
  const total = a + b;
  const chosen = detail.selectedOption === "A" ? a : b;
  const multiplier = chosen > 0 ? total / chosen : 0;

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-surface p-5">
      <h2 className="text-sm font-bold text-heading">🏆 배당</h2>
      <div className="flex">
        <div className="flex flex-1 flex-col items-center">
          <span className="text-xs text-muted">{detail.optionA}</span>
          <span className="text-lg font-bold text-indigo-500">
            {a.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center">
          <span className="text-xs text-muted">{detail.optionB}</span>
          <span className="text-lg font-bold text-rose-400">
            {b.toLocaleString()}
          </span>
        </div>
      </div>
      {multiplier > 0 && (
        <p className="text-center text-xs text-muted">
          예상 배당 {multiplier.toFixed(2)}배
        </p>
      )}
    </section>
  );
}

function Discussion({ locked }: { locked: boolean }) {
  if (locked) {
    return (
      <section className="flex items-center gap-3 rounded-2xl bg-surface p-5">
        <span className="text-muted">🔒</span>
        <div>
          <p className="text-sm font-bold text-heading">익명 토론</p>
          <p className="text-xs text-muted">
            투표에 참여하면 토론을 볼 수 있어요
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-surface p-5">
      <h2 className="text-sm font-bold text-heading">💬 익명 토론</h2>
      <p className="py-6 text-center text-xs text-muted">
        토론 기능은 곧 제공될 예정이에요.
      </p>
    </section>
  );
}
