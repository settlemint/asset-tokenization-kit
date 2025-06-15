import { cn } from "@/lib/utils";
import { AuthCard } from "@daveyplate/better-auth-ui";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/auth/$pathname")({
  component: RouteComponent,
});

function RouteComponent() {
  const { pathname } = Route.useParams();

  return (
    <main className="container flex grow flex-col items-center justify-center gap-3 self-center p-4 md:p-6">
      <Suspense
        fallback={
          <div className="h-96 w-full max-w-md animate-pulse rounded-lg bg-muted" />
        }
      >
        <AuthCard pathname={pathname} />
      </Suspense>

      <p
        className={cn(
          ["callback", "settings", "sign-out"].includes(pathname) && "hidden",
          "text-muted-foreground text-xs"
        )}
      >
        Powered by{" "}
        <a
          className="text-warning underline"
          href="https://better-auth.com"
          target="_blank"
          rel="noreferrer"
        >
          better-auth.
        </a>
      </p>
    </main>
  );
}
