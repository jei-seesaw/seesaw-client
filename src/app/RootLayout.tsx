import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { LoadingSpinner } from "@/shared/ui";

/** Applies to every route: page background + lazy-load fallback. */
export function RootLayout() {
  return (
    <div className="min-h-screen bg-canvas">
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet />
      </Suspense>
    </div>
  );
}
