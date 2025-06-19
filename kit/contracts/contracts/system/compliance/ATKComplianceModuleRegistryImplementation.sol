// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { ISMARTComplianceModule } from "../../smart/interface/ISMARTComplianceModule.sol";
import { IATKSystem } from "../IATKSystem.sol";
import { IATKComplianceModuleRegistry } from "./IATKComplianceModuleRegistry.sol";
import {
    InvalidComplianceModuleAddress,
    ComplianceModuleAlreadyRegistered,
    InvalidImplementationInterface
} from "../ATKSystemErrors.sol";

contract ATKComplianceModuleRegistryImplementation is
    Initializable,
    IATKComplianceModuleRegistry,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    ERC2771ContextUpgradeable
{
    mapping(bytes32 typeHash => address moduleAddress) private complianceModulesByType;

    bytes4 private constant _ISMART_COMPLIANCE_MODULE_ID = type(ISMARTComplianceModule).interfaceId;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address trustedForwarder) ERC2771ContextUpgradeable(trustedForwarder) {
        _disableInitializers();
    }

    function initialize(address initialAdmin) public override initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
    }

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

    function complianceModule(bytes32 moduleTypeHash) public view override returns (address) {
        return complianceModulesByType[moduleTypeHash];
    }

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

    function supportsInterface(bytes4 interfaceId) public view override(AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _msgSender() internal view override(ContextUpgradeable, ERC2771ContextUpgradeable) returns (address) {
        return super._msgSender();
    }

    function _contextSuffixLength()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return super._contextSuffixLength();
    }

    function _msgData()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return super._msgData();
    }
}
