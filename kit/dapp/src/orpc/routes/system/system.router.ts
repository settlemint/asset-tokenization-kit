import { create } from './routes/system.create';
import { list } from './routes/system.list';
import { read } from './routes/system.read';

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
 *
 * The router is designed to be extended with additional system management
 * endpoints as the application evolves.
 */
const routes = {
  list,
  create,
  read,
};

export default routes;
