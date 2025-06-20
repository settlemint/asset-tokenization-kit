// Create tokens requires certain role on the System Level

// Token actions requires a certain role on the token

// Allow list / blocked list on a token

// Claim based
// Eg user needs KYC claim to be able to do actions on the token
// Country based checks (eg country RU not allowed to buy token)

// Issue claimTopics
// Check if user is a trusted issuer for a certain topic (KYC, AML, ISIN, etc )

// Subgraph caching
// For write, not an issue (there are not so many writes I would say)
// For read, we can fetch

import { authClient } from "@/lib/auth/auth.client";
import type { Permissions } from "@/lib/auth/permissions";
import { baseRouter } from "../../procedures/base.router";

export const permissionsMiddleware = (
  requiredPermissions: Partial<Permissions>
) =>
  baseRouter.middleware(async ({ context, next, errors }) => {
    if (!context.auth) {
      throw errors.UNAUTHORIZED();
    }

    const hasPermission = authClient.admin.checkRolePermission({
      permission: requiredPermissions,
      role: context.auth.user.role,
    });
    if (!hasPermission) {
      throw errors.FORBIDDEN();
    }

    return next();
  });
