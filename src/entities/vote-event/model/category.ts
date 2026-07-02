/** 투표 카테고리 (서버 categoryName과 매칭되는 한글 라벨). */
export const VOTE_CATEGORIES = ["배팅", "일상", "밸런스", "업무"] as const;

export type VoteCategoryName = (typeof VOTE_CATEGORIES)[number];

const CATEGORY_EMOJI: Record<string, string> = {
  배팅: "🎯",
  일상: "☀️",
  밸런스: "⚖️",
  업무: "💼",
};

const FALLBACK_EMOJI = "🗳️";

export function getCategoryEmoji(categoryName: string): string {
  return CATEGORY_EMOJI[categoryName] ?? FALLBACK_EMOJI;
}
