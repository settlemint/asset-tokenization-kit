import { baseRouter } from "../procedures/base.router";
import accountRouter from "./account/account.router";
import actionsRouter from "./actions/actions.router";
import addonsRouter from "./addons/addons.router";
import exchangeRatesRouter from "./exchange-rates/exchange-rates.router";
import settingsRouter from "./settings/settings.router";
import systemRouter from "./system/system.router";
import tokenRouter from "./token/token.router";
import userRouter from "./user/user.router";

/**
 * Main ORPC router configuration.
 *
 * This router serves as the root of the API route tree, organizing all
 * API endpoints into logical namespaces. It uses lazy loading to optimize
 * bundle size and startup performance by only loading route modules when
 * they are actually needed.
 *
 * The router structure follows a hierarchical pattern where each namespace
 * (like 'planet') contains related API procedures, making the API more
 * organized and maintainable.
 */
export const router = baseRouter.router({
  account: accountRouter,
  actions: actionsRouter,
  addons: addonsRouter,
  exchangeRates: exchangeRatesRouter,
  settings: settingsRouter,
  token: tokenRouter,
  system: systemRouter,
  user: userRouter,
});
