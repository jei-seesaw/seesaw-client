import { httpClient } from "@/shared/api";
import type { CastVoteRequest } from "../model/types";

export function castVote(body: CastVoteRequest): Promise<void> {
  return httpClient.post<void>("/vote", body);
}
