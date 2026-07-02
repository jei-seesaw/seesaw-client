import { Outlet } from "react-router-dom";
import { Header } from "@/widgets/header";

/** Shell for the main / list pages: common header + centered content. */
export function MainLayout() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
    </>
  );
}
