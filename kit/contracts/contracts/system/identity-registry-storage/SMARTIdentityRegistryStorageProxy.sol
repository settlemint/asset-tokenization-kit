// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { SMARTSystemProxy } from "../SMARTSystemProxy.sol";
import { ISMARTSystem } from "../ISMARTSystem.sol";
import { SMARTIdentityRegistryStorageImplementation } from "./SMARTIdentityRegistryStorageImplementation.sol";
import { IdentityRegistryStorageImplementationNotSet } from "../SMARTSystemErrors.sol";

/// @title SMART Identity Registry Storage Proxy
/// @author SettleMint Tokenization Services
/// @notice This contract serves as an EIP-1967 compliant proxy for the `SMARTIdentityRegistryStorageImplementation`
/// contract.
/// It allows the underlying storage logic for the identity registry to be upgraded without changing the publicly-facing
/// contract address.
/// The address of the current storage implementation is dynamically fetched from a central `ISMARTSystem` contract.
/// @dev This proxy inherits from `SMARTSystemProxy`.
/// During its construction, the proxy initializes the first version of the storage implementation by performing a
/// `delegatecall`
/// to its `initialize` function. All subsequent calls to this proxy are then delegated to the current implementation
/// address
/// as specified by the `ISMARTSystem` contract.
contract SMARTIdentityRegistryStorageProxy is SMARTSystemProxy {
    /// @notice Constructs the `SMARTIdentityRegistryStorageProxy`.
    /// @dev The constructor performs the following critical initialization steps:
    /// 1.  Stores the validated `systemAddress` (handled by `SMARTSystemProxy` constructor).
    /// 2.  Retrieves the address of the `SMARTIdentityRegistryStorageImplementation` from the `ISMARTSystem` contract.
    ///     If the implementation address is the zero address (not set), it reverts with
    /// `IdentityRegistryStorageImplementationNotSet`.
    /// 3.  Prepares the calldata for the `initialize` function of the `SMARTIdentityRegistryStorageImplementation`.
    /// 4.  Executes a `delegatecall` to the `initialize` function on the implementation contract via
    /// `_performInitializationDelegatecall`.
    /// @param systemAddress The address of the `ISMARTSystem` contract.
    /// @param initialAdmin The address that will be granted the `DEFAULT_ADMIN_ROLE`.
    constructor(address systemAddress, address initialAdmin) SMARTSystemProxy(systemAddress) {
        ISMARTSystem system_ = _getSystem();
        address implementation = _getSpecificImplementationAddress(system_);

        bytes memory data = abi.encodeWithSelector(
            SMARTIdentityRegistryStorageImplementation.initialize.selector, systemAddress, initialAdmin
        );

        _performInitializationDelegatecall(implementation, data);
    }

    /// @dev Retrieves the implementation address for the Identity Registry Storage module from the `ISMARTSystem`
    /// contract.
    /// @dev Reverts with `IdentityRegistryStorageImplementationNotSet` if the implementation address is zero.
    /// @param system The `ISMARTSystem` contract instance.
    /// @return The address of the `SMARTIdentityRegistryStorageImplementation` contract.
    /// @inheritdoc SMARTSystemProxy
    function _getSpecificImplementationAddress(ISMARTSystem system) internal view override returns (address) {
        address implementation = system.identityRegistryStorageImplementation();
        if (implementation == address(0)) {
            revert IdentityRegistryStorageImplementationNotSet();
        }
        return implementation;
    }
}
