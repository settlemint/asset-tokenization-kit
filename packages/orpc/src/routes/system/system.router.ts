import accessManagerRouter from "./access-manager/access-manager.router";
import addonRouter from "./addon/addon.router";
import complianceModuleRouter from "./compliance-module/compliance-module.router";
import identityRouter from "./identity/identity.router";
import { create } from "./routes/system.create";
import { list } from "./routes/system.list";
import { read } from "./routes/system.read";
import statsRouter from "./stats/stats.router";
import tokenFactoryRouter from "./token-factory/factory.router";

/**
 * System router module.
 *
 * Aggregates all system-related route handlers into a single exportable object.
 * This module serves as the entry point for the lazy-loaded system namespace
 * in the main ORPC router.
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
  ...accessManagerRouter,
  ...tokenFactoryRouter,
};

export default routes;
