// Centralized Action Types and Status Definitions
// This file ensures type consistency across all system boundaries

export const ACTION_TYPES = {
  APPROVE_XVP_SETTLEMENT: 'ApproveXvPSettlement',
  EXECUTE_XVP_SETTLEMENT: 'ExecuteXvPSettlement',
  MATURE_BOND: 'MatureBond',
} as const;

export const ACTION_USER_TYPES = {
  ADMIN: 'Admin',
  USER: 'User',
} as const;

export const ACTION_STATUS = {
  PENDING: 'PENDING',
  UPCOMING: 'UPCOMING',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
} as const;

// Type definitions
export type ActionType = typeof ACTION_TYPES[keyof typeof ACTION_TYPES];
export type ActionUserType = typeof ACTION_USER_TYPES[keyof typeof ACTION_USER_TYPES];
export type ActionStatus = typeof ACTION_STATUS[keyof typeof ACTION_STATUS];

// Helper functions for type safety
export const isValidActionType = (type: string): type is ActionType => {
  return Object.values(ACTION_TYPES).includes(type as ActionType);
};

export const isValidActionUserType = (type: string): type is ActionUserType => {
  return Object.values(ACTION_USER_TYPES).includes(type as ActionUserType);
};

export const isValidActionStatus = (status: string): status is ActionStatus => {
  return Object.values(ACTION_STATUS).includes(status as ActionStatus);
};

// Status calculation utility - centralized to prevent timezone issues
export const calculateActionStatus = (
  activeAt: number, // UTC seconds
  expiresAt: number | null, // UTC seconds
  executed: boolean
): ActionStatus => {
  const now = Math.floor(Date.now() / 1000); // UTC seconds
  
  if (executed) return ACTION_STATUS.COMPLETED;
  if (expiresAt && now > expiresAt) return ACTION_STATUS.EXPIRED;
  if (now < activeAt) return ACTION_STATUS.UPCOMING;
  return ACTION_STATUS.PENDING;
};

// Action registry for extensibility
export interface ActionDefinition {
  type: ActionType;
  userType: ActionUserType;
  description: string;
  requiresApproval: boolean;
  defaultExpiration?: number; // seconds from activation
}

export const ACTION_REGISTRY: Record<ActionType, ActionDefinition> = {
  [ACTION_TYPES.APPROVE_XVP_SETTLEMENT]: {
    type: ACTION_TYPES.APPROVE_XVP_SETTLEMENT,
    userType: ACTION_USER_TYPES.ADMIN,
    description: 'Approve XvP settlement for execution',
    requiresApproval: false,
    defaultExpiration: 86400, // 24 hours
  },
  [ACTION_TYPES.EXECUTE_XVP_SETTLEMENT]: {
    type: ACTION_TYPES.EXECUTE_XVP_SETTLEMENT,
    userType: ACTION_USER_TYPES.ADMIN,
    description: 'Execute approved XvP settlement',
    requiresApproval: true,
    defaultExpiration: 86400, // 24 hours
  },
  [ACTION_TYPES.MATURE_BOND]: {
    type: ACTION_TYPES.MATURE_BOND,
    userType: ACTION_USER_TYPES.ADMIN,
    description: 'Process bond maturation',
    requiresApproval: false,
  },
};