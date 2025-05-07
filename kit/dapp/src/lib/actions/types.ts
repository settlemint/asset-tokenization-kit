export const actionTypes = {
  BOND_MATURITY: "bond-mature",
} as const;

export type ActionType = (typeof actionTypes)[keyof typeof actionTypes];
