export interface HomeSummary {
  isLoggedIn: boolean;
  ongoingVoteEventCount: number;
  completedVoteEventCount: number;
  participantCount: number;
  /** Present only when logged in. */
  voteToken?: number;
}
