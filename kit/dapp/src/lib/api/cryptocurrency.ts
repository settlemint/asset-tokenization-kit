import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { getCryptoCurrencyDetail } from "@/lib/queries/cryptocurrency/cryptocurrency-detail";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia } from "elysia";
import { getAddress } from "viem";
import { getCryptoCurrencyList } from "../queries/cryptocurrency/cryptocurrency-list";
import { CryptoCurrencySchema } from "../queries/cryptocurrency/cryptocurrency-schema";

export const CryptoCurrencyApi = new Elysia()
  .use(betterAuth)
  .use(superJson)
  .get(
    "/",
    async () => {
      return getCryptoCurrencyList();
    },
    {
      auth: true,
      detail: {
        summary: "List",
        description:
          "Retrieves a list of all cryptocurrency tokens in the system with their details including supply and holder information.",
        tags: ["cryptocurrency"],
      },
      response: {
        200: t.Array(CryptoCurrencySchema),
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/:address",
    ({ params: { address } }) => {
      return getCryptoCurrencyDetail({
        address: getAddress(address),
      });
    },
    {
      auth: true,
      detail: {
        summary: "Details",
        description:
          "Retrieves a cryptocurrency token by address with details including supply and holder information.",
        tags: ["cryptocurrency"],
      },
      params: t.Object({
        address: t.String({
          description: "The address of the cryptocurrency token",
        }),
      }),
      response: {
        200: CryptoCurrencySchema,
        ...defaultErrorSchema,
      },
    }
  );
