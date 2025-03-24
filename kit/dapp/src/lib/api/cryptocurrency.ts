import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { isAddressAvailable } from "@/lib/queries/cryptocurrency-factory/cryptocurrency-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/cryptocurrency-factory/cryptocurrency-factory-predict-address";
import { PredictAddressInputSchema } from "@/lib/queries/cryptocurrency-factory/cryptocurrency-factory-schema";
import { getCryptoCurrencyDetail } from "@/lib/queries/cryptocurrency/cryptocurrency-detail";
import { getCryptoCurrencyList } from "@/lib/queries/cryptocurrency/cryptocurrency-list";
import { CryptoCurrencySchema } from "@/lib/queries/cryptocurrency/cryptocurrency-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia } from "elysia";
import { getAddress } from "viem";
import { createCryptoCurrencyFunction } from "../mutations/cryptocurrency/create/create-function";
import { CreateCryptoCurrencySchema } from "../mutations/cryptocurrency/create/create-schema";

export const CryptoCurrencyApi = new Elysia({
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
          "Checks if the given address is available for deploying a new cryptocurrency contract.",
        tags: ["cryptocurrency"],
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
          "Predicts the contract address for a new cryptocurrency based on creation parameters.",
        tags: ["cryptocurrency"],
      },
      body: PredictAddressInputSchema,
      response: {
        200: t.EthereumAddress({
          description: "The predicted contract address",
        }),
        ...defaultErrorSchema,
      },
    }
  )
  .post(
    "/factory",
    async ({ body, user }) => {
      return createCryptoCurrencyFunction({
        parsedInput: body,
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Create cryptocurrency",
        description:
          "Creates a new cryptocurrency token based on creation parameters.",
        tags: ["cryptocurrency"],
      },
      body: CreateCryptoCurrencySchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  );
