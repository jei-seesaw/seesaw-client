import { useEffect, useState } from "react";

function parseHms(s: string): number | null {
  const m = /^(\d+):(\d{2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

const URGENT_SEC = 10 * 60; // 10분 이내면 강조

function format(sec: number): string {
  if (sec <= 0) return "종료";
  if (sec > 3600) return `${Math.floor(sec / 3600)}시간 후 종료`;
  if (sec > 60) return `${Math.floor(sec / 60)}분 ${sec % 60}초 후 종료`;
  return `${sec}초 후 종료`;
}

export interface LiveRemaining {
  label: string;
  /** 10분 이내(진행중)면 true → 빨간색 등 강조용. */
  urgent: boolean;
}

/**
 * 서버가 준 "HH:MM:SS" 남은 시간을 1초마다 실시간으로 줄인다.
 * - 1시간 초과: "N시간 후 종료"
 * - 1시간 이내: "M분 S초 후 종료"
 * - 1분 이내: "S초 후 종료"
 * - 종료/파싱 불가: "종료" / 원본
 */
export function useLiveRemaining(
  remainingTime: string,
  /** 이 남은시간을 실제로 받은 시각(ms epoch). 보통 React Query의 dataUpdatedAt.
   *  재마운트해도 앵커가 동일해야 값이 늘어나지 않는다. */
  anchorMs?: number,
): LiveRemaining {
  const [prev, setPrev] = useState(remainingTime);
  const [seconds, setSeconds] = useState(() => parseHms(remainingTime));

  // remainingTime이 바뀌면(재조회 등) 렌더 중에 초를 다시 맞춘다.
  if (remainingTime !== prev) {
    setPrev(remainingTime);
    setSeconds(parseHms(remainingTime));
  }

  useEffect(() => {
    const initial = parseHms(remainingTime);
    if (initial == null || initial <= 0) return;
    // 데이터를 받은 시각 기준의 절대 종료시각에 고정.
    // 매초 "종료시각 - 현재시각"으로 재계산 → 인터벌 드리프트도, 재마운트 시 밀림도 없음.
    const endTime = (anchorMs ?? Date.now()) + initial * 1000;
    const update = () =>
      setSeconds(Math.max(0, Math.round((endTime - Date.now()) / 1000)));
    const immediate = setTimeout(update, 0); // 마운트 직후 즉시 보정
    const id = setInterval(update, 1000);
    return () => {
      clearTimeout(immediate);
      clearInterval(id);
    };
  }, [remainingTime, anchorMs]);

  if (seconds == null) return { label: remainingTime, urgent: false };
  return {
    label: format(seconds),
    urgent: seconds > 0 && seconds <= URGENT_SEC,
  };
}
