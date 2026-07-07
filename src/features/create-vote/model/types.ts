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

export interface ImageUploadRequest {
  bytes: number;
  contentType: string;
  purpose: "vote-event-option";
}

/** POST /image-uploads 응답 (Cloudinary signed upload 값). */
export interface ImageUploadSignature {
  allowedContentTypes: string[];
  expiresAt: string;
  formFields: Record<string, string | number>;
  maxBytes: number;
  uploadUrl: string;
}
