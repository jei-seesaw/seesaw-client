import { useState, type FormEvent } from "react";
import { Modal } from "@/shared/ui";
import { validatePassword } from "@/shared/lib";
import { useAffiliationsQuery } from "@/entities/affiliation";
import {
  getLoginErrorMessage,
  getRegisterErrorMessage,
  useLogin,
  useRegister,
} from "../model/useAuth";
import type { AuthTab } from "../model/types";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>("login");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [affiliationCode, setAffiliationCode] = useState("");

  const affiliations = useAffiliationsQuery();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const pending = loginMutation.isPending || registerMutation.isPending;
  const activeError = tab === "login" ? loginMutation.error : registerMutation.error;
  const errorMessage = activeError
    ? tab === "login"
      ? getLoginErrorMessage(activeError)
      : getRegisterErrorMessage(activeError)
    : null;

  // 회원가입 탭에서만 비밀번호 형식 검증 (로그인은 형식 제약 없이 서버에 위임)
  const passwordCheck = validatePassword(password);
  const showPasswordError =
    tab === "register" && password.length > 0 && !passwordCheck.valid;

  const canSubmit =
    nickname.trim() &&
    password.trim() &&
    (tab === "login" || (affiliationCode && passwordCheck.valid)) &&
    !pending;

  function handleClose() {
    setNickname("");
    setPassword("");
    setAffiliationCode("");
    loginMutation.reset();
    registerMutation.reset();
    onClose();
  }

  function switchTab(next: AuthTab) {
    setTab(next);
    loginMutation.reset();
    registerMutation.reset();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    if (tab === "login") {
      loginMutation.mutate({ nickname, password }, { onSuccess: handleClose });
    } else {
      registerMutation.mutate(
        { nickname, password, affiliationCode },
        { onSuccess: handleClose },
      );
    }
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="flex flex-col items-center gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-2xl text-white">
          ⚡
        </span>
        <h2 className="text-xl font-bold text-heading">시소</h2>
      </div>

      <div className="mt-5 flex rounded-xl bg-gray-100 p-1">
        <TabButton active={tab === "login"} onClick={() => switchTab("login")}>
          로그인
        </TabButton>
        <TabButton
          active={tab === "register"}
          onClick={() => switchTab("register")}
        >
          가입하기
        </TabButton>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <Field
          value={nickname}
          onChange={setNickname}
          placeholder="닉네임"
          autoComplete="username"
        />
        <Field
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="비밀번호"
          autoComplete={tab === "login" ? "current-password" : "new-password"}
        />

        {tab === "register" && (
          <p className={`text-xs ${showPasswordError ? "text-red-500" : "text-muted"}`}>
            {showPasswordError
              ? passwordCheck.message
              : "8~16자, 영문·숫자·특수문자 중 2가지 이상"}
          </p>
        )}

        {tab === "register" && (
          <>
            <select
              value={affiliationCode}
              onChange={(e) => setAffiliationCode(e.target.value)}
              className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-heading outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="" disabled>
                소속
              </option>
              {affiliations.data?.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.name}
                </option>
              ))}
            </select>

            <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-600">
              ⭐ 가입 시 1,000 토큰 증정!
            </p>
          </>
        )}

        {errorMessage && (
          <p className="text-xs text-red-500">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-40"
        >
          {pending ? "처리 중…" : tab === "login" ? "로그인" : "시작하기"}
        </button>
      </form>
    </Modal>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
        active ? "bg-surface text-primary shadow-sm" : "text-muted"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-heading outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30"
    />
  );
}
