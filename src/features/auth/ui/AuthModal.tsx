import { useState, type FormEvent } from "react";
import { Modal } from "@/shared/ui";
import { validatePassword } from "@/shared/lib";
import { useAffiliationsQuery } from "@/entities/affiliation";
import { useNicknameAvailabilityQuery } from "@/entities/user";
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

  // 닉네임 중복확인: "중복확인" 버튼으로 확인한 닉네임만 사용 가능 (회원가입 탭 전용)
  const trimmedNickname = nickname.trim();
  const [checkedNickname, setCheckedNickname] = useState("");
  const nicknameQuery = useNicknameAvailabilityQuery(
    tab === "register" ? checkedNickname : "",
  );

  // 확인한 닉네임이 현재 입력과 같아야 유효 (입력이 바뀌면 다시 확인 필요)
  const nicknameChecked =
    tab === "register" &&
    checkedNickname.length > 0 &&
    checkedNickname === trimmedNickname;
  const nicknameChecking = nicknameChecked && nicknameQuery.isFetching;
  const nicknameSettled = nicknameChecked && !nicknameQuery.isFetching;
  const nicknameAvailable =
    nicknameSettled && nicknameQuery.data?.available === true;
  const nicknameTaken =
    nicknameSettled && nicknameQuery.data?.available === false;
  const nicknameNeedsCheck =
    tab === "register" && trimmedNickname.length > 0 && !nicknameChecked;

  const pending = loginMutation.isPending || registerMutation.isPending;
  const activeError = tab === "login" ? loginMutation.error : registerMutation.error;
  const errorMessage = activeError
    ? tab === "login"
      ? getLoginErrorMessage(activeError)
      : getRegisterErrorMessage(activeError)
    : null;

  // 비밀번호 규칙: 8자 이상 (로그인·회원가입 공통)
  const passwordCheck = validatePassword(password);
  const showRegisterPwError =
    tab === "register" && password.length > 0 && !passwordCheck.valid;
  const showLoginPwError =
    tab === "login" && password.length > 0 && !passwordCheck.valid;

  const canSubmit = Boolean(
    tab === "login"
      ? trimmedNickname && passwordCheck.valid && !pending
      : trimmedNickname &&
          passwordCheck.valid &&
          affiliationCode &&
          nicknameAvailable &&
          !pending,
  );

  function handleClose() {
    setNickname("");
    setPassword("");
    setAffiliationCode("");
    setCheckedNickname("");
    loginMutation.reset();
    registerMutation.reset();
    onClose();
  }

  function handleCheckNickname() {
    if (!trimmedNickname) return;
    setCheckedNickname(trimmedNickname);
  }

  // 확인 완료된 닉네임을 다시 수정할 수 있도록 잠금 해제
  function handleUnlockNickname() {
    setCheckedNickname("");
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
        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            <div className="flex-1">
              <Field
                value={nickname}
                onChange={setNickname}
                placeholder="닉네임"
                autoComplete="username"
                disabled={nicknameAvailable}
              />
            </div>
            {tab === "register" &&
              (nicknameAvailable ? (
                <button
                  type="button"
                  onClick={handleUnlockNickname}
                  className="shrink-0 rounded-xl bg-gray-100 px-4 text-sm font-semibold text-muted transition hover:bg-gray-200"
                >
                  변경
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCheckNickname}
                  disabled={!trimmedNickname || nicknameChecking}
                  className="shrink-0 rounded-xl bg-gray-100 px-4 text-sm font-semibold text-heading transition hover:bg-gray-200 disabled:opacity-40"
                >
                  중복확인
                </button>
              ))}
          </div>
          {tab === "register" && trimmedNickname.length > 0 && (
            <NicknameFeedback
              needsCheck={nicknameNeedsCheck}
              checking={nicknameChecking}
              available={nicknameAvailable}
              taken={nicknameTaken}
            />
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Field
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="비밀번호"
            autoComplete={tab === "login" ? "current-password" : "new-password"}
          />
          {tab === "register" && (
            <p
              className={`text-xs ${showRegisterPwError ? "text-red-500" : "text-muted"}`}
            >
              {showRegisterPwError
                ? passwordCheck.message
                : "8자 이상으로 만들어 주세요"}
            </p>
          )}
          {showLoginPwError && (
            <p className="text-xs text-red-500">{passwordCheck.message}</p>
          )}
        </div>

        {tab === "register" && (
          <>
            <div className="relative">
              <select
                value={affiliationCode}
                onChange={(e) => setAffiliationCode(e.target.value)}
                className="w-full appearance-none rounded-xl bg-gray-50 px-4 py-3 pr-10 text-sm text-heading outline-none focus:ring-2 focus:ring-primary/30"
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
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted">
                ▾
              </span>
            </div>

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

function NicknameFeedback({
  needsCheck,
  checking,
  available,
  taken,
}: {
  needsCheck: boolean;
  checking: boolean;
  available: boolean;
  taken: boolean;
}) {
  if (checking) {
    return <p className="text-xs text-muted">닉네임 확인 중…</p>;
  }
  if (available) {
    return <p className="text-xs text-emerald-600">사용 가능한 닉네임이에요.</p>;
  }
  if (taken) {
    return <p className="text-xs text-red-500">이미 사용 중인 닉네임이에요.</p>;
  }
  if (needsCheck) {
    return <p className="text-xs text-muted">중복확인을 눌러주세요.</p>;
  }
  return null;
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
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      disabled={disabled}
      className="w-full rounded-xl bg-gray-50 px-4 py-3 text-sm text-heading outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:text-muted"
    />
  );
}
