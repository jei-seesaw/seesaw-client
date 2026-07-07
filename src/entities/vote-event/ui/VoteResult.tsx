import type { VoteEventDetail } from "../model/types";
import { Seesaw } from "./Seesaw";

interface VoteResultProps {
  detail: VoteEventDetail;
  /** 결과 수량 단위 (배팅=토큰, 그 외=표). */
  amountUnit: "토큰" | "표";
  /** 마감된 투표면 "최종 투표 결과"로 표기. */
  ended?: boolean;
}

/** 결과 화면 — 시소 위에 (이미지가 있으면) 이미지가 얹혀 기운다. */
export function VoteResult({
  detail,
  amountUnit,
  ended = false,
}: VoteResultProps) {
  const selectedLabel =
    detail.selectedOption === "A" ? detail.optionA : detail.optionB;

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-surface p-5">
      <h2 className="text-center text-sm font-semibold text-muted">
        {ended ? "최종 투표 결과" : "실시간 투표 결과"}
      </h2>

      <Seesaw detail={detail} />

      <div className="flex justify-between text-xs text-muted">
        <span>{formatAmount(detail.optionAResultAmount, amountUnit)}</span>
        <span>{formatAmount(detail.optionBResultAmount, amountUnit)}</span>
      </div>

      {detail.selectedOption && (
        <p className="text-center text-xs font-medium text-primary">
          ✓ {selectedLabel} 선택 완료
        </p>
      )}
    </section>
  );
}

function formatAmount(amount: number | null, unit: "토큰" | "표"): string {
  if (amount == null) return "";
  return unit === "토큰"
    ? `${amount.toLocaleString()} 토큰`
    : `${amount.toLocaleString()}표`;
}
