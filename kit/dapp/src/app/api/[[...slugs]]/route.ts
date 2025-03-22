import { CryptoCurrencyApi } from "@/lib/api/cryptocurrency";
import { metadata } from "@/lib/config/metadata";
import { AssetPriceApi } from "@/lib/providers/asset-price/asset-price-api";
import { ExchangeRatesApi } from "@/lib/providers/exchange-rates/exchange-rates-api";
import { ExchangeRateUpdateApi } from "@/lib/providers/exchange-rates/exchange-rates-update-api";
import { BondDetailApi } from "@/lib/queries/bond/bond-detail-api";
import { BondListApi } from "@/lib/queries/bond/bond-list-api";
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
      },
    })
  )
  .group("/stablecoin", (app) =>
    app.use(StablecoinListApi).use(StablecoinDetailApi)
  )
  .group("/fund", (app) => app.use(FundListApi).use(FundDetailApi))
  .group("/equity", (app) => app.use(EquityListApi).use(EquityDetailApi))
  .group("/cryptocurrency", (app) => app.use(CryptoCurrencyApi))
  .group("/bond", (app) => app.use(BondListApi).use(BondDetailApi))
  .group("/tokenizeddeposit", (app) =>
    app.use(TokenizedDepositListApi).use(TokenizedDepositApi)
  )
  .group("/providers/exchange-rates", (app) =>
    app.use(ExchangeRatesApi).use(ExchangeRateUpdateApi)
  )
  .group("/providers/asset-price", (app) => app.use(AssetPriceApi));

export const GET = app.handle;
export const POST = app.handle;
export const PATCH = app.handle;
export const DELETE = app.handle;
