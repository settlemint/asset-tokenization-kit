import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Props for StatCard component
 *
 * Design rationale: Simplified from previous version that included trend indicators
 * (percentage changes, icons) to focus on clarity and readability. The description
 * prop provides context without visual clutter.
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
}

/**
 * Stat card displaying a key metric with optional description
 *
 * Design philosophy: Minimalist presentation for dashboard KPIs. Previously included
 * trend indicators (icons, percentage changes) but was simplified to reduce cognitive
 * load and improve scannability on dense dashboards.
 *
 * Layout structure (vertical):
 * 1. Title (muted, small) - identifies the metric
 * 2. Value (bold, large) - the primary focus
 * 3. Description (muted, small, optional) - provides context
 *
 * Use cases:
 * - Portfolio summary cards (total value, asset count, identity status)
 * - Identity metrics (total identities, active registrations)
 * - Compliance overview (active claims, topics, issuers)
 *
 * @example
 * ```tsx
 * <StatCard
 *   title="Total value"
 *   value={formatCurrency(portfolioValue)}
 *   description="Combined value of all assets"
 * />
 * ```
 */
export function StatCard({
  title,
  value,
  className,
  description,
}: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      {/* Vertical flex layout with consistent spacing between elements */}
      <CardContent className="flex flex-col space-y-2">
        {/* Title: Small, muted text to avoid competing with the value */}
        <div className="text-sm text-muted-foreground">{title}</div>
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
