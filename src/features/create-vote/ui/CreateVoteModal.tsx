import { useMemo, useRef, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { BottomSheet, WheelPicker } from "@/shared/ui";
import { HttpError } from "@/shared/api";
import { VOTE_CATEGORIES, type VoteCategoryCode } from "@/entities/vote-event";
import { useCreateVoteEvent } from "../model/useCreateVoteEvent";
import { uploadOptionImage } from "../api/imageUploadApi";
import { buildDeadlineOptions, type DeadlineOption } from "../model/deadline";

const ACCEPT = "image/jpeg,image/webp";
const MAX_BYTES = 2 * 1024 * 1024;

interface PickedImage {
  file: File;
  url: string; // 미리보기용 object URL
}

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
  const [imageA, setImageA] = useState<PickedImage | null>(null);
  const [imageB, setImageB] = useState<PickedImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { mutate, isPending, error, reset: resetMutation } = useCreateVoteEvent();

  // 모달을 열 때 기준으로 마감 후보(정각)를 계산. 기본값은 마지막(=최대 24시간).
  const deadlineOptions = useMemo(() => (open ? buildDeadlineOptions(new Date()) : []), [open]);
  const effectiveDeadline = deadlineAt || deadlineOptions[deadlineOptions.length - 1]?.value || "";

  const pending = uploading || isPending;

  function pickImage(current: PickedImage | null, setImage: (v: PickedImage | null) => void, file: File | null) {
    setUploadError(null);
    if (current) URL.revokeObjectURL(current.url);
    if (!file) {
      setImage(null);
      return;
    }
    if (!ACCEPT.split(",").includes(file.type)) {
      setImage(null);
      setUploadError("JPEG 또는 WEBP 이미지만 올릴 수 있어요.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setImage(null);
      setUploadError("이미지는 2MB 이하만 올릴 수 있어요.");
      return;
    }
    setImage({ file, url: URL.createObjectURL(file) });
  }

  function handleClose() {
    if (imageA) URL.revokeObjectURL(imageA.url);
    if (imageB) URL.revokeObjectURL(imageB.url);
    setStep("category");
    setCategory(null);
    setTitle("");
    setOptionA("");
    setOptionB("");
    setDeadlineAt("");
    setImageA(null);
    setImageB(null);
    setUploading(false);
    setUploadError(null);
    resetMutation();
    onClose();
  }

  const canSubmit =
    Boolean(category) &&
    title.trim().length > 0 &&
    optionA.trim().length > 0 &&
    optionB.trim().length > 0 &&
    Boolean(effectiveDeadline) &&
    !pending;

  async function handleSubmit() {
    if (!category || !canSubmit) return;
    setUploadError(null);
    try {
      setUploading(true);
      // 최종 선택된 이미지만 업로드 → URL 확보
      const [optionAImageUrl, optionBImageUrl] = await Promise.all([
        imageA ? uploadOptionImage(imageA.file) : Promise.resolve(null),
        imageB ? uploadOptionImage(imageB.file) : Promise.resolve(null),
      ]);
      mutate(
        {
          category,
          title: title.trim(),
          deadlineAt: effectiveDeadline,
          optionA: optionA.trim(),
          optionB: optionB.trim(),
          optionAImageUrl,
          optionBImageUrl,
        },
        { onSuccess: handleClose },
      );
    } catch {
      setUploadError("이미지 업로드에 실패했어요. 다시 시도해주세요.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <header className="mb-5 grid grid-cols-[1fr_auto_1fr] items-center">
        <div className="justify-self-start">
          {step === "details" && (
            <button
              type="button"
              onClick={() => setStep("category")}
              aria-label="뒤로"
              className="-ml-2 rounded-full p-1.5 text-heading transition hover:bg-gray-100"
            >
              <ChevronLeft size={22} />
            </button>
          )}
        </div>
        <h2 className="text-lg font-bold text-heading">투표 만들기</h2>
        <button
          type="button"
          onClick={handleClose}
          aria-label="닫기"
          className="-mr-2 justify-self-end rounded-full p-1.5 text-muted transition hover:bg-gray-100"
        >
          <X size={22} />
        </button>
      </header>

      {step === "category" ? (
        <CategoryStep selected={category} onSelect={setCategory} onNext={() => setStep("details")} />
      ) : (
        <DetailsStep
          title={title}
          optionA={optionA}
          optionB={optionB}
          imageAUrl={imageA?.url ?? null}
          imageBUrl={imageB?.url ?? null}
          deadlineOptions={deadlineOptions}
          deadline={effectiveDeadline}
          onTitle={setTitle}
          onOptionA={setOptionA}
          onOptionB={setOptionB}
          onPickImageA={(f) => pickImage(imageA, setImageA, f)}
          onPickImageB={(f) => pickImage(imageB, setImageB, f)}
          onDeadline={setDeadlineAt}
          onSubmit={handleSubmit}
          canSubmit={canSubmit}
          pending={pending}
          errorMessage={uploadError ?? getCreateErrorMessage(error)}
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
              selected === c.code ? "border-primary bg-primary/5" : "border-transparent bg-gray-50 hover:bg-gray-100"
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
  imageAUrl,
  imageBUrl,
  deadlineOptions,
  deadline,
  onTitle,
  onOptionA,
  onOptionB,
  onPickImageA,
  onPickImageB,
  onDeadline,
  onSubmit,
  canSubmit,
  pending,
  errorMessage,
}: {
  title: string;
  optionA: string;
  optionB: string;
  imageAUrl: string | null;
  imageBUrl: string | null;
  deadlineOptions: DeadlineOption[];
  deadline: string;
  onTitle: (v: string) => void;
  onOptionA: (v: string) => void;
  onOptionB: (v: string) => void;
  onPickImageA: (file: File | null) => void;
  onPickImageB: (file: File | null) => void;
  onDeadline: (v: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  pending: boolean;
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
          placeholder="예: 신규 프로젝트 로고 시안, 여러분의 선택은?"
          className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-heading outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <OptionField
          label="A 선택지"
          placeholder="A안"
          value={optionA}
          onChange={onOptionA}
          imageUrl={imageAUrl}
          onPickImage={onPickImageA}
        />
        <OptionField
          label="B 선택지"
          placeholder="B안"
          value={optionB}
          onChange={onOptionB}
          imageUrl={imageBUrl}
          onPickImage={onPickImageB}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-heading">마감 시간</span>
        <div className="rounded-xl bg-gray-50 px-4">
          <WheelPicker options={deadlineOptions} value={deadline} onChange={onDeadline} />
        </div>
        <span className="text-xs text-muted">위아래로 넘겨 정각을 선택하세요. (생성 시점부터 24시간 이내)</span>
      </div>

      {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-1 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-40"
      >
        {pending ? "만드는 중…" : "투표 만들기 🎉"}
      </button>
    </form>
  );
}

function OptionField({
  label,
  placeholder,
  value,
  onChange,
  imageUrl,
  onPickImage,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  imageUrl: string | null;
  onPickImage: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-heading">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-heading outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30"
      />
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          onPickImage(e.target.files?.[0] ?? null);
          e.target.value = ""; // 같은 파일 재선택 허용
        }}
      />
      {imageUrl ? (
        <div className="relative h-24 w-full overflow-hidden rounded-xl bg-gray-100">
          <img src={imageUrl} alt={`${label} 이미지`} className="h-full w-full object-contain" />
          <button
            type="button"
            onClick={() => onPickImage(null)}
            aria-label="이미지 제거"
            className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white transition hover:bg-black/70"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-20 w-full items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted transition hover:bg-gray-50"
        >
          ＋ 이미지 추가
        </button>
      )}
    </div>
  );
}
