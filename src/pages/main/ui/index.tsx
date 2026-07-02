import { useHealthQuery } from "@/shared/api";
import { useAffiliationsQuery } from "@/entities/affiliation";

export default function MainPage() {
  const health = useHealthQuery();
  const affiliations = useAffiliationsQuery();

  return (
    <div>
      <h1>메인페이지</h1>

      <section>
        <h2>API 상태</h2>
        {health.isLoading && <p>확인 중…</p>}
        {health.isError && <p>health 호출 실패</p>}
        {health.data && <p>status: {health.data.status}</p>}
      </section>

      <section>
        <h2>소속 목록</h2>
        {affiliations.isLoading && <p>불러오는 중…</p>}
        {affiliations.isError && <p>affiliations 호출 실패</p>}
        {affiliations.data && (
          <ul>
            {affiliations.data.map((a) => (
              <li key={a.code}>
                {a.code} — {a.name}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
