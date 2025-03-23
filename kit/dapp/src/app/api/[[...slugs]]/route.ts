import { CryptoCurrencyApi } from "@/lib/api/cryptocurrency";
import { EquityApi } from "@/lib/api/equity";
import { FundApi } from "@/lib/api/fund";
import { metadata } from "@/lib/config/metadata";
import { AssetPriceApi } from "@/lib/providers/asset-price/asset-price-api";
import { ExchangeRatesApi } from "@/lib/providers/exchange-rates/exchange-rates-api";
import { ExchangeRateUpdateApi } from "@/lib/providers/exchange-rates/exchange-rates-update-api";
import { BondDetailApi } from "@/lib/queries/bond/bond-detail-api";
import { BondListApi } from "@/lib/queries/bond/bond-list-api";
import { StablecoinDetailApi } from "@/lib/queries/stablecoin/stablecoin-detail-api";
import { StablecoinListApi } from "@/lib/queries/stablecoin/stablecoin-list-api";
import { TokenizedDepositApi } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-detail-api";
import { TokenizedDepositListApi } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-list-api";
import { serverTiming } from "@elysiajs/server-timing";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import pkgjson from "../../../../package.json";

const app = new Elysia({ prefix: "/api" })
  .use(serverTiming())
  .use(
    swagger({
      documentation: {
        info: {
          title: metadata.title.default,
          version: pkgjson.version,
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
  .group("/bond", (app) => app.use(BondListApi).use(BondDetailApi))
  .group("/cryptocurrency", (app) => app.use(CryptoCurrencyApi))
  .group("/equity", (app) => app.use(EquityApi))
  .group("/fund", (app) => app.use(FundApi))
  .group("/stablecoin", (app) =>
    app.use(StablecoinListApi).use(StablecoinDetailApi)
  )
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
