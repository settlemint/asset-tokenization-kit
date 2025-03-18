import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { Elysia, t } from "elysia";
import { BondDetailResponseSchema } from "./bond-detail-api";
import { getBondList } from "./bond-list";

const BondListResponseSchema = t.Array(BondDetailResponseSchema);

export const BondListApi = new Elysia()
  .use(betterAuth)
  .use(superJson)
  .get(
    "/",
    () => {
      return getBondList();
    },
    {
      auth: true,
      detail: {
        summary: "List",
        description:
          "Retrieves a list of all bonds in the system with their details including supply, maturity, and holder information.",
        tags: ["bond"],
      },
      response: {
        200: BondListResponseSchema,
        ...defaultErrorSchema,
      },
    }
  );
