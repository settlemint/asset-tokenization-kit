import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Props for StatCard component
 *
 * Design rationale: Simplified from previous version that included trend indicators
 * (percentage changes, icons) to focus on clarity and readability. The description
 * prop provides context without visual clutter. The indicator prop was added to support
 * displaying various supplementary information (percentage changes, icons, badges) in a
 * consistent, accessible manner.
 */
interface StatCardProps {
  /** Stat label displayed at the top (e.g., "Total value", "Active claims") */
  title: string;
  /**
   * Main metric value - accepts ReactNode to support formatted numbers, badges,
   * or custom components (e.g., currency formatting, verification badges)
   */
  value: React.ReactNode;
  /** Optional Tailwind classes for custom styling */
  className?: string;
  /**
   * Optional explanatory text shown below the value
   *
   * Why optional: Not all stats need explanation. Use for context like
   * "Combined value of all assets" or "2 bonds, 1 deposit" to help users
   * understand what the metric represents.
   */
  description?: string;
  /**
   * Optional indicator element displayed in top-right corner
   *
   * Why ReactNode for flexibility: Supports multiple use cases without coupling
   * to specific component types. Common patterns include:
   * - PercentageChange component for trend analysis
   * - Icons for status indication (checkmark, warning, info)
   * - Badges for categorical information (new, verified, pending)
   * - Custom components for domain-specific indicators
   *
   * Placed in the top-right corner using flex layout to ensure graceful
   * wrapping on smaller screens without overlapping the title.
   */
  indicator?: React.ReactNode;
}

/**
 * Stat card displaying a key metric with optional description and indicator
 *
 * Design philosophy: Minimalist presentation for dashboard KPIs. The indicator slot
 * provides at-a-glance supplementary information (trends, status, badges) without
 * cluttering the primary metric. Flex layout ensures responsive behavior when both
 * title and indicator are present.
 *
 * Layout structure (vertical):
 * 1. Header row (flex, wrappable):
 *    - Title (left, muted, small) - identifies the metric
 *    - Indicator (right, small, optional) - shows supplementary info (trend, status, icon)
 * 2. Value (bold, large) - the primary focus
 * 3. Description (muted, small, optional) - provides context
 *
 * Why use flex with wrap for the header:
 * - Ensures title and indicator don't overlap or clip on narrow screens
 * - Maintains visual hierarchy (title is primary, indicator is supplementary)
 * - Gracefully handles long titles by wrapping indicator to next line
 *
 * Use cases:
 * - Portfolio summary cards (total value with percentage change, asset count)
 * - Identity metrics (total identities with status icon, active registrations)
 * - Compliance overview (active claims with badge, topics, issuers)
 *
 * @example Percentage change indicator
 * ```tsx
 * <StatCard
 *   title="Total value"
 *   value={formatCurrency(portfolioValue)}
 *   description="Combined value of all assets"
 *   indicator={<PercentageChange previousValue={100} currentValue={125} period="trailing7Days" />}
 * />
 * ```
 *
 * @example Icon indicator
 * ```tsx
 * <StatCard
 *   title="System status"
 *   value="Operational"
 *   indicator={<CheckCircle className="h-4 w-4 text-success" />}
 * />
 * ```
 */
export function StatCard({
  title,
  value,
  className,
  description,
  indicator,
}: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      {/* Vertical flex layout with consistent spacing between elements */}
      <CardContent className="flex flex-col space-y-2">
        {/* Header row: Title and optional indicator with flex wrap */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          {/* Title: Small, muted text to avoid competing with the value */}
          <div className="text-sm text-muted-foreground">{title}</div>
          {/* Indicator: Conditional rendering for percentage change, icons, or other supplementary content */}
          {indicator && <div className="shrink-0">{indicator}</div>}
        </div>
        {/* Value: Large, bold to draw immediate attention */}
        <div className="text-2xl font-bold">{value}</div>
        {/* Description: Conditional rendering to maintain clean layout when not needed */}
        {description && (
          <div className="text-sm text-muted-foreground">{description}</div>
        )}
      </CardContent>
    </Card>
  );
}
