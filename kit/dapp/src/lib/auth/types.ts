import type { Address } from "viem";
import type { CurrencyCode } from "../db/schema-settings";
import type { UserRole } from "../utils/typebox/user-roles";
import type { auth } from "./auth";

export type Session = typeof auth.$Infer.Session;
export type User = Omit<Session["user"], "wallet" | "role" | "currency"> & {
  wallet: Address;
  role: UserRole;
  currency: CurrencyCode;
};
