import { createPublicClient, getAddress, http, toHex } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { anvil } from "viem/chains";

const client = createPublicClient({
  chain: anvil,
  transport: http("http://localhost:8545"),
});

const balanceInHex = toHex(1000000000000000000n);
const defaultWallet = mnemonicToAccount(
  "test test test test test test test test test test test junk",
  {
    path: "m/44'/60'/0'/0/0",
  }
);
const defaultWalletAddress = getAddress(defaultWallet.address);

console.log(`Setting balance for address: ${defaultWalletAddress}`);
console.log(`Balance to set: ${balanceInHex} (${1000000000000000000n} wei)`);

await client.request({
  method: "anvil_setBalance",
  params: [defaultWalletAddress, balanceInHex],
} as any);

console.log(`Successfully set balance for ${defaultWalletAddress}`);
