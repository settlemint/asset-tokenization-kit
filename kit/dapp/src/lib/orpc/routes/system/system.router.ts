import { create } from "./routes/system.create";
import { list } from "./routes/system.list";

/**
 * System router module.
 *
 * Aggregates all system-related route handlers into a single exportable object.
 * This module serves as the entry point for the lazy-loaded system namespace
 * in the main ORPC router.
 *
 * Current routes:
 * - list: GET /systems - Retrieve paginated list of SMART systems
 *
 * The router is designed to be extended with additional system management
 * endpoints as the application evolves.
 */
const routes = {
  list,
  create,
};

export default routes;
