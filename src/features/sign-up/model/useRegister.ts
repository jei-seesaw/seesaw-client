import { useMutation } from "@tanstack/react-query";
import { HttpError } from "@/shared/api";
import { register } from "../api/signUpApi";

/** Maps register error statuses to user-facing messages. */
export function getRegisterErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    switch (error.status) {
      case 400:
        return "입력한 정보가 올바르지 않습니다.";
      case 409:
        return "이미 사용 중인 닉네임입니다.";
      case 422:
        return "존재하지 않는 소속입니다.";
    }
  }
  return "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.";
}

export function useRegister() {
  return useMutation({
    mutationFn: register,
  });
}
