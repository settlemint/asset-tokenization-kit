import { create } from "./routes/bootstrap.create";
import { find } from "./routes/bootstrap.find";
import { list } from "./routes/bootstrap.list";
import { remove } from "./routes/bootstrap.remove";
import { update } from "./routes/bootstrap.update";

/**
 * Bootstrap router module.
 *
 * This module aggregates all bootstrap-related route handlers and exports them
 * as a cohesive router implementation. It serves as the entry point for all
 * bootstrap API operations, organizing the handlers in a clean, maintainable structure.
 *
 * The router follows a modular approach where each operation is implemented
 * in its own file, promoting:
 * - Code organization and maintainability
 * - Easy testing of individual operations
 * - Clear separation of concerns
 * - Reusability across different contexts
 *
 * Route handlers included:
 * - list: Retrieve multiple bootstrap configurations with filtering/pagination
 * - find: Retrieve a specific bootstrap configuration by ID
 * - create: Create a new bootstrap configuration
 * - update: Update an existing bootstrap configuration
 * - remove: Delete a bootstrap configuration
 *
 * Each handler implements the corresponding contract definition and includes
 * proper authentication, validation, and error handling.
 *
 * @see {@link ./routes/bootstrap.list} - List bootstrap configurations handler
 * @see {@link ./routes/bootstrap.find} - Find bootstrap configuration handler
 * @see {@link ./routes/bootstrap.create} - Create bootstrap configuration handler
 * @see {@link ./routes/bootstrap.update} - Update bootstrap configuration handler
 * @see {@link ./routes/bootstrap.remove} - Remove bootstrap configuration handler
 * @see {@link ./bootstrap.contract} - Bootstrap API contract definitions
 */
const routes = {
  list,
  find,
  create,
  update,
  remove,
};

export default routes;