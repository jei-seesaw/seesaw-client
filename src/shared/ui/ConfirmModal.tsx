import { Modal } from "./Modal";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

/** 확인/취소 두 버튼을 가진 범용 확인 모달. */
export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-base font-bold text-heading">{title}</h2>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-semibold text-muted transition hover:bg-gray-200"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:brightness-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
