import { useMutation, useQueryClient } from "@tanstack/react-query";
import { homeKeys } from "@/entities/home";
import { voteEventKeys } from "@/entities/vote-event";
import { castVote } from "../api/castVoteApi";

/** 투표 후 상세·목록·보유토큰을 갱신한다. */
export function useCastVote(voteEventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: castVote,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: voteEventKeys.detail(voteEventId),
      });
      queryClient.invalidateQueries({ queryKey: voteEventKeys.ongoing() });
      queryClient.invalidateQueries({ queryKey: homeKeys.summary });
    },
  });
}
