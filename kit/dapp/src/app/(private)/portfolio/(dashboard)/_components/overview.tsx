export function PortfolioOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border p-4">
        <div className="font-medium text-muted-foreground text-sm">Total Value</div>
        <div className="mt-2 font-bold text-2xl">$100,000</div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="font-medium text-muted-foreground text-sm">Total Assets</div>
        <div className="mt-2 font-bold text-2xl">5</div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="font-medium text-muted-foreground text-sm">Performance</div>
        <div className="mt-2 font-bold text-2xl text-green-600">+12.5%</div>
      </div>
    </div>
  );
}
