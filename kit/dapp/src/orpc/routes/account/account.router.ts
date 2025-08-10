import { me } from "@/orpc/routes/account/routes/account.me";
import { search } from "@/orpc/routes/account/routes/account.search";
import { read } from "./routes/account.read";

/**
 * Account router module.
 *
 * Aggregates all account-related route handlers into a single exportable object.
 * This module serves as the entry point for the lazy-loaded account namespace
 * in the main ORPC router.
 *
 * Current routes:
 * - create: POST /account/create - Create a wallet for the authenticated user
 * - read: GET /account/read - Retrieve account information and identity claims
 *
 * The router is designed to be extended with additional account management
 * endpoints such as identity claim updates, account verification, and
 * compliance-related operations.
 * @see {@link ./account.contract} - Type-safe contract definitions
 * @see {@link ./account.create} - Wallet creation implementation
 * @see {@link ./account.read} - Account information retrieval
 */
const routes = {
  read,
  me,
  search,
};

export default routes;
