/**
 * SMART Protocol Topic Constants
 *
 * These constants must match the topic names defined in contracts/system/SMARTTopics.sol
 * Topic IDs are dynamically generated during system bootstrap using keccak256(abi.encodePacked(name))
 */

export enum SMARTTopic {
  kyc = "kyc",
  aml = "aml",
  collateral = "collateral",
  isin = "isin",
  assetClassification = "assetClassification",
}
