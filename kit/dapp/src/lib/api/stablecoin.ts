import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import { getStableCoinList } from "@/lib/queries/stablecoin/stablecoin-list";
import { StableCoinSchema } from "@/lib/queries/stablecoin/stablecoin-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia } from "elysia";
import { getAddress } from "viem";

export const StableCoinApi = new Elysia()
  .use(betterAuth)
  .use(superJson)
  .get(
    "/",
    async () => {
      return getStableCoinList();
    },
    {
      auth: true,
      detail: {
        summary: "List",
        description:
          "Retrieves a list of all stablecoin tokens in the system with their details including supply, collateral, and holder information.",
        tags: ["stablecoin"],
      },
      response: {
        200: t.Array(StableCoinSchema),
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/:address",
    ({ params: { address } }) => {
      return getStableCoinDetail({
        address: getAddress(address),
      });
    },
    {
      auth: true,
      detail: {
        summary: "Details",
        description:
          "Retrieves a stablecoin by address with details including supply, collateral, and holder information.",
        tags: ["stablecoin"],
      },
      params: t.Object({
        address: t.String({
          description: "The address of the stablecoin",
        }),
      }),
      response: {
        200: StableCoinSchema,
        ...defaultErrorSchema,
      },
    }
  );
