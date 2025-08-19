/**
 * ATK Topics Validation Utilities
 *
 * Provides Zod schemas for validating ATK topic identifiers and mapping
 * between topic names and IDs for expression building in compliance modules.
 * Based on kit/contracts/scripts/hardhat/constants/topics.ts
 * @module TopicsValidation
 */
import { encodePacked, keccak256 } from "viem";
import { z } from "zod";

/**
 * Tuple of valid ATK topic identifiers for type-safe iteration.
 * These constants must match the topic names defined in contracts/system/ATKTopics.sol
 * Topic IDs are dynamically generated during system bootstrap using keccak256(abi.encodePacked(name))
 */
export const atkTopics = ["kyc", "aml", "collateral", "isin", "assetClassification", "basePrice"] as const;

/**
 * Enum-like object for dot notation access to ATK topic identifiers.
 * Provides a convenient way to reference ATK topics in code.
 * @example
 * ```typescript
 * // Use for comparisons and assignments
 * if (topic === ATKTopicEnum.kyc) {
 *   console.log("Processing KYC topic");
 * }
 *
 * // Use in switch statements
 * switch (topicName) {
 *   case ATKTopicEnum.kyc:
 *     processKYC();
 *     break;
 *   case ATKTopicEnum.aml:
 *     processAML();
 *     break;
 * }
 * ```
 */
export const ATKTopicEnum = {
  kyc: "kyc",
  aml: "aml",
  collateral: "collateral",
  isin: "isin",
  assetClassification: "assetClassification",
  basePrice: "basePrice",
} as const;

/**
 * Zod schema for validating ATK topic identifiers.
 * @returns A Zod enum schema for ATK topic validation
 * @example
 * ```typescript
 * const schema = atkTopic();
 * schema.parse("kyc"); // Returns "kyc" as ATKTopic
 * schema.parse("invalid"); // Throws ZodError
 *
 * // Use in form validation
 * const formSchema = z.object({
 *   topic: atkTopic(),
 *   params: z.array(z.string())
 * });
 * ```
 */
export const atkTopic = () => z.enum(atkTopics).describe("ATK topic name");

/**
 * Type representing a validated ATK topic.
 */
export type ATKTopic = z.infer<ReturnType<typeof atkTopic>>;

const topicNameToIdCache = new Map<ATKTopic, bigint>();
const idToTopicNameCache = new Map<bigint, ATKTopic>();

/**
 * Get topic ID by name (uses cache if available)
 */
export function getTopicId(topic: ATKTopic): bigint {
  // First check cache
  const cached = topicNameToIdCache.get(topic);
  if (cached) {
    return cached;
  }

  // Calculate ID from name (same as Solidity: uint256(keccak256(abi.encodePacked(name))))
  const hash = keccak256(encodePacked(["string"], [topic]));
  const id = BigInt(hash);

  topicNameToIdCache.set(topic, id);
  idToTopicNameCache.set(id, topic);

  return id;
}

/// @notice Helper function to get topic name from topic ID
/// @param topicId The topic ID to look up
/// @returns Topic name if found, otherwise formatted topic ID
export const getTopicNameFromId = (topicId: bigint): ATKTopic => {
  // Try to find the topic name from the cache
  const cached = idToTopicNameCache.get(topicId);
  if (cached) {
    return cached;
  }

  // Check if it's a known ATKTopic
  for (const [key, value] of Object.entries(ATKTopicEnum)) {
    if (getTopicId(value) === topicId) {
      const topic = key as ATKTopic;

      idToTopicNameCache.set(topicId, topic);
      topicNameToIdCache.set(topic, topicId);

      return topic;
    }
  }

  throw new Error(`Topic name for ID ${topicId} not found`);
};
