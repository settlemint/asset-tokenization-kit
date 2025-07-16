import { addonCreate } from "./routes/system.addonCreate";
import { create } from "./routes/system.create";
import { list } from "./routes/system.list";
import { portalRead } from "./routes/system.portal-read";
import { read } from "./routes/system.read";

/**
 * System router module.
 *
 * Aggregates all system-related route handlers into a single exportable object.
 * This module serves as the entry point for the lazy-loaded system namespace
 * in the main ORPC router.
 *
 * Current routes:
 * - list: GET /systems - Retrieve paginated list of SMART systems
 * - create: POST /systems - Deploy a new SMART system
 * - read: GET /systems/:id - Get system details with token factories
 * - portalRead: GET /systems/:id/portal - Get system data from Portal GraphQL
 * - addonCreate: POST /systems/addons - Register system add-ons
 *
 * The router is designed to be extended with additional system management
 * endpoints as the application evolves.
 */
const routes = {
  list,
  create,
  read,
  portalRead,
  addonCreate,
};

export default routes;
