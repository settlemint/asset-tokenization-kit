/**
 * Onboarded ORPC router for procedures requiring a wallet.
 *
 * This router extends the authenticated router with wallet verification
 * middleware. It ensures that any user accessing these procedures has
 * completed the onboarding process and has an associated wallet address.
 *
 * Middleware composition (inherited + added):
 * 1. Error middleware (from public router)
 * 2. Session middleware (from public router)
 * 3. Auth middleware (from auth router)
 * 4. Wallet middleware - Ensures user has a wallet
 * 5. System middleware - Ensures system is onboarded
 *
 * Use this router for procedures that require:
 * - A verified user wallet address
 * - Interactions with blockchain contracts
 * - Operations specific to onboarded users
 * @see {@link ./auth.router} - Authenticated router that this extends
 * @see {@link ../middlewares/auth/wallet.middleware} - Wallet verification middleware
 */
import { walletMiddleware } from "../middlewares/auth/wallet.middleware";
import { authRouter } from "./auth.router";

export const onboardedRouter = authRouter.use(walletMiddleware);
