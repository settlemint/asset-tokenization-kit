// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Proxy } from "@openzeppelin/contracts/proxy/Proxy.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { StorageSlot } from "@openzeppelin/contracts/utils/StorageSlot.sol";
import { IATKSystem } from "./IATKSystem.sol";
import { InvalidSystemAddress, ETHTransfersNotAllowed, AddonImplementationNotSet } from "./ATKSystemErrors.sol";
import { ATKSystemProxy } from "./ATKSystemProxy.sol";

/// @title Proxy contract for ATK System Addon.
/// @notice This contract serves as a proxy to the ATK System Addon implementation,
/// allowing for upgradeability of the system addon logic.
/// It retrieves the implementation address from the IATKSystem contract.
contract ATKSystemAddonProxy is ATKSystemProxy {
    // keccak256("org.atk.contracts.proxy.ATKSystemAddonProxy.addonTypeHash")
    bytes32 private constant _ADDON_TYPE_HASH_SLOT = 0x00e3e0cec59b60132eea2c7a5f5ee6f561df7478627a471ef97f7437cc141bee;

    function _setAddonTypeHash(bytes32 addonTypeHash_) internal {
        StorageSlot.getBytes32Slot(_ADDON_TYPE_HASH_SLOT).value = addonTypeHash_;
    }

    function _getAddonTypeHash() internal view returns (bytes32) {
        return StorageSlot.getBytes32Slot(_ADDON_TYPE_HASH_SLOT).value;
    }

    /// @notice Constructor for the `ATKSystemAddonProxy`.
    /// @dev This function is called only once when the proxy contract is deployed.
    /// It performs critical setup steps:
    /// 1. Stores the `systemAddress` (handled by `ATKSystemProxy` constructor).
    /// 2. Retrieves the initial `ATKSystemAddonImplementation` address from the `IATKSystem` contract.
    /// 3. Ensures this retrieved implementation address is not the zero address.
    /// 4. Executes a `delegatecall` to the `initialize` function of the `ATKSystemAddonImplementation` contract
    ///    via `_performInitializationDelegatecall`.
    /// @param systemAddress The address of the `IATKSystem` contract.
    /// @param addonTypeHash The hash of the addon type.
    /// @param initializeData The encoded function call to initialize the proxy (e.g., abi.encodeWithSelector(...)).
    constructor(
        address systemAddress,
        bytes32 addonTypeHash,
        bytes memory initializeData
    )
        ATKSystemProxy(systemAddress)
    {
        _setAddonTypeHash(addonTypeHash);

        IATKSystem system_ = _getSystem();
        address implementation = _getSpecificImplementationAddress(system_);

        _performInitializationDelegatecall(implementation, initializeData);
    }

    /// @dev Retrieves the implementation address for the System Addon module from the `IATKSystem` contract.
    /// @dev Reverts with `AddonImplementationNotSet` if the implementation address is zero.
    /// @param system The `IATKSystem` contract instance.
    /// @return The address of the `ATKSystemAddonImplementation` contract.
    /// @inheritdoc ATKSystemProxy
    function _getSpecificImplementationAddress(IATKSystem system) internal view override returns (address) {
        bytes32 addonTypeHash = _getAddonTypeHash();
        address implementation = system.addonImplementation(addonTypeHash);
        if (implementation == address(0)) {
            revert AddonImplementationNotSet(addonTypeHash);
        }
        return implementation;
    }
}
