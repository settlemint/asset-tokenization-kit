import { LanguageSwitcher } from "@/components/language/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { orpc } from "@/orpc";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_private")({
  beforeLoad: async ({ context }) => {
    const user: User = await context.queryClient.ensureQueryData(
      orpc.user.me.queryOptions({})
    );
    return { user };
  },
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <div>
          <div className="flex items-center justify-between p-4 border-b">
            <div>Private Area</div>
            <div className="flex gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
          <div>
            <Outlet />
          </div>
        </div>
      </SignedIn>
    </>
  );
}
