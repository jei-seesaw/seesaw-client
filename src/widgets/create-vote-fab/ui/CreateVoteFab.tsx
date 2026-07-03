import { useState } from "react";
import { useHomeSummaryQuery } from "@/entities/home";
import { AuthModal } from "@/features/auth";
import { CreateVoteModal } from "@/features/create-vote";

/**
 * 플로팅 "투표 만들기" 버튼.
 * 로그인 상태면 생성 모달, 아니면 로그인 모달을 연다 (생성은 인증 필요).
 */
export function CreateVoteFab() {
  const { data } = useHomeSummaryQuery();
  const isLoggedIn = data?.isLoggedIn ?? false;

  const [createOpen, setCreateOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  function handleClick() {
    if (isLoggedIn) setCreateOpen(true);
    else setAuthOpen(true);
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-8 right-8 z-40 flex items-center gap-1.5 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-95"
      >
        <span className="text-base leading-none">＋</span> 투표 만들기
      </button>

      <CreateVoteModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
