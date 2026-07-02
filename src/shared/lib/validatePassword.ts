const MIN_LENGTH = 8;

export interface PasswordCheck {
  valid: boolean;
  message?: string;
}

/** 비밀번호 규칙: 8자 이상. */
export function validatePassword(password: string): PasswordCheck {
  if (password.length < MIN_LENGTH) {
    return { valid: false, message: "비밀번호는 8자 이상이어야 해요." };
  }
  return { valid: true };
}
