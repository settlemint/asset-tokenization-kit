// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { SMARTSystemProxy } from "../SMARTSystemProxy.sol";
import { ISMARTSystem } from "../ISMARTSystem.sol";
import { SMARTTokenAccessManagerImplementation } from "./SMARTTokenAccessManagerImplementation.sol";
import { TokenAccessManagerImplementationNotSet } from "../SMARTSystemErrors.sol";

/// @title SMART Token Access Manager Proxy Contract
/// @author SettleMint Tokenization Services
/// @notice This contract acts as an upgradeable proxy for the `SMARTTokenAccessManagerImplementation`.
/// @dev It follows the EIP-1967 standard for upgradeable proxies. This means that this contract (the proxy)
///      holds the storage and the public address that users interact with, while the logic (code execution)
///      is delegated to a separate implementation contract (`SMARTTokenAccessManagerImplementation`).
///      The address of the current implementation contract is retrieved dynamically from the `ISMARTSystem` contract.
///      This allows the underlying token access manager logic to be upgraded without changing the proxy's address or
/// losing its state.
///      Inherits from `SMARTSystemProxy`.
contract SMARTTokenAccessManagerProxy is SMARTSystemProxy {
    /// @notice Constructor for the `SMARTTokenAccessManagerProxy`.
    /// @dev This function is called only once when the proxy contract is deployed.
    /// It performs critical setup steps:
    /// 1. Stores the `systemAddress` (handled by `SMARTSystemProxy` constructor).
    /// 2. Retrieves the initial `SMARTTokenAccessManagerImplementation` address from the `ISMARTSystem` contract.
    /// 3. Ensures this retrieved implementation address is not the zero address.
    /// 4. Executes a `delegatecall` to the `initialize` function of the `SMARTTokenAccessManagerImplementation`
    /// contract
    ///    via `_performInitializationDelegatecall`.
    /// @param systemAddress The address of the `ISMARTSystem` contract.
    /// @param initialAdmin The address that will be granted initial administrative privileges.
    constructor(address systemAddress, address initialAdmin) SMARTSystemProxy(systemAddress) {
        ISMARTSystem system_ = _getSystem();

        address implementation = _getSpecificImplementationAddress(system_);
        bytes memory data =
            abi.encodeWithSelector(SMARTTokenAccessManagerImplementation.initialize.selector, initialAdmin);

        _performInitializationDelegatecall(implementation, data);
    }

    /// @dev Retrieves the implementation address for the Token Access Manager module from the `ISMARTSystem` contract.
    /// @dev Reverts with `TokenAccessManagerImplementationNotSet` if the implementation address is zero.
    /// @param system The `ISMARTSystem` contract instance.
    /// @return The address of the `SMARTTokenAccessManagerImplementation` contract.
    /// @inheritdoc SMARTSystemProxy
    function _getSpecificImplementationAddress(ISMARTSystem system) internal view override returns (address) {
        address implementation = system.tokenAccessManagerImplementation();
        if (implementation == address(0)) {
            revert TokenAccessManagerImplementationNotSet();
        }
        return implementation;
    }
}
