import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_onboarded/_sidebar/profile")({
  component: Profile,
});

function Profile() {
  return <div className="p-6" />;
}
