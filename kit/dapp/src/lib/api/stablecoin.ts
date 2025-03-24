import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { isAddressAvailable } from "@/lib/queries/stablecoin-factory/stablecoin-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/stablecoin-factory/stablecoin-factory-predict-address";
import { PredictAddressInputSchema } from "@/lib/queries/stablecoin-factory/stablecoin-factory-schema";
import { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import { getStableCoinList } from "@/lib/queries/stablecoin/stablecoin-list";
import { StableCoinSchema } from "@/lib/queries/stablecoin/stablecoin-schema";
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
import { blockUserFunction } from "../mutations/block-user/block-user-function";
import { BlockUserSchema } from "../mutations/block-user/block-user-schema";
import { burnFunction } from "../mutations/burn/burn-function";
import { BurnSchema } from "../mutations/burn/burn-schema";
import { freezeFunction } from "../mutations/freeze/freeze-function";
import { FreezeSchema } from "../mutations/freeze/freeze-schema";
import { mintFunction } from "../mutations/mint/mint-function";
import { MintSchema } from "../mutations/mint/mint-schema";
import { pauseFunction } from "../mutations/pause/pause-function";
import { PauseSchema } from "../mutations/pause/pause-schema";
import { createStablecoinFunction } from "../mutations/stablecoin/create/create-function";
import { CreateStablecoinSchema } from "../mutations/stablecoin/create/create-schema";
import { transferAssetFunction } from "../mutations/transfer/transfer-function";
import { TransferSchema } from "../mutations/transfer/transfer-schema";
import { unblockUserFunction } from "../mutations/unblock-user/unblock-user-function";
import { UnblockUserSchema } from "../mutations/unblock-user/unblock-user-schema";
import { unpauseFunction } from "../mutations/unpause/unpause-function";
import { UnpauseSchema } from "../mutations/unpause/unpause-schema";
import { updateCollateralFunction } from "../mutations/update-collateral/update-collateral-function";
import { UpdateCollateralSchema } from "../mutations/update-collateral/update-collateral-schema";
import { withdrawFunction } from "../mutations/withdraw/withdraw-function";
import { WithdrawSchema } from "../mutations/withdraw/withdraw-schema";

export const StableCoinApi = new Elysia({
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
    "",
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
        tags: ["stablecoin"],
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
        tags: ["stablecoin"],
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
      return createStablecoinFunction({
        parsedInput: body,
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Create stablecoin",
        description:
          "Creates a new stablecoin token based on creation parameters.",
        tags: ["stablecoin"],
      },
      body: CreateStablecoinSchema(),
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
          assettype: "stablecoin",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Transfer stablecoin",
        description:
          "Transfers stablecoin tokens from the current user's account to another address.",
        tags: ["stablecoin"],
      },
      body: TransferSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .put(
    "/access-control/grant-role",
    async ({ body, user }) => {
      return grantRoleFunction({
        parsedInput: {
          ...body,
          assettype: "stablecoin",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Grant role",
        description:
          "Grants a specific role to a user for a stablecoin contract.",
        tags: ["stablecoin"],
      },
      body: GrantRoleSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .delete(
    "/access-control/revoke-role",
    async ({ body, user }) => {
      return revokeRoleFunction({
        parsedInput: {
          ...body,
          assettype: "stablecoin",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Revoke role",
        description:
          "Revokes a specific role from a user for a stablecoin contract.",
        tags: ["stablecoin"],
      },
      body: RevokeRoleSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .patch(
    "/access-control/update-roles",
    async ({ body, user }) => {
      return updateRolesFunction({
        parsedInput: {
          ...body,
          assettype: "stablecoin",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Update roles",
        description:
          "Updates the roles assigned to a user for a stablecoin contract.",
        tags: ["stablecoin"],
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
          assettype: "stablecoin",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Mint new stablecoin tokens",
        description:
          "Creates new stablecoin tokens and assigns them to the specified address.",
        tags: ["stablecoin"],
      },
      body: MintSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .delete(
    "/burn",
    async ({ body, user }) => {
      return burnFunction({
        parsedInput: {
          ...body,
          assettype: "stablecoin",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Burn stablecoin tokens",
        description:
          "Burns the specified amount of stablecoin tokens from the user's account.",
        tags: ["stablecoin"],
      },
      body: BurnSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .put(
    "/freeze",
    async ({ body, user }) => {
      return freezeFunction({
        parsedInput: {
          ...body,
          assettype: "stablecoin",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Freeze user account",
        description:
          "Freezes a specified amount of stablecoin tokens in a user's account.",
        tags: ["stablecoin"],
      },
      body: FreezeSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .put(
    "/pause",
    async ({ body, user }) => {
      return pauseFunction({
        parsedInput: {
          ...body,
          assettype: "stablecoin",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Pause contract",
        description: "Pauses all operations on the stablecoin contract.",
        tags: ["stablecoin"],
      },
      body: PauseSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .delete(
    "/unpause",
    async ({ body, user }) => {
      return unpauseFunction({
        parsedInput: {
          ...body,
          assettype: "stablecoin",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Unpause contract",
        description:
          "Resumes all operations on a previously paused stablecoin contract.",
        tags: ["stablecoin"],
      },
      body: UnpauseSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .patch(
    "/update-collateral",
    async ({ body, user }) => {
      return updateCollateralFunction({
        parsedInput: {
          ...body,
          assettype: "stablecoin",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Update collateral",
        description: "Updates the collateral amount for a stablecoin contract.",
        tags: ["stablecoin"],
      },
      body: UpdateCollateralSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .put(
    "/block-user",
    async ({ body, user }) => {
      return blockUserFunction({
        parsedInput: {
          ...body,
          assettype: "stablecoin",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Block user",
        description:
          "Blocks a user from interacting with a stablecoin contract.",
        tags: ["stablecoin"],
      },
      body: BlockUserSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .delete(
    "/unblock-user",
    async ({ body, user }) => {
      return unblockUserFunction({
        parsedInput: {
          ...body,
          assettype: "stablecoin",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Unblock user",
        description:
          "Unblocks a previously blocked user, allowing them to interact with a stablecoin contract.",
        tags: ["stablecoin"],
      },
      body: UnblockUserSchema(),
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
          assettype: "stablecoin",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Withdraw token",
        description: "Withdraws token from a stablecoin contract.",
        tags: ["stablecoin"],
      },
      body: WithdrawSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  );
