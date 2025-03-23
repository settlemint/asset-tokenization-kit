import { BondApi } from "@/lib/api/bond";
import { CryptoCurrencyApi } from "@/lib/api/cryptocurrency";
import { EquityApi } from "@/lib/api/equity";
import { FundApi } from "@/lib/api/fund";
import { StableCoinApi } from "@/lib/api/stablecoin";
import { TokenizedDepositApi } from "@/lib/api/tokenizeddeposit";
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
  .group("/bond", (app) => app.use(BondApi))
  .group("/cryptocurrency", (app) => app.use(CryptoCurrencyApi))
  .group("/equity", (app) => app.use(EquityApi))
  .group("/fund", (app) => app.use(FundApi))
  .group("/stablecoin", (app) => app.use(StableCoinApi))
  .group("/tokenizeddeposit", (app) => app.use(TokenizedDepositApi))
  .group("/transaction", (app) => app.use(TransactionApi))
  .group("/user", (app) => app.use(UserApi))
  .group("/providers/exchange-rates", (app) =>
    app.use(ExchangeRatesApi).use(ExchangeRateUpdateApi)
  )
  .group("/providers/asset-price", (app) => app.use(AssetPriceApi));

export const GET = app.handle;
export const POST = app.handle;
export const PATCH = app.handle;
export const DELETE = app.handle;
