import { z } from "zod";
import { roles } from "./access-control-roles";

type AccessControlRoles = (typeof roles)[number];

/**
 * Role requirement type that supports both AND and OR logic
 *
 * Examples:
 * - Single role: "admin"
 * - OR logic: { any: ["admin", "systemManager"] }
 * - AND logic: { all: ["admin", "tokenManager"] }
 * - Complex: { all: ["admin", { any: ["tokenManager", "systemManager"] }] }
 */
export type RoleRequirement =
  | AccessControlRoles
  | { any: RoleRequirement[] }
  | { all: RoleRequirement[] };

/**
 * Type guard to check if a role requirement is a single role
 */
export function isSingleRole(req: RoleRequirement): req is AccessControlRoles {
  return typeof req === "string";
}

/**
 * Type guard to check if a role requirement is an "any" (OR) requirement
 */
export function isAnyRoleRequirement(
  req: RoleRequirement
): req is { any: RoleRequirement[] } {
  return typeof req === "object" && "any" in req;
}

/**
 * Type guard to check if a role requirement is an "all" (AND) requirement
 */
export function isAllRoleRequirement(
  req: RoleRequirement
): req is { all: RoleRequirement[] } {
  return typeof req === "object" && "all" in req;
}

/**
 * Check if a user with given roles satisfies the role requirement
 */
export function satisfiesRoleRequirement(
  userRoles: AccessControlRoles[],
  requirement: RoleRequirement
): boolean {
  if (isSingleRole(requirement)) {
    return userRoles.includes(requirement);
  }

  if (isAnyRoleRequirement(requirement)) {
    // OR logic - at least one must be satisfied
    // Empty array means no roles required (everyone can perform this action)
    if (requirement.any.length === 0) {
      return true;
    }
    return requirement.any.some((req) =>
      satisfiesRoleRequirement(userRoles, req)
    );
  }

  if (isAllRoleRequirement(requirement)) {
    // AND logic - all must be satisfied
    return requirement.all.every((req) =>
      satisfiesRoleRequirement(userRoles, req)
    );
  }

  return false;
}

/**
 * Zod schema for role requirements
 */
const RoleRequirementSchema: z.ZodType<RoleRequirement> = z.lazy(() =>
  z.union([
    z.string() as z.ZodType<AccessControlRoles>,
    z.object({
      any: z.array(RoleRequirementSchema),
    }),
    z.object({
      all: z.array(RoleRequirementSchema),
    }),
  ])
);

export { RoleRequirementSchema };
