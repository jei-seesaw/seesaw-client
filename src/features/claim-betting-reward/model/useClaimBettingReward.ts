import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpError } from "@/shared/api";
import { homeKeys } from "@/entities/home";
import { voteEventKeys } from "@/entities/vote-event";
import { claimBettingReward } from "../api/claimBettingRewardApi";

/** 배팅 보상 수령. 성공 시 상세·목록·보유토큰 갱신. */
export function useClaimBettingReward(voteEventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => claimBettingReward(voteEventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voteEventKeys.all });
      queryClient.invalidateQueries({ queryKey: homeKeys.summary });
    },
  });
}

export function getClaimErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 409) return "아직 배팅 결과가 확정되지 않았어요.";
    if (error.status === 403) return "배팅 참여자만 수령할 수 있어요.";
    if (error.status === 422) return "배팅 투표가 아니라 수령할 수 없어요.";
  }
  return "보상 수령에 실패했어요. 잠시 후 다시 시도해주세요.";
}
