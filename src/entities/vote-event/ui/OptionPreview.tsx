import { ExpandableImage } from "@/shared/ui";
import type { VoteSide } from "../model/types";

interface OptionPreviewProps {
  side: VoteSide;
  label: string;
  imageUrl: string | null;
  selected?: boolean;
  onClick?: () => void;
}

/**
 * 투표 전 선택지 미리보기 카드 (결과는 "?"로 가림).
 * 박스를 누르면 선택, 이미지를 누르면 확대된다.
 */
export function OptionPreview({ side, label, imageUrl, selected = false, onClick }: OptionPreviewProps) {
  const tone = side === "A" ? "bg-indigo-50 text-indigo-500" : "bg-rose-50 text-rose-400";
  const ring = selected ? (side === "A" ? "ring-2 ring-indigo-400" : "ring-2 ring-rose-400") : "";

  return (
    <div onClick={onClick} className={`flex-1 cursor-pointer overflow-hidden rounded-2xl transition ${tone} ${ring}`}>
      {imageUrl && <ExpandableImage src={imageUrl} alt={label} className="h-28 w-full" />}
      <div className={`flex flex-col items-center gap-1 ${imageUrl ? "py-3" : "py-8"}`}>
        <span className="text-xl font-bold">{selected ? "✓" : "?"}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}
