import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_private/_onboarded/token/$factoryAddress/$tokenAddress',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_private/_onboarded/token/$type/$address"!</div>
}
