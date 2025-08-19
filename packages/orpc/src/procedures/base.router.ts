import { implement } from "@orpc/server";
import type { Context } from "../context/context";
import { contract } from "../routes/contract";

/**
 * Base ORPC router implementation.
 *
 * This router serves as the foundation for all other routers in the application,
 * providing the core implementation that connects the contract definition with
 * the application context. It establishes the type-safe bridge between the
 * API contract and the actual procedure implementations.
 *
 * The base router:
 * - Implements the main contract to ensure type safety
 * - Provides the Context type for all procedures
 * - Serves as the starting point for middleware composition
 * - Ensures consistent behavior across all API endpoints
 *
 * Other routers should extend this base router by adding middleware layers
 * for authentication, error handling, logging, and other cross-cutting concerns.
 * @see {@link ../context} - Context type definition
 * @see {@link ../contract} - Main contract definition
 */
export const baseRouter = implement(contract).$context<Context>();
