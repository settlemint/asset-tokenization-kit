/**
 * ERC165 Interface IDs for Token Actions
 *
 * This file is auto-generated by generate-interface-ids.ts
 * Do not edit manually - run `bun run generate:interface-ids` to regenerate
 *
 * Found 8 interfaces
 */

// Standard interface IDs (manually added as they're from OpenZeppelin)
const STANDARD_INTERFACE_IDS = {
  IERC165: "0x01ffc9a7",
  IERC20: "0x36372b07",
} as const;

// Generated interface IDs
export const INTERFACE_IDS = {
  ISMARTBurnable: "0xd7ae59db",
  ISMARTCapped: "0x722a19dd",
  ISMARTCollateral: "0xb5cb9db3",
  ISMARTCustodian: "0x25e5ad79",
  ISMARTPausable: "0xe78a39d8",
  ISMARTRedeemable: "0xf4433ab7",
  ISMARTYield: "0x85ebbbb4",
  IERC3643: "0xb97d944c",
} as const;

// Merged interface IDs for easy access
export const ALL_INTERFACE_IDS = {
  ...STANDARD_INTERFACE_IDS,
  ...INTERFACE_IDS,
} as const;

// Helper type for interface IDs
export type InterfaceId = keyof typeof ALL_INTERFACE_IDS;

// Helper function to get interface ID
export function getInterfaceId(name: InterfaceId): string {
  return ALL_INTERFACE_IDS[name];
}
