export interface CategoryDef {
  /** 생성 API에 보내는 코드. */
  code: "betting" | "daily" | "balance" | "work";
  /** 서버가 내려주는 categoryName (한글). */
  label: string;
  emoji: string;
  description: string;
}

export const VOTE_CATEGORIES: readonly CategoryDef[] = [
  { code: "betting", label: "배팅", emoji: "🎯", description: "스포츠 결과 + 토큰 배팅" },
  { code: "daily", label: "일상", emoji: "☀️", description: "가벼운 일상 주제" },
  { code: "balance", label: "밸런스", emoji: "⚖️", description: "A vs B 취향 대결" },
  { code: "work", label: "업무", emoji: "💼", description: "업무 의견 수집" },
];

export type VoteCategoryCode = CategoryDef["code"];

/** 필터 칩·목록에서 쓰는 한글 라벨 배열. */
export const CATEGORY_LABELS = VOTE_CATEGORIES.map((c) => c.label);

const EMOJI_BY_LABEL: Record<string, string> = Object.fromEntries(
  VOTE_CATEGORIES.map((c) => [c.label, c.emoji]),
);

const FALLBACK_EMOJI = "🗳️";

export function getCategoryEmoji(label: string): string {
  return EMOJI_BY_LABEL[label] ?? FALLBACK_EMOJI;
}
