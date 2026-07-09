import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getToken, randomId } from "@/shared/lib";
import { getChatMessages } from "../api/chatApi";
import type { ChatMessage } from "./types";

const MAX_CONTENT = 500;

/** 서버 ack 공통 형태 */
type Ack<T = null> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };

/**
 * 투표 이벤트 채팅. 진입 시 히스토리를 HTTP로 불러오고,
 * 이후 Socket.IO로 실시간 메시지를 수신·전송한다.
 */
export function useChatSocket(voteEventId: string, enabled: boolean) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const seenRef = useRef<Set<string>>(new Set());
  const cursorRef = useRef<string | null>(null);
  const loadingOlderRef = useRef(false);

  useEffect(() => {
    if (!enabled || !voteEventId) return;
    let active = true;
    let socket: Socket | null = null;

    // voteEventId가 바뀌면 이전 방의 dedup/커서 상태를 초기화
    // (messages/hasMore는 아래 초기 fetch의 응답으로 교체된다)
    seenRef.current.clear();
    cursorRef.current = null;

    const seen = seenRef.current;
    const remember = (m: ChatMessage) => {
      seen.add(m.id);
      if (m.clientMessageId) seen.add(m.clientMessageId);
    };
    const isDuplicate = (m: ChatMessage) => seen.has(m.id) || (m.clientMessageId ? seen.has(m.clientMessageId) : false);
    const receive = (message: ChatMessage) => {
      if (!active || isDuplicate(message)) return;
      remember(message);
      setMessages((prev) => [...prev, message]);
      setTotalCount((c) => c + 1);
    };

    // 1) 히스토리 → 2) 소켓 연결 (히스토리 먼저 확보)
    getChatMessages(voteEventId, { limit: 50 })
      .then((res) => {
        if (!active) return;
        res.messages.forEach(remember);
        setMessages(res.messages);
        cursorRef.current = res.pageInfo.nextCursor;
        setHasMore(res.pageInfo.hasNext);
        setTotalCount(res.totalCount);
      })
      .catch(() => {})
      .finally(() => {
        if (!active) return;
        socket = io("/api/v2/chats", {
          path: "/api/v2/socket.io",
          transports: ["polling"],
          auth: { accessToken: getToken() },
        });
        socketRef.current = socket;

        socket.on("connect", () => {
          if (!active) return;
          setConnected(true);
          setError(null);
          // 연결되면 채팅방 join (ack로 성공/실패 확인)
          socket?.emit("chat:join", { voteEventId }, (ack: Ack) => {
            if (active && ack && !ack.ok) setError(ack.error.message);
          });
        });
        socket.on("disconnect", () => active && setConnected(false));
        // 인증 실패(invalid_access_token) 등 연결 오류
        socket.on("connect_error", (e: Error) => active && setError(e.message));
        socket.on("chat:message:new", receive);
      });

    return () => {
      active = false;
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [voteEventId, enabled]);

  // 위로 스크롤 시 이전(더 오래된) 메시지를 커서로 불러와 앞쪽에 붙인다.
  const loadOlder = useCallback(async () => {
    if (loadingOlderRef.current || !cursorRef.current) return;
    loadingOlderRef.current = true;
    setLoadingOlder(true);
    try {
      const res = await getChatMessages(voteEventId, { limit: 50, cursor: cursorRef.current });
      const seen = seenRef.current;
      const fresh = res.messages.filter((m) => !seen.has(m.id));
      fresh.forEach((m) => {
        seen.add(m.id);
        if (m.clientMessageId) seen.add(m.clientMessageId);
      });
      cursorRef.current = res.pageInfo.nextCursor;
      setHasMore(res.pageInfo.hasNext);
      if (fresh.length) setMessages((prev) => [...fresh, ...prev]);
    } catch {
      //
    } finally {
      loadingOlderRef.current = false;
      setLoadingOlder(false);
    }
  }, [voteEventId]);

  const sendMessage = useCallback(
    (content: string) => {
      const socket = socketRef.current;
      const text = content.trim();
      if (!socket || text.length === 0 || text.length > MAX_CONTENT) return;
      socket.emit(
        "chat:message:send",
        { voteEventId, clientMessageId: randomId(), content: text },
        (ack: Ack<ChatMessage>) => {
          if (ack && !ack.ok) setError(ack.error.message);
        },
      );
    },
    [voteEventId],
  );

  return { messages, connected, error, sendMessage, loadOlder, hasMore, loadingOlder, totalCount };
}
