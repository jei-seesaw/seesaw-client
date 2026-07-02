import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { isAuthenticated } from "@/shared/lib";
import { ErrorPage } from "@/shared/ui";
import { Layout } from "../layout";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", Component: lazy(() => import("@/pages/main")) },
      { path: "/votes/:id", Component: lazy(() => import("@/pages/vote-detail")) },
      { path: "/sign-in", Component: lazy(() => import("@/pages/sign-in")) },
      { path: "/sign-up", Component: lazy(() => import("@/pages/sign-up")) },
      // 매칭 안 되는 경로: 로그인 상태면 메인, 아니면 로그인 페이지로
      {
        path: "*",
        element: <Navigate to={isAuthenticated() ? "/" : "/sign-in"} replace />,
      },
    ],
  },
]);
