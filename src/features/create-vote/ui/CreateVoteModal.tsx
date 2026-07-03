import { useState } from "react";
import { BottomSheet } from "@/shared/ui";
import { VOTE_CATEGORIES, type VoteCategoryCode } from "@/entities/vote-event";
import { useCreateVoteEvent } from "../model/useCreateVoteEvent";

interface CreateVoteModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "category" | "details";

export function CreateVoteModal({ open, onClose }: CreateVoteModalProps) {
  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState<VoteCategoryCode | null>(null);
  const [title, setTitle] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");

  const { mutate, isPending, error, reset: resetMutation } = useCreateVoteEvent();

  function handleClose() {
    setStep("category");
    setCategory(null);
    setTitle("");
    setOptionA("");
    setOptionB("");
    resetMutation();
    onClose();
  }

  const canSubmit =
    Boolean(category) &&
    title.trim().length > 0 &&
    optionA.trim().length > 0 &&
    optionB.trim().length > 0 &&
    !isPending;

  function handleSubmit() {
    if (!category || !canSubmit) return;
    mutate(
      {
        category,
        title: title.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionAImageUrl: null,
        optionBImageUrl: null,
      },
      { onSuccess: handleClose },
    );
  }

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <header className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {step === "details" && (
            <button
              type="button"
              onClick={() => setStep("category")}
              aria-label="뒤로"
              className="text-muted"
            >
              ‹
            </button>
          )}
          <h2 className="text-lg font-bold text-heading">투표 만들기</h2>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="닫기"
          className="text-muted"
        >
          ✕
        </button>
      </header>

      {step === "category" ? (
        <CategoryStep
          selected={category}
          onSelect={setCategory}
          onNext={() => setStep("details")}
        />
      ) : (
        <DetailsStep
          title={title}
          optionA={optionA}
          optionB={optionB}
          onTitle={setTitle}
          onOptionA={setOptionA}
          onOptionB={setOptionB}
          onSubmit={handleSubmit}
          canSubmit={canSubmit}
          isPending={isPending}
          errored={Boolean(error)}
        />
      )}
    </BottomSheet>
  );
}

function CategoryStep({
  selected,
  onSelect,
  onNext,
}: {
  selected: VoteCategoryCode | null;
  onSelect: (code: VoteCategoryCode) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">어떤 종류의 투표인가요?</p>

      <div className="grid grid-cols-2 gap-3">
        {VOTE_CATEGORIES.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => onSelect(c.code)}
            className={`flex flex-col gap-1 rounded-2xl border p-4 text-left transition ${
              selected === c.code
                ? "border-primary bg-primary/5"
                : "border-transparent bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <span className="text-xl">{c.emoji}</span>
            <span className="font-bold text-heading">{c.label}</span>
            <span className="text-xs text-muted">{c.description}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!selected}
        className="mt-1 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-40"
      >
        다음
      </button>
    </div>
  );
}

function DetailsStep({
  title,
  optionA,
  optionB,
  onTitle,
  onOptionA,
  onOptionB,
  onSubmit,
  canSubmit,
  isPending,
  errored,
}: {
  title: string;
  optionA: string;
  optionB: string;
  onTitle: (v: string) => void;
  onOptionA: (v: string) => void;
  onOptionB: (v: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isPending: boolean;
  errored: boolean;
}) {
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-heading">투표 제목</span>
        <input
          value={title}
          onChange={(e) => onTitle(e.target.value)}
          placeholder="예: 짜장면 vs 짬뽕, 오늘 점심은?"
          className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-heading outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-heading">A 선택지</span>
          <input
            value={optionA}
            onChange={(e) => onOptionA(e.target.value)}
            placeholder="A안"
            className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-heading outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-heading">B 선택지</span>
          <input
            value={optionB}
            onChange={(e) => onOptionB(e.target.value)}
            placeholder="B안"
            className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-heading outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30"
          />
        </label>
      </div>

      <p className="rounded-xl bg-gray-50 px-4 py-2.5 text-xs text-muted">
        ⏱️ 투표는 생성 후 24시간 동안 진행돼요.
      </p>

      {errored && (
        <p className="text-xs text-red-500">
          투표 생성에 실패했어요. 잠시 후 다시 시도해주세요.
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-1 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-40"
      >
        {isPending ? "만드는 중…" : "투표 만들기 🎉"}
      </button>
    </form>
  );
}
