// Centralized Action Types for Subgraph
// This ensures consistency with the frontend constants
// Note: Using individual constants instead of object literals for AssemblyScript compatibility

// Action Types
export const ACTION_TYPE_APPROVE_XVP_SETTLEMENT = "ApproveXvPSettlement";
export const ACTION_TYPE_EXECUTE_XVP_SETTLEMENT = "ExecuteXvPSettlement";
export const ACTION_TYPE_MATURE_BOND = "MatureBond";

// Action User Types
export const ACTION_USER_TYPE_ADMIN = "Admin";
export const ACTION_USER_TYPE_USER = "User";

// Helper function to validate action types
export function isValidActionType(type: string): boolean {
  return type === ACTION_TYPE_APPROVE_XVP_SETTLEMENT ||
         type === ACTION_TYPE_EXECUTE_XVP_SETTLEMENT ||
         type === ACTION_TYPE_MATURE_BOND;
}

export function isValidActionUserType(type: string): boolean {
  return type === ACTION_USER_TYPE_ADMIN ||
         type === ACTION_USER_TYPE_USER;
}
