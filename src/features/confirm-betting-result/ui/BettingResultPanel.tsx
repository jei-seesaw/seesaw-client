import { useState } from "react";
import { ConfirmModal } from "@/shared/ui";
import type { VoteSide } from "@/entities/vote-event";
import { getConfirmErrorMessage, useConfirmBettingResult } from "../model/useConfirmBettingResult";

interface BettingResultPanelProps {
  voteEventId: string;
  optionA: string;
  optionB: string;
  amountA: number;
  amountB: number;
  /** 확정된 정답 (미확정이면 null). */
  confirmedOption: VoteSide | null;
  /** 지금 확정 가능한지. */
  canConfirm: boolean;
}

/** 주최자 전용: 배팅 현황(금액)과 정답 확정 입력. */
export function BettingResultPanel({
  voteEventId,
  optionA,
  optionB,
  amountA,
  amountB,
  confirmedOption,
  canConfirm,
}: BettingResultPanelProps) {
  const [selected, setSelected] = useState<VoteSide | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutate, isPending, error } = useConfirmBettingResult(voteEventId);

  const selectedLabel = selected === "A" ? optionA : selected === "B" ? optionB : "";
  const confirmedLabel = confirmedOption === "A" ? optionA : confirmedOption === "B" ? optionB : "";

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-surface p-5">
      <h2 className="text-sm font-bold text-heading">🏆 배팅 현황</h2>

      {/* 옵션별 배팅 금액 */}
      <div className="flex">
        <AmountColumn side="A" label={optionA} amount={amountA} />
        <AmountColumn side="B" label={optionB} amount={amountB} />
      </div>

      {confirmedOption ? (
        <p className="border-t border-border pt-3 text-center text-xs font-medium text-primary">
          ✓ 정답 "{confirmedLabel}" 확정 · 정산 완료
        </p>
      ) : !canConfirm ? (
        <p className="border-t border-border pt-3 text-center text-xs text-muted">
          마감 후 정답을 선택해 정산할 수 있어요.
        </p>
      ) : (
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <p className="text-center text-xs text-muted">투표 결과 입력</p>
          <div className="grid grid-cols-2 gap-2">
            <PickButton side="A" label={optionA} selected={selected === "A"} onClick={() => setSelected("A")} />
            <PickButton side="B" label={optionB} selected={selected === "B"} onClick={() => setSelected("B")} />
          </div>

          {error && <p className="text-xs text-red-500">{getConfirmErrorMessage(error)}</p>}

          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={!selected || isPending}
            className="rounded-xl bg-heading py-3.5 text-sm font-semibold text-white transition hover:brightness-125 disabled:bg-gray-300 disabled:hover:brightness-100"
          >
            {isPending ? "확정 중…" : selected ? `"${selectedLabel}" 선택하기` : "투표 결과를 선택해주세요"}
          </button>

          <ConfirmModal
            open={confirmOpen}
            title={`"${selectedLabel}"(으)로 확정할까요?`}
            description="확정하면 승자에게 토큰이 정산되며 되돌릴 수 없어요."
            confirmLabel="확정"
            cancelLabel="취소"
            onConfirm={() => selected && mutate(selected)}
            onClose={() => setConfirmOpen(false)}
          />
        </div>
      )}
    </section>
  );
}

function AmountColumn({ side, label, amount }: { side: VoteSide; label: string; amount: number }) {
  const color = side === "A" ? "text-indigo-500" : "text-rose-400";
  return (
    <div className="flex flex-1 flex-col items-center gap-0.5">
      <span className="text-xs text-muted">{label}</span>
      <span className={`text-xl font-bold ${color}`}>{amount.toLocaleString()}</span>
    </div>
  );
}

function PickButton({
  side,
  label,
  selected,
  onClick,
}: {
  side: VoteSide;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  const tone = selected
    ? side === "A"
      ? "bg-indigo-500 text-white"
      : "bg-rose-400 text-white"
    : side === "A"
      ? "bg-indigo-50 text-indigo-500"
      : "bg-rose-50 text-rose-400";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl py-3 text-sm font-semibold transition hover:brightness-95 ${tone}`}
    >
      {selected ? "✓ " : ""}
      {label}
    </button>
  );
}
