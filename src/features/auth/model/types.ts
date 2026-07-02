export interface LoginRequest {
  nickname: string;
  password: string;
}

export interface RegisterRequest {
  nickname: string;
  password: string;
  affiliationCode: string;
}

export interface AccessToken {
  accessToken: string;
}

export interface RegisterResult {
  id: string;
}

export type AuthTab = "login" | "register";
