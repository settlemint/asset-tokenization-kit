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
import { grantRoleFunction } from "../mutations/asset/access-control/grant-role/grant-role-function";
import { GrantRoleSchema } from "../mutations/asset/access-control/grant-role/grant-role-schema";
import { revokeRoleFunction } from "../mutations/asset/access-control/revoke-role/revoke-role-function";
import { RevokeRoleSchema } from "../mutations/asset/access-control/revoke-role/revoke-role-schema";
import { updateRolesFunction } from "../mutations/asset/access-control/update-role/update-role-function";
import { UpdateRolesSchema } from "../mutations/asset/access-control/update-role/update-role-schema";
import { transferAssetFunction } from "../mutations/asset/transfer/transfer-function";
import { getTransferFormSchema } from "../mutations/asset/transfer/transfer-schema";
import { blockUserFunction } from "../mutations/block-user/block-user-function";
import { BlockUserSchema } from "../mutations/block-user/block-user-schema";
import { burnFunction } from "../mutations/burn/burn-function";
import { BurnSchema } from "../mutations/burn/burn-schema";
import { createEquityFunction } from "../mutations/equity/create/create-function";
import { CreateEquitySchema } from "../mutations/equity/create/create-schema";
import { mintFunction } from "../mutations/mint/mint-function";
import { MintSchema } from "../mutations/mint/mint-schema";
import { unblockUserFunction } from "../mutations/unblock-user/unblock-user-function";
import { UnblockUserSchema } from "../mutations/unblock-user/unblock-user-schema";
import { withdrawFunction } from "../mutations/withdraw/withdraw-function";
import { WithdrawSchema } from "../mutations/withdraw/withdraw-schema";

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
  )
  .post(
    "/factory",
    async ({ body, user }) => {
      return createEquityFunction({
        parsedInput: body,
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Create equity",
        description: "Creates a new equity token based on creation parameters.",
        tags: ["equity"],
      },
      body: CreateEquitySchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .post(
    "/transfer",
    async ({ body, user }) => {
      return transferAssetFunction({
        parsedInput: {
          ...body,
          assetType: "equity",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Transfer equity",
        description:
          "Transfers equity tokens from the current user's account to another address.",
        tags: ["equity"],
      },
      body: getTransferFormSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .post(
    "/access-control/grant-role",
    async ({ body, user }) => {
      return grantRoleFunction({
        parsedInput: {
          ...body,
          assettype: "equity",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Grant role",
        description: "Grants a specific role to a user for an equity contract.",
        tags: ["equity"],
      },
      body: GrantRoleSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .post(
    "/access-control/revoke-role",
    async ({ body, user }) => {
      return revokeRoleFunction({
        parsedInput: {
          ...body,
          assettype: "equity",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Revoke role",
        description:
          "Revokes a specific role from a user for an equity contract.",
        tags: ["equity"],
      },
      body: RevokeRoleSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .post(
    "/access-control/update-roles",
    async ({ body, user }) => {
      return updateRolesFunction({
        parsedInput: {
          ...body,
          assettype: "equity",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Update roles",
        description:
          "Updates the roles assigned to a user for an equity contract.",
        tags: ["equity"],
      },
      body: UpdateRolesSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .post(
    "/mint",
    async ({ body, user }) => {
      return mintFunction({
        parsedInput: {
          ...body,
          assettype: "equity",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Mint new equity tokens",
        description:
          "Creates new equity tokens and assigns them to the specified address.",
        tags: ["equity"],
      },
      body: MintSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .post(
    "/withdraw",
    async ({ body, user }) => {
      return withdrawFunction({
        parsedInput: {
          ...body,
          assettype: "equity",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Withdraw token",
        description: "Withdraws token from an equity contract.",
        tags: ["equity"],
      },
      body: WithdrawSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .post(
    "/burn",
    async ({ body, user }) => {
      return burnFunction({
        parsedInput: {
          ...body,
          assettype: "equity",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Burn equity tokens",
        description: "Burns a specified amount of equity tokens.",
        tags: ["equity"],
      },
      body: BurnSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .post(
    "/block-user",
    async ({ body, user }) => {
      return blockUserFunction({
        parsedInput: {
          ...body,
          assettype: "equity",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Block user",
        description: "Blocks a user from interacting with an equity token.",
        tags: ["equity"],
      },
      body: BlockUserSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .post(
    "/unblock-user",
    async ({ body, user }) => {
      return unblockUserFunction({
        parsedInput: {
          ...body,
          assettype: "equity",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Unblock user",
        description: "Unblocks a previously blocked user for an equity token.",
        tags: ["equity"],
      },
      body: UnblockUserSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  );
