import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { getEquityDetail } from "@/lib/queries/equity/equity-detail";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia } from "elysia";
import { getAddress } from "viem";
import { getEquityList } from "../queries/equity/equity-list";
import { EquitySchema } from "../queries/equity/equity-schema";

export const EquityApi = new Elysia()
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
          "Retrieves a list of all equity tokens in the system with their details including supply and holder information.",
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
          "Retrieves an equity token by address with details including supply and holder information.",
        tags: ["equity"],
      },
      params: t.Object({
        address: t.String({
          description: "The address of the equity token",
        }),
      }),
      response: {
        200: EquitySchema,
        ...defaultErrorSchema,
      },
    }
  );
