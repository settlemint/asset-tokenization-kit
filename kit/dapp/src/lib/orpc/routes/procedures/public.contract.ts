import { bc } from "@/lib/orpc/routes/procedures/base.contract";

/**
 * Public ORPC contract for unauthenticated procedures.
 *
 * This contract extends the base contract and is used for API procedures
 * that don't require authentication. It inherits all common error definitions
 * from the base contract while being specifically designed for public endpoints.
 *
 * Public procedures typically include:
 * - Health checks and status endpoints
 * - Public data retrieval (e.g., public content, metadata)
 * - Rate-limited public APIs
 *
 * Since this directly extends the base contract without additional errors,
 * it maintains the same error handling capabilities while clearly indicating
 * the intended use for public, unauthenticated access.
 *
 * @see {@link ./base.contract} - Base contract with common errors
 */
export const pc = bc;
