// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { ATKSystemAccessControlled } from "../access-manager/ATKSystemAccessControlled.sol";
import { IATKSystemAccessManager } from "../access-manager/IATKSystemAccessManager.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { IATKSystem } from "../IATKSystem.sol";
import { IATKSystemAddonRegistry } from "./IATKSystemAddonRegistry.sol";
import {
    InvalidAddonAddress,
    SystemAddonTypeAlreadyRegistered,
    SystemAddonImplementationNotSet
} from "../ATKSystemErrors.sol";
import { ATKSystemRoles } from "../ATKSystemRoles.sol";
import { IATKTypedImplementationRegistry } from "../IATKTypedImplementationRegistry.sol";
import { ATKTypedImplementationProxy } from "../ATKTypedImplementationProxy.sol";

contract ATKSystemAddonRegistryImplementation is
    Initializable,
    IATKSystemAddonRegistry,
    IATKTypedImplementationRegistry,
    ATKSystemAccessControlled,
    ReentrancyGuardUpgradeable,
    ERC2771ContextUpgradeable
{
    IATKSystem private _system;

    mapping(bytes32 typeHash => address addonImplementationAddress) private addonImplementationsByType;
    mapping(bytes32 typeHash => address addonProxyAddress) private addonProxiesByType;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address trustedForwarder) ERC2771ContextUpgradeable(trustedForwarder) {
        _disableInitializers();
    }

    function initialize(
        address initialAdmin,
        address systemAddress,
        address systemAccessManager
    )
        public
        override
        initializer
    {
        __ReentrancyGuard_init();

        // Set the system access manager for centralized access control
        _setSystemAccessManager(systemAccessManager);

        // Note: Access control is now managed centrally through ATKSystemAccessManager
        // Roles are granted there instead of locally in this contract
        // Parameters are kept for interface compatibility but not used
        _system = IATKSystem(systemAddress);
    }

    function registerSystemAddon(
        string calldata name,
        address implementation_,
        bytes calldata initializationData
    )
        external
        override
        nonReentrant
        onlyRegistrar
        returns (address proxyAddress)
    {
        if (address(implementation_) == address(0)) revert InvalidAddonAddress();

        bytes32 addonTypeHash = keccak256(abi.encodePacked(name));

        if (addonImplementationsByType[addonTypeHash] != address(0)) {
            revert SystemAddonTypeAlreadyRegistered(name);
        }

        addonImplementationsByType[addonTypeHash] = implementation_;

        address _addonProxy = address(new ATKTypedImplementationProxy(address(this), addonTypeHash, initializationData));

        addonProxiesByType[addonTypeHash] = _addonProxy;

        // Grant the bypass list manager role to the new addon proxy
        // This allows the addon to manage bypass lists in the compliance module
        IATKSystemAccessManager(getSystemAccessManager()).grantRole(
            ATKSystemRoles.BYPASS_LIST_MANAGER_ROLE, _addonProxy
        );

        (bool success, bytes memory data) =
            _addonProxy.staticcall(abi.encodeWithSelector(bytes4(keccak256("typeId()"))));

        bytes32 typeId = bytes32(0);
        if (success && data.length == 32) {
            typeId = abi.decode(data, (bytes32));
        }

        emit SystemAddonRegistered(
            _msgSender(), name, typeId, _addonProxy, implementation_, initializationData, block.timestamp
        );

        return _addonProxy;
    }

    function setAddonImplementation(
        bytes32 addonTypeHash,
        address implementation_
    )
        public
        override
        onlyImplementationManager
    {
        if (implementation_ == address(0)) revert InvalidAddonAddress();
        if (addonImplementationsByType[addonTypeHash] == address(0)) {
            revert SystemAddonImplementationNotSet(addonTypeHash);
        }

        addonImplementationsByType[addonTypeHash] = implementation_;
        emit AddonImplementationUpdated(_msgSender(), addonTypeHash, implementation_);
    }

    function implementation(bytes32 addonTypeHash) public view override returns (address) {
        return addonImplementationsByType[addonTypeHash];
    }

    function addon(bytes32 addonTypeHash) public view override returns (address) {
        return addonProxiesByType[addonTypeHash];
    }

    function supportsInterface(bytes4 interfaceId) public view override(IERC165) returns (bool) {
        return interfaceId == type(IATKSystemAddonRegistry).interfaceId
            || interfaceId == type(IATKTypedImplementationRegistry).interfaceId
            || interfaceId == type(IAccessControl).interfaceId || interfaceId == type(IERC165).interfaceId;
    }

    function _msgSender() internal view override(ERC2771ContextUpgradeable) returns (address) {
        return ERC2771ContextUpgradeable._msgSender();
    }

    function _msgData() internal view override(ERC2771ContextUpgradeable) returns (bytes calldata) {
        return ERC2771ContextUpgradeable._msgData();
    }

    function _contextSuffixLength() internal view override(ERC2771ContextUpgradeable) returns (uint256) {
        return ERC2771ContextUpgradeable._contextSuffixLength();
    }

    // IAccessControl implementation - delegate to centralized system access manager
    function hasRole(
        bytes32 role,
        address account
    )
        public
        view
        override(ATKSystemAccessControlled, IAccessControl)
        returns (bool)
    {
        return ATKSystemAccessControlled.hasRole(role, account);
    }

    function getRoleAdmin(bytes32 role) external view override returns (bytes32) {
        return IATKSystemAccessManager(getSystemAccessManager()).getRoleAdmin(role);
    }

    function grantRole(bytes32 role, address account) external override {
        IATKSystemAccessManager(getSystemAccessManager()).grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account) external override {
        IATKSystemAccessManager(getSystemAccessManager()).revokeRole(role, account);
    }

    function renounceRole(bytes32 role, address callerConfirmation) external override {
        IATKSystemAccessManager(getSystemAccessManager()).renounceRole(role, callerConfirmation);
    }
}
