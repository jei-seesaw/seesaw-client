import { routes, type VercelConfig } from "@vercel/config/v1";
import process from "node:process";

const BACKEND_URL = process.env.VITE_API_URL;

if (!BACKEND_URL) {
  throw new Error("환경변수 VITE_API_URL이 없습니다. Vercel Settings → Environment Variables에 등록하세요.");
}

export const config: VercelConfig = {
  rewrites: [routes.rewrite("/api/(.*)", `${BACKEND_URL}/api/$1`), routes.rewrite("/(.*)", "/index.html")],
};
