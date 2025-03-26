import type { Address } from "viem";
import type { UserRole } from "../utils/typebox/user-roles";
import type { auth } from "./auth";

export type Session = typeof auth.$Infer.Session;
export type User = Omit<Session["user"], "wallet" | "role"> & {
  wallet: Address;
  role: UserRole;
};
