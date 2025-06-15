import { AuthCard } from "@daveyplate/better-auth-ui";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/auth/$pathname")({
  component: RouteComponent,
});

function RouteComponent() {
  const { pathname } = Route.useParams();

  return (
    <main className="my-auto flex flex-col items-center w-full max-w-md px-4">
      <Suspense>
        <AuthCard pathname={pathname} className="w-full" />
      </Suspense>
    </main>
  );
}
