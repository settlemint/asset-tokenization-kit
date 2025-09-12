// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { ISMARTComplianceModule } from "../../smart/interface/ISMARTComplianceModule.sol";
import { IATKComplianceModuleRegistry } from "./IATKComplianceModuleRegistry.sol";
import {
    InvalidComplianceModuleAddress,
    ComplianceModuleAlreadyRegistered,
    InvalidImplementationInterface
} from "../ATKSystemErrors.sol";
import { ATKPeopleRoles } from "../ATKPeopleRoles.sol";
import { ATKSystemAccessManaged } from "../access-manager/ATKSystemAccessManaged.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { IATKSystemAccessManaged } from "../access-manager/IATKSystemAccessManaged.sol";
import { ATKSystemRoles } from "../ATKSystemRoles.sol";

/// @title ATKComplianceModuleRegistryImplementation
/// @author SettleMint
/// @notice Implementation contract for the ATK Compliance Module Registry
/// @dev This contract maintains a registry of approved compliance modules that can be used by
///      security tokens in the ATK ecosystem. Compliance modules implement various regulatory
///      requirements such as identity verification, country restrictions, and allowlisting.
///      Only modules supporting the ISMARTComplianceModule interface can be registered.
contract ATKComplianceModuleRegistryImplementation is
    Initializable,
    IATKComplianceModuleRegistry,
    ATKSystemAccessManaged,
    ReentrancyGuardUpgradeable,
    ERC2771ContextUpgradeable,
    ERC165Upgradeable
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
    /// @param accessManager The address of the access manager
    /// @dev Reverts if no initial admins are provided
    function initialize(address accessManager) public override initializer {
        __ATKSystemAccessManaged_init(accessManager);
        __ReentrancyGuard_init();
    }

    /// @notice Registers a new compliance module in the registry
    /// @param moduleAddress The address of the compliance module to register
    /// @dev The module must implement ISMARTComplianceModule interface and have a unique type ID
    function registerComplianceModule(address moduleAddress)
        external
        override
        nonReentrant
        onlySystemRoles2(ATKPeopleRoles.SYSTEM_MANAGER_ROLE, ATKSystemRoles.SYSTEM_MODULE_ROLE)
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
    function supportsInterface(bytes4 interfaceId) public view override(ERC165Upgradeable) returns (bool) {
        return interfaceId == type(IATKComplianceModuleRegistry).interfaceId
            || interfaceId == type(IATKSystemAccessManaged).interfaceId || super.supportsInterface(interfaceId);
    }

    /// @notice Returns the address of the current message sender
    /// @return The address of the message sender, accounting for meta-transactions
    /// @dev Overrides to use ERC2771 context for meta-transaction support
    function _msgSender() internal view override(ERC2771ContextUpgradeable, ATKSystemAccessManaged) returns (address) {
        return ERC2771ContextUpgradeable._msgSender();
    }
}
