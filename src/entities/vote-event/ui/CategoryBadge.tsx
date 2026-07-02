const CATEGORY_EMOJI: Record<string, string> = {
  업무: "💼",
  일상: "☀️",
  밸런스: "⚖️",
  배팅: "🎯",
};

export function CategoryBadge({ categoryName }: { categoryName: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
      {CATEGORY_EMOJI[categoryName] ?? "🗳️"} {categoryName}
    </span>
  );
}
