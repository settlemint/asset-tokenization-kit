import type { ExtractAbiEventNames } from "abitype";
import {
  type ContractEventName,
  type Hex,
  type TransactionReceipt,
  decodeEventLog,
} from "viem";
import type { SMARTOnboardingContracts } from "../services/deployer";
import { waitForSuccess } from "./wait-for-success";

// Utility function to find specific event arguments from a transaction
export async function waitForEvent<
  Key extends keyof SMARTOnboardingContracts,
>(params: {
  contract: SMARTOnboardingContracts[Key];
  transactionHash: Hex;
  eventName: ExtractAbiEventNames<SMARTOnboardingContracts[Key]["abi"]>;
}) {
  const { transactionHash, contract, eventName } = params;
  const contractAddress = contract.address;
  const abi = contract.abi;

  const receipt: TransactionReceipt = await waitForSuccess(transactionHash);

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() === contractAddress.toLowerCase()) {
      try {
        const decodedEvent = decodeEventLog({
          abi: abi,
          data: log.data,
          topics: log.topics,
          eventName: eventName as ContractEventName<
            SMARTOnboardingContracts[Key]["abi"]
          >,
        });
        // If decodeEventLog doesn't throw and finds the event, it means topics matched for the specific eventName.
        console.log(`Decoded ${eventName} event args:`, decodedEvent.args);
        return decodedEvent.args;
      } catch (e) {
        // This log is from the correct contract but not the specific event we're looking for,
        // or it was not decodable as such. We can safely ignore this error and continue checking other logs.
        // console.debug(`Log from ${log.address} not matching ${eventName} or decoding error:`, e);
      }
    }
  }
  console.warn(
    `Transaction was successful, but could not find the ${eventName} event from contract ${contractAddress} in the logs.`,
    receipt.logs,
  );
  return null;
}
