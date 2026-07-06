import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getNicknameAvailability,
  getNicknameSuggestion,
} from "../api/userApi";
import { userKeys } from "./queryKeys";

/** 클릭 시 추천 닉네임을 받아온다 (서버가 사용 가능한 값만 반환). */
export function useNicknameSuggestion() {
  return useMutation({ mutationFn: getNicknameSuggestion });
}

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
