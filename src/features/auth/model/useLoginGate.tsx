import { useCallback, useState, type MouseEvent } from "react";
import { useHomeSummaryQuery } from "@/entities/home";
import { AuthModal } from "../ui/AuthModal";

/**
 * 비로그인 상태의 이동을 막고 로그인 모달을 띄우는 게이트.
 *
 * - `guard`: <Link>/<a> 등의 onClick에 연결. 로그인 상태면 통과(기본 이동),
 *   비로그인이면 기본 이동을 막고 로그인 모달을 연다.
 * - `authModal`: 컴포넌트에서 한 번 렌더링한다. (닫혀 있으면 null)
 */
export function useLoginGate() {
  const { data } = useHomeSummaryQuery();
  const isLoggedIn = data?.isLoggedIn ?? false;
  const [open, setOpen] = useState(false);

  const guard = useCallback(
    (e: MouseEvent) => {
      if (isLoggedIn) return;
      e.preventDefault();
      setOpen(true);
    },
    [isLoggedIn],
  );

  const authModal = <AuthModal open={open} onClose={() => setOpen(false)} />;

  return { isLoggedIn, guard, authModal };
}
