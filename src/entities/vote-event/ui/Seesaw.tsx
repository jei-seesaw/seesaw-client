import { useEffect, useState } from "react";
import { ExpandableImage } from "@/shared/ui";
import type { VoteEventDetail, VoteSide } from "../model/types";

const MAX_ANGLE = 11;

/**
 * A/B 비율을 시소처럼 표현. 비율이 높은(무거운) 쪽이 아래로 기운다.
 * 진입 시 0°에서 목표 각도로 기울어지는 애니메이션.
 */
export function Seesaw({ detail }: { detail: VoteEventDetail }) {
  const aRatio = detail.optionARatio ?? 0;
  const bRatio = detail.optionBRatio ?? 0;
  // B가 무거우면 오른쪽이 내려가도록 시계방향(+) 회전
  const target = ((bRatio - aRatio) / 100) * MAX_ANGLE;

  const [angle, setAngle] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setAngle(target), 60);
    return () => clearTimeout(id);
  }, [target]);

  return (
    <div className="flex flex-col items-center pt-2">
      <div
        className="mx-auto w-full max-w-sm origin-center transition-transform duration-700 ease-out"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <div className="flex items-stretch gap-3">
          <Seat side="A" label={detail.optionA} ratio={aRatio} imageUrl={detail.optionAImageUrl} />
          <Seat side="B" label={detail.optionB} ratio={bRatio} imageUrl={detail.optionBImageUrl} />
        </div>
        {/* 시소 널빤지 */}
        <div className="mt-3 h-2 rounded-full bg-gray-300" />
      </div>
      {/* 받침대 */}
      <div className="-mt-1 text-2xl leading-none text-gray-300">▲</div>
    </div>
  );
}

function Seat({
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
  const tone = side === "A" ? "bg-indigo-50 text-indigo-500" : "bg-rose-50 text-rose-400";

  return (
    <div className={`flex-1 overflow-hidden rounded-2xl ${tone}`}>
      {imageUrl && <ExpandableImage src={imageUrl} alt={label} className="h-28 w-full" />}
      <div className={`flex flex-col items-center gap-0.5 px-4 ${imageUrl ? "py-3" : "py-10"}`}>
        <span className="text-2xl font-extrabold leading-none">{ratio}%</span>
        <span className="text-center text-xs font-medium">{label}</span>
      </div>
    </div>
  );
}
