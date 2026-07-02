export const userKeys = {
  all: ["user"] as const,
  nicknameAvailability: (nickname: string) =>
    [...userKeys.all, "nickname-availability", nickname] as const,
};
