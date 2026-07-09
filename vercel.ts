import process from "node:process";

const BACKEND_URL = process.env.VITE_API_URL;

if (!BACKEND_URL) {
  throw new Error("환경변수 VITE_API_URL이 없습니다. Vercel Settings → Environment Variables에 등록하세요.");
}

export const config = {
  rewrites: [
    { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
    { source: "/(.*)", destination: "/index.html" },
  ],
};
