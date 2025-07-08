/**
 * Metrics Router Module
 *
 * Aggregates all metrics-related route handlers into a single
 * exportable object for the main ORPC router.
 * @module MetricsRouter
 */
import { assets } from "./routes/metrics.assets";
import { summary } from "./routes/metrics.summary";
import { transactions } from "./routes/metrics.transactions";
import { users } from "./routes/metrics.users";
import { value } from "./routes/metrics.value";

/**
 * Metrics router module.
 *
 * Provides focused, performant metrics endpoints for dashboard components:
 *
 * Individual focused endpoints (recommended):
 * - assets: GET /metrics/assets - Asset counts, breakdowns, and activity
 * - users: GET /metrics/users - User counts and growth data
 * - transactions: GET /metrics/transactions - Transaction counts and history
 * - value: GET /metrics/value - Total system value in base currency
 *
 * Legacy endpoint (kept for backward compatibility):
 * - summary: GET /metrics/summary - All metrics in one call (deprecated)
 *
 * Benefits of using focused endpoints:
 * - Better caching strategies per metric type
 * - Reduced payload sizes
 * - Components only fetch what they need
 * - Easier to test and maintain
 */
const routes = {
  assets,
  users,
  transactions,
  value,
  summary, // Keep for backward compatibility, but mark as deprecated
};

export default routes;
