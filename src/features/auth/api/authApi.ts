import { httpClient } from "@/shared/api";
import type {
  AccessToken,
  LoginRequest,
  RegisterRequest,
  RegisterResult,
} from "../model/types";

export function login(body: LoginRequest): Promise<AccessToken> {
  return httpClient.post<AccessToken>("/auth/login", body);
}

export function register(body: RegisterRequest): Promise<RegisterResult> {
  return httpClient.post<RegisterResult>("/register", body);
}
