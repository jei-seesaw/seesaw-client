import { useState, type ReactNode } from "react";
import { Confetti } from "@/shared/ui";
import type { BettingInfo } from "@/entities/vote-event";
import {
  getClaimErrorMessage,
  useClaimBettingReward,
} from "../model/useClaimBettingReward";

interface MyBettingResultPanelProps {
  voteEventId: string;
  /** 확정된 정답(승자) 라벨. */
  winnerLabel: string;
  /** 내가 선택한 옵션 라벨. */
  myChoiceLabel: string;
  /** 내가 이겼는지 (내 선택 === 정답). */
  won: boolean;
  info: BettingInfo;
}

/** 참여자 전용: 내 배팅 결과 + (승자면) 보상 수령. */
export function MyBettingResultPanel({
  voteEventId,
  winnerLabel,
  myChoiceLabel,
  won,
  info,
}: MyBettingResultPanelProps) {
  const { mutate, isPending, error } = useClaimBettingReward(voteEventId);
  const [celebrate, setCelebrate] = useState(false);

  function handleClaim() {
    mutate(undefined, {
      onSuccess: (data) => {
        if (data.earnedTokenAmount > 0) setCelebrate(true);
      },
    });
  }

  const earned = won
    ? (info.earnedTokenAmount ?? Math.round(info.myTokenAmount * info.payoutRate))
    : 0;
  const claimed = info.rewardClaimed === true;

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-surface p-5">
      <h2 className="text-sm font-bold text-heading">🏆 내 배팅 결과</h2>

      <dl className="flex flex-col gap-1.5 text-sm">
        <Row label="최종 결과">
          <span className="font-semibold text-primary">{winnerLabel}</span>
        </Row>
        <Row label="내 선택">{myChoiceLabel}</Row>
        <Row label="내가 배팅한 금액">
          {info.myTokenAmount.toLocaleString()} 토큰
        </Row>
        <Row label="배당률">{formatRate(info.payoutRate)}배</Row>
        <Row label="획득 토큰">
          <span className={won ? "font-semibold text-emerald-600" : undefined}>
            {earned.toLocaleString()} 토큰
          </span>
        </Row>
      </dl>

      {error && (
        <p className="text-xs text-red-500">{getClaimErrorMessage(error)}</p>
      )}

      {!won ? (
        <p className="rounded-xl bg-gray-100 py-3 text-center text-xs font-medium text-muted">
          아쉽지만 이번엔 배팅에 실패했어요
        </p>
      ) : claimed ? (
        <p className="rounded-xl bg-emerald-50 py-3 text-center text-xs font-medium text-emerald-600">
          ✓ {earned.toLocaleString()} 토큰이 지급되었습니다
        </p>
      ) : (
        <button
          type="button"
          onClick={handleClaim}
          disabled={isPending}
          className="rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-40"
        >
          {isPending ? "수령 중…" : "토큰 수령하기"}
        </button>
      )}

      {celebrate && <Confetti onComplete={() => setCelebrate(false)} />}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="text-heading">{children}</dd>
    </div>
  );
}

function formatRate(rate: number): number {
  return Number(rate.toFixed(2));
}
