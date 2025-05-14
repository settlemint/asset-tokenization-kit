import type { User } from "@/lib/auth/types";
import { withAccessControl } from "@/lib/utils/access-control";
import type { VerificationType } from "@/lib/utils/typebox/verification-type";
import { getAddress, zeroAddress } from "viem";
import type { ApplicationSetupInput } from "./application-setup-schema";
import { complianceModule } from "./modules/compliance";
import { configurationModule } from "./modules/configuration";
import { identityFactoryModule } from "./modules/identity-factory";
import { identityRegistryModule } from "./modules/identity-registry";
import { identityRegistryStorageModule } from "./modules/identity-registry-storage";
import { registerDeploymentModule } from "./modules/register-deployment";
import { tokenRegistryModule } from "./modules/token-registry";
import { trustedIssuersRegistryModule } from "./modules/trusted-issuer-registry";

export interface SetupApplicationArgs {
  user: User;
  verificationCode: string;
  verificationType: VerificationType;
}

async function setupApplication(args: SetupApplicationArgs) {
  const forwarder = getAddress(
    process.env.SETTLEMINT_HD_PRIVATE_KEY_FORWARDER_ADDRESS || zeroAddress
  );

  const phase1 = await Promise.allSettled([
    identityRegistryStorageModule({
      ...args,
      forwarder,
    }),
    trustedIssuersRegistryModule({
      ...args,
      forwarder,
    }),
    complianceModule({
      ...args,
      forwarder,
    }),
    identityFactoryModule({
      ...args,
      forwarder,
    }),
    tokenRegistryModule({
      ...args,
      forwarder,
    }),
  ]);

  const [
    identityRegistryStorageModuleResult,
    trustedIssuersRegistryModuleResult,
    complianceModuleResult,
    identityFactoryModuleResult,
    tokenRegistryModuleResult,
  ] = phase1;
  if (
    identityRegistryStorageModuleResult.status !== "fulfilled" ||
    trustedIssuersRegistryModuleResult.status !== "fulfilled" ||
    complianceModuleResult.status !== "fulfilled" ||
    identityFactoryModuleResult.status !== "fulfilled" ||
    tokenRegistryModuleResult.status !== "fulfilled"
  ) {
    console.error(
      "Application setup failed: Contract deployment failed",
      phase1.map((result) =>
        result.status === "rejected" ? result.reason?.toString() : null
      )
    );
    throw new Error("Contract deployment failed");
  }

  const { identityRegistryProxy } = await identityRegistryModule({
    ...args,
    forwarder,
    identityRegistryStorageProxy:
      identityRegistryStorageModuleResult.value.identityRegistryStorageProxy,
    trustedIssuersRegistryProxy:
      trustedIssuersRegistryModuleResult.value.trustedIssuersRegistryProxy,
  });
  await configurationModule({
    ...args,
    identityRegistry: identityRegistryProxy,
    identityRegistryStorage:
      identityRegistryStorageModuleResult.value.identityRegistryStorageProxy,
  });

  await registerDeploymentModule({
    ...args,
    compliance: complianceModuleResult.value.complianceProxy,
    identityRegistryStorage:
      identityRegistryStorageModuleResult.value.identityRegistryStorageProxy,
    identityFactory: identityFactoryModuleResult.value.identityFactoryProxy,
    identityRegistry: identityRegistryProxy,
    trustedIssuersRegistry:
      trustedIssuersRegistryModuleResult.value.trustedIssuersRegistryProxy,
    tokenRegistry: tokenRegistryModuleResult.value.tokenRegistry,
  });
}

export const applicationSetupFunction = withAccessControl(
  {
    requiredPermissions: {
      application: ["setup"],
    },
  },
  async ({
    parsedInput: { verificationCode, verificationType },
    ctx: { user },
  }: {
    parsedInput: ApplicationSetupInput;
    ctx: {
      user: User;
    };
  }): Promise<{ started: boolean }> => {
    /*setupApplication({ user, verificationCode, verificationType })
      .then(() => {
        console.log("Application setup completed successfully");
      })
      .catch((error: Error) => {
        console.error(`Application setup failed: ${error.message}`, error);
      });*/
    return {
      started: true,
    };
  }
);
