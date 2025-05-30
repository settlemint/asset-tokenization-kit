import type { AirdropType } from "@/lib/utils/typebox/airdrop-types";

export function getAirdropColor(
  type: AirdropType,
  as?: "class" | "color"
): string {
  switch (type) {
    case "standard":
      return as === "color" ? "var(--chart-1)" : "bg-chart-1"; // Using chart-1 for standard
    case "vesting":
      return as === "color" ? "var(--chart-2)" : "bg-chart-2"; // Using chart-2 for vesting
    case "push":
      return as === "color" ? "var(--chart-3)" : "bg-chart-3"; // Using chart-3 for push
    default:
      // Fallback to one of the existing chart colors if a new type is added and not mapped
      return as === "color" ? "var(--chart-4)" : "bg-chart-4";
  }
}
