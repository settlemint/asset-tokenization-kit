import { logger } from "@/lib/api/utils/api-logger";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { serverTiming } from "@elysiajs/server-timing";
import { swagger } from "@elysiajs/swagger";
import { Elysia, status as elysiaStatus } from "elysia";
import pkgjson from "../../../package.json";
import { metadata } from "../config/metadata";
import { siteConfig } from "../config/site";
import { AssetPriceApi } from "../providers/asset-price/asset-price-api";
import { ExchangeRatesApi } from "../providers/exchange-rates/exchange-rates-api";
import { ExchangeRateUpdateApi } from "../providers/exchange-rates/exchange-rates-update-api";
import { AccessControlError } from "../utils/access-control";
import { cacheControl } from "../utils/elysia";
import { ApplicationSetupApi } from "./application-setup";
import { AssetApi } from "./asset";
import { AssetActivityApi } from "./asset-activity";
import { AssetBalanceApi } from "./asset-balance";
import { AssetEventsApi } from "./asset-events";
import { AssetStatsApi } from "./asset-stats";
import { BondApi } from "./bond";
import { ContactApi } from "./contact";
import { CryptoCurrencyApi } from "./cryptocurrency";
import { DepositApi } from "./deposit";
import { EquityApi } from "./equity";
import { FixedYieldApi } from "./fixed-yield";
import { FundApi } from "./fund";
import { SettingApi } from "./setting";
import { StableCoinApi } from "./stablecoin";
import { TransactionApi } from "./transaction";
import { UserApi } from "./user";
import { VaultApi } from "./vault";

export const api = new Elysia({
  aot: true,
  precompile: true,
  experimental: { encodeSchema: true },
  prefix: "/api",
  detail: {
    security: [
      {
        apiKeyAuth: [],
      },
    ],
  },
})
  .use(
    opentelemetry({
      serviceName: process.env.NEXT_PUBLIC_APP_ID || "ATK",
    })
  )
  .use(serverTiming())
  .use(cacheControl)
  .use(
    swagger({
      documentation: {
        info: {
          title: metadata.title.default,
          version: pkgjson.version,
          description: metadata.description,
          license: {
            name: "FSL-1.1-MIT",
            url: "https://github.com/settlemint/asset-tokenization-kit/blob/main/LICENSE",
          },
          contact: {
            name: siteConfig.publisher,
            url: siteConfig.url,
            email: siteConfig.email,
          },
        },
        externalDocs: {
          description: "SettleMint Asset Tokenization Kit",
          url: "https://console.settlemint.com/documentation/application-kits/asset-tokenization/introduction",
        },
        security: [
          {
            apiKeyAuth: [],
          },
        ],
        components: {
          securitySchemes: {
            apiKeyAuth: {
              type: "apiKey",
              in: "header",
              name: "x-api-key",
              description: "API key",
            },
          },
        },
      },
    })
  )
  .onError(({ code, error, path }) => {
    if (code === "NOT_FOUND") {
      return elysiaStatus(404, "Not Found");
    }
    if (error instanceof AccessControlError) {
      return elysiaStatus(error.statusCode, error.message);
    }

    // Handle transaction-related errors more specifically
    if (
      error instanceof Error &&
      error.message.includes("Check is not defined")
    ) {
      console.warn("Caught Check is not defined error in:", path);

      // For the transactions API, return empty array instead of an error
      if (path && path.includes("/transaction/recent")) {
        return []; // Return empty array instead of error for transaction endpoints
      }

      return elysiaStatus(500, "Transaction processing error");
    }

    // TODO: handle specific errors (hasura, postgres, thegraph, portal, etc)
    console.error(
      `Unexpected error: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      error
    );
    return elysiaStatus(500, "Internal server error");
  })
  .ws("/ws/test", {
    error: (error) => {
      logger.error("Websocket error occurred", error);
    },
    close: (_ws, code, reason) => {
      logger.info(`Websocket closed: ${code} ${reason}`);
    },
    open: (ws) => {
      logger.info(`Websocket opened: ${ws.id}`);
      ws.send("Hello Client!");
    },
    message: (ws, message) => {
      logger.info(`Websocket message received: ${message}`);
      ws.send("Message received!");
    },
  })
  .group("/application-setup", (app) => app.use(ApplicationSetupApi))
  .group("/bond", (app) => app.use(BondApi))
  .group("/contact", (app) => app.use(ContactApi))
  .group("/cryptocurrency", (app) => app.use(CryptoCurrencyApi))
  .group("/equity", (app) => app.use(EquityApi))
  .group("/yield", (app) => app.use(FixedYieldApi))
  .group("/fund", (app) => app.use(FundApi))
  .group("/stablecoin", (app) => app.use(StableCoinApi))
  .group("/deposit", (app) => app.use(DepositApi))
  .group("/transaction", (app) => app.use(TransactionApi))
  .group("/user", (app) => app.use(UserApi))
  .group("/asset", (app) => app.use(AssetApi))
  .group("/stats", (app) => app.use(AssetStatsApi))
  .group("/events", (app) => app.use(AssetEventsApi))
  .group("/balance", (app) => app.use(AssetBalanceApi))
  .group("/vault", (app) => app.use(VaultApi))
  .group("/activity", (app) => app.use(AssetActivityApi))
  .group("/setting", (app) => app.use(SettingApi))
  .group("/providers/fx", (app) =>
    app.use(ExchangeRatesApi).use(ExchangeRateUpdateApi)
  )
  .group("/providers/asset-price", (app) => app.use(AssetPriceApi))
  .compile();

export type Api = typeof api;
