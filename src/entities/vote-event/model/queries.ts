import { useQuery } from "@tanstack/react-query";
import { isAuthenticated } from "@/shared/lib";
import {
  getCompletedVoteEvents,
  getMyCreatedVoteEvents,
  getMyParticipatedVoteEvents,
  getOngoingVoteEvents,
  getVoteEventDetail,
} from "../api/voteEventApi";
import { voteEventKeys } from "./queryKeys";
import type { MyVoteEventsParams } from "./types";

/** 내가 만든 투표 목록 (로그인 필요). */
export function useMyCreatedVoteEventsQuery(
  params: MyVoteEventsParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: voteEventKeys.myCreated(params),
    queryFn: () => getMyCreatedVoteEvents(params),
    enabled: enabled && isAuthenticated(),
  });
}

/** 내가 참여한 투표 목록 (로그인 필요). */
export function useMyParticipatedVoteEventsQuery(
  params: MyVoteEventsParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: voteEventKeys.myParticipated(params),
    queryFn: () => getMyParticipatedVoteEvents(params),
    enabled: enabled && isAuthenticated(),
  });
}

export function useVoteEventDetailQuery(id: string) {
  return useQuery({
    queryKey: voteEventKeys.detail(id),
    queryFn: () => getVoteEventDetail(id),
    enabled: Boolean(id),
  });
}

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
