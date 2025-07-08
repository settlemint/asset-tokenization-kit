import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/_onboarded/asset-designer/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_private/_onboarded/asset-designer/"!</div>
}
