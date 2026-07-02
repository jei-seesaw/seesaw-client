import { useQuery } from "@tanstack/react-query";
import { getNicknameAvailability } from "../api/userApi";
import { userKeys } from "./queryKeys";

/**
 * Checks nickname availability. Disabled while `nickname` is empty so it only
 * fires once there is something to check.
 */
export function useNicknameAvailabilityQuery(nickname: string) {
  const trimmed = nickname.trim();
  return useQuery({
    queryKey: userKeys.nicknameAvailability(trimmed),
    queryFn: () => getNicknameAvailability(trimmed),
    enabled: trimmed.length > 0,
  });
}
