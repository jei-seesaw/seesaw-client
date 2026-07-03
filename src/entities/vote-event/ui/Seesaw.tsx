import { useEffect, useState } from "react";
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
    <div className="flex flex-col items-center pt-6">
      <div
        className="mx-auto w-full max-w-sm origin-center transition-transform duration-700 ease-out"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <div className="flex items-end">
          <Seat
            side="A"
            label={detail.optionA}
            ratio={aRatio}
            imageUrl={detail.optionAImageUrl}
            heavier={aRatio >= bRatio}
          />
          <Seat
            side="B"
            label={detail.optionB}
            ratio={bRatio}
            imageUrl={detail.optionBImageUrl}
            heavier={bRatio > aRatio}
          />
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
  heavier,
}: {
  side: VoteSide;
  label: string;
  ratio: number;
  imageUrl: string | null;
  heavier: boolean;
}) {
  const color = side === "A" ? "text-indigo-500" : "text-rose-400";

  return (
    <div
      className={`flex flex-1 flex-col items-center gap-1 ${heavier ? "" : "opacity-55"}`}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={label}
          className="mb-1 h-20 w-24 rounded-2xl object-cover shadow-sm"
        />
      )}
      <span className={`text-3xl font-extrabold leading-none ${color}`}>
        {ratio}%
      </span>
      <span className={`text-sm font-medium ${color}`}>{label}</span>
    </div>
  );
}
