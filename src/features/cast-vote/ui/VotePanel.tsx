import { useState } from "react";
import { BottomSheet } from "@/shared/ui";
import { useHomeSummaryQuery } from "@/entities/home";
import {
  OptionPreview,
  type VoteEventDetail,
  type VoteSide,
} from "@/entities/vote-event";
import { useCastVote } from "../model/useCastVote";

interface VotePanelProps {
  voteEventId: string;
  detail: VoteEventDetail;
  isBetting: boolean;
}

/** 투표 전: 선택지 미리보기 + 선택 + 제출 (배팅이면 토큰 배팅 시트). */
export function VotePanel({ voteEventId, detail, isBetting }: VotePanelProps) {
  const [selected, setSelected] = useState<VoteSide | null>(null);
  const [betOpen, setBetOpen] = useState(false);
  const { mutate, isPending } = useCastVote();
  const { data: home } = useHomeSummaryQuery();
  const balance = home?.voteToken ?? 0;

  const selectedLabel =
    selected === "A" ? detail.optionA : selected === "B" ? detail.optionB : "";

  function submitVote(tokenAmount?: number) {
    if (!selected) return;
    mutate({
      voteEventId,
      selectedOption: selected,
      ...(tokenAmount != null ? { tokenAmount } : {}),
    });
  }

  function handleSubmit() {
    if (!selected) return;
    if (isBetting) setBetOpen(true);
    else submitVote();
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-surface p-5">
      <p className="text-center text-xs text-muted">🔒 투표 후 결과 공개</p>

      <div className="flex items-stretch gap-2">
        <OptionPreview
          side="A"
          label={detail.optionA}
          imageUrl={detail.optionAImageUrl}
          selected={selected === "A"}
          onClick={() => setSelected("A")}
        />
        <span className="self-center text-xs font-semibold text-muted">vs</span>
        <OptionPreview
          side="B"
          label={detail.optionB}
          imageUrl={detail.optionBImageUrl}
          selected={selected === "B"}
          onClick={() => setSelected("B")}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <SelectButton
          side="A"
          label={detail.optionA}
          selected={selected === "A"}
          onClick={() => setSelected("A")}
        />
        <SelectButton
          side="B"
          label={detail.optionB}
          selected={selected === "B"}
          onClick={() => setSelected("B")}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selected || isPending}
        className="rounded-xl bg-heading py-3.5 text-sm font-semibold text-white transition hover:brightness-125 disabled:bg-gray-300 disabled:hover:brightness-100"
      >
        {selected ? `"${selectedLabel}" 선택하기` : "선택지를 골라주세요"}
      </button>

      {isBetting && (
        <TokenBetSheet
          open={betOpen}
          onClose={() => setBetOpen(false)}
          selectedLabel={selectedLabel}
          balance={balance}
          isPending={isPending}
          onBet={submitVote}
        />
      )}
    </section>
  );
}

function SelectButton({
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

function TokenBetSheet({
  open,
  onClose,
  selectedLabel,
  balance,
  isPending,
  onBet,
}: {
  open: boolean;
  onClose: () => void;
  selectedLabel: string;
  balance: number;
  isPending: boolean;
  onBet: (amount: number) => void;
}) {
  const [amount, setAmount] = useState(100);
  const clamped = Math.max(0, Math.min(amount, balance));

  function change(next: number) {
    setAmount(Math.max(0, Math.min(next, balance)));
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="text-lg font-bold text-heading">토큰 배팅</h2>
      <p className="mt-1 text-sm text-muted">
        선택: <span className="font-semibold text-primary">{selectedLabel}</span>
      </p>

      <div className="mt-4 flex flex-col gap-4 rounded-2xl bg-gray-50 p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">보유 토큰</span>
          <span className="font-semibold text-emerald-600">
            🪙 {balance.toLocaleString()} T
          </span>
        </div>

        <div className="flex items-center justify-between">
          <StepButton onClick={() => change(clamped - 100)}>−</StepButton>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-heading">
              {clamped.toLocaleString()}
            </span>
            <span className="text-xs text-muted">토큰</span>
          </div>
          <StepButton onClick={() => change(clamped + 100)}>+</StepButton>
        </div>

        <div className="flex gap-2">
          {[100, 300, 500].map((v) => (
            <QuickButton key={v} onClick={() => change(clamped + v)}>
              {`+${v}`}
            </QuickButton>
          ))}
          <button
            type="button"
            onClick={() => change(balance)}
            className="flex-1 rounded-full bg-rose-50 py-2 text-xs font-semibold text-rose-500 transition hover:bg-rose-100"
          >
            전액
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onBet(clamped)}
        disabled={clamped <= 0 || clamped > balance || isPending}
        className="mt-4 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-40"
      >
        {isPending
          ? "배팅 중…"
          : `${clamped.toLocaleString()} 토큰 배팅하기`}
      </button>
    </BottomSheet>
  );
}

function StepButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-xl font-bold text-heading shadow-sm transition hover:bg-gray-50"
    >
      {children}
    </button>
  );
}

function QuickButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-full bg-surface py-2 text-xs font-semibold text-heading shadow-sm transition hover:bg-gray-50"
    >
      {children}
    </button>
  );
}
