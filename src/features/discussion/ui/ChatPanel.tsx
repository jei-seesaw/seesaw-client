import { Fragment, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { getNickname } from "@/shared/lib";
import { useChatSocket, type ChatMessage } from "@/entities/chat";

const MAX_CONTENT = 500;

export function ChatPanel({ voteEventId }: { voteEventId: string }) {
  const { messages, connected, error, sendMessage, totalCount, loadOlder, hasMore, loadingOlder } = useChatSocket(
    voteEventId,
    true,
  );
  const myNickname = getNickname();
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const prevCountRef = useRef(0);
  // 이전 메시지 로드 직전의 스크롤 높이/위치를 저장 (prepend 후 위치 복원용)
  const pendingOlderRef = useRef<{ prevHeight: number; prevTop: number } | null>(null);

  /**
   * 메시지 변경 후 스크롤 처리:
   * - 이전 메시지를 앞에 붙였으면(prepend) 보던 위치를 그대로 유지
   * - 그 외(신규 수신/전송/최초 로드)엔 하단 근처일 때만 맨 아래로
   * */
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const wasCount = prevCountRef.current;
    prevCountRef.current = messages.length;

    if (pendingOlderRef.current) {
      const { prevHeight, prevTop } = pendingOlderRef.current;
      pendingOlderRef.current = null;
      el.scrollTop = el.scrollHeight - prevHeight + prevTop;
      return;
    }
    if (wasCount === 0 || nearBottomRef.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: wasCount === 0 ? "auto" : "smooth" });
    }
  }, [messages]);

  function handleScroll() {
    const el = listRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    // 맨 위 근처에 닿으면 이전 메시지 로드
    if (hasMore && !loadingOlder && !pendingOlderRef.current && el.scrollTop <= 60) {
      pendingOlderRef.current = { prevHeight: el.scrollHeight, prevTop: el.scrollTop };
      loadOlder();
    }
  }

  function handleSend() {
    const text = draft.trim();
    if (!text) return;
    nearBottomRef.current = true;
    sendMessage(text);
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-surface p-5">
      <header className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-heading">
          💬 토론
          <span className="text-xs font-medium text-muted">{totalCount}</span>
        </h2>
        <span className="flex items-center gap-1 text-xs text-emerald-500">
          <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-gray-300"}`} />
          실시간
        </span>
      </header>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-500">{error}</p>}

      <div ref={listRef} onScroll={handleScroll} className="no-scrollbar flex max-h-80 flex-col gap-3 overflow-y-auto">
        {loadingOlder && <p className="py-2 text-center text-xs text-muted">이전 메시지 불러오는 중…</p>}
        {messages.length === 0 ? (
          <p className="py-10 text-center text-xs text-muted">아직 메시지가 없어요. 먼저 의견을 남겨보세요!</p>
        ) : (
          messages.map((m, i) => {
            const prev = messages[i - 1];
            const next = messages[i + 1];
            const showDivider = !prev || !isSameDay(prev.createdAt, m.createdAt);
            // 같은 사람의 연속 메시지 중 첫 번째에만 닉네임을, 같은 분 그룹의 마지막에만 시간을 표시
            const firstOfSender = showDivider || !prev || prev.user.id !== m.user.id;
            const nextDateChanged = !!next && !isSameDay(m.createdAt, next.createdAt);
            const lastOfMinute =
              !next ||
              nextDateChanged ||
              next.user.id !== m.user.id ||
              formatTime(next.createdAt) !== formatTime(m.createdAt);
            return (
              <Fragment key={m.id}>
                {showDivider && <DateDivider iso={m.createdAt} />}
                <MessageBubble
                  message={m}
                  mine={m.user.nickname === myNickname}
                  showName={firstOfSender}
                  showTime={lastOfMinute}
                  grouped={!firstOfSender}
                />
              </Fragment>
            );
          })
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAX_CONTENT}
          placeholder="메시지 보내기..."
          className="flex-1 rounded-full bg-gray-50 px-4 py-2.5 text-sm text-heading outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!draft.trim()}
          aria-label="전송"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:brightness-95 disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
    </section>
  );
}

function DateDivider({ iso }: { iso: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-border" />
      <span className="text-[11px] text-muted">{formatDateLabel(iso)}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function MessageBubble({
  message,
  mine,
  showName,
  showTime,
  grouped,
}: {
  message: ChatMessage;
  mine: boolean;
  showName: boolean;
  showTime: boolean;
  grouped: boolean;
}) {
  const time = formatTime(message.createdAt);
  // 연속 메시지는 간격을 좁혀 바로 아래에 붙인다. (컨테이너 gap-3에서 끌어올림)
  const spacing = grouped ? "-mt-2.5" : "";

  if (mine) {
    return (
      <div className={`flex items-end justify-end gap-1.5 ${spacing}`}>
        {showTime && <span className="shrink-0 whitespace-nowrap text-[10px] text-muted">{time}</span>}
        <p className="min-w-0 whitespace-pre-wrap wrap-anywhere rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-white">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-start gap-1 ${spacing}`}>
      {showName && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-heading">{message.user.nickname}</span>
          <span className="h-2.5 w-px bg-muted" />
          <span className="text-[10px] text-muted">{message.user.affiliationName}</span>
        </div>
      )}
      <div className="flex items-end gap-1.5">
        <span className="min-w-0 whitespace-pre-wrap wrap-anywhere rounded-2xl rounded-tl-sm bg-gray-100 px-3 py-2 text-sm text-heading">
          {message.content}
        </span>
        {showTime && <span className="shrink-0 whitespace-nowrap text-[10px] text-muted">{time}</span>}
      </div>
    </div>
  );
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 말풍선 옆 시각: 오전/오후 h:mm */
function formatTime(iso: string): string {
  const d = new Date(iso);
  const hours = d.getHours();
  const ampm = hours < 12 ? "오전" : "오후";
  const h12 = hours % 12 || 12;
  return `${ampm} ${h12}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** 날짜 구분선 라벨: 2026년 7월 8일 화요일 */
function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAYS[d.getDay()]}요일`;
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}
