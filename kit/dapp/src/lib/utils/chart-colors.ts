/**
 * Utility for getting consistent chart colors across the application
 */

/**
 * Gets a color for bond status
 */
export function getBondStatusColor(status: string): string {
  switch (status) {
    // Issued/issuing - blue
    case "issuing":
      return "var(--chart-1)";
    // Pending - gray
    case "pending":
      return "var(--muted)";
    // Active/redeemable - green
    case "active":
    case "redeemable":
      return "var(--chart-3)";
    // Matured - amber
    case "matured":
      return "var(--chart-4)";
    // Redeemed - indigo
    case "redeemed":
      return "var(--chart-2)";
    // General purpose states
    case "success":
      return "var(--success)";
    case "warning":
      return "var(--warning)";
    case "danger":
    case "error":
      return "var(--destructive)";
    // Fallback
    default:
      return "var(--muted)";
  }
}

/**
 * Gets chart colors by index (for consistent coloring in data visualizations)
 */
export function getChartColorByIndex(index: number): string {
  const colors = [
    "var(--chart-1)", // Blue
    "var(--chart-2)", // Purple
    "var(--chart-3)", // Green
    "var(--chart-4)", // Amber
    "var(--chart-5)", // Red
    "var(--chart-6)", // Cyan
  ];

  return colors[index % colors.length];
}