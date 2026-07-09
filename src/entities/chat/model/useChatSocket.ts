import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getToken } from "@/shared/lib";
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
  const socketRef = useRef<Socket | null>(null);
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || !voteEventId) return;
    let active = true;
    let socket: Socket | null = null;

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
    };

    // 1) 히스토리 → 2) 소켓 연결 (히스토리 먼저 확보)
    getChatMessages(voteEventId, { limit: 50 })
      .then((res) => {
        if (!active) return;
        res.messages.forEach(remember);
        setMessages(res.messages);
      })
      .catch(() => {})
      .finally(() => {
        if (!active) return;
        // same-origin으로 붙어 Vite 프록시(/socket.io, ws)를 타게 한다 → CORS 회피
        socket = io("/api/v2/chats", {
          path: "/api/v2/socket.io",
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

  const sendMessage = useCallback(
    (content: string) => {
      const socket = socketRef.current;
      const text = content.trim();
      if (!socket || text.length === 0 || text.length > MAX_CONTENT) return;
      socket.emit(
        "chat:message:send",
        { voteEventId, clientMessageId: crypto.randomUUID(), content: text },
        // 성공 시 서버가 chat:message:new로도 브로드캐스트하므로 ack.data는 중복 방지에 맡긴다.
        // 실패(vote_event_not_found / validation_error)만 표면화.
        (ack: Ack<ChatMessage>) => {
          if (ack && !ack.ok) setError(ack.error.message);
        },
      );
    },
    [voteEventId],
  );

  return { messages, connected, error, sendMessage };
}
