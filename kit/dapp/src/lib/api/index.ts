import { opentelemetry } from "@elysiajs/opentelemetry";
import { serverTiming } from "@elysiajs/server-timing";
import { swagger } from "@elysiajs/swagger";
import { Elysia, error as elysiaError } from "elysia";
import pkgjson from "../../../package.json";
import { metadata } from "../config/metadata";
import { siteConfig } from "../config/site";
import { AssetPriceApi } from "../providers/asset-price/asset-price-api";
import { ExchangeRatesApi } from "../providers/exchange-rates/exchange-rates-api";
import { ExchangeRateUpdateApi } from "../providers/exchange-rates/exchange-rates-update-api";
import { AccessControlError } from "../utils/access-control";
import { cacheControl } from "../utils/elysia";
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
  .onError(({ code, error }) => {
    if (code === "NOT_FOUND") {
      return elysiaError(404, "Not Found");
    }
    if (error instanceof AccessControlError) {
      return elysiaError(error.statusCode, error.message);
    }
    // TODO: handle specific errors (hasura, postgres, thegraph, portal, etc)
    console.error(
      `Unexpected error: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      error
    );
    return elysiaError(500, "Internal server error");
  })
  .group("/bond", (app) => app.use(BondApi))
  .group("/contact", (app) => app.use(ContactApi))
  .group("/cryptocurrency", (app) => app.use(CryptoCurrencyApi))
  .group("/equity", (app) => app.use(EquityApi))
  .group("/fixed-yield", (app) => app.use(FixedYieldApi))
  .group("/fund", (app) => app.use(FundApi))
  .group("/stablecoin", (app) => app.use(StableCoinApi))
  .group("/deposit", (app) => app.use(DepositApi))
  .group("/transaction", (app) => app.use(TransactionApi))
  .group("/user", (app) => app.use(UserApi))
  .group("/asset", (app) => app.use(AssetApi))
  .group("/asset-stats", (app) => app.use(AssetStatsApi))
  .group("/asset-events", (app) => app.use(AssetEventsApi))
  .group("/asset-balance", (app) => app.use(AssetBalanceApi))
  .group("/asset-activity", (app) => app.use(AssetActivityApi))
  .group("/setting", (app) => app.use(SettingApi))
  .group("/providers/exchange-rates", (app) =>
    app.use(ExchangeRatesApi).use(ExchangeRateUpdateApi)
  )
  .group("/providers/asset-price", (app) => app.use(AssetPriceApi))
  .compile();

export type Api = typeof api;
