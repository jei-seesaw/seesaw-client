export interface ChatUser {
  id: string;
  nickname: string;
  affiliationName: string;
}

export interface ChatMessage {
  id: string;
  voteEventId: string;
  clientMessageId: string;
  user: ChatUser;
  content: string;
  /** ISO 문자열. */
  createdAt: string;
}

export interface ChatMessagesPage {
  messages: ChatMessage[];
  pageInfo: {
    hasNext: boolean;
    nextCursor: string | null;
  };
  /** 채팅방 전체 메시지 수 (현재 로드된 개수와 무관). */
  totalCount: number;
}
