// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ATKSystemProxy } from "../ATKSystemProxy.sol";
import { IATKSystem } from "../IATKSystem.sol";
import { ATKIdentityFactoryImplementation } from "./ATKIdentityFactoryImplementation.sol";
import { IdentityFactoryImplementationNotSet } from "../ATKSystemErrors.sol";

/// @title ATK Identity Factory Proxy Contract
/// @author SettleMint Tokenization Services
/// @notice This contract acts as an upgradeable proxy for the `ATKIdentityFactoryImplementation`.
/// @dev It follows the EIP-1967 standard for upgradeable proxies. This means that this contract (the proxy)
///      holds the storage and the public address that users interact with, while the logic (code execution)
///      is delegated to a separate implementation contract (`ATKIdentityFactoryImplementation`).
///      The address of the current implementation contract is retrieved dynamically from the `IATKSystem` contract.
///      This allows the underlying identity factory logic to be upgraded without changing the proxy's address or losing
/// its state.
///      Inherits from `ATKSystemProxy`.
contract ATKIdentityFactoryProxy is ATKSystemProxy {
    /// @notice Constructor for the `ATKIdentityFactoryProxy`.
    /// @dev This function is called only once when the proxy contract is deployed.
    /// It performs critical setup steps:
    /// 1. Stores the `systemAddress` (handled by `ATKSystemProxy` constructor).
    /// 2. Retrieves the initial `ATKIdentityFactoryImplementation` address from the `IATKSystem` contract.
    /// 3. Ensures this retrieved implementation address is not the zero address.
    /// 4. Executes a `delegatecall` to the `initialize` function of the `ATKIdentityFactoryImplementation` contract
    ///    via `_performInitializationDelegatecall`.
    /// @param systemAddress The address of the `IATKSystem` contract.
    /// @param initialAdmin The address that will be granted initial administrative privileges.
    constructor(address systemAddress, address initialAdmin) ATKSystemProxy(systemAddress) {
        IATKSystem system_ = _getSystem();
        address implementation = _getSpecificImplementationAddress(system_);

        bytes memory data =
            abi.encodeWithSelector(ATKIdentityFactoryImplementation.initialize.selector, systemAddress, initialAdmin);

        _performInitializationDelegatecall(implementation, data);
    }

    /// @dev Retrieves the implementation address for the Identity Factory module from the `IATKSystem` contract.
    /// @dev Reverts with `IdentityFactoryImplementationNotSet` if the implementation address is zero.
    /// @param system The `IATKSystem` contract instance.
    /// @return The address of the `ATKIdentityFactoryImplementation` contract.
    /// @inheritdoc ATKSystemProxy
    function _getSpecificImplementationAddress(IATKSystem system) internal view override returns (address) {
        address implementation = system.identityFactoryImplementation();
        if (implementation == address(0)) {
            revert IdentityFactoryImplementationNotSet();
        }
        return implementation;
    }
}
