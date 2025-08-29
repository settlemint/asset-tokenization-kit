// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { AbstractATKSystemProxy } from "../../AbstractATKSystemProxy.sol";
import { IATKSystem } from "../../IATKSystem.sol";
import { ATKTokenAccessManagerImplementation } from "./ATKTokenAccessManagerImplementation.sol";
import { TokenAccessManagerImplementationNotSet } from "../../ATKSystemErrors.sol";

/// @title ATK Token Access Manager Proxy Contract
/// @author SettleMint
/// @notice This contract acts as an upgradeable proxy for the `ATKTokenAccessManagerImplementation`.
/// @dev It follows the EIP-1967 standard for upgradeable proxies. This means that this contract (the proxy)
///      holds the storage and the public address that users interact with, while the logic (code execution)
///      is delegated to a separate implementation contract (`ATKTokenAccessManagerImplementation`).
///      The address of the current implementation contract is retrieved dynamically from the `IATKSystem` contract.
///      This allows the underlying token access manager logic to be upgraded without changing the proxy's address or
/// losing its state.
///      Inherits from `ATKSystemProxy`.
contract ATKTokenAccessManagerProxy is AbstractATKSystemProxy {
    /// @notice Constructor for the `ATKTokenAccessManagerProxy`.
    /// @dev This function is called only once when the proxy contract is deployed.
    /// It performs critical setup steps:
    /// 1. Stores the `systemAddress` (handled by `ATKSystemProxy` constructor).
    /// 2. Retrieves the initial `ATKTokenAccessManagerImplementation` address from the `IATKSystem` contract.
    /// 3. Ensures this retrieved implementation address is not the zero address.
    /// 4. Executes a `delegatecall` to the `initialize` function of the `ATKTokenAccessManagerImplementation`
    /// contract
    ///    via `_performInitializationDelegatecall`.
    /// @param systemAddress The address of the `IATKSystem` contract.
    /// @param initialAdmins The addresses that will be granted initial administrative privileges.
    constructor(address systemAddress, address[] memory initialAdmins) AbstractATKSystemProxy(systemAddress) {
        IATKSystem system_ = _getSystem();

        address implementation = _getSpecificImplementationAddress(system_);
        bytes memory data =
            abi.encodeWithSelector(ATKTokenAccessManagerImplementation.initialize.selector, initialAdmins);

        _performInitializationDelegatecall(implementation, data);
    }

    /// @notice Gets the specific implementation address for the token access manager proxy
    /// @dev Retrieves the implementation address for the Token Access Manager module from the `IATKSystem` contract.
    /// @dev Reverts with `TokenAccessManagerImplementationNotSet` if the implementation address is zero.
    /// @param system The `IATKSystem` contract instance.
    /// @return The address of the `ATKTokenAccessManagerImplementation` contract.
    /// @inheritdoc AbstractATKSystemProxy
    function _getSpecificImplementationAddress(IATKSystem system) internal view override returns (address) {
        address implementation = system.tokenAccessManagerImplementation();
        if (implementation == address(0)) {
            revert TokenAccessManagerImplementationNotSet();
        }
        return implementation;
    }
}
