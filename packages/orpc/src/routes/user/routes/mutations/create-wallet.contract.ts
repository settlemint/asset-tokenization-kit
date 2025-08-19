import { baseContract } from "../../../../procedures/base.contract";
import { CreateWalletOutputSchema } from "./create-wallet.schema";

export const createWalletContract = baseContract
  .route({
    method: "POST",
    path: "/user/create-wallet",
    description: "Create a wallet for the user",
    successDescription: "Wallet",
    tags: ["user"],
  })
  .output(CreateWalletOutputSchema);
