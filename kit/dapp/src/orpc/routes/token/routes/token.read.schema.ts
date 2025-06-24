import { decimals } from "@/lib/zod/validators/decimals";
import { z } from "zod/v4";

export const TokenSchema = z.object({
  id: z.string(),
  name: z.string().describe("The name of the token"),
  symbol: z.string().describe("The symbol of the token"),
  decimals: decimals(),
  userPermissions: z
    .object({
      roles: z
        .record(z.string(), z.boolean())
        .describe("The roles of the user for the token"),
      isCompliant: z
        .boolean()
        .describe(
          "Whether the user has the required claim topics to interact with the token"
        ),
    })
    .describe("The permissions of the user for the token"),
});
