// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @title SMART Topic Scheme Registry Interface
/// @author SettleMint
/// @notice Interface for managing topic schemes with their signatures for data encoding/decoding
/// @dev This registry allows registration and management of topic schemes used for claim data structures
interface ISMARTTopicSchemeRegistry is IERC165 {
    // --- Structs ---
    /// @notice Defines a topic scheme with its identifier and signature
    /// @param topicId The unique identifier for this topic scheme (generated from name)
    /// @param signature The signature string used for encoding/decoding claim data
    /// @param exists Flag indicating if this topic scheme is registered
    struct TopicScheme {
        uint256 topicId;
        string signature;
        bool exists;
    }

    // --- Events ---
    /// @notice Emitted when a new topic scheme is registered
    /// @param sender The address that registered the topic scheme
    /// @param topicId The unique identifier of the registered topic scheme
    /// @param name The name of the registered topic scheme
    /// @param signature The signature associated with the topic scheme
    event TopicSchemeRegistered(address indexed sender, uint256 indexed topicId, string name, string signature);

    /// @notice Emitted when multiple topic schemes are registered in batch
    /// @param sender The address that registered the topic schemes
    /// @param topicIds The unique identifiers of the registered topic schemes
    /// @param names The names of the registered topic schemes
    /// @param signatures The signatures associated with the topic schemes
    event TopicSchemesBatchRegistered(address indexed sender, uint256[] topicIds, string[] names, string[] signatures);

    /// @notice Emitted when a topic scheme is updated
    /// @param sender The address that updated the topic scheme
    /// @param topicId The unique identifier of the updated topic scheme
    /// @param name The name of the updated topic scheme
    /// @param oldSignature The previous signature
    /// @param newSignature The new signature
    event TopicSchemeUpdated(
        address indexed sender, uint256 indexed topicId, string name, string oldSignature, string newSignature
    );

    /// @notice Emitted when a topic scheme is removed
    /// @param sender The address that removed the topic scheme
    /// @param topicId The unique identifier of the removed topic scheme
    /// @param name The name of the removed topic scheme
    event TopicSchemeRemoved(address indexed sender, uint256 indexed topicId, string name);

    // --- Functions ---
    /// @notice Registers a new topic scheme with its name and signature
    /// @dev topicId is generated as uint256(keccak256(abi.encodePacked(name)))
    /// @param name The human-readable name for the topic scheme
    /// @param signature The signature string used for encoding/decoding data
    function registerTopicScheme(string calldata name, string calldata signature) external;

    /// @notice Registers multiple topic schemes in a single transaction
    /// @dev topicIds are generated from names using keccak256 hash
    /// @param names Array of human-readable names for the topic schemes
    /// @param signatures Array of signature strings used for encoding/decoding data
    function batchRegisterTopicSchemes(string[] calldata names, string[] calldata signatures) external;

    /// @notice Updates an existing topic scheme's signature
    /// @param name The name of the topic scheme to update
    /// @param newSignature The new signature string
    function updateTopicScheme(string calldata name, string calldata newSignature) external;

    /// @notice Removes a topic scheme from the registry
    /// @param name The name of the topic scheme to remove
    function removeTopicScheme(string calldata name) external;

    /// @notice Checks if a topic scheme exists by ID
    /// @param topicId The unique identifier to check
    /// @return exists True if the topic scheme is registered, false otherwise
    function hasTopicScheme(uint256 topicId) external view returns (bool exists);

    /// @notice Checks if a topic scheme exists by name
    /// @param name The name to check
    /// @return exists True if the topic scheme is registered, false otherwise
    function hasTopicSchemeByName(string calldata name) external view returns (bool exists);

    /// @notice Gets the signature for a specific topic scheme by ID
    /// @param topicId The unique identifier of the topic scheme
    /// @return signature The signature string for the topic scheme
    function getTopicSchemeSignature(uint256 topicId) external view returns (string memory signature);

    /// @notice Gets the signature for a specific topic scheme by name
    /// @param name The name of the topic scheme
    /// @return signature The signature string for the topic scheme
    function getTopicSchemeSignatureByName(string calldata name) external view returns (string memory signature);

    /// @notice Gets the topic ID for a given name
    /// @param name The name of the topic scheme
    /// @return topicId The unique identifier generated from the name
    function getTopicId(string calldata name) external pure returns (uint256 topicId);

    /// @notice Gets all registered topic IDs
    /// @return topicIds Array of all registered topic scheme identifiers
    function getAllTopicIds() external view returns (uint256[] memory topicIds);

    /// @notice Gets the total number of registered topic schemes
    /// @return count The number of registered topic schemes
    function getTopicSchemeCount() external view returns (uint256 count);
}
