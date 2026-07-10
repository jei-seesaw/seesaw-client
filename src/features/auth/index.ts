export { AuthModal } from "./ui/AuthModal";
export { useLoginGate } from "./model/useLoginGate";
export {
  useLogin,
  useRegister,
  useLogout,
  getLoginErrorMessage,
  getRegisterErrorMessage,
} from "./model/useAuth";
export { login, register } from "./api/authApi";
export type { LoginRequest, RegisterRequest, AuthTab } from "./model/types";
