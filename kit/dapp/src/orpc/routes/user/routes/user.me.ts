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
import { AssetFactoryTypeIdEnum } from "@/lib/zod/validators/asset-types";
import type { VerificationType } from "@/lib/zod/validators/verification-type";
import { VerificationType as VerificationTypeEnum } from "@/lib/zod/validators/verification-type";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { me as readAccount } from "@/orpc/routes/account/routes/account.me";
import { read as settingsRead } from "@/orpc/routes/settings/routes/settings.read";
import { read as systemRead } from "@/orpc/routes/system/routes/system.read";
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
      call(readAccount, {}, { context }).catch((error: unknown) => {
        if (error instanceof ORPCError && error.status === 404) {
          return null;
        }
        throw error;
      }),
    ]);

    const { kyc } = userQueryResult ?? {};

    // Check if system has token factories/addons using existing ORPC route
    let hasTokenFactories = false;
    let hasSystemAddons = false;
    let hasBondFactory = false;
    let hasYieldAddon = false;
    if (systemAddress) {
      try {
        const systemData = await call(
          systemRead,
          {
            id: systemAddress,
          },
          {
            context,
          }
        );
        hasTokenFactories = systemData.tokenFactories.length > 0;

        // Check if bond factory is deployed
        hasBondFactory = systemData.tokenFactories.some(
          (factory) => factory.typeId === AssetFactoryTypeIdEnum.ATKBondFactory
        );

        // Check if yield addon is deployed
        hasYieldAddon = systemData.systemAddons.some(
          (addon) => addon.typeId === "ATKFixedYieldScheduleFactory"
        );

        // System addons are optional, except when bond factory exists - then yield addon is required
        // If user has explicitly skipped, consider it complete unless bond factory requires yield
        if (systemAddonsSkipped === "true") {
          hasSystemAddons = hasBondFactory ? hasYieldAddon : true;
        } else {
          hasSystemAddons = hasBondFactory
            ? hasYieldAddon
            : systemData.systemAddons.length > 0;
        }
      } catch {
        // If system read fails, we assume no factories and addons
        hasTokenFactories = false;
        hasSystemAddons = true; // Default to true since addons are optional
        hasBondFactory = false;
        hasYieldAddon = false;
      }
    }

    return {
      id: authUser.id,
      name:
        kyc?.firstName && kyc.lastName
          ? `${kyc.firstName} ${kyc.lastName}`
          : authUser.name,
      email: authUser.email,
      role: authUser.role,
      wallet: authUser.wallet,
      isOnboarded: authUser.isOnboarded,
      firstName: kyc?.firstName,
      lastName: kyc?.lastName,
      verificationTypes: [
        ...(authUser.pincodeEnabled ? [VerificationTypeEnum.pincode] : []),
        ...(authUser.twoFactorEnabled ? [VerificationTypeEnum.twoFactor] : []),
        ...(authUser.secretCodeVerificationId
          ? [VerificationTypeEnum.secretCode]
          : []),
      ] as VerificationType[],
      onboardingState: {
        wallet: authUser.wallet !== zeroAddress,
        walletSecurity:
          authUser.pincodeEnabled || authUser.twoFactorEnabled || false,
        walletRecoveryCodes: authUser.secretCodesConfirmed ?? false,
        system: !!systemAddress,
        systemSettings: !!baseCurrency,
        systemAssets: hasTokenFactories,
        systemAddons: hasSystemAddons,
        identitySetup: !!account?.identity,
        identity: !!userQueryResult?.kyc,
      },
    };
  });
