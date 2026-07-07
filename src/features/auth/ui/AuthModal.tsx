import { useEffect, useRef, useState, type FormEvent } from "react";
import { RefreshCw, Star } from "lucide-react";
import {
  Modal,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import { validatePassword } from "@/shared/lib";
import { useAffiliationsQuery } from "@/entities/affiliation";
import { useNicknameAvailabilityQuery, useNicknameSuggestion } from "@/entities/user";
import { getLoginErrorMessage, getRegisterErrorMessage, useLogin, useRegister } from "../model/useAuth";
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
  const affiliationOptions = (affiliations.data ?? []).map((a) => ({
    value: a.code,
    label: a.name,
  }));
  // 휠은 항상 하나가 중앙에 오므로, 미선택이면 재능교육(없으면 첫 소속)을 기본값으로
  const defaultAffiliation =
    affiliationOptions.find((o) => o.label === "재능교육")?.value ?? affiliationOptions[0]?.value ?? "";
  const effectiveAffiliation = affiliationCode || defaultAffiliation;
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  // 닉네임 중복확인: "중복확인" 버튼으로 확인한 닉네임만 사용 가능 (회원가입 탭 전용)
  const trimmedNickname = nickname.trim();
  const [checkedNickname, setCheckedNickname] = useState("");
  const nicknameQuery = useNicknameAvailabilityQuery(tab === "register" ? checkedNickname : "");
  const suggestion = useNicknameSuggestion();

  // 회원가입 탭에 처음 들어오면 추천 닉네임을 한 번 자동으로 채운다.
  const hasAutoSuggested = useRef(false);
  useEffect(() => {
    if (open && tab === "register" && !hasAutoSuggested.current) {
      hasAutoSuggested.current = true;
      suggestion.mutate(undefined, {
        onSuccess: ({ nickname: suggested }) => {
          setNickname(suggested);
          setCheckedNickname(suggested);
        },
      });
    }
  }, [open, tab, suggestion]);

  // 확인한 닉네임이 현재 입력과 같아야 유효 (입력이 바뀌면 다시 확인 필요)
  const nicknameChecked = tab === "register" && checkedNickname.length > 0 && checkedNickname === trimmedNickname;
  const nicknameChecking = nicknameChecked && nicknameQuery.isFetching;
  const nicknameSettled = nicknameChecked && !nicknameQuery.isFetching;
  const nicknameAvailable = nicknameSettled && nicknameQuery.data?.available === true;
  const nicknameTaken = nicknameSettled && nicknameQuery.data?.available === false;
  const nicknameNeedsCheck = tab === "register" && trimmedNickname.length > 0 && !nicknameChecked;

  const pending = loginMutation.isPending || registerMutation.isPending;
  const activeError = tab === "login" ? loginMutation.error : registerMutation.error;
  const errorMessage = activeError
    ? tab === "login"
      ? getLoginErrorMessage(activeError)
      : getRegisterErrorMessage(activeError)
    : null;

  // 비밀번호 규칙: 8자 이상 (로그인·회원가입 공통)
  const passwordCheck = validatePassword(password);
  const showRegisterPwError = tab === "register" && password.length > 0 && !passwordCheck.valid;
  const showLoginPwError = tab === "login" && password.length > 0 && !passwordCheck.valid;

  const canSubmit = Boolean(
    tab === "login"
      ? trimmedNickname && passwordCheck.valid && !pending
      : trimmedNickname && passwordCheck.valid && effectiveAffiliation && nicknameAvailable && !pending,
  );

  function handleClose() {
    setNickname("");
    setPassword("");
    setAffiliationCode("");
    setCheckedNickname("");
    hasAutoSuggested.current = false;
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

  // 추천 닉네임은 서버가 사용 가능한 값만 주므로 바로 확인 완료 처리
  function handleSuggestNickname() {
    suggestion.mutate(undefined, {
      onSuccess: ({ nickname: suggested }) => {
        setNickname(suggested);
        setCheckedNickname(suggested);
      },
    });
  }

  function switchTab(next: AuthTab) {
    setTab(next);
    // 탭이 바뀌면 입력값을 초기화 (가입 탭으로 가면 추천이 다시 채운다)
    setNickname("");
    setPassword("");
    setAffiliationCode("");
    setCheckedNickname("");
    hasAutoSuggested.current = false;
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
        { nickname, password, affiliationCode: effectiveAffiliation },
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
        <TabButton active={tab === "register"} onClick={() => switchTab("register")}>
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
            {tab === "register" && (
              <button
                type="button"
                onClick={handleSuggestNickname}
                disabled={suggestion.isPending}
                aria-label="닉네임 새로고침"
                title="다른 닉네임 추천"
                className="flex shrink-0 items-center justify-center rounded-xl bg-gray-100 px-3 text-muted transition hover:bg-gray-200 disabled:opacity-50"
              >
                <RefreshCw size={16} className={suggestion.isPending ? "animate-spin" : ""} />
              </button>
            )}
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
          {tab === "register" && password.length === 0 && (
            <p className="text-xs text-muted">8자 이상으로 만들어 주세요</p>
          )}
          {(showRegisterPwError || showLoginPwError) && <p className="text-xs text-red-500">{passwordCheck.message}</p>}
        </div>

        {tab === "register" && (
          <>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-heading">소속</span>
              <Select
                value={effectiveAffiliation}
                onValueChange={setAffiliationCode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="소속 선택" />
                </SelectTrigger>
                <SelectContent>
                  {affiliationOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="flex items-center justify-start gap-1 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-600">
              <Star size={12} className="text-emerald-500" />
              가입 시 1,000 토큰 증정!
            </p>
          </>
        )}

        {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}

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

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
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
