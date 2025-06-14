import type { EthereumAddress } from "../utils/zod/validators/ethereum-address";
import type { auth } from "./auth";

export type Session = typeof auth.$Infer.Session;
export type User = Omit<Session["user"], "walletAddress"> & {
  walletAddress?: EthereumAddress;
};
