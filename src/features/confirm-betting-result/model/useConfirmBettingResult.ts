import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpError } from "@/shared/api";
import { homeKeys } from "@/entities/home";
import { voteEventKeys, type VoteSide } from "@/entities/vote-event";
import { confirmBettingResult } from "../api/confirmBettingResultApi";

/** 주최자가 배팅 정답을 확정·정산한다. 성공 시 상세·목록·보유토큰 갱신. */
export function useConfirmBettingResult(voteEventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (winningOption: VoteSide) =>
      confirmBettingResult(voteEventId, winningOption),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voteEventKeys.all });
      queryClient.invalidateQueries({ queryKey: homeKeys.summary });
    },
  });
}

export function getConfirmErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 409) return "이미 결과가 확정된 투표예요.";
    if (error.status === 403) return "주최자만 결과를 확정할 수 있어요.";
    if (error.status === 422) return "배팅 투표가 아니라 확정할 수 없어요.";
  }
  return "결과 확정에 실패했어요. 잠시 후 다시 시도해주세요.";
}
