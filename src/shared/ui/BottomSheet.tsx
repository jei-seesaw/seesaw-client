import type { ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** 화면 하단에 붙어 아래에서 올라오는 모바일 스타일 바텀시트. */
export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={onClose}>
      <div
        className="no-scrollbar max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface p-6 pb-8 shadow-xl animate-[sheet-up_0.28s_ease-out]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}
