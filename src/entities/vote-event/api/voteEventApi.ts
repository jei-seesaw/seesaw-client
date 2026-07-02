import { httpClient } from "@/shared/api";
import type { CompletedVoteEvents, OngoingVoteEvents } from "../model/types";

export function getOngoingVoteEvents(): Promise<OngoingVoteEvents> {
  return httpClient.get<OngoingVoteEvents>("/ongoing-vote-events");
}

export function getCompletedVoteEvents(): Promise<CompletedVoteEvents> {
  return httpClient.get<CompletedVoteEvents>("/completed-vote-events");
}
