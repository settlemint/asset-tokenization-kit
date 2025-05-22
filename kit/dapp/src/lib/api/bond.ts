import { getBondList } from "@/lib/queries/bond/bond-list";
import { betterAuth } from "@/lib/utils/elysia";
import { TypeBox } from "@sinclair/typemap";
import { Elysia } from "elysia";
import { z } from "zod";
import { BondSchemaZod } from "../queries/bond/bond-schema-zod";

const Test = TypeBox(z.array(BondSchemaZod));

export const BondApi = new Elysia({
  detail: {
    security: [
      {
        apiKeyAuth: [],
      },
    ],
  },
})
  .use(betterAuth)
  .get(
    "",
    async ({ user }) => {
      return getBondList(user.currency);
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
        200: TypeBox(z.array(BondSchemaZod)),
        // ...defaultErrorSchema,
      },
    }
  );
