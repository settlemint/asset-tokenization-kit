import { portalGraphql } from "@/lib/settlemint/portal";
import { systemRouter } from "@/orpc/procedures/system.router";
import { getTokenFactory } from "@/orpc/routes/system/token-factory/helpers/factory-context";
import { PredictAddressOutputSchema } from "@/orpc/routes/system/token-factory/routes/factory.predict-address.schema";
import z from "zod";

const PREDICT_ACCESS_MANAGER_QUERY = portalGraphql(`
  query PredictEquityAccessManagerAddress(
    $address: String!
    $symbol: String!
    $name: String!
    $decimals: Int!
  ) {
    IATKTokenFactory(address: $address) {
      predictAccessManagerAddress(
        symbol_: $symbol
        name_: $name
        decimals_: $decimals
      ) {
        predictedAddress
      }
    }
  }
`);
export const factoryPredictAddress =
  systemRouter.system.factory.predictAddress.handler(
    async ({ input, context, errors }) => {
      const tokenFactory = getTokenFactory(context, input.type);
      if (!tokenFactory) {
        throw errors.NOT_FOUND({
          message: `Token factory for type ${input.type} not found`,
        });
      }

      const result = await context.portalClient.query(
        PREDICT_ACCESS_MANAGER_QUERY,
        {
          address: tokenFactory.id,
          from: context.auth.user.wallet,
          name: input.name,
          symbol: input.symbol,
          decimals: input.decimals,
        },
        z.object({
          IATKTokenFactory: z.object({
            predictAccessManagerAddress: PredictAddressOutputSchema,
          }),
        })
      );

      return result.IATKTokenFactory.predictAccessManagerAddress;
    }
  );
