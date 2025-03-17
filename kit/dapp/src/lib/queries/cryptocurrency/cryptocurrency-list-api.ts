import { betterAuth, superJson } from "@/lib/utils/elysia";
import { Elysia, t } from "elysia";
import { CryptoCurrencyDetailResponseSchema } from "./cryptocurrency-detail-api";
import { getCryptoCurrencyList } from "./cryptocurrency-list";

const CryptoCurrencyListResponseSchema = t.Array(
  CryptoCurrencyDetailResponseSchema
);

export const CryptoCurrencyListApi = new Elysia()
  .use(betterAuth)
  .use(superJson)
  .get(
    "/",
    async () => {
      const cryptocurrencies = await getCryptoCurrencyList();
      // Add concentration field to match the schema
      return cryptocurrencies.map((crypto) => {
        const topHoldersSum = crypto.holders.reduce(
          (sum, holder) => sum + holder.valueExact,
          0n
        );
        const concentration =
          crypto.totalSupplyExact === 0n
            ? 0
            : Number((topHoldersSum * 100n) / crypto.totalSupplyExact);

        return {
          ...crypto,
          concentration,
        };
      });
    },
    {
      auth: true,
      detail: {
        summary: "Get Cryptocurrency List",
        description:
          "Retrieves a list of all cryptocurrency tokens in the system with their details including supply and holder information.",
        tags: ["Cryptocurrencies"],
      },
      response: {
        200: CryptoCurrencyListResponseSchema,
        400: t.Object({
          error: t.String({
            description: "Bad Request - Invalid parameters or request format",
          }),
          details: t.Optional(t.Array(t.String())),
        }),
        401: t.Object({
          error: t.String({
            description: "Unauthorized - Authentication is required",
          }),
        }),
        403: t.Object({
          error: t.String({
            description:
              "Forbidden - Insufficient permissions to access the resource",
          }),
        }),
        404: t.Object({
          error: t.String({
            description: "Not Found - The requested resource does not exist",
          }),
        }),
        429: t.Object({
          error: t.String({
            description: "Too Many Requests - Rate limit exceeded",
          }),
          retryAfter: t.Optional(t.Number()),
        }),
        500: t.Object({
          error: t.String({
            description:
              "Internal Server Error - Something went wrong on the server",
          }),
          requestId: t.Optional(t.String()),
        }),
      },
    }
  );
