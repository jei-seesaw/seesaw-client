export interface RegisterRequest {
  affiliationCode: string;
  nickname: string;
  password: string;
}

export interface RegisterResult {
  id: string;
}
