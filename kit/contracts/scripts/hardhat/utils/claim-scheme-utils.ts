import {
  type Hex,
  decodeAbiParameters,
  encodeAbiParameters,
  parseAbiParameters,
} from "viem";
import type { ATKTopic } from "../constants/topics";
import { topicManager } from "../services/topic-manager";

/**
 * Decodes claim data based on the claim topic's scheme
 * @param claimTopic The claim topic as a bigint
 * @param encodedData The encoded claim data as hex string
 * @returns The decoded claim data
 */
export function decodeClaimData(
  claimTopic: bigint,
  encodedData: Hex
): readonly unknown[] {
  // Ensure topic manager is initialized
  if (!topicManager.isInitialized()) {
    throw new Error(
      "TopicManager is not initialized. Call topicManager.initialize() first."
    );
  }

  const signature = topicManager.getTopicSignatureById(claimTopic);

  if (!signature) {
    throw new Error(`Unknown claim topic: ${claimTopic}`);
  }

  return decodeAbiParameters(parseAbiParameters(signature), encodedData);
}

/**
 * Encodes claim data based on the claim topic's scheme
 * @param claimTopic The claim topic name from ATKTopic enum or as a bigint
 * @param values The values to encode according to the claim scheme
 * @returns The encoded claim data as hex string
 */
export function encodeClaimData(
  claimTopic: ATKTopic | bigint,
  values: readonly unknown[]
): Hex {
  let topicId: bigint;

  if (typeof claimTopic === "bigint") {
    topicId = claimTopic;
  } else {
    // Ensure topic manager is initialized
    if (!topicManager.isInitialized()) {
      throw new Error(
        "TopicManager is not initialized. Call topicManager.initialize() first."
      );
    }
    topicId = topicManager.getTopicId(claimTopic);
  }

  // Ensure topic manager is initialized
  if (!topicManager.isInitialized()) {
    throw new Error(
      "TopicManager is not initialized. Call topicManager.initialize() first."
    );
  }

  const signature = topicManager.getTopicSignatureById(topicId);

  if (!signature) {
    throw new Error(`Unknown claim topic: ${topicId}`);
  }

  const abiParams = parseAbiParameters(signature);

  // Need to wrap it in a tuple so it can be decoded by The Graph
  // To get the "0x...20..." format (like The Graph's ethereum.decode expects for a tuple)
  const encodedViemTuple = encodeAbiParameters(
    [{ type: "tuple", components: abiParams }], // Explicitly encode as a single tuple
    [values] // Wrap the args in an array because the main type is now a single tuple
  );

  return encodedViemTuple;
}
