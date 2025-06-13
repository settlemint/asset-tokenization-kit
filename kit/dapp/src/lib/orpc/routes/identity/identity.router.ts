import { create } from "./routes/identity.create";
import { read } from "./routes/identity.read";

/**
 * Identity router module.
 *
 * Aggregates all identity-related route handlers into a single exportable object.
 * This module serves as the entry point for the lazy-loaded identity namespace
 * in the main ORPC router.
 *
 * Current routes:
 * - read: GET /identities/:identityAddress - Retrieve identity information with claims
 * - create: POST /identities - Create a new identity contract
 *
 * The router is designed to be extended with additional identity management
 * endpoints as the application evolves, such as claim management and
 * identity verification operations.
 */
const routes = {
  read,
  create,
};

export default routes;