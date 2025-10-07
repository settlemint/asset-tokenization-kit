import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/account/onchain-identity"
)({
  component: OnchainIdentity,
});

function OnchainIdentity() {
  return <div className="p-6" />;
}
