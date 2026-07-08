import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ConfettiBoom from "react-confetti-boom";

const COLORS = [
  "#2563eb",
  "#f43f5e",
  "#22c55e",
  "#f59e0b",
  "#a855f7",
  "#06b6d4",
  "#ec4899",
];

interface ConfettiProps {
  /** 폭죽 재생이 끝난 뒤 호출 (정리용). */
  onComplete?: () => void;
  /** 재생 시간(ms). 이후 onComplete 호출. */
  durationMs?: number;
}

/** 화면에서 터지는 폭죽 (react-confetti-boom). */
export function Confetti({ onComplete, durationMs = 2800 }: ConfettiProps) {
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });
  useEffect(() => {
    const t = setTimeout(() => onCompleteRef.current?.(), durationMs);
    return () => clearTimeout(t);
  }, [durationMs]);

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-80">
      {/* 가운데에서 크게 한 번 */}
      <ConfettiBoom
        mode="boom"
        x={0.5}
        y={0.4}
        particleCount={140}
        deg={270}
        spreadDeg={80}
        launchSpeed={1.6}
        shapeSize={12}
        colors={COLORS}
        effectCount={2}
        effectInterval={500}
      />
      {/* 양옆에서 살짝 더 */}
      <ConfettiBoom
        mode="boom"
        x={0.2}
        y={0.55}
        particleCount={50}
        deg={300}
        spreadDeg={60}
        launchSpeed={1.4}
        shapeSize={10}
        colors={COLORS}
      />
      <ConfettiBoom
        mode="boom"
        x={0.8}
        y={0.55}
        particleCount={50}
        deg={240}
        spreadDeg={60}
        launchSpeed={1.4}
        shapeSize={10}
        colors={COLORS}
      />
    </div>,
    document.body,
  );
}
