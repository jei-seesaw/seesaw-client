import { Fragment, useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { getNickname } from "@/shared/lib";
import { useChatSocket, type ChatMessage } from "@/entities/chat";

const MAX_CONTENT = 500;

export function ChatPanel({ voteEventId }: { voteEventId: string }) {
  const { messages, connected, error, sendMessage } = useChatSocket(voteEventId, true);
  const myNickname = getNickname();
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  // 새 메시지가 오거나(히스토리 포함) 전송하면 맨 아래로 스크롤
  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length, scrollToBottom]);

  function handleSend() {
    const text = draft.trim();
    if (!text) return;
    sendMessage(text);
    setDraft("");
    scrollToBottom();
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
          <span className="text-xs font-medium text-muted">{messages.length}</span>
        </h2>
        <span className="flex items-center gap-1 text-xs text-emerald-500">
          <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-gray-300"}`} />
          실시간
        </span>
      </header>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-500">{error}</p>}

      <div ref={listRef} className="no-scrollbar flex max-h-80 flex-col gap-3 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-xs text-muted">아직 메시지가 없어요. 먼저 의견을 남겨보세요!</p>
        ) : (
          messages.map((m, i) => {
            const prev = messages[i - 1];
            const showDivider = !prev || !isSameDay(prev.createdAt, m.createdAt);
            return (
              <Fragment key={m.id}>
                {showDivider && <DateDivider iso={m.createdAt} />}
                <MessageBubble message={m} mine={m.user.nickname === myNickname} />
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
          onFocus={() => scrollToBottom()}
          maxLength={MAX_CONTENT}
          placeholder="익명으로 메시지 보내기..."
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

function MessageBubble({ message, mine }: { message: ChatMessage; mine: boolean }) {
  const time = formatTime(message.createdAt);

  if (mine) {
    return (
      <div className="flex items-end justify-end gap-1.5">
        <span className="text-[10px] text-muted">{time}</span>
        <p className="max-w-[75%] whitespace-pre-wrap wrap-break-word rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-white">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-heading">{message.user.nickname}</span>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-muted">{message.user.affiliationName}</span>
      </div>
      <div className="flex items-end gap-1.5">
        <p className="max-w-[75%] whitespace-pre-wrap wrap-break-word rounded-2xl rounded-tl-sm bg-gray-100 px-3 py-2 text-sm text-heading">
          {message.content}
        </p>
        <span className="text-[10px] text-muted">{time}</span>
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
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}
