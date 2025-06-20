import type { EthereumAddress } from "@/lib/utils/zod/validators/ethereum-address";
import type { CurrencyCode } from "../db/schema-settings";
import type { UserRole } from "../utils/zod/validators/user-roles";
import type { auth } from "./auth";

export type Session = typeof auth.$Infer.Session;
export type User = Omit<Session["user"], "wallet" | "role" | "currency"> & {
  wallet: EthereumAddress;
  role: UserRole;
  currency: CurrencyCode;
};
