export function getAssetColor(
  type: "bond" | "cryptocurrency" | "equity" | "fund" | "stablecoin"
): string {
  switch (type) {
    case "bond":
      return "bg-chart-1";
    case "cryptocurrency":
      return "bg-chart-2";
    case "equity":
      return "bg-chart-3";
    case "fund":
      return "bg-chart-4";
    case "stablecoin":
      return "bg-chart-5";
    default:
      return "bg-chart-5";
  }
}
