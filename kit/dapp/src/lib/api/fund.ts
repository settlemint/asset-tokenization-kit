import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { getFundDetail } from "@/lib/queries/fund/fund-detail";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia } from "elysia";
import { getAddress } from "viem";
import { getFundList } from "../queries/fund/fund-list";
import { FundSchema } from "../queries/fund/fund-schema";

export const FundApi = new Elysia()
  .use(betterAuth)
  .use(superJson)
  .get(
    "/",
    async () => {
      return getFundList();
    },
    {
      auth: true,
      detail: {
        summary: "List",
        description:
          "Retrieves a list of all fund tokens in the system with their details including supply, assets, and holder information.",
        tags: ["fund"],
      },
      response: {
        200: t.Array(FundSchema),
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/:address",
    ({ params: { address } }) => {
      return getFundDetail({
        address: getAddress(address),
      });
    },
    {
      auth: true,
      detail: {
        summary: "Details",
        description:
          "Retrieves a fund token by address with details including supply, assets, and holder information.",
        tags: ["fund"],
      },
      params: t.Object({
        address: t.String({
          description: "The address of the fund token",
        }),
      }),
      response: {
        200: FundSchema,
        ...defaultErrorSchema,
      },
    }
  );
