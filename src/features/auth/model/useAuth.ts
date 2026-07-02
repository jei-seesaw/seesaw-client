import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpError } from "@/shared/api";
import { clearToken, setToken } from "@/shared/lib";
import { homeKeys } from "@/entities/home";
import { voteEventKeys } from "@/entities/vote-event";
import { login, register } from "../api/authApi";

/** 인증 상태(로그인 여부·토큰·참여 여부)에 영향받는 데이터를 다시 불러온다. */
function useInvalidateAuthScopedQueries() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: homeKeys.summary });
    queryClient.invalidateQueries({ queryKey: voteEventKeys.all });
  };
}

function useAuthSuccess() {
  const invalidate = useInvalidateAuthScopedQueries();
  return (accessToken: string) => {
    setToken(accessToken);
    invalidate();
  };
}

/** 로그아웃: 토큰을 지우고 인증 의존 데이터를 갱신한다. */
export function useLogout() {
  const invalidate = useInvalidateAuthScopedQueries();
  return () => {
    clearToken();
    invalidate();
  };
}

export function useLogin() {
  const onAuthenticated = useAuthSuccess();
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => onAuthenticated(data.accessToken),
  });
}

/** 회원가입 후 동일 자격증명으로 자동 로그인 → "시작하기" 흐름. */
export function useRegister() {
  const onAuthenticated = useAuthSuccess();
  return useMutation({
    mutationFn: async (body: Parameters<typeof register>[0]) => {
      await register(body);
      return login({ nickname: body.nickname, password: body.password });
    },
    onSuccess: (data) => onAuthenticated(data.accessToken),
  });
}

export function getLoginErrorMessage(error: unknown): string {
  if (error instanceof HttpError && error.status === 401) {
    return "닉네임 또는 비밀번호가 올바르지 않습니다.";
  }
  return "로그인에 실패했습니다. 잠시 후 다시 시도해주세요.";
}

export function getRegisterErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 409) return "이미 사용 중인 닉네임입니다.";
    if (error.status === 422) return "존재하지 않는 소속입니다.";
    if (error.status === 400) return "입력한 정보가 올바르지 않습니다.";
  }
  return "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.";
}
