import { httpClient } from "@/shared/api";
import type { ChatMessagesPage } from "../model/types";

/** 채팅 메시지 조회 (오래된 순 정렬). */
export function getChatMessages(
  voteEventId: string,
  params: { limit?: number; cursor?: string } = {},
): Promise<ChatMessagesPage> {
  const search = new URLSearchParams();
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.cursor) search.set("cursor", params.cursor);
  const query = search.toString();
  return httpClient.get<ChatMessagesPage>(
    `/vote-events/${voteEventId}/chat-messages${query ? `?${query}` : ""}`,
  );
}
