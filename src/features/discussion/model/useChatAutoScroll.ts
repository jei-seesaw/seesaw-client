import { useLayoutEffect, useRef, useState } from "react";
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
  /** 입력창 아래 스크롤 기준점에 연결. */
  bottomRef: React.RefObject<HTMLDivElement | null>;
  /** 컨테이너 onScroll 핸들러. */
  onScroll: () => void;
  /** 메시지 전송 시 호출 — 다음 렌더에서 맨 아래(+페이지)로 스크롤한다. */
  markSend: () => void;
  /** 위로 올려둔 상태에서 새 메시지가 도착했는지 (점프 버튼 노출용). */
  hasNewMessages: boolean;
  /** 리스트를 맨 아래로 스크롤 (점프 버튼 클릭용). */
  scrollToBottom: () => void;
}

/**
 * 토론 메시지 목록의 스크롤 동작을 한곳에서 관리한다.
 * - 최초 로드 / 내가 전송 / 하단 근처에서 수신 → 맨 아래로
 * - 내가 전송한 경우엔 페이지까지 내려 입력창을 화면 맨 아래에 노출
 * - 위로 올려 과거 메시지를 불러오면(prepend) 보던 위치를 유지
 * - 위로 올려둔 상태에서 새 메시지가 오면 자동 스크롤 대신 hasNewMessages로 알림
 */
export function useChatAutoScroll(
  messages: ChatMessage[],
  { hasMore, loadingOlder, loadOlder }: Options,
): ChatAutoScroll {
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  // 사용자가 하단 근처를 보고 있는지 (새 메시지 자동 추적 여부).
  const nearBottom = useRef(true);
  // 직전 메시지 개수 — 0이면 최초 로드.
  const prevCount = useRef(0);
  // 내가 방금 전송했는지 (다음 렌더에서 페이지까지 스크롤).
  const sendPending = useRef(false);
  // prepend 직전 스크롤 상태 — 이후 위치 복원용.
  const olderAnchor = useRef<{ height: number; top: number } | null>(null);
  // 위로 올려둔 상태에서 도착한 새 메시지 알림.
  const [hasNewMessages, setHasNewMessages] = useState(false);

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

    // 최초 로드 / 내 전송 / 하단 근처 수신 → 맨 아래로.
    const behavior: ScrollBehavior = wasCount === 0 ? "auto" : "smooth";
    el.scrollTo({ top: el.scrollHeight, behavior });
    if (isSend) bottomRef.current?.scrollIntoView({ behavior, block: "end" });
    setHasNewMessages(false);
  }, [messages]);

  function onScroll() {
    const el = listRef.current;
    if (!el) return;
    nearBottom.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
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

  function scrollToBottom() {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    nearBottom.current = true;
    setHasNewMessages(false);
  }

  return { listRef, bottomRef, onScroll, markSend, hasNewMessages, scrollToBottom };
}
