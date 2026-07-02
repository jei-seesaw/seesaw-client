import { httpClient } from "@/shared/api";
import type { VoteEventsList } from "../model/types";

export function getOngoingVoteEvents(): Promise<VoteEventsList> {
  return httpClient.get<VoteEventsList>("/ongoing-vote-events");
}

export function getCompletedVoteEvents(): Promise<VoteEventsList> {
  return httpClient.get<VoteEventsList>("/completed-vote-events");
}
