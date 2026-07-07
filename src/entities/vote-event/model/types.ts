import type { VoteCategoryCode } from "./category";

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

/** 커서 기반 페이지네이션 목록 (완료/내 투표 공통 형태). */
export interface PagedVoteEvents {
  voteEvents: VoteEventListItem[];
  pageInfo: VoteEventsPageInfo;
}

export type MyVoteSort = "latest" | "deadline" | "participants";

export interface MyVoteEventsParams {
  /** latest=최신순, deadline=마감임박순, participants=참여자순. */
  sort?: MyVoteSort;
  category?: VoteCategoryCode;
  limit?: number;
  cursor?: string;
}

export interface AffiliationStat {
  affiliationCode: string;
  affiliationName: string;
  optionARatio: number;
  optionBRatio: number;
}

/** 배팅 투표에서 내 배팅/보상 정보. */
export interface BettingInfo {
  /** 내가 배팅한 토큰. */
  myTokenAmount: number;
  /** 배당률 (배수). */
  payoutRate: number;
  /** 획득(예정) 토큰. 확정 전에는 null. */
  earnedTokenAmount: number | null;
  /** 배팅 결과 확정 여부. */
  resultConfirmed: boolean;
  /** 보상 수령 여부 (확정 전 등 해당 없으면 null). */
  rewardClaimed: boolean | null;
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
  /** 내가 만든(주최한) 투표인지. */
  isOrganizer: boolean;
  /** 지금 배팅 결과를 확정할 수 있는지 (배팅·마감·미확정 등). */
  canConfirmBettingResult: boolean;
  /** 확정된 배팅 정답 (미확정이면 null). */
  bettingResultOption: VoteSide | null;
  bettingResultConfirmedAt: string | null;
  /** 배팅 참여 정보 (비참여/비배팅이면 null). */
  bettingInfo: BettingInfo | null;
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
