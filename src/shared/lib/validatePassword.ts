const MIN_LENGTH = 8;
const MAX_LENGTH = 16;

const HAS_LETTER = /[a-zA-Z]/;
const HAS_DIGIT = /\d/;
const HAS_SPECIAL = /[^a-zA-Z0-9]/;

export interface PasswordCheck {
  valid: boolean;
  message?: string;
}

/**
 * 비밀번호 규칙: 8~16자, {영문, 숫자, 특수문자} 중 2가지 이상 포함.
 */
export function validatePassword(password: string): PasswordCheck {
  if (password.length < MIN_LENGTH || password.length > MAX_LENGTH) {
    return { valid: false, message: "비밀번호는 8~16자여야 합니다." };
  }

  const kinds = [HAS_LETTER, HAS_DIGIT, HAS_SPECIAL].filter((re) =>
    re.test(password),
  ).length;

  if (kinds < 2) {
    return {
      valid: false,
      message: "영문·숫자·특수문자 중 2가지 이상을 포함해야 합니다.",
    };
  }

  return { valid: true };
}
