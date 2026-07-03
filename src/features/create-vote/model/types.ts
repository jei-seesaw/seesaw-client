import type { VoteCategoryCode } from "@/entities/vote-event";

export interface CreateVoteEventRequest {
  category: VoteCategoryCode;
  title: string;
  optionA: string;
  optionB: string;
  optionAImageUrl?: string | null;
  optionBImageUrl?: string | null;
}

export interface CreateVoteEventResult {
  id: string;
}
