import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_onboarded/token/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_private/_onboarded/token/$id"!</div>;
}
