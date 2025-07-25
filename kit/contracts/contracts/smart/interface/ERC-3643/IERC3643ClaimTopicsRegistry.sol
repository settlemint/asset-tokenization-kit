// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.28;

/// Events

/// @notice Emitted when a claim topic has been added to the ClaimTopicsRegistry
/// @dev This event is emitted when a claim topic has been added to the ClaimTopicsRegistry.
/// @param _claimTopic is the required claim added to the Claim Topics Registry.
event ClaimTopicAdded(uint256 indexed _claimTopic);

/// @notice Emitted when a claim topic has been removed from the ClaimTopicsRegistry
/// @dev This event is emitted when a claim topic has been removed from the ClaimTopicsRegistry.
/// @param _claimTopic is the required claim removed from the Claim Topics Registry.
event ClaimTopicRemoved(uint256 indexed _claimTopic);

/**
 * @title IERC3643ClaimTopicsRegistry
 * @author SettleMint
 * @notice Interface for ERC-3643 compliant Claim Topics Registry managing required claim topics
 * @dev This interface defines the standard for managing claim topics that investors must have
 *      verified on their identity contracts. Claim topics represent different types of verifications
 *      such as KYC, AML, accreditation status, etc.
 */
interface IERC3643ClaimTopicsRegistry {
    /**
     * @notice Add a trusted claim topic to the registry
     * @dev Add a trusted claim topic (For example: KYC=1, AML=2).
     * Only owner can call.
     * emits `ClaimTopicAdded` event
     * cannot add more than 15 topics for 1 token as adding more could create gas issues
     * @param _claimTopic The claim topic index
     */
    function addClaimTopic(uint256 _claimTopic) external;

    /**
     *  @notice Remove a trusted claim topic from the registry
     *  @dev Remove a trusted claim topic (For example: KYC=1, AML=2).
     *  Only owner can call.
     *  emits `ClaimTopicRemoved` event
     *  @param _claimTopic The claim topic index
     */
    function removeClaimTopic(uint256 _claimTopic) external;

    /**
     *  @notice Get the trusted claim topics for the security token
     *  @dev Get the trusted claim topics for the security token
     *  @return Array of trusted claim topics
     */
    function getClaimTopics() external view returns (uint256[] memory);
}
