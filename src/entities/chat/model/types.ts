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
}
