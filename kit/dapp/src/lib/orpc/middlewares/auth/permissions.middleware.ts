import { auth } from "@/lib/auth/auth";
import { br } from "../../routes/procedures/base.router";

/**
 * CRUD permission types for API key authorization.
 *
 * Defines the standard CRUD operations that can be required for API key access:
 * - read: View/retrieve data
 * - create: Create data
 * - update: Update data
 * - delete: Remove data
 */
export type CRUDPermission = "read" | "create" | "update" | "delete";

/**
 * Creates a permissions middleware for specific CRUD permissions and user roles.
 *
 * This function returns a middleware that automatically extracts the resource type
 * from the ORPC procedure path and validates that the user has the required role
 * permissions and, if present, that the API key has the required CRUD permissions
 * for that resource.
 *
 * Features:
 * - Automatic resource extraction from path (e.g., "planet" from "planet.find")
 * - User role-based permission checking as baseline security
 * - CRUD-based API key permission checking as additional restrictions
 * - API keys can only restrict access, never expand it beyond user permissions
 * - Clear error messages indicating missing permissions
 *
 * Usage:
 * ```typescript
 * // Require read permission for the resource (extracted from path)
 * export const find = ar.planet.find
 *   .use(permissionsMiddleware({ requiredPermissions: ["read"], roles: ["user"] }))
 *   .handler(async ({ input }) => { ... });
 *
 * // Require write permission for creating/updating
 * export const create = ar.planet.create
 *   .use(permissionsMiddleware({ requiredPermissions: ["create"], roles: ["admin"] }))
 *   .handler(async ({ input }) => { ... });
 *
 * // Require multiple permissions
 * export const adminAction = ar.planet.adminAction
 *   .use(permissionsMiddleware({ requiredPermissions: ["read", "delete"], roles: ["admin"] }))
 *   .handler(async ({ input }) => { ... });
 * ```
 *
 * The middleware will:
 * 1. Extract resource type from the first segment of the procedure path
 * 2. First check user role permissions (if roles are specified)
 * 3. If API key is present, verify it has the required permissions for the resource
 * 4. API key permissions act as additional restrictions on top of user permissions
 * 5. Throw FORBIDDEN if user role or API key lacks required permissions
 *
 * @param requiredPermissions - Array of CRUD permissions required for this endpoint
 * @param roles - Array of user roles required for this endpoint
 * @returns Middleware function that checks user role and API key permissions
 * @throws UNAUTHORIZED - When user is not authenticated
 * @throws FORBIDDEN - When user role or API key lacks required permissions for the resource
 */
export function permissionsMiddleware({
  requiredPermissions,
  roles,
}: {
  requiredPermissions: CRUDPermission[];
  roles: string[];
}) {
  return br.middleware(async ({ context, next, errors, path }) => {
    // Extract the API key from request headers
    const apiKey = context.headers.get("x-api-key");

    // Extract the resource type from the first segment of the procedure path
    // e.g., "planet" from ["planet", "find"] or ["planet", "create"]
    const resourceType = path[0];

    if (!resourceType) {
      throw errors.FORBIDDEN({
        message: "Unable to determine resource type from procedure path",
      });
    }

    // First, always check user role permissions if roles are required
    if (roles.length > 0) {
      const { user } = context.auth || {};
      if (!user) {
        throw errors.UNAUTHORIZED();
      }
      const { role } = user;
      if (!roles.includes(role)) {
        throw errors.FORBIDDEN({
          message: `User does not have the required permissions for resource '${resourceType}'. Required: [${roles.join(", ")}]`,
        });
      }
    }

    // If no API key is present, we're done - user role check passed
    if (!apiKey) {
      return next();
    }

    // If API key is present, verify it has the required permissions for this resource
    // This acts as an additional restriction on top of user permissions
    const result = await auth.api.verifyApiKey({
      body: {
        key: apiKey,
        permissions: {
          [resourceType]: requiredPermissions, // Dynamic resource type with required permissions
        },
      },
    });

    const { valid } = result;
    if (valid) {
      // API key is valid and has required permissions, and user role check already passed
      return next();
    } else {
      // API key is invalid or lacks required permissions
      const permissionsList = requiredPermissions.join(", ");
      throw errors.FORBIDDEN({
        message: `API key does not have the required permissions for resource '${resourceType}'. Required: [${permissionsList}]`,
      });
    }
  });
}
