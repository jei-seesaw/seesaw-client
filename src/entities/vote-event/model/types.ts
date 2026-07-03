export interface VoteEventListItem {
  id: string;
  categoryName: string;
  /** "hh:mm:ss" 형태의 남은 시간 문자열. */
  remainingTime: string;
  title: string;
  optionA: string;
  optionB: string;
  optionAImageUrl: string | null;
  optionBImageUrl: string | null;
  /** 참여 전(isParticipated=false)에는 null일 수 있음. */
  optionARatio: number | null;
  optionBRatio: number | null;
  totalParticipantCount: number;
  totalTokenAmount: number | null;
  isParticipated: boolean;
}

export type VoteSide = "A" | "B";

export interface VoteEventsPageInfo {
  hasNext: boolean;
  nextCursor: string | null;
}

export interface AffiliationStat {
  affiliationCode: string;
  affiliationName: string;
  optionARatio: number;
  optionBRatio: number;
}

/** GET /vote-events/{id} */
export interface VoteEventDetail {
  categoryName: string;
  title: string;
  totalParticipantCount: number;
  remainingTime: string | null;
  optionA: string;
  optionB: string;
  optionAImageUrl: string | null;
  optionBImageUrl: string | null;
  /** 참여 전에는 null. */
  optionARatio: number | null;
  optionBRatio: number | null;
  /** 옵션별 결과 수량 (배팅=토큰, 그 외=표). 참여 전에는 null. */
  optionAResultAmount: number | null;
  optionBResultAmount: number | null;
  affiliationStats: AffiliationStat[] | null;
  isParticipated: boolean;
  selectedOption: VoteSide | null;
  totalTokenAmount: number | null;
}

/** GET /ongoing-vote-events */
export interface OngoingVoteEvents {
  /** 가장 뜨거운 배틀 (없으면 null). */
  mainVote: VoteEventListItem | null;
  otherVoteEvents: VoteEventListItem[];
  pageInfo: VoteEventsPageInfo;
}

/** GET /completed-vote-events */
export interface CompletedVoteEvents {
  voteEvents: VoteEventListItem[];
  pageInfo: VoteEventsPageInfo;
}
