// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
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

/**
 * @title ATKSystemAddonRegistryImplementation
 * @author SettleMint
 * @notice Implementation contract for the ATK System Addon Registry
 * @dev This contract manages the registration and deployment of system addons, which are
 *      supplementary modules that extend the core ATK system functionality. It handles
 *      the creation of proxy contracts for each addon and maintains a registry of addon
 *      implementations that can be upgraded by authorized parties.
 */
contract ATKSystemAddonRegistryImplementation is
    Initializable,
    IATKSystemAddonRegistry,
    IATKTypedImplementationRegistry,
    AccessControlUpgradeable,
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

    function initialize(address initialAdmin, address systemAddress) public override initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(ATKSystemRoles.REGISTRAR_ROLE, initialAdmin);
        _grantRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE, initialAdmin);
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
        onlyRole(ATKSystemRoles.REGISTRAR_ROLE)
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

        IAccessControl(address(_system.compliance())).grantRole(ATKSystemRoles.BYPASS_LIST_MANAGER_ROLE, _addonProxy);
        IAccessControl(address(_system.identityRegistry())).grantRole(ATKSystemRoles.REGISTRAR_ROLE, _addonProxy);

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
        onlyRole(ATKSystemRoles.IMPLEMENTATION_MANAGER_ROLE)
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

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControlUpgradeable, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId) || interfaceId == type(IATKSystemAddonRegistry).interfaceId
            || interfaceId == type(IATKTypedImplementationRegistry).interfaceId;
    }

    function _msgSender() internal view override(ContextUpgradeable, ERC2771ContextUpgradeable) returns (address) {
        return super._msgSender();
    }

    function _msgData()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return super._msgData();
    }

    function _contextSuffixLength()
        internal
        view
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return super._contextSuffixLength();
    }
}
