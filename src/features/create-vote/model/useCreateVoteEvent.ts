import { useMutation, useQueryClient } from "@tanstack/react-query";
import { homeKeys } from "@/entities/home";
import { voteEventKeys } from "@/entities/vote-event";
import { createVoteEvent } from "../api/createVoteApi";

export function useCreateVoteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVoteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voteEventKeys.ongoing() });
      queryClient.invalidateQueries({ queryKey: homeKeys.summary });
    },
  });
}
