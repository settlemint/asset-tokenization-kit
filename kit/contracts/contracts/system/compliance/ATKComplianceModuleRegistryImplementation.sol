// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { ISMARTComplianceModule } from "../../smart/interface/ISMARTComplianceModule.sol";
import { IATKComplianceModuleRegistry } from "./IATKComplianceModuleRegistry.sol";
import {
    InvalidComplianceModuleAddress,
    ComplianceModuleAlreadyRegistered,
    InvalidImplementationInterface
} from "../ATKSystemErrors.sol";

/**
 * @title ATKComplianceModuleRegistryImplementation
 * @author SettleMint
 * @notice Implementation contract for the ATK Compliance Module Registry
 * @dev This contract maintains a registry of approved compliance modules that can be used by
 *      security tokens in the ATK ecosystem. Compliance modules implement various regulatory
 *      requirements such as identity verification, country restrictions, and allowlisting.
 *      Only modules supporting the ISMARTComplianceModule interface can be registered.
 */
contract ATKComplianceModuleRegistryImplementation is
    Initializable,
    IATKComplianceModuleRegistry,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    ERC2771ContextUpgradeable
{
    mapping(bytes32 typeHash => address moduleAddress) private complianceModulesByType;

    bytes4 private constant _ISMART_COMPLIANCE_MODULE_ID = type(ISMARTComplianceModule).interfaceId;

    /// @notice Constructor that disables initializers and sets the trusted forwarder
    /// @param trustedForwarder The address of the trusted forwarder for meta-transactions
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address trustedForwarder) ERC2771ContextUpgradeable(trustedForwarder) {
        _disableInitializers();
    }

    /// @notice Initializes the compliance module registry with initial admin accounts
    /// @param initialAdmins Array of addresses to be granted the default admin role
    /// @dev Reverts if no initial admins are provided
    function initialize(address[] calldata initialAdmins) public override initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();

        if (initialAdmins.length == 0) {
            revert NoInitialAdmins();
        }

        for (uint256 i = 0; i < initialAdmins.length; ++i) {
            _grantRole(DEFAULT_ADMIN_ROLE, initialAdmins[i]);
        }
    }

    /// @notice Registers a new compliance module in the registry
    /// @param moduleAddress The address of the compliance module to register
    /// @dev The module must implement ISMARTComplianceModule interface and have a unique type ID
    function registerComplianceModule(address moduleAddress)
        external
        override
        nonReentrant
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (moduleAddress == address(0)) revert InvalidComplianceModuleAddress();
        _checkInterface(moduleAddress, _ISMART_COMPLIANCE_MODULE_ID);

        string memory name = ISMARTComplianceModule(moduleAddress).name();
        bytes32 moduleTypeHash = ISMARTComplianceModule(moduleAddress).typeId();

        if (complianceModulesByType[moduleTypeHash] != address(0)) {
            revert ComplianceModuleAlreadyRegistered(name);
        }

        complianceModulesByType[moduleTypeHash] = moduleAddress;

        emit ComplianceModuleRegistered(_msgSender(), name, moduleTypeHash, moduleAddress, block.timestamp);
    }

    /// @notice Returns the address of a compliance module by its type hash
    /// @param moduleTypeHash The type hash of the compliance module
    /// @return The address of the compliance module, or zero address if not registered
    function complianceModule(bytes32 moduleTypeHash) public view override returns (address) {
        return complianceModulesByType[moduleTypeHash];
    }

    /// @notice Checks if a contract implements the required interface
    /// @param implAddress The address of the contract to check
    /// @param interfaceId The interface ID to verify
    /// @dev Reverts if the contract doesn't implement the interface
    function _checkInterface(address implAddress, bytes4 interfaceId) private view {
        if (implAddress == address(0)) return;
        try IERC165(implAddress).supportsInterface(interfaceId) returns (bool supported) {
            if (!supported) {
                revert InvalidImplementationInterface(implAddress, interfaceId);
            }
        } catch {
            revert InvalidImplementationInterface(implAddress, interfaceId);
        }
    }

    /// @notice Checks if the contract supports a given interface
    /// @param interfaceId The interface identifier to check
    /// @return bool True if the interface is supported, false otherwise
    function supportsInterface(bytes4 interfaceId) public view override(AccessControlUpgradeable) returns (bool) {
        return interfaceId == type(IATKComplianceModuleRegistry).interfaceId || super.supportsInterface(interfaceId);
    }

    /// @notice Returns the address of the current message sender
    /// @return The address of the message sender, accounting for meta-transactions
    /// @dev Overrides to use ERC2771 context for meta-transaction support
    function _msgSender() internal view override(ContextUpgradeable, ERC2771ContextUpgradeable) returns (address) {
        return super._msgSender();
    }

    /// @notice Returns the length of the context suffix for meta-transactions
    /// @return The length of the context suffix
    /// @dev Overrides to use ERC2771 context for meta-transaction support
    function _contextSuffixLength()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return super._contextSuffixLength();
    }

    /// @notice Returns the calldata of the current transaction
    /// @return The calldata, accounting for meta-transactions
    /// @dev Overrides to use ERC2771 context for meta-transaction support
    function _msgData()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return super._msgData();
    }
}
