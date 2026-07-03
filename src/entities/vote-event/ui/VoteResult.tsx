import type { VoteEventDetail, VoteSide } from "../model/types";

interface VoteResultProps {
  detail: VoteEventDetail;
  /** 결과 수량 단위 (배팅=토큰, 그 외=표). */
  amountUnit: "토큰" | "표";
}

/** 참여 후 실시간 결과 (비율 + 수량 + 내 선택 표시). */
export function VoteResult({ detail, amountUnit }: VoteResultProps) {
  const aRatio = detail.optionARatio ?? 0;
  const bRatio = detail.optionBRatio ?? 0;
  const selectedLabel =
    detail.selectedOption === "A" ? detail.optionA : detail.optionB;

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-surface p-5">
      <h2 className="text-center text-sm font-semibold text-muted">
        실시간 투표 결과
      </h2>

      <div className="flex items-stretch gap-2">
        <ResultBox
          side="A"
          label={detail.optionA}
          ratio={aRatio}
          imageUrl={detail.optionAImageUrl}
        />
        <span className="self-center text-xs font-semibold text-muted">vs</span>
        <ResultBox
          side="B"
          label={detail.optionB}
          ratio={bRatio}
          imageUrl={detail.optionBImageUrl}
        />
      </div>

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

function ResultBox({
  side,
  label,
  ratio,
  imageUrl,
}: {
  side: VoteSide;
  label: string;
  ratio: number;
  imageUrl: string | null;
}) {
  const tone =
    side === "A" ? "bg-indigo-50 text-indigo-500" : "bg-rose-50 text-rose-400";

  return (
    <div
      className={`flex flex-1 flex-col items-center gap-1 rounded-2xl p-4 ${tone}`}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={label}
          className="mb-1 h-20 w-full rounded-xl object-cover"
        />
      )}
      <span className="text-2xl font-bold">{ratio}%</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function formatAmount(amount: number | null, unit: "토큰" | "표"): string {
  if (amount == null) return "";
  return unit === "토큰"
    ? `${amount.toLocaleString()} 토큰`
    : `${amount.toLocaleString()}표`;
}
