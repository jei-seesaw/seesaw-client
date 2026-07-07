import { httpClient } from "@/shared/api";
import type { VoteSide } from "@/entities/vote-event";

export function confirmBettingResult(
  voteEventId: string,
  winningOption: VoteSide,
): Promise<void> {
  return httpClient.post<void>(`/vote-events/${voteEventId}/betting-result`, {
    winningOption,
  });
}
