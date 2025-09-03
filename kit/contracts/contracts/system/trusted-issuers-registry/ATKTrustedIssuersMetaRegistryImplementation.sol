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
import { ISMARTTrustedIssuersRegistry } from "../../smart/interface/ISMARTTrustedIssuersRegistry.sol";
import { IATKTrustedIssuersRegistry } from "./IATKTrustedIssuersRegistry.sol";
import { IATKTrustedIssuersMetaRegistry } from "./IATKTrustedIssuersMetaRegistry.sol";
import { IATKSystemAccessManaged } from "../access-manager/IATKSystemAccessManaged.sol";

// Constants
import { ATKPeopleRoles } from "../ATKPeopleRoles.sol";
import { ATKSystemRoles } from "../ATKSystemRoles.sol";

// Extensions
import { ATKSystemAccessManaged } from "../access-manager/ATKSystemAccessManaged.sol";

/// @title ATK Trusted Issuers Meta Registry Implementation
/// @author SettleMint
/// @notice Implementation contract for the registry-of-registries pattern that extends subject-aware
///         trusted issuers registry functionality for managing both system and contract-specific trusted issuers.
/// @dev This contract serves as a subject-aware meta-registry that:
///      - Extends ISMARTTrustedIssuersRegistry with subject-aware functionality
///      - Stores a system trusted issuers registry for system-wide issuers
///      - Maps contract addresses to their specific trusted issuers registries
///      - Provides aggregated subject-aware query functions for efficient validation
///      - Enables lightweight token implementations by centralizing registry management
///
///      Access Control:
///      - SYSTEM_MANAGER_ROLE: Can set system registry and manage system-level registries
///      - TOKEN_FACTORY_MODULE_ROLE: Can register contract-specific registries (for token creation)
///      - SYSTEM_MODULE_ROLE: Can set registries during system bootstrap
contract ATKTrustedIssuersMetaRegistryImplementation is
    Initializable,
    ERC165Upgradeable,
    ERC2771ContextUpgradeable,
    ATKSystemAccessManaged,
    IATKTrustedIssuersMetaRegistry
{
    // --- Storage Variables ---

    /// @notice The system trusted issuers registry that applies system-wide
    /// @dev This registry provides trusted issuers for all contracts unless overridden
    ///      by contract-specific registries. Can be address(0) if no system registry is set.
    ISMARTTrustedIssuersRegistry private _systemRegistry;

    /// @notice Mapping from contract addresses to their specific trusted issuers registries
    /// @dev Allows individual contracts (typically tokens) to have dedicated registries.
    ///      If a contract address maps to address(0), no specific registry is set.
    mapping(address => ISMARTTrustedIssuersRegistry registry) private _contractRegistries;

    // --- Errors ---

        /// @notice Error triggered when trying to use aggregation functions on meta-registry
    error MetaRegistryCannotProvideCompleteAnswer();

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
    /// @param systemRegistry The address of the system trusted issuers registry
    function initialize(address accessManager, address systemRegistry) public initializer {
        __ATKSystemAccessManaged_init(accessManager);
        __ERC165_init_unchained();
        _systemRegistry = ISMARTTrustedIssuersRegistry(systemRegistry);

        emit SystemRegistrySet(_msgSender(), address(0), systemRegistry);
    }

    // --- Registry Management Functions ---

    /// @notice Sets the system trusted issuers registry
    /// @dev Part of the meta-registry pattern - manages the system registry that applies to all contracts
    /// @param registry The address of the system trusted issuers registry (can be address(0) to remove)
    function setSystemRegistry(address registry)
        external
        onlySystemRoles3(
            ATKPeopleRoles.SYSTEM_MANAGER_ROLE,
            ATKSystemRoles.SYSTEM_MODULE_ROLE,
            ATKSystemRoles.TOKEN_FACTORY_MODULE_ROLE
        )
    {
        // registry can be address(0) to remove the system registry
        address oldRegistry = address(_systemRegistry);
        _systemRegistry = ISMARTTrustedIssuersRegistry(registry);

        emit SystemRegistrySet(_msgSender(), oldRegistry, registry);
    }

    /// @notice Sets a contract-specific trusted issuers registry
    /// @dev Part of the meta-registry pattern - manages contract-specific registries
    /// @param contractAddress The contract address to set the registry for
    /// @param registry The address of the trusted issuers registry for this contract (can be address(0) to remove)
    function setRegistryForContract(address contractAddress, address registry)
        external
        onlySystemRoles3(
            ATKPeopleRoles.SYSTEM_MANAGER_ROLE,
            ATKSystemRoles.SYSTEM_MODULE_ROLE,
            ATKSystemRoles.TOKEN_FACTORY_MODULE_ROLE
        )
    {
        if (contractAddress == address(0)) revert InvalidContractAddress();
        // registry can be address(0) to remove the contract-specific registry

        address oldRegistry = address(_contractRegistries[contractAddress]);
        _contractRegistries[contractAddress] = ISMARTTrustedIssuersRegistry(registry);

        emit ContractRegistrySet(_msgSender(), contractAddress, oldRegistry, registry);
    }

    /// @notice Removes a contract-specific trusted issuers registry
    /// @dev Convenience function that delegates to setRegistryForContract with address(0)
    /// @param contractAddress The contract address to remove the registry for
    function removeRegistryForContract(address contractAddress)
        external
        onlySystemRoles3(
            ATKPeopleRoles.SYSTEM_MANAGER_ROLE,
            ATKSystemRoles.SYSTEM_MODULE_ROLE,
            ATKSystemRoles.TOKEN_FACTORY_MODULE_ROLE
        )
    {
        // Delegate to setRegistryForContract with address(0) to remove the registry
        this.setRegistryForContract(contractAddress, address(0));
    }

    // --- Registry Getters ---

    /// @notice Gets the system trusted issuers registry
    /// @return The system trusted issuers registry address
    function getSystemRegistry() external view returns (ISMARTTrustedIssuersRegistry) {
        return _systemRegistry;
    }

    /// @notice Gets the contract-specific trusted issuers registry
    /// @param contractAddress The contract address to get the registry for
    /// @return The contract-specific trusted issuers registry address
    function getRegistryForContract(address contractAddress)
        external
        view
        returns (ISMARTTrustedIssuersRegistry)
    {
        return _contractRegistries[contractAddress];
    }

    // --- ISMARTTrustedIssuersRegistry Implementation ---

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function getTrustedIssuers(address _subject) external view returns (IClaimIssuer[] memory) {
        return _getTrustedIssuers(_subject);
    }

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function getTrustedIssuersForClaimTopic(address _subject, uint256 claimTopic)
        external
        view
        override
        returns (IClaimIssuer[] memory)
    {
        return _getTrustedIssuersForClaimTopic(_subject, claimTopic);
    }


    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function isTrustedIssuer(address _subject, address _issuer) external view override returns (bool) {
        return _isTrustedIssuer(_subject, _issuer);
    }

    /// @inheritdoc ISMARTTrustedIssuersRegistry
    function hasClaimTopic(address _subject, address _issuer, uint256 _claimTopic) external view override returns (bool) {
        return _hasClaimTopic(_subject, _issuer, _claimTopic);
    }

    // --- Internal Helper Functions ---

    function _getTrustedIssuers(address _subject) internal view returns (IClaimIssuer[] memory) {
        // If subject is address(0), only return system registry issuers (system-only verification)
        if (_subject == address(0)) {
            if (address(_systemRegistry) != address(0)) {
                return _systemRegistry.getTrustedIssuers(_subject);
            }
            return new IClaimIssuer[](0);
        }

        IClaimIssuer[] memory contractIssuers;
        IClaimIssuer[] memory systemIssuers;

        // Get issuers from contract-specific registry (using subject as the contract address)
        ISMARTTrustedIssuersRegistry contractRegistry = _contractRegistries[_subject];
        if (address(contractRegistry) != address(0)) {
            contractIssuers = contractRegistry.getTrustedIssuers(_subject);
        }

        // Get issuers from system registry
        if (address(_systemRegistry) != address(0)) {
            systemIssuers = _systemRegistry.getTrustedIssuers(_subject);
        }

        // Merge arrays and remove duplicates
        return _mergeIssuerArrays(contractIssuers, systemIssuers);
    }

    /// @notice Checks if an issuer is trusted for a given subject
    /// @dev Meta-registry implementation that checks both contract-specific and system registries.
    ///      For subject = address(0), only system registry is checked.
    ///      For other subjects, both registries are checked.
    /// @param subject The subject address to check
    /// @param _issuer The issuer address to check
    /// @return True if the issuer is trusted for the given subject, false otherwise
    function _isTrustedIssuer(address subject, address _issuer) internal view returns (bool) {
        // If subject is address(0), only check system registry (system-only verification)
        if (subject == address(0)) {
            if (address(_systemRegistry) != address(0)) {
                return _systemRegistry.isTrustedIssuer(subject, _issuer);
            }
            return false;
        }

        // First check contract-specific registry (using subject as the contract address)
        ISMARTTrustedIssuersRegistry contractRegistry = _contractRegistries[subject];
        if (address(contractRegistry) != address(0)) {
            if (contractRegistry.isTrustedIssuer(subject, _issuer)) {
                return true;
            }
        }

        // Then check system registry
        if (address(_systemRegistry) != address(0)) {
            return _systemRegistry.isTrustedIssuer(subject, _issuer);
        }

        return false;
    }

    /// @notice Checks if an issuer is trusted for a given subject and claim topic
    /// @param subject The subject address to check
    /// @param _issuer The issuer address to check
    /// @param _claimTopic The claim topic to check
    /// @return True if the issuer is trusted for the given subject and claim topic, false otherwise
    function _hasClaimTopic(address subject, address _issuer, uint256 _claimTopic) internal view returns (bool) {
        // If subject is address(0), only check system registry (system-only verification)
        if (subject == address(0)) {
            if (address(_systemRegistry) != address(0)) {
                return _systemRegistry.hasClaimTopic(subject, _issuer, _claimTopic);
            }
            return false;
        }

        // First check contract-specific registry (using subject as the contract address)
        ISMARTTrustedIssuersRegistry contractRegistry = _contractRegistries[subject];
        if (address(contractRegistry) != address(0)) {
            if (contractRegistry.hasClaimTopic(subject, _issuer, _claimTopic)) {
                return true;
            }
        }

        // Then check system registry
        if (address(_systemRegistry) != address(0)) {
            return _systemRegistry.hasClaimTopic(subject, _issuer, _claimTopic);
        }

        return false;
    }

    /// @notice Returns trusted issuers for a given subject and claim topic
    /// @param subject The subject address to check
    /// @param claimTopic The claim topic to check
    /// @return Array of trusted issuers for the given subject and claim topic
    /// @dev Meta-registry implementation that checks both contract-specific and system registries.
    ///      For subject = address(0), only system registry is checked.
    ///      For other subjects (identity contracts), both registries are checked and merged.
    function _getTrustedIssuersForClaimTopic(address subject, uint256 claimTopic)
        internal
        view
        returns (IClaimIssuer[] memory)
    {
        // If subject is address(0), only return system registry issuers (system-only verification)
        if (subject == address(0)) {
            if (address(_systemRegistry) != address(0)) {
                return _systemRegistry.getTrustedIssuersForClaimTopic(subject, claimTopic);
            }
            return new IClaimIssuer[](0);
        }

        IClaimIssuer[] memory contractIssuers;
        IClaimIssuer[] memory systemIssuers;

        // Get issuers from contract-specific registry (using subject as the contract address)
        ISMARTTrustedIssuersRegistry contractRegistry = _contractRegistries[subject];
        if (address(contractRegistry) != address(0)) {
            contractIssuers = contractRegistry.getTrustedIssuersForClaimTopic(subject, claimTopic);
        }

        // Get issuers from system registry
        if (address(_systemRegistry) != address(0)) {
            systemIssuers = _systemRegistry.getTrustedIssuersForClaimTopic(subject, claimTopic);
        }

        // Merge arrays and remove duplicates
        return _mergeIssuerArrays(contractIssuers, systemIssuers);
    }

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
            || interfaceId == type(IATKTrustedIssuersRegistry).interfaceId
            || interfaceId == type(ISMARTTrustedIssuersRegistry).interfaceId
            || interfaceId == type(IATKSystemAccessManaged).interfaceId
            || super.supportsInterface(interfaceId);
    }
}