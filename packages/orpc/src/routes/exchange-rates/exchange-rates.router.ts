/**
 * Exchange Rates Router Module
 *
 * Aggregates all exchange rate-related route handlers into a single
 * exportable object for the main ORPC router.
 * @module ExchangeRatesRouter
 */
import { del } from "./routes/exchange-rates.delete";
import { history } from "./routes/exchange-rates.history";
import { list } from "./routes/exchange-rates.list";
import { read } from "./routes/exchange-rates.read";
import { sync } from "./routes/exchange-rates.sync";
import { update } from "./routes/exchange-rates.update";

/**
 * Exchange rates router module.
 *
 * Provides comprehensive exchange rate management including:
 * - Real-time rate queries with automatic sync
 * - Manual rate updates for overrides
 * - Historical data access for analytics
 * - External provider synchronization
 * - CRUD operations for rate management
 *
 * Current routes:
 * - read: GET /exchange-rates/:baseCurrency/:quoteCurrency - Get current rate
 * - list: GET /exchange-rates - List all rates with pagination
 * - update: PUT /exchange-rates/:baseCurrency/:quoteCurrency - Manual update
 * - delete: DELETE /exchange-rates/:baseCurrency/:quoteCurrency - Delete manual rate
 * - sync: POST /exchange-rates/sync - Sync with external providers
 * - history: GET /exchange-rates/:baseCurrency/:quoteCurrency/history - Get historical rates
 */
const routes = {
  read,
  list,
  update,
  delete: del,
  sync,
  history,
};

export default routes;
