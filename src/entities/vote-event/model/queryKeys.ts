export const voteEventKeys = {
  all: ["vote-events"] as const,
  ongoing: () => [...voteEventKeys.all, "ongoing"] as const,
  completed: () => [...voteEventKeys.all, "completed"] as const,
  detail: (id: string) => [...voteEventKeys.all, "detail", id] as const,
};
