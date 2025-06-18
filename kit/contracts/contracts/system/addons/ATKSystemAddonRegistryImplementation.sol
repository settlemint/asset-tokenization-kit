// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import { IATKSystem } from "../IATKSystem.sol";
import { IATKSystemAddonRegistry } from "./IATKSystemAddonRegistry.sol";
import { InvalidAddonAddress, AddonTypeAlreadyRegistered, AddonImplementationNotSet } from "../ATKSystemErrors.sol";
import { ATKSystemRoles } from "../ATKSystemRoles.sol";
import { IATKTypedImplementationRegistry } from "../IATKTypedImplementationRegistry.sol";
import { ATKTypedImplementationProxy } from "../ATKTypedImplementationProxy.sol";

contract ATKSystemAddonRegistryImplementation is
    Initializable,
    IATKSystemAddonRegistry,
    IATKTypedImplementationRegistry,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable
{
    IATKSystem private _system;

    mapping(bytes32 typeHash => address addonImplementationAddress) private addonImplementationsByType;
    mapping(bytes32 typeHash => address addonProxyAddress) private addonProxiesByType;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialAdmin, address systemAddress) public override initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _system = IATKSystem(systemAddress);
    }

    function createSystemAddon(
        string calldata name,
        address implementation_,
        bytes calldata initializationData
    )
        external
        override
        nonReentrant
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (address proxyAddress)
    {
        if (address(implementation_) == address(0)) revert InvalidAddonAddress();

        bytes32 addonTypeHash = keccak256(abi.encodePacked(name));

        if (addonImplementationsByType[addonTypeHash] != address(0)) {
            revert AddonTypeAlreadyRegistered(name);
        }

        addonImplementationsByType[addonTypeHash] = implementation_;

        address _addonProxy = address(new ATKTypedImplementationProxy(address(this), addonTypeHash, initializationData));

        addonProxiesByType[addonTypeHash] = _addonProxy;

        IAccessControl(address(_system.complianceProxy())).grantRole(
            ATKSystemRoles.BYPASS_LIST_MANAGER_ROLE, _addonProxy
        );

        (bool success, bytes memory data) =
            _addonProxy.staticcall(abi.encodeWithSelector(bytes4(keccak256("typeId()"))));

        bytes32 typeId = bytes32(0);
        if (success && data.length == 32) {
            typeId = abi.decode(data, (bytes32));
        }

        emit SystemAddonCreated(
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
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (implementation_ == address(0)) revert InvalidAddonAddress();
        if (addonImplementationsByType[addonTypeHash] == address(0)) revert AddonImplementationNotSet(addonTypeHash);

        addonImplementationsByType[addonTypeHash] = implementation_;
        emit AddonImplementationUpdated(_msgSender(), addonTypeHash, implementation_);
    }

    function implementation(bytes32 addonTypeHash) public view override returns (address) {
        return addonImplementationsByType[addonTypeHash];
    }

    function addonProxy(bytes32 addonTypeHash) public view override returns (address) {
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
}
