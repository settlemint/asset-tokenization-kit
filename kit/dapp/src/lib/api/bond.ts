import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { isAddressAvailable } from "@/lib/queries/bond-factory/bond-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/bond-factory/bond-factory-predict-address";
import { PredictAddressInputSchema } from "@/lib/queries/bond-factory/bond-factory-schema";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { getBondList } from "@/lib/queries/bond/bond-list";
import { BondSchema } from "@/lib/queries/bond/bond-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia } from "elysia";
import { getAddress } from "viem";

export const BondApi = new Elysia()
  .use(betterAuth)
  .use(superJson)
  .get(
    "/",
    async () => {
      return getBondList();
    },
    {
      auth: true,
      detail: {
        summary: "List",
        description:
          "Retrieves a list of all bond tokens in the system with their details including supply, maturity, and holder information.",
        tags: ["bond"],
      },
      response: {
        200: t.Array(BondSchema),
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/:address",
    ({ params: { address } }) => {
      return getBondDetail({
        address: getAddress(address),
      });
    },
    {
      auth: true,
      detail: {
        summary: "Details",
        description:
          "Retrieves a bond token by address with details including supply, maturity, and holder information.",
        tags: ["bond"],
      },
      params: t.Object({
        address: t.String({
          description: "The address of the bond token",
        }),
      }),
      response: {
        200: BondSchema,
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
          "Checks if the given address is available for deploying a new tokenized deposit contract.",
        tags: ["bond"],
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
          "Predicts the contract address for a new tokenized deposit based on creation parameters.",
        tags: ["bond"],
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
