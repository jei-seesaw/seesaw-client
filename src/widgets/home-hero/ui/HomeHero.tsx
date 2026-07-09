import { useHomeSummaryQuery } from "@/entities/home";

export function HomeHero() {
  const { data } = useHomeSummaryQuery();

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-primary">재능인들의 집단지성 공간</span>
        <h1 className="text-4xl font-extrabold leading-tight text-heading">
          지금 재능에서
          <br />
          가장 솔직한 선택 🔥
        </h1>
        <p className="text-sm leading-relaxed text-muted">재능인들의 생각이 궁금할 땐? 시소에서 익명으로 투표!</p>
      </div>

      <dl className="flex gap-10">
        <Stat value={data?.ongoingVoteEventCount ?? 0} unit="개" label="진행중인 투표" />
        <Stat value={data?.participantCount ?? 0} unit="명" label="총 참여자" />
      </dl>
    </section>
  );
}

function Stat({ value, unit, label }: { value: number; unit: string; label: string }) {
  return (
    <div className="flex flex-col">
      <dd className="text-2xl font-bold text-heading">
        {value.toLocaleString()}
        {unit}
      </dd>
      <dt className="text-xs text-muted">{label}</dt>
    </div>
  );
}
