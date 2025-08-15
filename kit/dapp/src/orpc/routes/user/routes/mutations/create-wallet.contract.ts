import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { baseContract } from "@/orpc/procedures/base.contract";

export const createWalletContract = baseContract
  .route({
    method: "POST",
    path: "/user/create-wallet",
    description: "Create a wallet for the user",
    successDescription: "Wallet",
    tags: ["user"],
  })
  .output(ethereumAddress);
