import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { isAddressAvailable } from "@/lib/queries/equity-factory/equity-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/equity-factory/equity-factory-predict-address";
import { PredictAddressInputSchema } from "@/lib/queries/equity-factory/equity-factory-schema";
import { getEquityDetail } from "@/lib/queries/equity/equity-detail";
import { getEquityList } from "@/lib/queries/equity/equity-list";
import { EquitySchema } from "@/lib/queries/equity/equity-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia } from "elysia";
import { getAddress } from "viem";

export const EquityApi = new Elysia({
  detail: {
    security: [
      {
        apiKeyAuth: [],
      },
    ],
  },
})
  .use(betterAuth)
  .use(superJson)
  .get(
    "/",
    async () => {
      return getEquityList();
    },
    {
      auth: true,
      detail: {
        summary: "List",
        description:
          "Retrieves a list of all equity tokens in the system with their details including supply, collateral, and holder information.",
        tags: ["equity"],
      },
      response: {
        200: t.Array(EquitySchema),
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/:address",
    ({ params: { address } }) => {
      return getEquityDetail({
        address: getAddress(address),
      });
    },
    {
      auth: true,
      detail: {
        summary: "Details",
        description:
          "Retrieves a equity by address with details including supply, collateral, and holder information.",
        tags: ["equity"],
      },
      params: t.Object({
        address: t.String({
          description: "The address of the equity",
        }),
      }),
      response: {
        200: EquitySchema,
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
          "Checks if the given address is available for deploying a new equity contract.",
        tags: ["equity"],
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
          "Predicts the contract address for a new equity based on creation parameters.",
        tags: ["equity"],
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
