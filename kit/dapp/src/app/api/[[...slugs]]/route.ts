import { AssetActivityApi } from "@/lib/api/asset-activity";
import { AssetBalanceApi } from "@/lib/api/asset-balance";
import { AssetEventsApi } from "@/lib/api/asset-events";
import { AssetStatsApi } from "@/lib/api/asset-stats";
import { BondApi } from "@/lib/api/bond";
import { ContactApi } from "@/lib/api/contact";
import { CryptoCurrencyApi } from "@/lib/api/cryptocurrency";
import { DepositApi } from "@/lib/api/deposit";
import { EquityApi } from "@/lib/api/equity";
import { FixedYieldApi } from "@/lib/api/fixed-yield";
import { FundApi } from "@/lib/api/fund";
import { StableCoinApi } from "@/lib/api/stablecoin";
import { TransactionApi } from "@/lib/api/transaction";
import { UserApi } from "@/lib/api/user";
import { metadata } from "@/lib/config/metadata";
import { AssetPriceApi } from "@/lib/providers/asset-price/asset-price-api";
import { ExchangeRatesApi } from "@/lib/providers/exchange-rates/exchange-rates-api";
import { ExchangeRateUpdateApi } from "@/lib/providers/exchange-rates/exchange-rates-update-api";
import { serverTiming } from "@elysiajs/server-timing";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import pkgjson from "../../../../package.json";

const app = new Elysia({
  prefix: "/api",
  detail: {
    security: [
      {
        apiKeyAuth: [],
      },
    ],
  },
})
  .use(serverTiming())
  .use(
    swagger({
      documentation: {
        info: {
          title: metadata.title.default,
          version: pkgjson.version,
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
  .group("/asset-stats", (app) => app.use(AssetStatsApi))
  .group("/asset-events", (app) => app.use(AssetEventsApi))
  .group("/asset-balance", (app) => app.use(AssetBalanceApi))
  .group("/asset-activity", (app) => app.use(AssetActivityApi))
  .group("/providers/exchange-rates", (app) =>
    app.use(ExchangeRatesApi).use(ExchangeRateUpdateApi)
  )
  .group("/providers/asset-price", (app) => app.use(AssetPriceApi));

export const GET = app.handle;
export const POST = app.handle;
export const PATCH = app.handle;
export const DELETE = app.handle;
