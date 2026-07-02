import { httpClient } from "@/shared/api";
import type { RegisterRequest, RegisterResult } from "../model/types";

export function register(body: RegisterRequest): Promise<RegisterResult> {
  return httpClient.post<RegisterResult>("/register", body);
}
