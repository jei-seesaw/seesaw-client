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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

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
