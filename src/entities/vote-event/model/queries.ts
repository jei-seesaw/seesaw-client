import { useQuery } from "@tanstack/react-query";
import {
  getCompletedVoteEvents,
  getOngoingVoteEvents,
} from "../api/voteEventApi";
import { voteEventKeys } from "./queryKeys";

export function useOngoingVoteEventsQuery() {
  return useQuery({
    queryKey: voteEventKeys.ongoing(),
    queryFn: getOngoingVoteEvents,
  });
}

export function useCompletedVoteEventsQuery() {
  return useQuery({
    queryKey: voteEventKeys.completed(),
    queryFn: getCompletedVoteEvents,
  });
}
