import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_onboarded/token/stats")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_private/_onboarded/token/stats"!</div>;
}
