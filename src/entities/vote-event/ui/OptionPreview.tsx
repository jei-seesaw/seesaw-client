import type { VoteSide } from "../model/types";

interface OptionPreviewProps {
  side: VoteSide;
  label: string;
  imageUrl: string | null;
}

/** 투표 전 선택지 미리보기 박스 (결과는 "?"로 가림). */
export function OptionPreview({ side, label, imageUrl }: OptionPreviewProps) {
  const tone =
    side === "A" ? "bg-indigo-50 text-indigo-500" : "bg-rose-50 text-rose-400";

  return (
    <div
      className={`flex flex-1 flex-col items-center gap-2 rounded-2xl p-4 ${tone}`}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={label}
          className="h-24 w-full rounded-xl object-cover"
        />
      )}
      <span className="text-xl font-bold">?</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
