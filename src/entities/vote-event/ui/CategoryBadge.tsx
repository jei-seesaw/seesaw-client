import { memo } from "react";
import { getCategoryEmoji } from "../model/category";

export const CategoryBadge = memo(function CategoryBadge({
  categoryName,
}: {
  categoryName: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
      {getCategoryEmoji(categoryName)} {categoryName}
    </span>
  );
});
