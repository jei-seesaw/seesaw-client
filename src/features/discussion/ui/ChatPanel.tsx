import { Fragment, useState, type KeyboardEvent } from "react";
import { ArrowDown, Send } from "lucide-react";
import { getNickname } from "@/shared/lib";
import { useChatSocket, type ChatMessage } from "@/entities/chat";
import { useChatAutoScroll } from "../model/useChatAutoScroll";

const MAX_CONTENT = 500;

export function ChatPanel({ voteEventId }: { voteEventId: string }) {
  const { messages, connected, error, sendMessage, totalCount, loadOlder, hasMore, loadingOlder } = useChatSocket(
    voteEventId,
    true,
  );
  const myNickname = getNickname();
  const [draft, setDraft] = useState("");
  const { listRef, bottomRef, onScroll, markSend, hasNewMessages, scrollToBottom } = useChatAutoScroll(messages, {
    hasMore,
    loadingOlder,
    loadOlder,
  });

  function handleSend() {
    const text = draft.trim();
    if (!text) return;
    markSend();
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

      <div className="relative">
        <div ref={listRef} onScroll={onScroll} className="no-scrollbar flex h-80 flex-col overflow-y-auto">
          {/* mt-auto: 메시지가 적으면 하단 정렬, 넘치면 auto가 0이 되어 정상 스크롤 */}
          <div className="mt-auto flex flex-col gap-3">
            {loadingOlder && <p className="py-2 text-center text-xs text-muted">이전 메시지 불러오는 중…</p>}
            <MessageList messages={messages} myNickname={myNickname} />
          </div>
        </div>
        {hasNewMessages && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-white shadow-md transition hover:brightness-95"
          >
            <ArrowDown size={14} /> 새 메시지
          </button>
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
      {/* 맨 아래 스크롤 기준점 */}
      <div ref={bottomRef} />
    </section>
  );
}

/** 메시지 목록 렌더링 + 연속 메시지 그룹핑(닉네임/시간/날짜 구분선) 처리. */
function MessageList({ messages, myNickname }: { messages: ChatMessage[]; myNickname: string | null }) {
  if (messages.length === 0) {
    return <p className="py-10 text-center text-xs text-muted">아직 메시지가 없어요. 먼저 의견을 남겨보세요!</p>;
  }

  return messages.map((m, i) => {
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
  });
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
