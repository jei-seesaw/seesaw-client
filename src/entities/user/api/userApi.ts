import { httpClient } from "@/shared/api";
import type { NicknameAvailability } from "../model/types";

export function getNicknameAvailability(
  nickname: string,
): Promise<NicknameAvailability> {
  const query = new URLSearchParams({ nickname }).toString();
  return httpClient.get<NicknameAvailability>(
    `/users/nickname-availability?${query}`,
  );
}
