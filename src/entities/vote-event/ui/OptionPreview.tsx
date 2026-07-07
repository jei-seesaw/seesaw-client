import type { VoteSide } from "../model/types";

interface OptionPreviewProps {
  side: VoteSide;
  label: string;
  imageUrl: string | null;
  selected?: boolean;
  onClick?: () => void;
}

/** 투표 전 선택지 미리보기 박스 (결과는 "?"로 가림). 클릭 시 선택 가능. */
export function OptionPreview({
  side,
  label,
  imageUrl,
  selected = false,
  onClick,
}: OptionPreviewProps) {
  const tone =
    side === "A" ? "bg-indigo-50 text-indigo-500" : "bg-rose-50 text-rose-400";
  const ring = selected
    ? side === "A"
      ? "ring-2 ring-indigo-400"
      : "ring-2 ring-rose-400"
    : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-2 rounded-2xl p-4 transition hover:brightness-95 ${tone} ${ring}`}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={label}
          className="aspect-square w-full rounded-xl object-cover"
        />
      )}
      <span className="text-xl font-bold">{selected ? "✓" : "?"}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
