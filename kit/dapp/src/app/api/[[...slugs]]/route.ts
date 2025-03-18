import { metadata } from "@/lib/config/metadata";
import { ExchangeRatesApi } from "@/lib/providers/exchange-rates/exchange-rates-api";
import { ExchangeRateUpdateApi } from "@/lib/providers/exchange-rates/exchange-rates-update-api";
import { BondDetailApi } from "@/lib/queries/bond/bond-detail-api";
import { BondListApi } from "@/lib/queries/bond/bond-list-api";
import { CryptoCurrencyDetailApi } from "@/lib/queries/cryptocurrency/cryptocurrency-detail-api";
import { CryptoCurrencyListApi } from "@/lib/queries/cryptocurrency/cryptocurrency-list-api";
import { EquityDetailApi } from "@/lib/queries/equity/equity-detail-api";
import { EquityListApi } from "@/lib/queries/equity/equity-list-api";
import { FundDetailApi } from "@/lib/queries/fund/fund-detail-api";
import { FundListApi } from "@/lib/queries/fund/fund-list-api";
import { StablecoinDetailApi } from "@/lib/queries/stablecoin/stablecoin-detail-api";
import { StablecoinListApi } from "@/lib/queries/stablecoin/stablecoin-list-api";
import { TokenizedDepositApi } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-detail-api";
import { TokenizedDepositListApi } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-list-api";
import { serverTiming } from "@elysiajs/server-timing";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { version } from "../../../../package.json";

const app = new Elysia({ prefix: "/api" })
  .use(serverTiming())
  .use(
    swagger({
      documentation: {
        info: {
          title: metadata.title.default,
          version,
        },
        components: {
          securitySchemes: {
            apiKeyAuth: {
              type: "apiKey",
              in: "header",
              name: "x-api-key",
            },
          },
        },
        tags: [
          { name: "Auth", description: "Authentication endpoints" },
          { name: "Bonds", description: "Bond endpoints" },
          {
            name: "Cryptocurrencies",
            description: "CryptoCurrency endpoints",
          },
          { name: "Equities", description: "Equity endpoints" },
          { name: "Funds", description: "Fund endpoints" },
          { name: "Stablecoins", description: "Stablecoin endpoints" },
          {
            name: "Tokenized Deposits",
            description: "Tokenized Deposit endpoints",
          },
          { name: "Providers", description: "Provider endpoints" },
        ],
      },
    })
  )
  .group("/stablecoins", (app) =>
    app.use(StablecoinListApi).use(StablecoinDetailApi)
  )
  .group("/funds", (app) => app.use(FundListApi).use(FundDetailApi))
  .group("/equities", (app) => app.use(EquityListApi).use(EquityDetailApi))
  .group("/cryptocurrencies", (app) =>
    app.use(CryptoCurrencyListApi).use(CryptoCurrencyDetailApi)
  )
  .group("/bonds", (app) => app.use(BondListApi).use(BondDetailApi))
  .group("/tokenized-deposits", (app) =>
    app.use(TokenizedDepositListApi).use(TokenizedDepositApi)
  )
  .group("/providers/exchange-rates", (app) =>
    app.use(ExchangeRatesApi).use(ExchangeRateUpdateApi)
  );

export const GET = app.handle;
export const POST = app.handle;
export const PATCH = app.handle;
