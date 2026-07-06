import { keepPreviousData, useQuery } from "@tanstack/react-query";
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

export function useOngoingVoteEventsQuery(params: MyVoteEventsParams = {}) {
  return useQuery({
    queryKey: voteEventKeys.ongoing(params),
    queryFn: () => getOngoingVoteEvents(params),
    placeholderData: keepPreviousData,
  });
}

export function useCompletedVoteEventsQuery(params: MyVoteEventsParams = {}) {
  return useQuery({
    queryKey: voteEventKeys.completed(params),
    queryFn: () => getCompletedVoteEvents(params),
    placeholderData: keepPreviousData,
  });
}

/** 내가 만든 투표 목록 (로그인 필요). */
export function useMyCreatedVoteEventsQuery(params: MyVoteEventsParams = {}) {
  return useQuery({
    queryKey: voteEventKeys.myCreated(params),
    queryFn: () => getMyCreatedVoteEvents(params),
    enabled: isAuthenticated(),
    placeholderData: keepPreviousData,
  });
}

/** 내가 참여한 투표 목록 (로그인 필요). */
export function useMyParticipatedVoteEventsQuery(
  params: MyVoteEventsParams = {},
) {
  return useQuery({
    queryKey: voteEventKeys.myParticipated(params),
    queryFn: () => getMyParticipatedVoteEvents(params),
    enabled: isAuthenticated(),
    placeholderData: keepPreviousData,
  });
}

export function useVoteEventDetailQuery(id: string) {
  return useQuery({
    queryKey: voteEventKeys.detail(id),
    queryFn: () => getVoteEventDetail(id),
    enabled: Boolean(id),
  });
}
