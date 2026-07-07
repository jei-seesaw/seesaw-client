import { useEffect, useRef, type PointerEvent } from "react";

interface WheelOption {
  value: string;
  label: string;
}

interface WheelPickerProps {
  options: WheelOption[];
  value: string;
  onChange: (value: string) => void;
  /** 보이는 줄 수(홀수). 3이면 위아래 1개씩. 기본 5. */
  visibleCount?: number;
}

const ITEM_H = 40; // px
const DRAG_THRESHOLD = 4; // px 이상 움직이면 드래그로 간주
const MOMENTUM_MS = 180; // 관성 투영 시간 (놓을 때 속도 × 이 값만큼 더 이동)
const IDLE_MS = 60; // 이 시간 이상 멈췄다 놓으면 관성 없음

function clampIndex(scrollTop: number, length: number): number {
  return Math.min(length - 1, Math.max(0, Math.round(scrollTop / ITEM_H)));
}

/**
 * iOS 드럼 스타일 휠 피커.
 * - 위/아래 항목 클릭(탭) → 그 항목으로 이동
 * - 마우스 클릭-드래그 → 관성(flick) 스크롤, 터치 드래그·휠도 지원
 */
export function WheelPicker({
  options,
  value,
  onChange,
  visibleCount = 5,
}: WheelPickerProps) {
  const pad = ((visibleCount - 1) / 2) * ITEM_H;
  const ref = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const snapRestore = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 마우스 드래그 상태
  const dragging = useRef(false);
  const moved = useRef(false);
  const startY = useRef(0);
  const startScroll = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0); // px/ms (scrollTop 기준)

  // 최초 1회: 현재 선택값 위치로 스크롤
  useEffect(() => {
    if (didInit.current || !ref.current) return;
    const idx = options.findIndex((o) => o.value === value);
    if (idx >= 0) {
      ref.current.scrollTop = idx * ITEM_H;
      didInit.current = true;
    }
  }, [options, value]);

  function setSnap(enabled: boolean) {
    if (ref.current) ref.current.style.scrollSnapType = enabled ? "" : "none";
  }

  function scrollToIndex(idx: number, smooth = true) {
    ref.current?.scrollTo({
      top: idx * ITEM_H,
      behavior: smooth ? "smooth" : "auto",
    });
  }

  function commitCentered() {
    const el = ref.current;
    if (!el) return;
    const next = options[clampIndex(el.scrollTop, options.length)]?.value;
    if (next && next !== value) onChange(next);
  }

  function handleScroll() {
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(commitCentered, 80);
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch" || !ref.current) return; // 터치는 네이티브 스크롤
    dragging.current = true;
    moved.current = false;
    startY.current = e.clientY;
    startScroll.current = ref.current.scrollTop;
    lastY.current = e.clientY;
    lastTime.current = e.timeStamp;
    velocity.current = 0;
    clearTimeout(snapRestore.current);
    setSnap(false); // 드래그 중 스냅 해제 → 매끄럽게 따라옴
    ref.current.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!dragging.current || !el) return;
    const dy = e.clientY - startY.current;
    if (Math.abs(dy) > DRAG_THRESHOLD) moved.current = true;

    const prev = el.scrollTop;
    el.scrollTop = startScroll.current - dy;

    const dt = e.timeStamp - lastTime.current;
    if (dt > 0) velocity.current = (el.scrollTop - prev) / dt;
    lastY.current = e.clientY;
    lastTime.current = e.timeStamp;
  }

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!dragging.current || !el) return;
    dragging.current = false;
    el.releasePointerCapture(e.pointerId);

    // 멈췄다 놓으면 관성 없음
    const idle = e.timeStamp - lastTime.current > IDLE_MS;
    const projected = el.scrollTop + (idle ? 0 : velocity.current * MOMENTUM_MS);
    scrollToIndex(clampIndex(projected, options.length));

    // 스냅은 부드러운 스크롤이 끝난 뒤 복구 (도착 지점이 이미 정확한 칸이라 튐 없음)
    snapRestore.current = setTimeout(() => setSnap(true), 400);
  }

  return (
    <div
      className="relative select-none"
      style={{ height: visibleCount * ITEM_H }}
    >
      {/* 가운데 선택 밴드 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-xl bg-primary/10"
        style={{ height: ITEM_H }}
      />
      {/* 위아래 페이드 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-linear-to-b from-surface to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-linear-to-t from-surface to-transparent" />

      <div
        ref={ref}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="no-scrollbar h-full cursor-grab snap-y snap-mandatory overflow-y-scroll active:cursor-grabbing"
      >
        <div style={{ height: pad }} />
        {options.map((o, i) => (
          <div
            key={o.value}
            onClick={() => {
              if (moved.current) return; // 드래그였으면 클릭 무시
              scrollToIndex(i);
            }}
            className={`flex cursor-pointer snap-center items-center justify-center text-sm transition ${
              o.value === value ? "font-bold text-heading" : "text-muted/70"
            }`}
            style={{ height: ITEM_H }}
          >
            {o.label}
          </div>
        ))}
        <div style={{ height: pad }} />
      </div>
    </div>
  );
}
