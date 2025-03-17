import { betterAuth, superJson } from "@/lib/utils/elysia";
import { Elysia, t } from "elysia";
import { TokenizedDepositDetailResponseSchema } from "./tokenizeddeposit-detail-api";
import { getTokenizedDepositList } from "./tokenizeddeposit-list";

const TokenizedDepositListResponseSchema = t.Array(
  TokenizedDepositDetailResponseSchema
);

export const TokenizedDepositListApi = new Elysia()
  .use(betterAuth)
  .use(superJson)
  .get(
    "/",
    () => {
      return getTokenizedDepositList();
    },
    {
      auth: true,
      detail: {
        summary: "Get Tokenized Deposit List",
        description:
          "Retrieves a list of all tokenized deposits in the system with their details including supply, collateral, and holder information.",
        tags: ["Tokenized Deposits"],
      },
      response: {
        200: TokenizedDepositListResponseSchema,
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
