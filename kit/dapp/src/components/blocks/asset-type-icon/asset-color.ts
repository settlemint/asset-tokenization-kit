export function getAssetColor(
  type:
    | "bond"
    | "cryptocurrency"
    | "equity"
    | "fund"
    | "stablecoin"
    | "tokenizeddeposit",
  as?: "class" | "color"
): string {
  switch (type) {
    case "bond":
      return as === "color" ? "var(--chart-1)" : "bg-chart-1";
    case "cryptocurrency":
      return as === "color" ? "var(--chart-2)" : "bg-chart-2";
    case "equity":
      return as === "color" ? "var(--chart-3)" : "bg-chart-3";
    case "fund":
      return as === "color" ? "var(--chart-4)" : "bg-chart-4";
    case "stablecoin":
      return as === "color" ? "var(--chart-5)" : "bg-chart-5";
    case "tokenizeddeposit":
      return as === "color" ? "var(--chart-6)" : "bg-chart-6";
    default:
      return as === "color" ? "var(--chart-5)" : "bg-chart-5";
  }
}
