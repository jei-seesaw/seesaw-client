import { clearToken, getToken, setToken } from "@/shared/lib";
import type { ApiEnvelope } from "./types";

const BASE_URL = "/api/v2";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

/**
 * accessToken 재발급 (refreshToken HttpOnly 쿠키 기반).
 * 동시 401이 여러 개 떠도 refresh는 한 번만 수행하도록 프라미스를 공유한다.
 */
let refreshPromise: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          clearToken();
          return false;
        }
        const body = (await res.json()) as ApiEnvelope<{ accessToken: string }>;
        setToken(body.data.accessToken);
        return true;
      })
      .catch(() => {
        clearToken();
        return false;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request<T>(
  path: string,
  init?: RequestInit,
  allowRetry = true,
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  // accessToken 만료(401)면 한 번만 refresh 후 원 요청을 재시도.
  // (인증 엔드포인트 자체의 401은 자격증명 오류이므로 제외)
  if (res.status === 401 && allowRetry && !path.startsWith("/auth/")) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return request<T>(path, init, false);
  }

  if (!res.ok) {
    throw new HttpError(res.status, res.statusText);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  // Unwrap the `{ data }` envelope so callers get the payload directly.
  const body = (await res.json()) as ApiEnvelope<T>;
  return body.data;
}

export const httpClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
};
