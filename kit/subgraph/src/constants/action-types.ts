// Centralized Action Types for Subgraph
// This ensures consistency with the frontend constants

export const ACTION_TYPES = {
  APPROVE_XVP_SETTLEMENT: "ApproveXvPSettlement",
  EXECUTE_XVP_SETTLEMENT: "ExecuteXvPSettlement",
  MATURE_BOND: "MatureBond",
};

export const ACTION_USER_TYPES = {
  ADMIN: "Admin",
  USER: "User",
};

// Helper function to validate action types
export function isValidActionType(type: string): boolean {
  return Object.values(ACTION_TYPES).includes(type);
}

export function isValidActionUserType(type: string): boolean {
  return Object.values(ACTION_USER_TYPES).includes(type);
}
