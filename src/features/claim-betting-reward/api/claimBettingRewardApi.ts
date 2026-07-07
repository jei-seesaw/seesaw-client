import { httpClient } from "@/shared/api";

export interface ClaimBettingRewardResult {
  earnedTokenAmount: number;
  rewardClaimed: boolean;
}

export function claimBettingReward(
  voteEventId: string,
): Promise<ClaimBettingRewardResult> {
  return httpClient.post<ClaimBettingRewardResult>(
    `/vote-events/${voteEventId}/betting-reward/claim`,
  );
}
