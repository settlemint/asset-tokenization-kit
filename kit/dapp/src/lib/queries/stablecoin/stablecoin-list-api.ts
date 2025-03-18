import { betterAuth, superJson } from "@/lib/utils/elysia";
import { Elysia, t } from "elysia";
import { StablecoinDetailResponseSchema } from "./stablecoin-detail-api";
import { getStableCoinList } from "./stablecoin-list";

const StablecoinListResponseSchema = t.Array(StablecoinDetailResponseSchema);

export const StablecoinListApi = new Elysia()
  .use(betterAuth)
  .use(superJson)
  .get(
    "/",
    () => {
      return getStableCoinList();
    },
    {
      auth: true,
      detail: {
        summary: "Get Stablecoin List",
        description:
          "Retrieves a list of all stablecoins in the system with their details including supply, collateral, and holder information.",
        tags: ["Stablecoins"],
      },
      response: {
        200: StablecoinListResponseSchema,
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
