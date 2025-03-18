import { defaultErrorSchema } from "@/lib/api/default-error-schema";
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
        summary: "Stablecoin List",
        description:
          "Retrieves a list of all stablecoins in the system with their details including supply, collateral, and holder information.",
        tags: ["Stablecoins"],
      },
      response: {
        200: StablecoinListResponseSchema,
        ...defaultErrorSchema,
      },
    }
  );
