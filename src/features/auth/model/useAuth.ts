import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpError } from "@/shared/api";
import { setToken } from "@/shared/lib";
import { homeKeys } from "@/entities/home";
import { voteEventKeys } from "@/entities/vote-event";
import { login, register } from "../api/authApi";

/** 로그인/가입 성공 후 인증 상태에 영향받는 데이터를 다시 불러온다. */
function useAuthSuccess() {
  const queryClient = useQueryClient();
  return (accessToken: string) => {
    setToken(accessToken);
    queryClient.invalidateQueries({ queryKey: homeKeys.summary });
    queryClient.invalidateQueries({ queryKey: voteEventKeys.all });
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
