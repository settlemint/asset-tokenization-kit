import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { getFixedYieldDetail } from "@/lib/queries/fixed-yield/fixed-yield-detail";
import { getFixedYieldList } from "@/lib/queries/fixed-yield/fixed-yield-list";
import { betterAuth } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia, NotFoundError } from "elysia";
import { getAddress } from "viem";
import { FixedYieldSchema } from "../queries/fixed-yield/fixed-yield-schema";

export const FixedYieldApi = new Elysia({
  detail: {
    security: [
      {
        apiKeyAuth: [],
      },
    ],
  },
})
  .use(betterAuth)
  .get(
    "",
    async () => {
      return getFixedYieldList();
    },
    {
      auth: true,
      detail: {
        summary: "List",
        description:
          "Retrieves a list of all fixed yield schedules with their details including token, underlying asset, rates, and periods.",
        tags: ["yield"],
      },
      response: {
        200: t.Array(FixedYieldSchema),
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/:address",
    async ({ params: { address } }) => {
      const result = await getFixedYieldDetail({
        address: getAddress(address),
      });

      if (!result) {
        throw new NotFoundError("Fixed yield schedule not found");
      }

      return result;
    },
    {
      auth: true,
      detail: {
        summary: "Details",
        description:
          "Retrieves a fixed yield schedule by address with details including token, underlying asset, rates, and periods.",
        tags: ["yield"],
      },
      params: t.Object({
        address: t.String({
          description: "The address of the fixed yield schedule",
        }),
      }),
      response: {
        200: FixedYieldSchema,
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/bond/:bondAddress",
    async ({ params: { bondAddress } }) => {
      const result = await getFixedYieldDetail({
        address: getAddress(bondAddress),
      });

      if (!result) {
        throw new NotFoundError("Fixed yield schedule not found for this bond");
      }

      return result;
    },
    {
      auth: true,
      detail: {
        summary: "Get by Bond",
        description:
          "Retrieves the fixed yield schedule associated with a specific bond.",
        tags: ["yield"],
      },
      params: t.Object({
        bondAddress: t.String({
          description: "The address of the bond",
        }),
      }),
      response: {
        200: FixedYieldSchema,
        ...defaultErrorSchema,
      },
    }
  );
