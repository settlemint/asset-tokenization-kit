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
        summary: "Get Equity List",
        description:
          "Retrieves a list of all equity tokens in the system with their details including supply and holder information.",
        tags: ["Equities"],
      },
      response: {
        200: EquityListResponseSchema,
        400: t.Object({
          error: t.String({
            description: "Bad Request - Invalid parameters or request format",
          }),
          details: t.Optional(t.Array(t.String())),
        }),
        401: t.Object({
          error: t.String({
            description: "Unauthorized - Authentication is required",
          }),
        }),
        403: t.Object({
          error: t.String({
            description:
              "Forbidden - Insufficient permissions to access the resource",
          }),
        }),
        404: t.Object({
          error: t.String({
            description: "Not Found - The requested resource does not exist",
          }),
        }),
        429: t.Object({
          error: t.String({
            description: "Too Many Requests - Rate limit exceeded",
          }),
          retryAfter: t.Optional(t.Number()),
        }),
        500: t.Object({
          error: t.String({
            description:
              "Internal Server Error - Something went wrong on the server",
          }),
          requestId: t.Optional(t.String()),
        }),
      },
    }
  );
