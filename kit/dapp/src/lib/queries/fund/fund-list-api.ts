import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { Elysia, t } from "elysia";
import { FundDetailResponseSchema } from "./fund-detail-api";
import { getFundList } from "./fund-list";

const FundListResponseSchema = t.Array(FundDetailResponseSchema);

export const FundListApi = new Elysia()
  .use(betterAuth)
  .use(superJson)
  .get(
    "/",
    () => {
      return getFundList();
    },
    {
      auth: true,
      detail: {
        summary: "List",
        description:
          "Retrieves a list of all funds in the system with their details including supply, assets, and holder information.",
        tags: ["fund"],
      },
      response: {
        200: FundListResponseSchema,
        ...defaultErrorSchema,
      },
    }
  );
