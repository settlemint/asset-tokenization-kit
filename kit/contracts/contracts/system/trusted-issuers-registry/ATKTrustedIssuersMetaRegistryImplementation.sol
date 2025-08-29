// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// OnchainID imports
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";

// Interface imports
import { IERC3643TrustedIssuersRegistry } from "../../smart/interface/ERC-3643/IERC3643TrustedIssuersRegistry.sol";
import { IATKTrustedIssuersMetaRegistry } from "./IATKTrustedIssuersMetaRegistry.sol";
import { IATKSystemAccessManaged } from "../access-manager/IATKSystemAccessManaged.sol";

// Constants
import { ATKPeopleRoles } from "../ATKPeopleRoles.sol";
import { ATKSystemRoles } from "../ATKSystemRoles.sol";

// Extensions
import { ATKSystemAccessManaged } from "../access-manager/ATKSystemAccessManaged.sol";

/// @title ATK Trusted Issuers Meta Registry Implementation
/// @author SettleMint
/// @notice Implementation contract for the registry-of-registries pattern that manages both
///         global and contract-specific trusted issuers registries.
/// @dev This contract serves as a meta-registry that:
///      - Stores a global trusted issuers registry for system-wide issuers
///      - Maps contract addresses to their specific trusted issuers registries
///      - Provides aggregated query functions for efficient trusted issuer validation
///      - Enables lightweight token implementations by centralizing registry management
///
///      Access Control:
///      - SYSTEM_MANAGER_ROLE: Can set global registry and manage system-level registries
///      - TOKEN_FACTORY_REGISTRY_MODULE_ROLE: Can register contract-specific registries (for token creation)
///      - SYSTEM_MODULE_ROLE: Can set registries during system bootstrap
contract ATKTrustedIssuersMetaRegistryImplementation is
    Initializable,
    ERC165Upgradeable,
    ERC2771ContextUpgradeable,
    ATKSystemAccessManaged,
    IATKTrustedIssuersMetaRegistry
{
    // --- Storage Variables ---

    /// @notice The global trusted issuers registry that applies system-wide
    /// @dev This registry provides trusted issuers for all contracts unless overridden
    ///      by contract-specific registries. Can be address(0) if no global registry is set.
    IERC3643TrustedIssuersRegistry private _globalRegistry;

    /// @notice Mapping from contract addresses to their specific trusted issuers registries
    /// @dev Allows individual contracts (typically tokens) to have dedicated registries.
    ///      If a contract address maps to address(0), no specific registry is set.
    mapping(address => IERC3643TrustedIssuersRegistry registry) private _contractRegistries;

    // --- Errors ---

    /// @notice Error triggered when attempting to set a registry to an invalid address
    /// @param registry The invalid registry address
    error InvalidRegistryAddress(address registry);

    /// @notice Error triggered when attempting to set a registry for the zero address
    error InvalidContractAddress();

    // --- Constructor ---

    /// @notice Constructor for the ATKTrustedIssuersMetaRegistryImplementation
    /// @dev Initializes ERC2771ContextUpgradeable and disables initializers to prevent
    ///      direct initialization on the implementation contract
    /// @param trustedForwarder The address of the trusted forwarder for meta-transactions
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address trustedForwarder) ERC2771ContextUpgradeable(trustedForwarder) {
        _disableInitializers();
    }

    // --- Initializer ---

    /// @notice Initializes the ATKTrustedIssuersMetaRegistryImplementation contract
    /// @dev This function acts as the constructor for the upgradeable contract and can only be called once.
    ///      Initializes all parent contracts and sets up access management.
    /// @param accessManager The address of the access manager for role-based permissions
    function initialize(address accessManager) public initializer {
        __ATKSystemAccessManaged_init(accessManager);
        __ERC165_init_unchained();
    }

    // --- Registry Management Functions ---

    /// @inheritdoc IATKTrustedIssuersMetaRegistry
    function setGlobalRegistry(address registry)
        external
        override
        onlySystemRoles3(
            ATKPeopleRoles.SYSTEM_MANAGER_ROLE,
            ATKSystemRoles.SYSTEM_MODULE_ROLE,
            ATKSystemRoles.TOKEN_FACTORY_REGISTRY_MODULE_ROLE
        )
    {
        // registry can be address(0) to remove the global registry
        address oldRegistry = address(_globalRegistry);
        _globalRegistry = IERC3643TrustedIssuersRegistry(registry);

        emit GlobalRegistrySet(_msgSender(), oldRegistry, registry);
    }

    /// @inheritdoc IATKTrustedIssuersMetaRegistry
    function setRegistryForContract(address contractAddress, address registry)
        external
        override
        onlySystemRoles3(
            ATKPeopleRoles.SYSTEM_MANAGER_ROLE,
            ATKSystemRoles.SYSTEM_MODULE_ROLE,
            ATKSystemRoles.TOKEN_FACTORY_REGISTRY_MODULE_ROLE
        )
    {
        if (contractAddress == address(0)) revert InvalidContractAddress();
        // registry can be address(0) to remove the contract-specific registry

        address oldRegistry = address(_contractRegistries[contractAddress]);
        _contractRegistries[contractAddress] = IERC3643TrustedIssuersRegistry(registry);

        emit ContractRegistrySet(_msgSender(), contractAddress, oldRegistry, registry);
    }

    // --- Registry Getters ---

    /// @inheritdoc IATKTrustedIssuersMetaRegistry
    function getGlobalRegistry() external view override returns (IERC3643TrustedIssuersRegistry) {
        return _globalRegistry;
    }

    /// @inheritdoc IATKTrustedIssuersMetaRegistry
    function getRegistryForContract(address contractAddress)
        external
        view
        override
        returns (IERC3643TrustedIssuersRegistry)
    {
        return _contractRegistries[contractAddress];
    }

    // --- Aggregated Query Functions ---

    /// @inheritdoc IATKTrustedIssuersMetaRegistry
    function isTrustedIssuerForContract(address contractAddress, address issuer)
        external
        view
        override
        returns (bool)
    {
        // First check contract-specific registry
        IERC3643TrustedIssuersRegistry contractRegistry = _contractRegistries[contractAddress];
        if (address(contractRegistry) != address(0)) {
            if (contractRegistry.isTrustedIssuer(issuer)) {
                return true;
            }
        }

        // Then check global registry
        if (address(_globalRegistry) != address(0)) {
            return _globalRegistry.isTrustedIssuer(issuer);
        }

        return false;
    }

    /// @inheritdoc IATKTrustedIssuersMetaRegistry
    function getTrustedIssuersForClaimTopicAndContract(
        address contractAddress,
        uint256 claimTopic
    ) external view override returns (IClaimIssuer[] memory) {
        IClaimIssuer[] memory contractIssuers;
        IClaimIssuer[] memory globalIssuers;

        // Get issuers from contract-specific registry
        IERC3643TrustedIssuersRegistry contractRegistry = _contractRegistries[contractAddress];
        if (address(contractRegistry) != address(0)) {
            contractIssuers = contractRegistry.getTrustedIssuersForClaimTopic(claimTopic);
        }

        // Get issuers from global registry
        if (address(_globalRegistry) != address(0)) {
            globalIssuers = _globalRegistry.getTrustedIssuersForClaimTopic(claimTopic);
        }

        // Merge arrays and remove duplicates
        return _mergeIssuerArrays(contractIssuers, globalIssuers);
    }

    /// @inheritdoc IATKTrustedIssuersMetaRegistry
    function hasClaimTopicForContract(
        address contractAddress,
        address issuer,
        uint256 claimTopic
    ) external view override returns (bool) {
        // First check contract-specific registry
        IERC3643TrustedIssuersRegistry contractRegistry = _contractRegistries[contractAddress];
        if (address(contractRegistry) != address(0)) {
            if (contractRegistry.hasClaimTopic(issuer, claimTopic)) {
                return true;
            }
        }

        // Then check global registry
        if (address(_globalRegistry) != address(0)) {
            return _globalRegistry.hasClaimTopic(issuer, claimTopic);
        }

        return false;
    }

    // --- Internal Helper Functions ---

    /// @notice Merges two arrays of IClaimIssuer addresses and removes duplicates
    /// @dev Uses a simple O(n²) algorithm suitable for the expected small array sizes in practice
    /// @param array1 First array of claim issuers
    /// @param array2 Second array of claim issuers
    /// @return merged Array containing unique issuers from both input arrays
    function _mergeIssuerArrays(
        IClaimIssuer[] memory array1,
        IClaimIssuer[] memory array2
    ) internal pure returns (IClaimIssuer[] memory merged) {
        uint256 array1Length = array1.length;
        uint256 array2Length = array2.length;

        // Handle edge cases
        if (array1Length == 0) return array2;
        if (array2Length == 0) return array1;

        // Create temporary array with maximum possible size
        IClaimIssuer[] memory temp = new IClaimIssuer[](array1Length + array2Length);
        uint256 mergedLength = 0;

        // Add all issuers from array1
        for (uint256 i = 0; i < array1Length;) {
            temp[mergedLength] = array1[i];
            mergedLength++;
            unchecked { ++i; }
        }

        // Add issuers from array2 that are not already in the merged array
        for (uint256 i = 0; i < array2Length;) {
            bool isDuplicate = false;
            for (uint256 j = 0; j < mergedLength;) {
                if (temp[j] == array2[i]) {
                    isDuplicate = true;
                    break;
                }
                unchecked { ++j; }
            }

            if (!isDuplicate) {
                temp[mergedLength] = array2[i];
                mergedLength++;
            }
            unchecked { ++i; }
        }

        // Create final array with correct size
        merged = new IClaimIssuer[](mergedLength);
        for (uint256 i = 0; i < mergedLength;) {
            merged[i] = temp[i];
            unchecked { ++i; }
        }

        return merged;
    }

    // --- Context Overrides (ERC2771 for meta-transactions) ---

    /// @notice Provides the actual sender of a transaction, supporting meta-transactions via ERC2771
    /// @dev Overrides both ContextUpgradeable and ERC2771ContextUpgradeable implementations
    /// @return The address of the original transaction sender
    function _msgSender()
        internal
        view
        virtual
        override(ERC2771ContextUpgradeable, ATKSystemAccessManaged)
        returns (address)
    {
        return ERC2771ContextUpgradeable._msgSender();
    }

    /// @inheritdoc IERC165
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Upgradeable, IERC165)
        returns (bool)
    {
        return interfaceId == type(IATKTrustedIssuersMetaRegistry).interfaceId
            || interfaceId == type(IATKSystemAccessManaged).interfaceId
            || super.supportsInterface(interfaceId);
    }
}