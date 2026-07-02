const TOKEN_KEY = "seesaw_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

interface TokenPayload {
  nickname?: string;
  exp?: number;
}

/** JWT payload를 디코드 (UTF-8 안전). 형식이 잘못되면 null. */
function decodeTokenPayload(): TokenPayload | null {
  const token = getToken();
  const payload = token?.split(".")[1];
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}

/** 현재 로그인한 사용자의 닉네임 (토큰 기준). 없으면 null. */
export function getNickname(): string | null {
  return decodeTokenPayload()?.nickname ?? null;
}
