import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { tokenFactoryPermissionMiddleware } from "@/orpc/middlewares/auth/token-factory-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenFactoryMiddleware } from "@/orpc/middlewares/system/token-factory.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";

const CREATE_BOND_MUTATION = portalGraphql(`
  mutation CreateTokenMutation($address: String!, $from: String!, $input: ATKBondFactoryImplementationCreateBondInput!) {
    CreateToken: ATKBondFactoryImplementationCreateBond(
      address: $address
      from: $from
      input: $input
    ) {
      transactionHash
    }
  }
`);

export const create = onboardedRouter.token.create
  .use(portalMiddleware)
  .use(tokenFactoryMiddleware("bond"))
  .use(tokenFactoryPermissionMiddleware(["deployer"]))
  .handler(async ({ input, context }) => {
    const sender = context.auth.user;

    const result = await context.portalClient.request(CREATE_BOND_MUTATION, {
      address: context.tokenFactory.address,
      from: sender.wallet ?? "",
      input: {
        symbol_: input.symbol,
        name_: input.name,
        decimals_: input.decimals,
        initialModulePairs_: [],
        requiredClaimTopics_: [],
        maturityDate_: input.maturityDate.getTime().toString(),
        underlyingAsset_: input.underlyingAsset,
        faceValue_: input.faceValue.toString(),
        cap_: input.cap.toString(),
      },
    });

    // TODO: other operations to create a bond (issue isin claim, grant roles, etc)

    return getEthereumHash(result.CreateToken?.transactionHash);
  });
