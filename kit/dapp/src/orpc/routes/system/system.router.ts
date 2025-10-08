import accessManagerRouter from "@/orpc/routes/system/access-manager/access-manager.router";
import addonRouter from "@/orpc/routes/system/addon/addon.router";
import apiKeysRouter from "@/orpc/routes/system/api-keys/api-keys.router";
import claimTopicsRouter from "@/orpc/routes/system/claim-topics/claim-topics.router";
import complianceModuleRouter from "@/orpc/routes/system/compliance-module/compliance-module.router";
import identityRouter from "@/orpc/routes/system/identity/identity.router";
import statsRouter from "@/orpc/routes/system/stats/stats.router";
import tokenFactoryRouter from "@/orpc/routes/system/token-factory/factory.router";
import trustedIssuersRouter from "@/orpc/routes/system/trusted-issuers/trusted-issuers.router";
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
 * The router is designed to be extended with additional system management
 * endpoints as the application evolves.
 */
const routes = {
  list,
  create,
  read,
  addon: addonRouter,
  identity: identityRouter,
  compliance: complianceModuleRouter,
  claimTopics: claimTopicsRouter,
  trustedIssuers: trustedIssuersRouter,
  stats: statsRouter,
  accessManager: accessManagerRouter,
  factory: tokenFactoryRouter,
  apiKeys: apiKeysRouter,
};

export default routes;
