import { useMutation, useQueryClient } from "@tanstack/react-query";
import { homeKeys } from "@/entities/home";
import { voteEventKeys } from "@/entities/vote-event";
import { castVote } from "../api/castVoteApi";

/** 투표 후 상세·목록·보유토큰을 갱신한다. */
export function useCastVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: castVote,
    onSuccess: () => {
      // 상세·모든 목록(파라미터 변형 포함)을 프리픽스로 무효화
      queryClient.invalidateQueries({ queryKey: voteEventKeys.all });
      queryClient.invalidateQueries({ queryKey: homeKeys.summary });
    },
  });
}
