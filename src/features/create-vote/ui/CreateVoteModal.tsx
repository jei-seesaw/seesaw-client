import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { BottomSheet } from "@/shared/ui";
import { HttpError } from "@/shared/api";
import { VOTE_CATEGORIES, type VoteCategoryCode } from "@/entities/vote-event";
import { useCreateVoteEvent } from "../model/useCreateVoteEvent";
import { buildDeadlineOptions, type DeadlineOption } from "../model/deadline";

function getCreateErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof HttpError && error.status === 422) {
    return "마감 시간이 올바르지 않아요. 다시 선택해주세요.";
  }
  return "투표 생성에 실패했어요. 잠시 후 다시 시도해주세요.";
}

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
  const [deadlineAt, setDeadlineAt] = useState("");

  const { mutate, isPending, error, reset: resetMutation } = useCreateVoteEvent();

  // 모달을 열 때 기준으로 마감 후보(정각)를 계산. 기본값은 마지막(=최대 24시간).
  const deadlineOptions = useMemo(
    () => (open ? buildDeadlineOptions(new Date()) : []),
    [open],
  );
  const effectiveDeadline =
    deadlineAt || deadlineOptions[deadlineOptions.length - 1]?.value || "";

  function handleClose() {
    setStep("category");
    setCategory(null);
    setTitle("");
    setOptionA("");
    setOptionB("");
    setDeadlineAt("");
    resetMutation();
    onClose();
  }

  const canSubmit =
    Boolean(category) &&
    title.trim().length > 0 &&
    optionA.trim().length > 0 &&
    optionB.trim().length > 0 &&
    Boolean(effectiveDeadline) &&
    !isPending;

  function handleSubmit() {
    if (!category || !canSubmit) return;
    mutate(
      {
        category,
        title: title.trim(),
        deadlineAt: effectiveDeadline,
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
          deadlineOptions={deadlineOptions}
          deadline={effectiveDeadline}
          onTitle={setTitle}
          onOptionA={setOptionA}
          onOptionB={setOptionB}
          onDeadline={setDeadlineAt}
          onSubmit={handleSubmit}
          canSubmit={canSubmit}
          isPending={isPending}
          errorMessage={getCreateErrorMessage(error)}
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
  deadlineOptions,
  deadline,
  onTitle,
  onOptionA,
  onOptionB,
  onDeadline,
  onSubmit,
  canSubmit,
  isPending,
  errorMessage,
}: {
  title: string;
  optionA: string;
  optionB: string;
  deadlineOptions: DeadlineOption[];
  deadline: string;
  onTitle: (v: string) => void;
  onOptionA: (v: string) => void;
  onOptionB: (v: string) => void;
  onDeadline: (v: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isPending: boolean;
  errorMessage: string | null;
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

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-heading">마감 시간</span>
        <div className="relative">
          <select
            value={deadline}
            onChange={(e) => onDeadline(e.target.value)}
            className="w-full appearance-none rounded-xl bg-gray-50 px-4 py-3 pr-10 text-sm text-heading outline-none focus:ring-2 focus:ring-primary/30"
          >
            {deadlineOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
          />
        </div>
        <span className="text-xs text-muted">
          생성 시점부터 24시간 이내, 정각 단위로 마감돼요.
        </span>
      </label>

      {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}

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
