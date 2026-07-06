import type { VoteCategoryCode } from "@/entities/vote-event";

export interface CreateVoteEventRequest {
  category: VoteCategoryCode;
  title: string;
  /** ISO 8601 마감 시각 (정각 단위, 생성 시점~24시간 이내). */
  deadlineAt: string;
  optionA: string;
  optionB: string;
  optionAImageUrl?: string | null;
  optionBImageUrl?: string | null;
}

export interface CreateVoteEventResult {
  id: string;
}
