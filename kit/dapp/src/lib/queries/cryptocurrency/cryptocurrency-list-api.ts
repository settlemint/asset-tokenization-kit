import { defaultErrorSchema } from "@/lib/api/default-error-schema";
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
        ...defaultErrorSchema,
      },
    }
  );
