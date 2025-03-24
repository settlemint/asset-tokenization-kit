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
import { createFundFunction } from "../mutations/fund/create/create-function";
import { CreateFundSchema } from "../mutations/fund/create/create-schema";
import { mintFunction } from "../mutations/mint/mint-function";
import { MintSchema } from "../mutations/mint/mint-schema";
import { unblockUserFunction } from "../mutations/unblock-user/unblock-user-function";
import { UnblockUserSchema } from "../mutations/unblock-user/unblock-user-schema";
import { withdrawFunction } from "../mutations/withdraw/withdraw-function";
import { WithdrawSchema } from "../mutations/withdraw/withdraw-schema";

export const FundApi = new Elysia({
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
  )
  .post(
    "/factory",
    async ({ body, user }) => {
      return createFundFunction({
        parsedInput: body,
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Create fund",
        description: "Creates a new fund token based on creation parameters.",
        tags: ["fund"],
      },
      body: CreateFundSchema(),
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
          assetType: "fund",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Transfer fund",
        description:
          "Transfers fund tokens from the current user's account to another address.",
        tags: ["fund"],
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
          assettype: "fund",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Grant role",
        description: "Grants a specific role to a user for a fund contract.",
        tags: ["fund"],
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
          assettype: "fund",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Revoke role",
        description: "Revokes a specific role from a user for a fund contract.",
        tags: ["fund"],
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
          assettype: "fund",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Update roles",
        description:
          "Updates the roles assigned to a user for a fund contract.",
        tags: ["fund"],
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
          assettype: "fund",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Mint new fund tokens",
        description:
          "Creates new fund tokens and assigns them to the specified address.",
        tags: ["fund"],
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
          assettype: "fund",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Withdraw token",
        description: "Withdraws token from a fund contract.",
        tags: ["fund"],
      },
      body: WithdrawSchema(),
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
          assettype: "fund",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Burn fund tokens",
        description: "Burns a specified amount of fund tokens.",
        tags: ["fund"],
      },
      body: BurnSchema(),
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
          assettype: "fund",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Block user",
        description: "Blocks a user from interacting with a fund token.",
        tags: ["fund"],
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
          assettype: "fund",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Unblock user",
        description: "Unblocks a previously blocked user for a fund token.",
        tags: ["fund"],
      },
      body: UnblockUserSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  );
