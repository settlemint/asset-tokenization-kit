import { AccessControlRoles } from "@/lib/fragments/the-graph/access-control-fragment";

/**
 * The permissions for the token factory contract
 *
 * @description
 * This is a mapping of the token factory contract methods to the roles that are required to call them.
 */
export const TOKEN_FACTORY_PERMISSIONS: Record<"create", AccessControlRoles[]> =
  {
    create: ["registrar"],
  };
