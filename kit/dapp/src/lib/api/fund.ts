import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { isAddressAvailable } from "@/lib/queries/fund-factory/fund-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/fund-factory/fund-factory-predict-address";
import { PredictAddressInputSchema } from "@/lib/queries/fund-factory/fund-factory-schema";
import { getFundDetail } from "@/lib/queries/fund/fund-detail";
import { getFundList } from "@/lib/queries/fund/fund-list";
import { FundSchema } from "@/lib/queries/fund/fund-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia } from "elysia";
import { getAddress } from "viem";

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
          "Retrieves a list of all fund tokens in the system with their details including supply, collateral, and holder information.",
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
          "Retrieves a fund by address with details including supply, collateral, and holder information.",
        tags: ["fund"],
      },
      params: t.Object({
        address: t.String({
          description: "The address of the fund",
        }),
      }),
      response: {
        200: FundSchema,
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/factory/address-available/:address",
    async ({ params: { address } }) => {
      return isAddressAvailable(getAddress(address));
    },
    {
      auth: true,
      detail: {
        summary: "Check if address is available",
        description:
          "Checks if the given address is available for deploying a new fund contract.",
        tags: ["fund"],
      },
      params: t.Object({
        address: t.String({
          description: "The Ethereum address to check",
        }),
      }),
      response: {
        200: t.Boolean({
          description: "Whether the address is available",
        }),
        ...defaultErrorSchema,
      },
    }
  )
  .post(
    "/factory/predict-address",
    async ({ body }) => {
      return getPredictedAddress(body);
    },
    {
      auth: true,
      detail: {
        summary: "Predict contract address",
        description:
          "Predicts the contract address for a new fund based on creation parameters.",
        tags: ["fund"],
      },
      body: PredictAddressInputSchema,
      response: {
        200: t.EthereumAddress({
          description: "The predicted contract address",
        }),
        ...defaultErrorSchema,
      },
    }
  );
