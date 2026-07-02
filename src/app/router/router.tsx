import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { isAuthenticated } from "@/shared/lib";
import { ErrorPage } from "@/shared/ui";
import { RootLayout } from "../RootLayout";
import { MainLayout } from "../MainLayout";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      // 공통 헤더가 있는 화면 (메인/목록 계열)
      {
        element: <MainLayout />,
        children: [{ path: "/", Component: lazy(() => import("@/pages/main")) }],
      },

      // 자체 헤더를 갖는 화면들
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
