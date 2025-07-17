// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// Interface imports
import { ISMARTTopicSchemeRegistry } from "../../smart/interface/ISMARTTopicSchemeRegistry.sol";
import { IATKTopicSchemeRegistry } from "./IATKTopicSchemeRegistry.sol";

// Access control imports
import { ATKSystemAccessControlled } from "../access-manager/ATKSystemAccessControlled.sol";

// Constants
import { ATKSystemRoles } from "../ATKSystemRoles.sol";

/// @title ATK Topic Scheme Registry Implementation
/// @author SettleMint Tokenization Services
/// @notice Implementation for managing topic schemes with their signatures for data encoding/decoding
/// @dev This contract manages the registration and lifecycle of topic schemes used for claim data structures
contract ATKTopicSchemeRegistryImplementation is
    Initializable,
    ERC165Upgradeable,
    ERC2771ContextUpgradeable,
    ATKSystemAccessControlled,
    IATKTopicSchemeRegistry
{
    // --- Storage Variables ---
    /// @notice Mapping from topic ID to topic scheme information
    /// @dev Maps topicId => TopicScheme struct containing id, signature, and existence flag
    mapping(uint256 topicId => TopicScheme scheme) private _topicSchemes;

    /// @notice Array storing all registered topic IDs for enumeration
    /// @dev Allows iteration over all registered topic schemes
    uint256[] private _topicIds;

    /// @notice Mapping from topic ID to its index in the _topicIds array (plus one)
    /// @dev Used for efficient removal from _topicIds array using swap-and-pop technique
    /// Value of 0 means the topic ID is not in the array, non-zero values represent (actualIndex + 1)
    mapping(uint256 topicId => uint256 indexPlusOne) private _topicIdIndex;

    // --- Custom Errors ---
    /// @notice Error thrown when attempting to register a topic scheme with an empty name
    error EmptyName();

    /// @notice Error thrown when attempting to register a topic scheme with an empty signature
    error EmptySignature();

    /// @notice Error thrown when attempting to register a topic scheme that already exists
    /// @param name The name that already exists
    error TopicSchemeAlreadyExists(string name);

    /// @notice Error thrown when attempting to operate on a topic scheme that doesn't exist
    /// @param topicId The topic ID that doesn't exist
    error TopicSchemeDoesNotExist(uint256 topicId);

    /// @notice Error thrown when attempting to operate on a topic scheme that doesn't exist by name
    /// @param name The name that doesn't exist
    error TopicSchemeDoesNotExistByName(string name);

    /// @notice Error thrown when a topic ID is not found in the enumeration array during removal
    /// @param topicId The topic ID that was not found
    error TopicIdNotFoundInArray(uint256 topicId);

    /// @notice Error thrown when attempting to update a topic scheme with the same signature
    /// @param name The name of the topic scheme being updated
    /// @param signature The signature that is already set
    error SignatureUnchanged(string name, string signature);

    /// @notice Error thrown when input arrays have mismatched lengths
    /// @param namesLength The length of the names array
    /// @param signaturesLength The length of the signatures array
    error ArrayLengthMismatch(uint256 namesLength, uint256 signaturesLength);

    /// @notice Error thrown when attempting batch operations with empty arrays
    error EmptyArraysProvided();

    // --- Constructor ---
    /// @notice Constructor for the ATKTopicSchemeRegistryImplementation
    /// @dev Initializes ERC2771Context with trusted forwarder and disables initializers for UUPS pattern
    /// @param trustedForwarder The address of the trusted forwarder for meta-transactions
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address trustedForwarder) ERC2771ContextUpgradeable(trustedForwarder) {
        _disableInitializers();
    }

    // --- Initializer ---
    /// @notice Initializes the ATKTopicSchemeRegistryImplementation contract
    /// @dev Sets up access control by configuring the system access manager
    /// @param systemAccessManager The address of the centralized system access manager
    /// @param initialAdmin The address that will receive admin and registrar roles
    /// @param initialRegistrars The addresses that will receive registrar roles
    function initialize(
        address systemAccessManager,
        address initialAdmin,
        address[] memory initialRegistrars
    )
        public
        initializer
    {
        __ERC165_init_unchained();

        // Set up the system access manager
        _setSystemAccessManager(systemAccessManager);

        // Note: We don't need to grant roles here since they will be managed by the access manager
    }

    // --- Topic Scheme Management Functions ---

    /// @inheritdoc ISMARTTopicSchemeRegistry
    function registerTopicScheme(
        string calldata name,
        string calldata signature
    )
        external
        override
        onlyManagerOrSystemModule(ATKSystemRoles.REGISTRAR_ROLE)
    {
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(signature).length == 0) revert EmptySignature();

        // Generate topicId from name
        uint256 topicId = uint256(keccak256(abi.encodePacked(name)));

        if (_topicSchemes[topicId].exists) revert TopicSchemeAlreadyExists(name);

        // Store the topic scheme
        _topicSchemes[topicId] = TopicScheme({ topicId: topicId, signature: signature, exists: true });

        // Add to enumeration array
        _topicIds.push(topicId);
        _topicIdIndex[topicId] = _topicIds.length; // Store index + 1

        emit TopicSchemeRegistered(_msgSender(), topicId, name, signature);
    }

    /// @inheritdoc ISMARTTopicSchemeRegistry
    function batchRegisterTopicSchemes(
        string[] calldata names,
        string[] calldata signatures
    )
        external
        override
        onlyManagerOrSystemModule(ATKSystemRoles.REGISTRAR_ROLE)
    {
        uint256 namesLength = names.length;
        uint256 signaturesLength = signatures.length;

        // Validate inputs
        if (namesLength == 0 || signaturesLength == 0) revert EmptyArraysProvided();
        if (namesLength != signaturesLength) revert ArrayLengthMismatch(namesLength, signaturesLength);

        // Create arrays for storing data
        uint256[] memory topicIds = new uint256[](namesLength);

        // Use local variables to avoid multiple storage reads
        mapping(uint256 => TopicScheme) storage topicSchemes_ = _topicSchemes;
        uint256[] storage topicIds_ = _topicIds;
        mapping(uint256 => uint256) storage topicIdIndex_ = _topicIdIndex;
        uint256 currentArrayLength = topicIds_.length;

        // Process each topic scheme
        for (uint256 i = 0; i < namesLength;) {
            string calldata name = names[i];
            string calldata signature = signatures[i];

            // Validate individual topic scheme
            if (bytes(name).length == 0) revert EmptyName();
            if (bytes(signature).length == 0) revert EmptySignature();

            // Generate topicId from name
            uint256 topicId = uint256(keccak256(abi.encodePacked(name)));
            topicIds[i] = topicId;

            if (topicSchemes_[topicId].exists) revert TopicSchemeAlreadyExists(name);

            // Store the topic scheme
            topicSchemes_[topicId] = TopicScheme({ topicId: topicId, signature: signature, exists: true });

            // Add to enumeration array
            topicIds_.push(topicId);
            currentArrayLength++;
            topicIdIndex_[topicId] = currentArrayLength; // Use cached length instead of reading from storage

            // Emit individual event for each registration
            emit TopicSchemeRegistered(_msgSender(), topicId, name, signature);

            unchecked {
                ++i;
            }
        }

        // Emit batch event
        emit TopicSchemesBatchRegistered(_msgSender(), topicIds, names, signatures);
    }

    /// @inheritdoc ISMARTTopicSchemeRegistry
    function updateTopicScheme(
        string calldata name,
        string calldata newSignature
    )
        external
        override
        onlyManagerOrSystemModule(ATKSystemRoles.REGISTRAR_ROLE)
    {
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(newSignature).length == 0) revert EmptySignature();

        // Generate topicId from name
        uint256 topicId = uint256(keccak256(abi.encodePacked(name)));

        if (!_topicSchemes[topicId].exists) revert TopicSchemeDoesNotExistByName(name);

        string memory oldSignature = _topicSchemes[topicId].signature;
        if (keccak256(bytes(oldSignature)) == keccak256(bytes(newSignature))) {
            revert SignatureUnchanged(name, newSignature);
        }

        _topicSchemes[topicId].signature = newSignature;

        emit TopicSchemeUpdated(_msgSender(), topicId, name, oldSignature, newSignature);
    }

    /// @inheritdoc ISMARTTopicSchemeRegistry
    function removeTopicScheme(string calldata name)
        external
        override
        onlyManagerOrSystemModule(ATKSystemRoles.REGISTRAR_ROLE)
    {
        if (bytes(name).length == 0) revert EmptyName();

        // Generate topicId from name
        uint256 topicId = uint256(keccak256(abi.encodePacked(name)));

        if (!_topicSchemes[topicId].exists) revert TopicSchemeDoesNotExistByName(name);

        // Remove from enumeration array using swap-and-pop
        _removeTopicIdFromArray(topicId);

        // Delete the topic scheme
        delete _topicSchemes[topicId];

        emit TopicSchemeRemoved(_msgSender(), topicId, name);
    }

    // --- View Functions ---

    /// @inheritdoc ISMARTTopicSchemeRegistry
    function hasTopicScheme(uint256 topicId) external view override returns (bool exists) {
        return _topicSchemes[topicId].exists;
    }

    /// @inheritdoc ISMARTTopicSchemeRegistry
    function hasTopicSchemeByName(string calldata name) external view override returns (bool exists) {
        uint256 topicId = uint256(keccak256(abi.encodePacked(name)));
        return _topicSchemes[topicId].exists;
    }

    /// @inheritdoc ISMARTTopicSchemeRegistry
    function getTopicSchemeSignature(uint256 topicId) external view override returns (string memory signature) {
        if (!_topicSchemes[topicId].exists) revert TopicSchemeDoesNotExist(topicId);
        return _topicSchemes[topicId].signature;
    }

    /// @inheritdoc ISMARTTopicSchemeRegistry
    function getTopicSchemeSignatureByName(string calldata name)
        external
        view
        override
        returns (string memory signature)
    {
        uint256 topicId = uint256(keccak256(abi.encodePacked(name)));
        if (!_topicSchemes[topicId].exists) revert TopicSchemeDoesNotExistByName(name);
        return _topicSchemes[topicId].signature;
    }

    /// @inheritdoc ISMARTTopicSchemeRegistry
    function getTopicId(string calldata name) external pure override returns (uint256 topicId) {
        return uint256(keccak256(abi.encodePacked(name)));
    }

    /// @inheritdoc ISMARTTopicSchemeRegistry
    function getAllTopicIds() external view override returns (uint256[] memory topicIds) {
        return _topicIds;
    }

    /// @inheritdoc ISMARTTopicSchemeRegistry
    function getTopicSchemeCount() external view override returns (uint256 count) {
        return _topicIds.length;
    }

    // --- Special Initialization Methods ---

    /// @notice Registers topic schemes during initialization without access control checks
    /// @dev To be used only during system bootstrap, should never be called directly by users
    /// @param names Array of topic scheme names
    /// @param signatures Array of topic scheme signatures
    function initializeTopicSchemes(string[] calldata names, string[] calldata signatures) external {
        // Check if this is called by the system contract via proxy
        // We don't need to do any validation as this is part of the bootstrap process

        uint256 namesLength = names.length;
        uint256 signaturesLength = signatures.length;

        // Validate inputs
        if (namesLength == 0 || signaturesLength == 0) revert EmptyArraysProvided();
        if (namesLength != signaturesLength) revert ArrayLengthMismatch(namesLength, signaturesLength);

        // Create arrays for storing data
        uint256[] memory topicIds = new uint256[](namesLength);

        // Use local variables to avoid multiple storage reads
        mapping(uint256 => TopicScheme) storage topicSchemes_ = _topicSchemes;
        uint256[] storage topicIds_ = _topicIds;
        mapping(uint256 => uint256) storage topicIdIndex_ = _topicIdIndex;
        uint256 currentArrayLength = topicIds_.length;

        // Process each topic scheme
        for (uint256 i = 0; i < namesLength;) {
            string calldata name = names[i];
            string calldata signature = signatures[i];

            // Validate individual topic scheme
            if (bytes(name).length == 0) revert EmptyName();
            if (bytes(signature).length == 0) revert EmptySignature();

            // Generate topicId from name
            uint256 topicId = uint256(keccak256(abi.encodePacked(name)));
            topicIds[i] = topicId;

            if (topicSchemes_[topicId].exists) revert TopicSchemeAlreadyExists(name);

            // Store the topic scheme
            topicSchemes_[topicId] = TopicScheme({ topicId: topicId, signature: signature, exists: true });

            // Add to enumeration array
            topicIds_.push(topicId);
            currentArrayLength++;
            topicIdIndex_[topicId] = currentArrayLength; // Use cached length instead of reading from storage

            // Emit individual event for each registration
            emit TopicSchemeRegistered(_msgSender(), topicId, name, signature);

            unchecked {
                ++i;
            }
        }

        // Emit batch event
        emit TopicSchemesBatchRegistered(_msgSender(), topicIds, names, signatures);
    }

    // --- Internal Helper Functions ---

    /// @notice Removes a topic ID from the enumeration array using swap-and-pop technique
    /// @dev This maintains array compactness by swapping the target element with the last element
    /// @param topicId The topic ID to remove from the array
    function _removeTopicIdFromArray(uint256 topicId) internal {
        // Get the index from the mapping (value is index + 1)
        uint256 indexPlusOne = _topicIdIndex[topicId];
        if (indexPlusOne == 0) revert TopicIdNotFoundInArray(topicId);

        uint256 index = indexPlusOne - 1;
        uint256 lastIndex = _topicIds.length - 1;

        if (index != lastIndex) {
            // If not the last element, swap with the last element
            uint256 lastTopicId = _topicIds[lastIndex];
            _topicIds[index] = lastTopicId;
            _topicIdIndex[lastTopicId] = index + 1; // Update index of swapped element
        }

        // Pop the last element and clean up the index mapping
        _topicIds.pop();
        delete _topicIdIndex[topicId];
    }

    /// @notice Implementation of the _msgSender() function to support meta-transactions
    function _msgSender() internal view override(ERC2771ContextUpgradeable) returns (address) {
        return ERC2771ContextUpgradeable._msgSender();
    }

    /// @notice Implementation of the _msgData() function to support meta-transactions
    function _msgData() internal view override(ERC2771ContextUpgradeable) returns (bytes calldata) {
        return ERC2771ContextUpgradeable._msgData();
    }

    /// @notice Returns whether the contract implements the given interface
    /// @dev Implements the IERC165 interface to support interface discovery
    /// @param interfaceId The interface identifier to check
    /// @return True if the contract implements the interface
    function supportsInterface(bytes4 interfaceId) public view override(ERC165Upgradeable, IERC165) returns (bool) {
        return interfaceId == type(ISMARTTopicSchemeRegistry).interfaceId
            || interfaceId == type(IATKTopicSchemeRegistry).interfaceId || super.supportsInterface(interfaceId);
    }
}
