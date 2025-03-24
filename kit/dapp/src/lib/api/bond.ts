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
import { createBondFunction } from "../mutations/bond/create/create-function";
import { CreateBondSchema } from "../mutations/bond/create/create-schema";
import { matureFunction } from "../mutations/bond/mature/mature-function";
import { MatureFormSchema } from "../mutations/bond/mature/mature-schema";
import { redeemFunction } from "../mutations/bond/redeem/redeem-function";
import { RedeemBondSchema } from "../mutations/bond/redeem/redeem-schema";
import { setYieldScheduleFunction } from "../mutations/bond/set-yield-schedule/set-yield-schedule-function";
import { SetYieldScheduleSchema } from "../mutations/bond/set-yield-schedule/set-yield-schedule-schema";
import { topUpUnderlyingAssetFunction } from "../mutations/bond/top-up/top-up-function";
import { TopUpSchema } from "../mutations/bond/top-up/top-up-schema";
import { burnFunction } from "../mutations/burn/burn-function";
import { BurnSchema } from "../mutations/burn/burn-schema";
import { mintFunction } from "../mutations/mint/mint-function";
import { MintSchema } from "../mutations/mint/mint-schema";
import { unblockUserFunction } from "../mutations/unblock-user/unblock-user-function";
import { UnblockUserSchema } from "../mutations/unblock-user/unblock-user-schema";
import { withdrawFunction } from "../mutations/withdraw/withdraw-function";
import { WithdrawSchema } from "../mutations/withdraw/withdraw-schema";

export const BondApi = new Elysia({
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
  )
  .post(
    "/factory",
    async ({ body, user }) => {
      return createBondFunction({
        parsedInput: body,
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Create bond",
        description: "Creates a new bond token based on creation parameters.",
        tags: ["bond"],
      },
      body: CreateBondSchema(),
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
          assetType: "bond",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Transfer bond",
        description:
          "Transfers bond tokens from the current user's account to another address.",
        tags: ["bond"],
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
          assettype: "bond",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Grant role",
        description: "Grants a specific role to a user for a bond contract.",
        tags: ["bond"],
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
          assettype: "bond",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Revoke role",
        description: "Revokes a specific role from a user for a bond contract.",
        tags: ["bond"],
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
          assettype: "bond",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Update roles",
        description:
          "Updates the roles assigned to a user for a bond contract.",
        tags: ["bond"],
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
          assettype: "bond",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Mint new bond tokens",
        description:
          "Creates new bond tokens and assigns them to the specified address.",
        tags: ["bond"],
      },
      body: MintSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .post(
    "/mature",
    async ({ body, user }) => {
      return matureFunction({
        parsedInput: body,
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Mature bond",
        description: "Matures a bond, making it ready for redemption.",
        tags: ["bond"],
      },
      body: MatureFormSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .post(
    "/redeem",
    async ({ body, user }) => {
      return redeemFunction({
        parsedInput: body,
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Redeem bond",
        description: "Redeems bond tokens for the underlying asset.",
        tags: ["bond"],
      },
      body: RedeemBondSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .post(
    "/set-yield-schedule",
    async ({ body, user }) => {
      return setYieldScheduleFunction({
        parsedInput: body,
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Set yield schedule",
        description:
          "Sets the yield schedule for a bond, defining interest payments.",
        tags: ["bond"],
      },
      body: SetYieldScheduleSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  )
  .post(
    "/top-up",
    async ({ body, user }) => {
      return topUpUnderlyingAssetFunction({
        parsedInput: body,
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Top up bond",
        description: "Adds more of the underlying asset to a bond contract.",
        tags: ["bond"],
      },
      body: TopUpSchema(),
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
          assettype: "bond",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Block user",
        description: "Blocks a user from interacting with a bond contract.",
        tags: ["bond"],
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
          assettype: "bond",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Unblock user",
        description:
          "Unblocks a previously blocked user, allowing them to interact with a bond contract again.",
        tags: ["bond"],
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
          assettype: "bond",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Withdraw underlying asset",
        description: "Withdraws underlying asset from a bond contract.",
        tags: ["bond"],
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
          assettype: "bond",
        },
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Burn bond tokens",
        description:
          "Burns a specified amount of bond tokens from the user's account.",
        tags: ["bond"],
      },
      body: BurnSchema(),
      response: {
        200: t.Hashes(),
        ...defaultErrorSchema,
      },
    }
  );
