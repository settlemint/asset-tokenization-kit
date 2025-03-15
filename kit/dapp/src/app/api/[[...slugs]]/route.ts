import { metadata } from "@/lib/config/metadata";
import { StablecoinListApi } from "@/lib/queries/stablecoin/stablecoin-list-api";
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
        ],
      },
    })
  )
  .group("/stablecoins", (app) => app.use(StablecoinListApi));

export const GET = app.handle;
export const POST = app.handle;
