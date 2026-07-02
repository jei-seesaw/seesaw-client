import { useState } from "react";
import { Link } from "react-router-dom";
import { getNickname } from "@/shared/lib";
import { useHomeSummaryQuery } from "@/entities/home";
import { AuthModal, useLogout } from "@/features/auth";

export function Header() {
  const [authOpen, setAuthOpen] = useState(false);
  const { data } = useHomeSummaryQuery();
  const logout = useLogout();

  const isLoggedIn = data?.isLoggedIn ?? false;
  const nickname = isLoggedIn ? getNickname() : null;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg text-white">
            ⚡
          </span>
          <span className="text-xl font-bold text-heading">시소</span>
        </Link>

        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            {nickname && (
              <span className="text-sm font-semibold text-heading">
                {nickname}님
              </span>
            )}
            {data?.voteToken != null && (
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-600">
                🪙 {data.voteToken.toLocaleString()}
              </span>
            )}
            <button
              onClick={logout}
              className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-muted transition hover:bg-gray-200"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAuthOpen(true)}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            로그인
          </button>
        )}
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
