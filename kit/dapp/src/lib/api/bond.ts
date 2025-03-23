import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia } from "elysia";
import { getAddress } from "viem";
import { getBondList } from "../queries/bond/bond-list";
import { BondSchema } from "../queries/bond/bond-schema";

export const BondApi = new Elysia()
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
  );
