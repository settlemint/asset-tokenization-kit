import { list } from "@/orpc/routes/user/routes/user.list";
import { me } from "@/orpc/routes/user/routes/user.me";

/**
 * User router module.
 *
 * Aggregates all user-related route handlers into a single exportable object.
 * This module serves as the entry point for the lazy-loaded user namespace
 * in the main ORPC router.
 *
 * Current routes:
 * - me: GET /user/me - Retrieve current authenticated user information
 *
 * The router is designed to be extended with additional user management
 * endpoints such as profile updates, preference management, and session control.
 * @see {@link ./user.contract} - Type-safe contract definitions
 * @see {@link ./routes/user.me} - Current user endpoint implementation
 */
const routes = {
  me,
  list,
};

export default routes;
