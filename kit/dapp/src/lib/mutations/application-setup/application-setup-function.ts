import type { User } from "@/lib/auth/types";
import type { ApplicationSetupInput } from "@/lib/mutations/application-setup/application-setup-schema";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { waitForTransactionReceipt } from "@settlemint/sdk-portal";
import { zeroAddress } from "viem";

const deployContractIdentityMutation = portalGraphql(`
  mutation deployContractIdentity($from: String!, $constructorArguments: DeployContractIdentityInput!) {
    DeployContract: DeployContractIdentity(from: $from, constructorArguments: $constructorArguments) {
      transactionHash
    }
  }
`);

const deployContractSMARTIdentityRegistryStorageMutation = portalGraphql(`
  mutation deployContractSMARTIdentityRegistryStorage($from: String!, $constructorArguments: DeployContractSMARTIdentityRegistryStorageInput!) {
    DeployContract: DeployContractSMARTIdentityRegistryStorage(from: $from, constructorArguments: $constructorArguments) {
      transactionHash
    }
  }
`);

const deployContractSMARTTrustedIssuersRegistryMutation = portalGraphql(`
  mutation deployContractSMARTTrustedIssuersRegistry($from: String!, $constructorArguments: DeployContractSMARTTrustedIssuersRegistryInput!) {
    DeployContract: DeployContractSMARTTrustedIssuersRegistry(from: $from, constructorArguments: $constructorArguments) {
      transactionHash
    }
  }
`);

const deployContractSMARTComplianceMutation = portalGraphql(`
  mutation deployContractSMARTCompliance($from: String!, $constructorArguments: DeployContractSMARTComplianceInput!) {
    DeployContract: DeployContractSMARTCompliance(from: $from, constructorArguments: $constructorArguments) {
      transactionHash
    }
  }
`);

const deployContractSMARTIdentityFactoryMutation = portalGraphql(`
  mutation deployContractSMARTIdentityFactory($from: String!, $constructorArguments: DeployContractSMARTIdentityFactoryInput!) {
    DeployContract: DeployContractSMARTIdentityFactory(from: $from, constructorArguments: $constructorArguments) {
      transactionHash
    }
  }
`);

const deployContractSMARTIdentityRegistryMutation = portalGraphql(`
  mutation deployContractSMARTIdentityRegistry($from: String!, $constructorArguments: DeployContractSMARTIdentityRegistryInput!) {
    DeployContract: DeployContractSMARTIdentityRegistry(from: $from, constructorArguments: $constructorArguments) {
      transactionHash
    }
  }
`);

async function deployContracts(user: User) {
  const forwarder = process.env.SETTLEMINT_HD_PRIVATE_KEY_FORWARDER_ADDRESS;
  const deployResults = await Promise.allSettled([
    portalClient.request(deployContractIdentityMutation, {
      from: user.wallet,
      constructorArguments: {
        initialManagementKey: forwarder || zeroAddress,
        _isLibrary: true,
      },
    }),
    portalClient.request(deployContractSMARTIdentityRegistryStorageMutation, {
      from: user.wallet,
      constructorArguments: {
        trustedForwarder: forwarder || zeroAddress,
      },
    }),
    portalClient.request(deployContractSMARTTrustedIssuersRegistryMutation, {
      from: user.wallet,
      constructorArguments: {
        trustedForwarder: forwarder || zeroAddress,
      },
    }),
    portalClient.request(deployContractSMARTComplianceMutation, {
      from: user.wallet,
      constructorArguments: {
        trustedForwarder: forwarder || zeroAddress,
      },
    }),
    portalClient.request(deployContractSMARTIdentityFactoryMutation, {
      from: user.wallet,
      constructorArguments: {
        trustedForwarder: forwarder || zeroAddress,
      },
    }),
    portalClient.request(deployContractSMARTIdentityRegistryMutation, {
      from: user.wallet,
      constructorArguments: {
        trustedForwarder: forwarder || zeroAddress,
      },
    }),
  ]);

  await handleDeployResults(deployResults);
}

async function handleDeployResults(
  deployResults: PromiseSettledResult<{
    DeployContract: { transactionHash: string | null } | null;
  }>[]
) {
  if (deployResults.some((result) => result.status === "rejected")) {
    console.error("Application setup failed: Contract deployment failed");
    return;
  }

  const transactionHashes = deployResults
    .map((result) =>
      result.status === "fulfilled"
        ? result.value.DeployContract?.transactionHash
        : null
    )
    .filter(Boolean) as string[];
  const receipts = await Promise.all(
    transactionHashes.map((transactionHash) => {
      // TODO: add in portal codegen
      return waitForTransactionReceipt(transactionHash, {
        accessToken: process.env.SETTLEMINT_ACCESS_TOKEN!,
        portalGraphqlEndpoint: process.env.SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT!,
      });
    })
  );

  const reverted = receipts.filter(
    (receipt) => receipt.receipt.status.toLowerCase() === "reverted"
  );

  if (reverted.length > 0) {
    console.error(
      `Application setup failed: Contract deployment reverted for transactions ${reverted.map((r) => r.transactionHash).join(", ")}`
    );
    return;
  }

  return receipts;
}

export const applicationSetupFunction = withAccessControl(
  {
    requiredPermissions: {
      application: ["setup"],
    },
  },
  async ({
    ctx: { user },
  }: {
    parsedInput: ApplicationSetupInput;
    ctx: {
      user: User;
    };
  }): Promise<{ started: boolean }> => {
    deployContracts(user)
      .then(() => {
        console.log("Application setup completed successfully");
      })
      .catch((error: Error) => {
        console.error(`Application setup failed: ${error.message}`, error);
      });
    return {
      started: true,
    };
  }
);
