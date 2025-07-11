export type ActionStatus = "PENDING" | "UPCOMING" | "COMPLETED";

export function BadgeSpinner() {
  return (
    <div
      className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent text-muted-foreground"
      role="status"
      aria-label="loading badge"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function BadgeLoader() {
  // For now, return a placeholder badge with 0 count
  // This will be replaced with actual data fetching logic later

  // Always return null for now as we don't have real data
  return null;
}
