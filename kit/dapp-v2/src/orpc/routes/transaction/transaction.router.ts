import { track } from "./routes/transaction.track";

/**
 * Transaction router module.
 *
 * Aggregates all transaction-related route handlers into a single exportable object.
 * This module serves as the entry point for the lazy-loaded transaction namespace
 * in the main ORPC router.
 *
 * Current routes:
 * - track: GET /transactions/track - Real-time transaction status tracking via SSE
 *
 * The router is designed to be extended with additional transaction management
 * endpoints such as transaction history, gas estimation, and transaction simulation.
 * 
 * @see {@link ./transaction.contract} - Type-safe contract definitions
 * @see {@link ./routes/transaction.track} - Transaction tracking implementation
 */
const routes = {
  track,
};

export default routes;
