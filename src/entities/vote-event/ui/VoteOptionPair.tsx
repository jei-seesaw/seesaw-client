import type { VoteEventListItem } from "../model/types";

interface VoteOptionPairProps {
  item: VoteEventListItem;
  size?: "sm" | "lg";
}

/** A vs B 선택지 한 쌍. 참여 전이면 비율 대신 "?"를 보여준다. */
export function VoteOptionPair({ item, size = "sm" }: VoteOptionPairProps) {
  return (
    <div className="flex items-stretch gap-2">
      <OptionBox
        side="A"
        label={item.optionA}
        ratio={item.optionARatio}
        size={size}
      />
      <span className="self-center text-xs font-semibold text-muted">vs</span>
      <OptionBox
        side="B"
        label={item.optionB}
        ratio={item.optionBRatio}
        size={size}
      />
    </div>
  );
}

function OptionBox({
  side,
  label,
  ratio,
  size,
}: {
  side: "A" | "B";
  label: string;
  ratio: number | null;
  size: "sm" | "lg";
}) {
  const tone =
    side === "A" ? "bg-indigo-50 text-indigo-500" : "bg-rose-50 text-rose-400";
  const pad = size === "lg" ? "py-7" : "py-5";
  const valueSize = size === "lg" ? "text-xl" : "text-lg";

  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl ${pad} ${tone}`}
    >
      <span className={`font-bold ${valueSize}`}>
        {ratio != null ? `${ratio}%` : "?"}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
