import type { VoteSide } from "@/entities/vote-event";

export interface CastVoteRequest {
  voteEventId: string;
  selectedOption: VoteSide;
  /** 배팅 카테고리에서만 사용. */
  tokenAmount?: number;
}
