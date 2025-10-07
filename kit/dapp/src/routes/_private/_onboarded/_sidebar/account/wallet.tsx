import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/account/wallet"
)({
  component: Wallet,
});

function Wallet() {
  return <div className="p-6" />;
}
