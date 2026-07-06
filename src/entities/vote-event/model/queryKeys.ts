import type { MyVoteEventsParams } from "./types";

export const voteEventKeys = {
  all: ["vote-events"] as const,
  ongoing: (params: MyVoteEventsParams = {}) =>
    [...voteEventKeys.all, "ongoing", params] as const,
  completed: (params: MyVoteEventsParams = {}) =>
    [...voteEventKeys.all, "completed", params] as const,
  detail: (id: string) => [...voteEventKeys.all, "detail", id] as const,
  myCreated: (params: MyVoteEventsParams) =>
    [...voteEventKeys.all, "me", "created", params] as const,
  myParticipated: (params: MyVoteEventsParams) =>
    [...voteEventKeys.all, "me", "participated", params] as const,
};
