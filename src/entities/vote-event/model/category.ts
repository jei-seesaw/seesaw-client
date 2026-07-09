export interface CategoryDef {
  /** 생성 API에 보내는 코드. */
  code: "betting" | "daily" | "balance" | "work";
  /** 서버가 내려주는 categoryName (한글). */
  label: string;
  emoji: string;
  description: string;
  /** 투표 만들기 - 제목 입력 placeholder 예시. */
  titlePlaceholder: string;
}

export const VOTE_CATEGORIES: readonly CategoryDef[] = [
  {
    code: "work",
    label: "업무",
    emoji: "💼",
    description: "업무 의견 수집",
    titlePlaceholder: "예: 신규 프로젝트 로고 시안, 여러분의 선택은?",
  },
  {
    code: "daily",
    label: "일상",
    emoji: "☀️",
    description: "가벼운 일상 주제",
    titlePlaceholder: "예: 짜장면 vs 짬뽕, 오늘 팀 점심 메뉴는?",
  },
  {
    code: "balance",
    label: "밸런스",
    emoji: "⚖️",
    description: "A vs B 취향 대결",
    titlePlaceholder: "예: 일할 때 내 업무 효율을 높여주는 플레이리스트는?",
  },
  {
    code: "betting",
    label: "배팅",
    emoji: "🎯",
    description: "결과 + 토큰 내기",
    titlePlaceholder: "예: 오늘 프로야구 빅매치, 과연 승리할 팀은 어디?",
  },
];

export type VoteCategoryCode = CategoryDef["code"];

/** 필터 칩·목록에서 쓰는 한글 라벨 배열. */
export const CATEGORY_LABELS = VOTE_CATEGORIES.map((c) => c.label);

const EMOJI_BY_LABEL: Record<string, string> = Object.fromEntries(VOTE_CATEGORIES.map((c) => [c.label, c.emoji]));

const FALLBACK_EMOJI = "🗳️";

export function getCategoryEmoji(label: string): string {
  return EMOJI_BY_LABEL[label] ?? FALLBACK_EMOJI;
}
