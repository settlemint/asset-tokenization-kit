import { decimals } from "@/lib/zod/validators/decimals";
import type { TokenRoles } from "@/orpc/middlewares/system/token.middleware";
import { z } from "zod/v4";

const ROLES: TokenRoles[] = [
  "admin",
  "bypassListManager",
  "claimManager",
  "custodian",
  "deployer",
  "emergency",
  "implementationManager",
  "manageRegistries",
  "registrar",
  "storageModifier",
  "supplyManagement",
  "tokenGovernance",
];

export const TokenSchema = z.object({
  id: z.string(),
  name: z.string().describe("The name of the token"),
  symbol: z.string().describe("The symbol of the token"),
  decimals: decimals(),
  userPermissions: z
    .object({
      roles: z
        .object(
          ROLES.reduce<Record<TokenRoles, z.ZodType<boolean>>>(
            (acc, role) => {
              acc[role] = z
                .boolean()
                .describe(`Whether the user has the ${role} role`);
              return acc;
            },
            {} as Record<TokenRoles, z.ZodType<boolean>>
          )
        )
        .describe("The roles of the user for the token"),
      isCompliant: z
        .boolean()
        .describe(
          "Whether the user has the required claim topics to interact with the token"
        ),
      isAllowed: z
        .boolean()
        .describe("Whether the user is allowed to interact with the token"),
    })
    .describe("The permissions of the user for the token"),
});
