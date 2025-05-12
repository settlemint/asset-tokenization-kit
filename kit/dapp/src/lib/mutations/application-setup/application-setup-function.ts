import type { User } from "@/lib/auth/types";
import type { ApplicationSetupInput } from "@/lib/mutations/application-setup/application-setup-schema";
import { withAccessControl } from "@/lib/utils/access-control";
import { getAddress, zeroAddress } from "viem";
import { complianceModule } from "./implementations/compliance";
import { configurationModule } from "./implementations/configuration";
import { identityFactoryModule } from "./implementations/identity-factory";
import { identityRegistryModule } from "./implementations/identity-registry";
import { identityRegistryStorageModule } from "./implementations/identity-registry-storage";
import { tokenRegistryModule } from "./implementations/token-registry";
import { trustedIssuersRegistryModule } from "./implementations/trusted-issuer-registry";

async function setupApplication(user: User) {
  const forwarder = getAddress(
    process.env.SETTLEMINT_HD_PRIVATE_KEY_FORWARDER_ADDRESS || zeroAddress
  );
  const phase1 = await Promise.allSettled([
    identityRegistryStorageModule({
      user,
      forwarder,
    }),
    trustedIssuersRegistryModule({
      user,
      forwarder,
    }),
    complianceModule({
      user,
      forwarder,
    }),
    identityFactoryModule({
      user,
      forwarder,
    }),
    tokenRegistryModule({
      user,
      forwarder,
    }),
  ]);

  const isValid = validateDeployResults(phase1);
  if (!isValid) {
    return;
  }

  const [
    identityRegistryStorageModuleResult,
    trustedIssuersRegistryModuleResult,
  ] = phase1;
  if (identityRegistryStorageModuleResult.status !== "fulfilled") {
    return;
  }
  if (trustedIssuersRegistryModuleResult.status !== "fulfilled") {
    return;
  }

  const { identityRegistryProxy } = await identityRegistryModule({
    user,
    forwarder,
    identityRegistryStorageProxy:
      identityRegistryStorageModuleResult.value.identityRegistryStorageProxy,
    trustedIssuersRegistryProxy:
      trustedIssuersRegistryModuleResult.value.trustedIssuersRegistryProxy,
  });
  await configurationModule({
    user,
    identityRegistry: identityRegistryProxy,
    identityRegistryStorage:
      identityRegistryStorageModuleResult.value.identityRegistryStorageProxy,
  });
}

function validateDeployResults(deployResults: PromiseSettledResult<unknown>[]) {
  if (deployResults.some((result) => result.status === "rejected")) {
    console.error(
      "Application setup failed: Contract deployment failed",
      deployResults.map((result) =>
        result.status === "rejected" ? result.reason?.toString() : null
      )
    );
    return false;
  }
  return true;
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
    setupApplication(user)
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
