import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { isAddressAvailable } from "@/lib/queries/tokenizeddeposit-factory/tokenizeddeposit-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/tokenizeddeposit-factory/tokenizeddeposit-factory-predict-address";
import { getTokenizedDepositDetail } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-detail";
import { getTokenizedDepositList } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-list";
import { TokenizedDepositSchema } from "@/lib/queries/tokenizeddeposit/tokenizeddeposit-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia } from "elysia";
import { getAddress } from "viem";
import { allowUserFunction } from "../mutations/allow-user/allow-user-function";
import { AllowUserSchema } from "../mutations/allow-user/allow-user-schema";
import { grantRoleFunction } from "../mutations/asset/access-control/grant-role/grant-role-function";
import { GrantRoleSchema } from "../mutations/asset/access-control/grant-role/grant-role-schema";
import { revokeRoleFunction } from "../mutations/asset/access-control/revoke-role/revoke-role-function";
import { RevokeRoleSchema } from "../mutations/asset/access-control/revoke-role/revoke-role-schema";
import { updateRolesFunction } from "../mutations/asset/access-control/update-role/update-role-function";
import { UpdateRolesSchema } from "../mutations/asset/access-control/update-role/update-role-schema";
import { transferAssetFunction } from "../mutations/asset/transfer/transfer-function";
import { getTransferFormSchema } from "../mutations/asset/transfer/transfer-schema";
import { burnFunction } from "../mutations/burn/burn-function";
import { BurnSchema } from "../mutations/burn/burn-schema";
import { disallowUserFunction } from "../mutations/disallow-user/disallow-user-function";
import { DisallowUserSchema } from "../mutations/disallow-user/disallow-user-schema";
import { freezeFunction } from "../mutations/freeze/freeze-function";
import { FreezeSchema } from "../mutations/freeze/freeze-schema";
import { mintFunction } from "../mutations/mint/mint-function";
import { MintSchema } from "../mutations/mint/mint-schema";
import { pauseFunction } from "../mutations/pause/pause-function";
import { PauseSchema } from "../mutations/pause/pause-schema";
import { createTokenizedDepositFunction } from "../mutations/tokenized-deposit/create/create-function";
import { CreateTokenizedDepositSchema } from "../mutations/tokenized-deposit/create/create-schema";
import { unpauseFunction } from "../mutations/unpause/unpause-function";
import { UnpauseSchema } from "../mutations/unpause/unpause-schema";
import { updateCollateralFunction } from "../mutations/update-collateral/update-collateral-function";
import { UpdateCollateralSchema } from "../mutations/update-collateral/update-collateral-schema";
import { withdrawFunction } from "../mutations/withdraw/withdraw-function";
import { WithdrawSchema } from "../mutations/withdraw/withdraw-schema";
import { PredictAddressInputSchema } from "../queries/tokenizeddeposit-factory/tokenizeddeposit-factory-schema";

export const TokenizedDepositApi = new Elysia({
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
      return getTokenizedDepositList();
    },
    {
      auth: true,
      detail: {
        summary: "List",
        description:
          "Retrieves a list of all stablecoin tokens in the system with their details including supply, collateral, and holder information.",
        tags: ["tokenized deposit"],
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
        tags: ["tokenized deposit"],
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
        tags: ["tokenized deposit"],
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
        tags: ["tokenized deposit"],
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
      return createTokenizedDepositFunction({
        parsedInput: body,
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Create tokenized deposit",
        description:
          "Creates a new tokenized deposit token based on creation parameters.",
        tags: ["tokenized deposit"],
      },
      body: CreateTokenizedDepositSchema(),
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
          assetType: "tokenizeddeposit",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Transfer tokenized deposit",
        description:
          "Transfers tokenized deposit tokens from the current user's account to another address.",
        tags: ["tokenized deposit"],
      },
      body: getTransferFormSchema(),
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
          assettype: "tokenizeddeposit",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Grant role",
        description:
          "Grants a specific role to a user for a tokenized deposit contract.",
        tags: ["tokenized deposit"],
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
          assettype: "tokenizeddeposit",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Revoke role",
        description:
          "Revokes a specific role from a user for a tokenized deposit contract.",
        tags: ["tokenized deposit"],
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
          assettype: "tokenizeddeposit",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Update roles",
        description:
          "Updates the roles assigned to a user for a tokenized deposit contract.",
        tags: ["tokenized deposit"],
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
          assettype: "tokenizeddeposit",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Mint new tokenized deposit tokens",
        description:
          "Creates new tokenized deposit tokens and assigns them to the specified address.",
        tags: ["tokenized deposit"],
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
          assettype: "tokenizeddeposit",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Burn tokenized deposit tokens",
        description:
          "Burns the specified amount of tokenized deposit tokens from the user's account.",
        tags: ["tokenized deposit"],
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
          assettype: "tokenizeddeposit",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Freeze user account",
        description:
          "Freezes a specified amount of tokenized deposit tokens in a user's account.",
        tags: ["tokenized deposit"],
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
          assettype: "tokenizeddeposit",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Pause contract",
        description: "Pauses all operations on the tokenized deposit contract.",
        tags: ["tokenized deposit"],
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
          assettype: "tokenizeddeposit",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Unpause contract",
        description:
          "Resumes all operations on a previously paused tokenized deposit contract.",
        tags: ["tokenized deposit"],
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
          assettype: "tokenizeddeposit",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Update collateral",
        description:
          "Updates the collateral amount for a tokenized deposit contract.",
        tags: ["tokenized deposit"],
      },
      body: UpdateCollateralSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .put(
    "/allow-user",
    async ({ body, user }) => {
      return allowUserFunction({
        parsedInput: {
          ...body,
          assettype: "tokenizeddeposit",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Allow user",
        description: "Allows a user to access a tokenized deposit contract.",
        tags: ["tokenized deposit"],
      },
      body: AllowUserSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .delete(
    "/disallow-user",
    async ({ body, user }) => {
      return disallowUserFunction({
        parsedInput: {
          ...body,
          assettype: "tokenizeddeposit",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Disallow user",
        description: "Removes a user's access to a tokenized deposit contract.",
        tags: ["tokenized deposit"],
      },
      body: DisallowUserSchema(),
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
          assettype: "tokenizeddeposit",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Withdraw token",
        description: "Withdraws token from a tokenized deposit contract.",
        tags: ["tokenized deposit"],
      },
      body: WithdrawSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  );
