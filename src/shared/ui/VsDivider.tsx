/**
 * A/B 선택지 사이의 VS 구분 표시.
 * 이미지는 `public/vs.svg`를 교체해 사용한다. (없으면 alt "vs" 노출)
 */
export function VsDivider({ className = "" }: { className?: string }) {
  return (
    <img
      src="/vs.svg"
      alt="vs"
      className={`h-9 w-9 shrink-0 self-center object-contain ${className}`}
    />
  );
}
