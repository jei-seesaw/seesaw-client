import { httpClient } from "@/shared/api";
import type {
  CompletedVoteEvents,
  OngoingVoteEvents,
  VoteEventDetail,
} from "../model/types";

export function getOngoingVoteEvents(): Promise<OngoingVoteEvents> {
  return httpClient.get<OngoingVoteEvents>("/ongoing-vote-events");
}

export function getCompletedVoteEvents(): Promise<CompletedVoteEvents> {
  return httpClient.get<CompletedVoteEvents>("/completed-vote-events");
}

export function getVoteEventDetail(id: string): Promise<VoteEventDetail> {
  return httpClient.get<VoteEventDetail>(`/vote-events/${id}`);
}
