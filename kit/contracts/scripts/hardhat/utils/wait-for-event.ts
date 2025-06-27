import type { ExtractAbiEventNames } from 'abitype';
import {
  type Account,
  type Chain,
  decodeEventLog,
  type Hex,
  type PublicClient,
  type TransactionReceipt,
  type Transport,
  type WalletClient,
} from 'viem';
import type { ATKContracts } from '../constants/contracts';
import type { ViemContract } from '../services/deployer';
import { waitForSuccess } from './wait-for-success';

type Contracts = {
  [K in keyof typeof ATKContracts]: ViemContract<
    (typeof ATKContracts)[K], // Access ABI by key
    { public: PublicClient; wallet: WalletClient<Transport, Chain, Account> }
  >;
};

// Utility function to find specific event arguments from a transaction
export async function waitForEvent<
  Key extends keyof Contracts,
  EventName extends ExtractAbiEventNames<Contracts[Key]['abi']>,
>(params: {
  contract: Contracts[Key];
  transactionHash: Hex;
  eventName: EventName;
}) {
  const { transactionHash, contract, eventName } = params;
  const contractAddress = contract.address;
  const abi = contract.abi;

  const receipt: TransactionReceipt = await waitForSuccess(transactionHash);

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() === contractAddress.toLowerCase()) {
      try {
        const decodedEvent = decodeEventLog({
          abi,
          data: log.data,
          topics: log.topics,
        });

        // Check if this is the event we're looking for
        if (decodedEvent.eventName === eventName) {
          console.log(`Decoded ${eventName} event args:`, decodedEvent.args);
          return decodedEvent.args;
        }
      } catch (e) {
        // This log is from the correct contract but not the specific event we're looking for,
        // or it was not decodable as such. We can safely ignore this error and continue checking other logs.
        // console.debug(`Log from ${log.address} not matching ${eventName} or decoding error:`, e);
      }
    }
  }
  console.warn(
    `Transaction was successful, but could not find the ${eventName} event from contract ${contractAddress} in the logs.`,
    receipt.logs
  );
  return null;
}
