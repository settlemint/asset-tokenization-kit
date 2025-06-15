import { LanguageSwitcher } from "@/components/language/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_private")({
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
