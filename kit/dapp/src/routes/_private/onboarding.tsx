import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/_private/onboarding")({
  component: OnboardingLayout,
});

function OnboardingLayout() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <div className="min-h-screen w-full bg-center bg-cover bg-[url('/backgrounds/background-lm.svg')] dark:bg-[url('/backgrounds/background-dm.svg')]">
        <div className="flex min-h-screen items-center justify-center">
          <Outlet />
        </div>
      </div>
    </Suspense>
  );
}
