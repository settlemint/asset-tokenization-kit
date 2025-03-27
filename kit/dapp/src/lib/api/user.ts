import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { SetPincodeSchema } from "@/lib/mutations/user/set-pincode-schema";
import {
  getCurrentUserDetail,
  getUserDetail,
} from "@/lib/queries/user/user-detail";
import { getUserList } from "@/lib/queries/user/user-list";
import { UserDetailSchema, UserSchema } from "@/lib/queries/user/user-schema";
import { getUserSearch } from "@/lib/queries/user/user-search";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia } from "elysia";
import { getAddress } from "viem";
import { setPincodeFunction } from "../mutations/user/set-pincode-function";

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
      return await getUserList({ ctx: { user } });
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
      if (id === user.id) {
        return await getCurrentUserDetail();
      }
      return await getUserDetail({
        ctx: { user },
        id,
      });
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
      return await getUserDetail({
        ctx: { user },
        address: getAddress(address),
      });
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
    async ({ query: { term }, user }) => {
      return await getUserSearch({
        searchTerm: term,
        ctx: { user },
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
  .post(
    "/set-pincode",
    async ({ body, user }) => {
      return setPincodeFunction({
        parsedInput: body,
        ctx: { user },
      });
    },
    {
      auth: true,
      detail: {
        summary: "Set pincode",
        description: "Sets a pincode for a user.",
        tags: ["user"],
      },
      body: SetPincodeSchema(),
      response: {
        200: t.Object({ success: t.Boolean() }),
        ...defaultErrorSchema,
      },
    }
  );
