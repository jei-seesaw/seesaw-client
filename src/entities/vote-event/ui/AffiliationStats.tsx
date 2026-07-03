import type { AffiliationStat } from "../model/types";

/** 소속별 A/B 비율 통계. */
export function AffiliationStats({ stats }: { stats: AffiliationStat[] }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-surface p-5">
      <h2 className="text-sm font-bold text-heading">📊 소속별 통계</h2>

      <div className="flex flex-col gap-4">
        {stats.map((s) => (
          <div key={s.affiliationCode} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-heading">
                {s.affiliationName}
              </span>
              <span className="flex gap-2">
                <span className="font-semibold text-indigo-500">
                  {s.optionARatio}%
                </span>
                <span className="font-semibold text-rose-400">
                  {s.optionBRatio}%
                </span>
              </span>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full">
              <div
                className="bg-indigo-200"
                style={{ width: `${s.optionARatio}%` }}
              />
              <div
                className="bg-rose-200"
                style={{ width: `${s.optionBRatio}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
