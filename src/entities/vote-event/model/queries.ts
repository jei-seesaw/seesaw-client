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

/** 완료 목록은 완료 탭을 열었을 때만 조회하도록 enabled로 게이팅한다. */
export function useCompletedVoteEventsQuery(enabled = true) {
  return useQuery({
    queryKey: voteEventKeys.completed(),
    queryFn: getCompletedVoteEvents,
    enabled,
  });
}
