import { keccak256, stringToHex } from "viem";

export const roles = {
  [keccak256(stringToHex("SUPPLY_MANAGEMENT_ROLE"))]: "Supply Management",
  [keccak256(stringToHex("USER_MANAGEMENT_ROLE"))]: "User Management",
  "0x0000000000000000000000000000000000000000000000000000000000000000": "Admin",
} as const;
