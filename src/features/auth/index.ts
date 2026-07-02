export { AuthModal } from "./ui/AuthModal";
export {
  useLogin,
  useRegister,
  getLoginErrorMessage,
  getRegisterErrorMessage,
} from "./model/useAuth";
export { login, register } from "./api/authApi";
export type { LoginRequest, RegisterRequest, AuthTab } from "./model/types";
