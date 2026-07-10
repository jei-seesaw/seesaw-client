import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { isAuthenticated } from "@/shared/lib";
import {
  getCompletedVoteEvents,
  getMyCreatedVoteEvents,
  getMyParticipatedVoteEvents,
  getOngoingVoteEvents,
  getVoteEventDetail,
} from "../api/voteEventApi";
import { voteEventKeys } from "./queryKeys";
import type { MyVoteEventsParams, VoteEventsPageInfo } from "./types";

/** 커서 기반 무한 스크롤의 다음 페이지 파라미터. hasNext=false면 중단. */
function getNextCursor(pageInfo: VoteEventsPageInfo): string | undefined {
  return pageInfo.hasNext ? (pageInfo.nextCursor ?? undefined) : undefined;
}

export function useOngoingVoteEventsQuery(params: MyVoteEventsParams = {}) {
  return useInfiniteQuery({
    queryKey: voteEventKeys.ongoing(params),
    queryFn: ({ pageParam }) => getOngoingVoteEvents({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => getNextCursor(lastPage.pageInfo),
    placeholderData: keepPreviousData,
  });
}

export function useCompletedVoteEventsQuery(params: MyVoteEventsParams = {}) {
  return useInfiniteQuery({
    queryKey: voteEventKeys.completed(params),
    queryFn: ({ pageParam }) => getCompletedVoteEvents({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => getNextCursor(lastPage.pageInfo),
    placeholderData: keepPreviousData,
  });
}

/** 내가 만든 투표 목록 (로그인 필요). */
export function useMyCreatedVoteEventsQuery(params: MyVoteEventsParams = {}) {
  return useInfiniteQuery({
    queryKey: voteEventKeys.myCreated(params),
    queryFn: ({ pageParam }) => getMyCreatedVoteEvents({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => getNextCursor(lastPage.pageInfo),
    enabled: isAuthenticated(),
    placeholderData: keepPreviousData,
  });
}

/** 내가 참여한 투표 목록 (로그인 필요). */
export function useMyParticipatedVoteEventsQuery(params: MyVoteEventsParams = {}) {
  return useInfiniteQuery({
    queryKey: voteEventKeys.myParticipated(params),
    queryFn: ({ pageParam }) => getMyParticipatedVoteEvents({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => getNextCursor(lastPage.pageInfo),
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
