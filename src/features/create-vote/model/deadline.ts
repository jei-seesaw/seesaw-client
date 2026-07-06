export interface DeadlineOption {
  /** ISO 8601 문자열 (서버 전송용). */
  value: string;
  /** "오늘 15:00" / "내일 09:00" */
  label: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 생성 시점 이후의 정각들을 마감 후보로 생성한다.
 * (다음 정각부터 생성 시점 + 24시간 이내까지)
 */
export function buildDeadlineOptions(now: Date): DeadlineOption[] {
  const maxTime = now.getTime() + DAY_MS;

  const cursor = new Date(now);
  cursor.setMinutes(0, 0, 0);
  cursor.setHours(cursor.getHours() + 1); // 현재 시각 이후 첫 정각

  const today = now.getDate();
  const options: DeadlineOption[] = [];
  while (cursor.getTime() <= maxTime) {
    const hh = String(cursor.getHours()).padStart(2, "0");
    const dayLabel = cursor.getDate() === today ? "오늘" : "내일";
    options.push({
      value: cursor.toISOString(),
      label: `${dayLabel} ${hh}:00`,
    });
    cursor.setHours(cursor.getHours() + 1);
  }
  return options;
}
