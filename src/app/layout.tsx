import { LoadingSpinner } from "@/shared/ui";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

/** Shared chrome for every route. Page content renders into <Outlet />. */
export function Layout() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Outlet />
    </Suspense>
  );
}
