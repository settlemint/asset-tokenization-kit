import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { getUserDetail } from "@/lib/queries/user/user-detail";
import { getUserList } from "@/lib/queries/user/user-list";
import { UserDetailSchema, UserSchema } from "@/lib/queries/user/user-schema";
import { getUserSearch } from "@/lib/queries/user/user-search";
import {
  getUserWalletVerifications,
  WalletVerificationSchema,
} from "@/lib/queries/user/wallet-security";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia } from "elysia";
import { getAddress } from "viem";

export const UserApi = new Elysia({
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
    async ({ user }) => {
      return await getUserList({ currentUser: user });
    },
    {
      auth: true,
      detail: {
        summary: "List",
        description:
          "Retrieves a list of all users in the system with their details including wallet address, email, and activity information.",
        tags: ["user"],
      },
      response: {
        200: t.Array(UserDetailSchema),
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/:id",
    async ({ user, params: { id } }) => {
      return await getUserDetail(
        {
          currentUser: user,
        },
        {
          id,
        }
      );
    },
    {
      auth: true,
      detail: {
        summary: "Details by ID",
        description:
          "Retrieves a user by ID with details including wallet address, email, and activity information.",
        tags: ["user"],
      },
      params: t.Object({
        id: t.String({
          description: "The ID of the user",
        }),
      }),
      response: {
        200: UserDetailSchema,
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/wallet/:address",
    async ({ user, params: { address } }) => {
      return await getUserDetail(
        {
          currentUser: user,
        },
        {
          address: getAddress(address),
        }
      );
    },
    {
      auth: true,
      detail: {
        summary: "Details by Wallet",
        description:
          "Retrieves a user by wallet address with details including email and activity information.",
        tags: ["user"],
      },
      params: t.Object({
        address: t.String({
          description: "The wallet address of the user",
        }),
      }),
      response: {
        200: UserDetailSchema,
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/search",
    async ({ query: { term } }) => {
      return await getUserSearch({
        searchTerm: term,
      });
    },
    {
      auth: true,
      detail: {
        summary: "Search",
        description: "Searches for users by name, email, or wallet address.",
        tags: ["user"],
      },
      query: t.Object({
        term: t.String({
          description:
            "The search term to match against name, email, or wallet address",
        }),
      }),
      response: {
        200: t.Array(UserSchema),
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/wallet-security/:address",
    async ({ params: { address } }) => {
      return await getUserWalletVerifications(address);
    },
    {
      auth: true,
      detail: {
        summary: "Wallet Security",
        description:
          "Retrieves security verifications associated with a user's wallet.",
        tags: ["user"],
      },
      params: t.Object({
        address: t.String({
          description: "The wallet address to check security verifications for",
        }),
      }),
      response: {
        200: t.Array(WalletVerificationSchema),
        ...defaultErrorSchema,
      },
    }
  );
