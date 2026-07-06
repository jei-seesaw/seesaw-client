import { httpClient } from "@/shared/api";
import type {
  CompletedVoteEvents,
  MyVoteEventsParams,
  OngoingVoteEvents,
  PagedVoteEvents,
  VoteEventDetail,
} from "../model/types";

function toQuery(params: MyVoteEventsParams): string {
  const search = new URLSearchParams();
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.cursor) search.set("cursor", params.cursor);
  if (params.sort) search.set("sort", params.sort);
  if (params.category) search.set("category", params.category);
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function getOngoingVoteEvents(): Promise<OngoingVoteEvents> {
  return httpClient.get<OngoingVoteEvents>("/ongoing-vote-events");
}

export function getCompletedVoteEvents(): Promise<CompletedVoteEvents> {
  return httpClient.get<CompletedVoteEvents>("/completed-vote-events");
}

export function getVoteEventDetail(id: string): Promise<VoteEventDetail> {
  return httpClient.get<VoteEventDetail>(`/vote-events/${id}`);
}

export function getMyCreatedVoteEvents(
  params: MyVoteEventsParams = {},
): Promise<PagedVoteEvents> {
  return httpClient.get<PagedVoteEvents>(`/me/created-vote-events${toQuery(params)}`);
}

export function getMyParticipatedVoteEvents(
  params: MyVoteEventsParams = {},
): Promise<PagedVoteEvents> {
  return httpClient.get<PagedVoteEvents>(
    `/me/participated-vote-events${toQuery(params)}`,
  );
}
