export type { NicknameAvailability } from "./model/types";
export { getNicknameAvailability, getNicknameSuggestion } from "./api/userApi";
export { userKeys } from "./model/queryKeys";
export {
  useNicknameAvailabilityQuery,
  useNicknameSuggestion,
} from "./model/queries";
