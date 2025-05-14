import { handleChallenge } from "@/lib/challenge";
import { SMART_DEPLOYMENT_REGISTRY_ADDRESS } from "@/lib/contracts";
import { waitForTransactionToBeMined } from "@/lib/mutations/application-setup/utils/wait-for-transaction";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { Address } from "viem";
import type { SetupApplicationArgs } from "../application-setup-function";

interface RegisterDeploymentModuleArgs extends SetupApplicationArgs {
  compliance: Address;
  identityRegistryStorage: Address;
  identityFactory: Address;
  identityRegistry: Address;
  trustedIssuersRegistry: Address;
  tokenRegistry: Address;
}

const registerDeploymentMutation = portalGraphql(`
  mutation RegisterDeployment(
    $challengeResponse: String!,
    $verificationId: String,
    $from: String!,
    $address: String!,
    $input: SMARTDeploymentRegistryRegisterDeploymentInput!
  ) {
    SMARTDeploymentRegistryRegisterDeployment(
      challengeResponse: $challengeResponse,
      verificationId: $verificationId,
      from: $from,
      address: $address,
      input: $input
    ) {
      transactionHash
    }
  }
`);

const registerTokenRegistryMutation = portalGraphql(`
  mutation RegisterTokenRegistry(
    $challengeResponse: String!,
    $verificationId: String,
    $from: String!,
    $address: String!,
    $input: SMARTDeploymentRegistryRegisterTokenRegistryInput!
  ) {
    SMARTDeploymentRegistryRegisterTokenRegistry(
      challengeResponse: $challengeResponse,
      verificationId: $verificationId,
      from: $from,
      address: $address,
      input: $input
    ) {
      transactionHash
    }
  }
`);

export const registerDeploymentModule = async ({
  user,
  verificationCode,
  verificationType,
  compliance,
  identityRegistryStorage,
  identityFactory,
  identityRegistry,
  trustedIssuersRegistry,
  tokenRegistry,
}: RegisterDeploymentModuleArgs) => {
  const registerDeploymentResult = await portalClient.request(
    registerDeploymentMutation,
    {
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
      from: user.wallet,
      address: SMART_DEPLOYMENT_REGISTRY_ADDRESS,
      input: {
        _complianceContract: compliance,
        _identityRegistryStorageContract: identityRegistryStorage,
        _identityFactoryContract: identityFactory,
        _identityRegistryContract: identityRegistry,
        _trustedIssuersRegistryContract: trustedIssuersRegistry,
        _tokenRegistryContract: tokenRegistry,
      },
    }
  );
  await waitForTransactionToBeMined(
    registerDeploymentResult.SMARTDeploymentRegistryRegisterDeployment
      ?.transactionHash
  );

  const registerTokenRegistryResult = await portalClient.request(
    registerTokenRegistryMutation,
    {
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
      from: user.wallet,
      address: SMART_DEPLOYMENT_REGISTRY_ADDRESS,
      input: {
        _registryAddress: tokenRegistry,
        _typeName: "deposit",
      },
    }
  );
  await waitForTransactionToBeMined(
    registerTokenRegistryResult.SMARTDeploymentRegistryRegisterTokenRegistry
      ?.transactionHash
  );
};
