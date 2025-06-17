import { read } from "./routes/settings.read";
import { list } from "./routes/settings.list";
import { create } from "./routes/settings.create";
import { update } from "./routes/settings.update";
import { del } from "./routes/settings.delete";

/**
 * Settings router module.
 *
 * Aggregates all settings-related route handlers into a single exportable object.
 * This module serves as the entry point for the lazy-loaded settings namespace
 * in the main ORPC router.
 *
 * Current routes:
 * - read: GET /settings/:key - Retrieve a specific setting by key
 * - list: GET /settings - Retrieve paginated list of all settings
 * - create: POST /settings - Create a new setting
 * - update: PUT /settings/:key - Update an existing setting
 * - delete: DELETE /settings/:key - Delete a setting
 *
 * The router provides comprehensive CRUD operations for managing application
 * settings, with proper authentication and permission checks on each route.
 */
const routes = {
  read,
  list,
  create,
  update,
  delete: del,
};

export default routes;
