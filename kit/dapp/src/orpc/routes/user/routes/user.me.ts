/**
 * Current User Handler
 *
 * This handler returns information about the currently authenticated user.
 * It provides a simple way for clients to fetch the logged-in user's profile
 * data without needing to manage session state directly.
 * @see {@link ../user.me.schema} - Output schema definition
 * @see {@link @/orpc/procedures/auth.router} - Authentication requirements
 */

import { kycProfiles, user as userTable } from "@/lib/db/schema";
import { mapUserRoles } from "@/orpc/helpers/role-validation";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import type { ValidatedTheGraphClient } from "@/orpc/middlewares/services/the-graph.middleware";
import {
  getSystemContext,
  getSystemPermissions,
} from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { me as readAccount } from "@/orpc/routes/account/routes/account.me";
import { read as settingsRead } from "@/orpc/routes/settings/routes/settings.read";
import { AssetFactoryTypeIdEnum } from "@atk/zod/asset-types";
import { getEthereumAddress } from "@atk/zod/ethereum-address";
import { AddonFactoryTypeIdEnum } from "@atk/zod/src/addon-types";
import type { VerificationType } from "@atk/zod/verification-type";
import { VerificationType as VerificationTypeEnum } from "@atk/zod/verification-type";
import { call, ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { zeroAddress } from "viem";

/**
 * Get current authenticated user information.
 *
 * Returns the user object from the authentication context, which includes
 * essential profile information such as name, email, and wallet address.
 * This endpoint is commonly used for:
 * - Displaying user information in the UI
 * - Determining user permissions and capabilities
 * - Personalizing the application experience
 * @auth Required - User must be authenticated
 * @function GET /user/me
 * @param context - Request context containing authenticated user information
 * @returns User object with profile data and wallet address
 * @throws {ORPCError} UNAUTHORIZED - If user is not authenticated
 * @example
 * ```typescript
 * // Client usage:
 * const user = await orpc.user.me.query();
 * console.log(`Welcome ${user.name}!`);
 *
 * // Display wallet address
 * console.log(`Wallet: ${user.wallet}`);
 *
 * // Use in React component
 * const { data: user, isLoading } = orpc.user.me.useQuery();
 * ```
 */
export const me = authRouter.user.me
  .use(databaseMiddleware)
  .handler(async ({ context }) => {
    const authUser = context.auth.user;
    const userId = authUser.id;

    // Fetch user and KYC profile in a single query with left join
    const [
      [userQueryResult],
      systemAddress,
      baseCurrency,
      systemAddonsSkipped,
      account,
    ] = await Promise.all([
      context.db
        .select({
          user: userTable,
          kyc: {
            firstName: kycProfiles.firstName,
            lastName: kycProfiles.lastName,
          },
        })
        .from(userTable)
        .leftJoin(kycProfiles, eq(kycProfiles.userId, userTable.id))
        .where(eq(userTable.id, userId))
        .limit(1),
      call(
        settingsRead,
        {
          key: "SYSTEM_ADDRESS",
        },
        {
          context,
        }
      ),
      call(
        settingsRead,
        {
          key: "BASE_CURRENCY",
        },
        { context }
      ),
      call(
        settingsRead,
        {
          key: "SYSTEM_ADDONS_SKIPPED",
        },
        { context }
      ).catch(() => "false"), // Default to false if not set
      call(readAccount, { wallet: authUser.wallet }, { context }).catch(
        (error: unknown) => {
          if (error instanceof ORPCError && error.status === 404) {
            return null;
          }
          throw error;
        }
      ),
    ]);

    const { kyc } = userQueryResult ?? {};

    const { accessControl, ...systemOnboardingState } = await getSystemInfo(
      systemAddress,
      systemAddonsSkipped,
      context.theGraphClient
    );
    const userRoles = mapUserRoles(authUser.wallet, accessControl);
    return {
      id: authUser.id,
      name:
        kyc?.firstName && kyc.lastName
          ? `${kyc.firstName} ${kyc.lastName}`
          : authUser.name,
      email: authUser.email,
      role: authUser.role,
      wallet: authUser.wallet,
      firstName: kyc?.firstName,
      lastName: kyc?.lastName,
      identity: account?.identity,
      claims: account?.claims ?? [],
      isRegistered: !!account?.identity,
      verificationTypes: [
        ...(authUser.pincodeEnabled ? [VerificationTypeEnum.pincode] : []),
        ...(authUser.twoFactorEnabled ? [VerificationTypeEnum.otp] : []),
        ...(authUser.secretCodeVerificationId
          ? [VerificationTypeEnum.secretCodes]
          : []),
      ] as VerificationType[],
      userSystemPermissions: {
        roles: userRoles,
        actions: getSystemPermissions(userRoles),
      },
      onboardingState: {
        wallet: authUser.wallet !== zeroAddress,
        walletSecurity:
          authUser.pincodeEnabled || authUser.twoFactorEnabled || false,
        walletRecoveryCodes: authUser.secretCodesConfirmed ?? false,
        ...systemOnboardingState,
        systemSettings: !!baseCurrency,
        identitySetup: !!account?.identity,
        identity: !!userQueryResult?.kyc,
      },
    };
  });

async function getSystemInfo(
  systemAddress: string | null,
  systemAddonsSkipped: string | null,
  theGraphClient: ValidatedTheGraphClient
) {
  const systemOnboardingState = {
    system: false,
    systemAssets: false,
    systemAddons: false,
  };

  if (!systemAddress) {
    return {
      ...systemOnboardingState,
      accessControl: null,
    };
  }
  try {
    const systemData = await getSystemContext(
      getEthereumAddress(systemAddress),
      theGraphClient
    );
    if (!systemData) {
      return {
        ...systemOnboardingState,
        accessControl: null,
      };
    }
    systemOnboardingState.system = true;
    systemOnboardingState.systemAssets =
      systemData.tokenFactoryRegistry.tokenFactories.length > 0;

    // Check if bond factory is deployed
    const hasBondFactory = systemData.tokenFactoryRegistry.tokenFactories.some(
      (factory) => factory.typeId === AssetFactoryTypeIdEnum.ATKBondFactory
    );

    // Check if yield addon is deployed
    const hasYieldAddon = systemData.systemAddonRegistry.systemAddons.some(
      (addon) =>
        addon.typeId === AddonFactoryTypeIdEnum.ATKFixedYieldScheduleFactory
    );

    // System addons are optional, except when bond factory exists - then yield addon is required
    // If user has explicitly skipped, consider it complete unless bond factory requires yield
    if (systemAddonsSkipped === "true") {
      systemOnboardingState.systemAddons = hasBondFactory
        ? hasYieldAddon
        : true;
    } else {
      systemOnboardingState.systemAddons = hasBondFactory
        ? hasYieldAddon
        : systemData.systemAddonRegistry.systemAddons.length > 0;
    }
    return {
      ...systemOnboardingState,
      accessControl: systemData.systemAccessManager?.accessControl ?? null,
    };
  } catch {
    // If system read fails, we assume no factories and addons
  }
  return {
    ...systemOnboardingState,
    accessControl: null,
  };
}
