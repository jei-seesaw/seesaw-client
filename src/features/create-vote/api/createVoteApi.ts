import { httpClient } from "@/shared/api";
import type { CreateVoteEventRequest, CreateVoteEventResult } from "../model/types";

export function createVoteEvent(
  body: CreateVoteEventRequest,
): Promise<CreateVoteEventResult> {
  return httpClient.post<CreateVoteEventResult>("/vote-events", body);
}
