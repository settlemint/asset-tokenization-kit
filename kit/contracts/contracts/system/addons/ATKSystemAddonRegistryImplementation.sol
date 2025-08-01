// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { IATKSystem } from "../IATKSystem.sol";
import { IATKSystemAddonRegistry } from "./IATKSystemAddonRegistry.sol";
import {
    InvalidAddonAddress,
    SystemAddonTypeAlreadyRegistered,
    SystemAddonImplementationNotSet
} from "../ATKSystemErrors.sol";
import { ATKPeopleRoles } from "../ATKPeopleRoles.sol";
import { ATKSystemRoles } from "../ATKSystemRoles.sol";
import { IATKTypedImplementationRegistry } from "../IATKTypedImplementationRegistry.sol";
import { ATKTypedImplementationProxy } from "../ATKTypedImplementationProxy.sol";
import { ATKSystemAccessManaged } from "../access-manager/ATKSystemAccessManaged.sol";
import { IATKSystemAccessManager } from "../access-manager/IATKSystemAccessManager.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { IATKSystemAccessManaged } from "../access-manager/IATKSystemAccessManaged.sol";

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
    ATKSystemAccessManaged,
    ReentrancyGuardUpgradeable,
    ERC2771ContextUpgradeable,
    ERC165Upgradeable
{
    IATKSystem private _system;

    mapping(bytes32 typeHash => address addonImplementationAddress) private addonImplementationsByType;
    mapping(bytes32 typeHash => address addonProxyAddress) private addonProxiesByType;

    /// @notice Constructor that disables initializers and sets the trusted forwarder
    /// @param trustedForwarder The address of the trusted forwarder for meta-transactions
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address trustedForwarder) ERC2771ContextUpgradeable(trustedForwarder) {
        _disableInitializers();
    }

    /// @notice Initializes the addon registry with initial admin and system address
    /// @param accessManager The address of the access manager
    /// @param systemAddress The address of the ATK system contract
    function initialize(address accessManager, address systemAddress) public override initializer {
        __ATKSystemAccessManaged_init(accessManager);
        __ReentrancyGuard_init();

        _system = IATKSystem(systemAddress);
    }

    /// @notice Registers a new system addon with the registry
    /// @param name The unique name identifier for the addon
    /// @param implementation_ The implementation contract address for the addon
    /// @param initializationData The initialization data to pass to the addon proxy
    /// @return proxyAddress The address of the newly created addon proxy
    /// @dev Creates a new proxy for the addon and grants necessary roles
    function registerSystemAddon(
        string calldata name,
        address implementation_,
        bytes calldata initializationData
    )
        external
        override
        nonReentrant
        onlySystemRole(ATKPeopleRoles.SYSTEM_MANAGER_ROLE)
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

        IATKSystemAccessManager(_accessManager).grantRole(ATKSystemRoles.ADDON_FACTORY_MODULE_ROLE, _addonProxy);

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

    /// @notice Updates the implementation address for an existing addon type
    /// @param addonTypeHash The type hash of the addon to update
    /// @param implementation_ The new implementation contract address
    /// @dev Can only be called by accounts with IMPLEMENTATION_MANAGER_ROLE
    function setAddonImplementation(
        bytes32 addonTypeHash,
        address implementation_
    )
        public
        override
        onlySystemRole(ATKPeopleRoles.SYSTEM_MANAGER_ROLE)
    {
        if (implementation_ == address(0)) revert InvalidAddonAddress();
        if (addonImplementationsByType[addonTypeHash] == address(0)) {
            revert SystemAddonImplementationNotSet(addonTypeHash);
        }

        addonImplementationsByType[addonTypeHash] = implementation_;
        emit AddonImplementationUpdated(_msgSender(), addonTypeHash, implementation_);
    }

    /// @notice Returns the implementation address for a given addon type
    /// @param addonTypeHash The type hash of the addon
    /// @return The address of the implementation contract
    function implementation(bytes32 addonTypeHash) public view override returns (address) {
        return addonImplementationsByType[addonTypeHash];
    }

    /// @notice Returns the proxy address for a given addon type
    /// @param addonTypeHash The type hash of the addon
    /// @return The address of the addon proxy contract
    function addon(bytes32 addonTypeHash) public view override returns (address) {
        return addonProxiesByType[addonTypeHash];
    }

    /// @notice Checks if the contract supports a given interface
    /// @param interfaceId The interface identifier to check
    /// @return bool True if the interface is supported, false otherwise
    function supportsInterface(bytes4 interfaceId) public view override(ERC165Upgradeable, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId) || interfaceId == type(IATKSystemAddonRegistry).interfaceId
            || interfaceId == type(IATKTypedImplementationRegistry).interfaceId
            || interfaceId == type(IATKSystemAccessManaged).interfaceId;
    }

    /// @notice Returns the address of the current message sender
    /// @return The address of the message sender, accounting for meta-transactions
    /// @dev Overrides to use ERC2771 context for meta-transaction support
    function _msgSender() internal view override(ERC2771ContextUpgradeable, ATKSystemAccessManaged) returns (address) {
        return ERC2771ContextUpgradeable._msgSender();
    }
}
