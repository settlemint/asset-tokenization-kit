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
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { read } from "@/orpc/routes/settings/routes/settings.read";
import { read as systemRead } from "@/orpc/routes/system/routes/system.read";
import { call } from "@orpc/server";
import { eq } from "drizzle-orm";

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
    const [[userQueryResult], systemAddress, baseCurrency] = await Promise.all([
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
        read,
        {
          key: "SYSTEM_ADDRESS",
        },
        {
          context,
        }
      ),
      call(
        read,
        {
          key: "BASE_CURRENCY",
        },
        { context }
      ),
    ]);

    const { kyc } = userQueryResult ?? {};

    // Check if system has token factories using existing ORPC route
    let hasTokenFactories = false;
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
      } catch {
        // If system read fails, we assume no factories
        hasTokenFactories = false;
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
      onboardingState: {
        isAdmin: authUser.role === "admin",
        wallet:
          authUser.wallet !== "0x0000000000000000000000000000000000000000",
        walletSecurity:
          authUser.pincodeEnabled || authUser.twoFactorEnabled || false,
        walletRecoveryCodes: !!authUser.secretCodeVerificationId,
        system: !!systemAddress,
        systemSettings: !!baseCurrency,
        systemAssets: hasTokenFactories,
        systemAddons: false, // TODO: Track when addons are configured
        identitySetup: false, // TODO: Add logic to check if ONCHAINID is set up
        identity: !!userQueryResult?.kyc,
      },
    };
  });
