import { create } from "./routes/planet.create";
import { find } from "./routes/planet.find";
import { list } from "./routes/planet.list";

/**
 * Planet router module.
 *
 * This module aggregates all planet-related route handlers and exports them
 * as a cohesive router implementation. It serves as the entry point for all
 * planet API operations, organizing the handlers in a clean, maintainable structure.
 *
 * The router follows a modular approach where each operation is implemented
 * in its own file, promoting:
 * - Code organization and maintainability
 * - Easy testing of individual operations
 * - Clear separation of concerns
 * - Reusability across different contexts
 *
 * Route handlers included:
 * - list: Retrieve multiple planets with filtering/pagination
 * - find: Retrieve a specific planet by ID
 * - create: Create a new planet
 *
 * Each handler implements the corresponding contract definition and includes
 * proper authentication, validation, and error handling.
 *
 * @see {@link ./routes/planet.list} - List planets handler
 * @see {@link ./routes/planet.find} - Find planet handler
 * @see {@link ./routes/planet.create} - Create planet handler
 * @see {@link ./planet.contract} - Planet API contract definitions
 */
const routes = {
  list,
  find,
  create,
};

export default routes;
