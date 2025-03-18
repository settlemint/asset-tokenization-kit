import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { Elysia, t } from "elysia";
import { EquityDetailResponseSchema } from "./equity-detail-api";
import { getEquityList } from "./equity-list";

const EquityListResponseSchema = t.Array(EquityDetailResponseSchema);

export const EquityListApi = new Elysia()
  .use(betterAuth)
  .use(superJson)
  .get(
    "/",
    async () => {
      const equities = await getEquityList();
      // Add concentration field to match the schema
      return equities.map((equity) => {
        const topHoldersSum = equity.holders.reduce(
          (sum, holder) => sum + holder.valueExact,
          0n
        );
        const concentration =
          equity.totalSupplyExact === 0n
            ? 0
            : Number((topHoldersSum * 100n) / equity.totalSupplyExact);

        return {
          ...equity,
          concentration,
        };
      });
    },
    {
      auth: true,
      detail: {
        summary: "Equity List",
        description:
          "Retrieves a list of all equity tokens in the system with their details including supply and holder information.",
        tags: ["Equities"],
      },
      response: {
        200: EquityListResponseSchema,
        ...defaultErrorSchema,
      },
    }
  );
