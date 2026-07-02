import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthModal } from "@/features/auth";

export function Header() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg text-white">
            ⚡
          </span>
          <span className="text-xl font-bold text-heading">시소</span>
        </Link>

        <button
          onClick={() => setAuthOpen(true)}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
        >
          로그인
        </button>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
