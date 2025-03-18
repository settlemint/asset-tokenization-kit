import { defaultErrorSchema } from "@/lib/api/default-error-schema";
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
        ...defaultErrorSchema,
      },
    }
  );
