import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Single stat item configuration for StatList component.
 *
 * Variants provide semantic color coding to communicate status without requiring
 * users to parse numeric values—warning highlights actionable items, success
 * confirms positive states.
 */
export interface StatItem {
  /**
   * Content to display for this stat (string, number, or JSX).
   */
  text: ReactNode;

  /**
   * Semantic color variant matching tile status indicators.
   * - foreground: neutral state
   * - success: positive/completed state
   * - warning: requires attention
   * - destructive: error/critical state
   * - muted: de-emphasized info
   * @default "foreground"
   */
  variant?: "foreground" | "success" | "warning" | "destructive" | "muted";
}

export interface StatListProps {
  /**
   * Stat items to display in a horizontal list.
   * Automatically hides separator when rendering a single item.
   */
  items: StatItem[];

  /**
   * Character or string inserted between items (not shown after last item).
   * Use middot (•) to maintain visual hierarchy without overwhelming the layout.
   * @default "•"
   */
  separator?: string;

  /**
   * Tailwind classes for the container element.
   */
  className?: string;
}

// Map variant keys to Tailwind text color classes
// Ensures consistent theming with TileBadge and other status indicators
const variantClasses = {
  foreground: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  muted: "text-muted-foreground",
} as const;

/**
 * Horizontally-arranged stat list with semantic color variants and separators.
 *
 * Uses color variants to communicate status at a glance—warning for actionable items,
 * success for positive states—reducing cognitive load in dashboard tiles. Commonly
 * used in IdentityManagerTile and AssetManagerTile for displaying active/pending counts.
 *
 * @example
 * ```tsx
 * <StatList
 *   items={[
 *     { text: "24 active", variant: "foreground" },
 *     { text: "5 pending", variant: "warning" }
 *   ]}
 * />
 * // Renders: "24 active • 5 pending"
 * ```
 */
export function StatList({ items, separator = "•", className }: StatListProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {items.map((item, index) => {
        const variant = item.variant ?? "foreground";
        const isLast = index === items.length - 1;

        return (
          // Use .contents pseudo-class to collapse wrapper while maintaining flexbox item behavior
          // Prevents extra DOM nesting that would break gap spacing between text and separator
          <span key={index} className="contents">
            <span className={variantClasses[variant]}>{item.text}</span>
            {!isLast && (
              <span className="text-muted-foreground" aria-hidden="true">
                {separator}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
