import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TokenComplianceResponseSchema } from "@/orpc/routes/token/routes/token.compliance.schema";
import * as z from "zod";

const READ_TOKEN_QUERY = theGraphGraphql(
  `
  query ReadTokenQuery($id: ID!, $tokenAddress: Bytes!) {
    token(id: $id) {
      complianceModuleConfigs {
        complianceModule {
          typeId
          tokenConfigs(where: {token_: {id: $tokenAddress}}) {
            parameters {
              expression {
                topicScheme {
                  name
                }
                index
                nodeType
              }
              tokenSupplyLimit {
                global
                maxSupplyExact
              }
              countries
            }
          }
        }
      }
    }
  }`
);

export const compliance = tokenRouter.token.compliance.handler(
  async ({ context, input }) => {
    const { tokenAddress } = input;

    const { token } = await context.theGraphClient.query(READ_TOKEN_QUERY, {
      input: { id: tokenAddress, tokenAddress },
      output: z.object({
        token: TokenComplianceResponseSchema,
      }),
    });

    return token;
  }
);
