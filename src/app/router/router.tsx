import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
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

      // 자체 헤더를 갖는 화면
      { path: "/votes/:id", Component: lazy(() => import("@/pages/vote-detail")) },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
