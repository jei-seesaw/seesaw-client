import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/entities/chat";

/** 하단에서 이 픽셀 이내면 "맨 아래 근처"로 보고 새 메시지에 자동 추적한다. */
const NEAR_BOTTOM_PX = 80;
/** 상단에서 이 픽셀 이내로 올리면 이전 메시지를 더 불러온다. */
const LOAD_OLDER_PX = 60;

interface Options {
  hasMore: boolean;
  loadingOlder: boolean;
  loadOlder: () => void;
}

interface ChatAutoScroll {
  /** 메시지 스크롤 컨테이너에 연결. */
  listRef: React.RefObject<HTMLDivElement | null>;
  /** 컨테이너 onScroll 핸들러. */
  onScroll: () => void;
  /** 메시지 전송 시 호출 — 다음 렌더에서 화면 맨 아래로 스크롤한다. */
  markSend: () => void;
  /** 위로 올려둔 상태에서 새 메시지가 도착했는지 (점프 버튼 노출용). */
  hasNewMessages: boolean;
  /** 화면 맨 아래로 스크롤 */
  scrollToBottom: (behavior?: ScrollBehavior, page?: boolean) => void;
}

/**
 * 토론 메시지 목록의 스크롤 동작을 한곳에서 관리한다.
 * - 모든 "맨 아래로" 이동은 scrollToBottom 하나로 통일 (리스트 + 페이지 동시).
 * - 최초 로드 / 내가 전송 / 하단 근처에서 수신 → 맨 아래로
 * - 위로 올려 과거 메시지를 불러오면(prepend) 보던 위치를 유지
 * - 위로 올려둔 상태에서 새 메시지가 오면 자동 스크롤 대신 hasNewMessages로 알림
 */
export function useChatAutoScroll(
  messages: ChatMessage[],
  { hasMore, loadingOlder, loadOlder }: Options,
): ChatAutoScroll {
  const listRef = useRef<HTMLDivElement>(null);
  // 사용자가 하단 근처를 보고 있는지 (새 메시지 자동 추적 여부).
  const nearBottom = useRef(true);
  // 직전 메시지 개수 — 0이면 최초 로드.
  const prevCount = useRef(0);
  // 내가 방금 전송했는지 (다음 렌더에서 자동 스크롤).
  const sendPending = useRef(false);
  // prepend 직전 스크롤 상태 — 이후 위치 복원용.
  const olderAnchor = useRef<{ height: number; top: number } | null>(null);
  // 위로 올려둔 상태에서 도착한 새 메시지 알림.
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // 맨 아래로 내리는 단일 경로.
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth", page = true) => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
    if (page) window.scrollTo({ top: document.documentElement.scrollHeight, behavior });
    nearBottom.current = true;
    setHasNewMessages(false);
  }, []);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const wasCount = prevCount.current;
    prevCount.current = messages.length;

    // 과거 메시지 prepend: 늘어난 높이만큼 보정해 보던 위치를 유지.
    const anchor = olderAnchor.current;
    if (anchor) {
      olderAnchor.current = null;
      el.scrollTop = el.scrollHeight - anchor.height + anchor.top;
      return;
    }

    const isSend = sendPending.current;
    sendPending.current = false;

    // 하단에서 벗어나 있는데 새 메시지가 도착 → 자동 스크롤 대신 버튼으로 알림.
    if (wasCount !== 0 && !isSend && !nearBottom.current) {
      if (messages.length > wasCount) setHasNewMessages(true);
      return;
    }

    scrollToBottom(wasCount === 0 ? "auto" : "smooth", isSend);
  }, [messages, scrollToBottom]);

  function onScroll() {
    const el = listRef.current;
    if (!el) return;
    nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    // 하단으로 돌아오면 알림 해제.
    if (nearBottom.current) setHasNewMessages(false);
    // 맨 위 근처에 닿으면 이전 메시지 로드 (중복 요청 방지).
    if (hasMore && !loadingOlder && !olderAnchor.current && el.scrollTop <= LOAD_OLDER_PX) {
      olderAnchor.current = { height: el.scrollHeight, top: el.scrollTop };
      loadOlder();
    }
  }

  function markSend() {
    nearBottom.current = true;
    sendPending.current = true;
  }

  return { listRef, onScroll, markSend, hasNewMessages, scrollToBottom };
}
