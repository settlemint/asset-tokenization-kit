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
          <div>I'm a nested layout</div>
          <div className="flex gap-2 border-b">ccc</div>
          <div>
            <Outlet />
          </div>
        </div>
      </SignedIn>
    </>
  );
}
