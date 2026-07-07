import { useState } from "react";
import { createPortal } from "react-dom";
import { Expand, X } from "lucide-react";

interface ExpandableImageProps {
  src: string;
  alt: string;
  /** 썸네일 컨테이너 크기/모양 클래스 (예: "h-20 w-24 rounded-2xl"). */
  className?: string;
}

/** 호버 시 "확대" 버튼, 클릭 시 오버레이로 원본을 크게 보여준다. */
export function ExpandableImage({ src, alt, className = "" }: ExpandableImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // 선택 등 부모 클릭과 겹치지 않게
          setOpen(true);
        }}
        aria-label="이미지 확대"
        className={`group relative block overflow-hidden ${className}`}
      >
        <img src={src} alt={alt} className="h-full w-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition group-hover:opacity-100">
          <span className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">
            <Expand size={11} /> 확대
          </span>
        </span>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 p-6"
            onClick={() => setOpen(false)}
          >
            <img
              src={src}
              alt={alt}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-full rounded-xl object-contain"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="닫기"
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
