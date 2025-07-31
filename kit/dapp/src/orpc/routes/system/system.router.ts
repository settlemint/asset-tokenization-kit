import addonRouter from "@/orpc/routes/system/addon/addon.router";
import complianceModuleRouter from "@/orpc/routes/system/compliance-module/compliance-module.router";
import identityRouter from "@/orpc/routes/system/identity/identity.router";
import statsRouter from "@/orpc/routes/system/stats/stats.router";
import { create } from "./routes/system.create";
import { list } from "./routes/system.list";
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
 * - addonCreate: POST /systems/addons - Register system add-ons
 * - statsSystemAssets: System-wide asset statistics
 * - statsSystemValue: System-wide value metrics
 * - statsSystemTransactionCount: System-wide transaction count statistics
 * - statsSystemTransactionHistory: System-wide transaction history
 *
 * The router is designed to be extended with additional system management
 * endpoints as the application evolves.
 */
const routes = {
  list,
  create,
  read,
  ...addonRouter,
  ...identityRouter,
  ...complianceModuleRouter,
  ...statsRouter,
};

export default routes;
