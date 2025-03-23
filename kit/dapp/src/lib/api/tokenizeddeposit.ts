import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { getTokenizedDepositDetail } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-detail";
import { getTokenizedDepositList } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-list";
import { TokenizedDepositSchema } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia } from "elysia";
import { getAddress } from "viem";

export const TokenizedDepositApi = new Elysia()
  .use(betterAuth)
  .use(superJson)
  .get(
    "/",
    async () => {
      return getTokenizedDepositList();
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
        200: t.Array(TokenizedDepositSchema),
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/:address",
    ({ params: { address } }) => {
      return getTokenizedDepositDetail({
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
        200: TokenizedDepositSchema,
        ...defaultErrorSchema,
      },
    }
  );
