// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { SMARTSystemProxy } from "../../SMARTSystemProxy.sol";
import { ISMARTSystem } from "../../ISMARTSystem.sol";
import { IdentityImplementationNotSet } from "../../SMARTSystemErrors.sol";
import { ZeroAddressNotAllowed } from "../SMARTIdentityErrors.sol";
import { ISMARTIdentity } from "./ISMARTIdentity.sol";

/// @title SMART Identity Proxy Contract (for Wallet Identities)
/// @author SettleMint Tokenization Services
/// @notice This contract serves as an upgradeable proxy for an individual on-chain identity associated with a user
/// wallet.
///         It is based on the ERC725 (OnchainID) standard for identity and uses ERC734 for key management.
/// @dev This proxy contract adheres to EIP-1967 for upgradeability. It holds the identity's storage (keys, claims,
/// etc.)
///      and its public address, while delegating all logic calls to a `SMARTIdentityImplementation` contract.
///      The address of this logic implementation is retrieved from the central `ISMARTSystem` contract, allowing the
///      underlying identity logic to be upgraded without changing this proxy's address or losing its state.
///      This proxy is typically created by the `SMARTIdentityFactoryImplementation`.
///      Inherits from `SMARTSystemProxy`.
contract SMARTIdentityProxy is SMARTSystemProxy {
    /// @notice Constructor for the `SMARTIdentityProxy`.
    /// @dev This function is called only once when this proxy contract is deployed (typically by the
    /// `SMARTIdentityFactory`).
    /// It initializes the proxy and the underlying identity state:
    /// 1. Stores `systemAddress` (handled by `SMARTSystemProxy` constructor).
    /// 2. Validates `initialManagementKey`: Ensures it's not `address(0)`.
    /// 3. Retrieves the `SMARTIdentityImplementation` address from the `ISMARTSystem` contract.
    /// 4. Ensures this implementation address is configured (not `address(0)`), reverting with
    /// `IdentityImplementationNotSet` if not.
    /// 5. Performs a `delegatecall` to the `initialize` function of the `Identity` contract (which
    /// `SMARTIdentityImplementation` inherits) via `_performInitializationDelegatecall`.
    /// @param systemAddress The address of the `ISMARTSystem` contract.
    /// @param initialManagementKey The address to be set as the first management key for this identity.
    constructor(address systemAddress, address initialManagementKey) SMARTSystemProxy(systemAddress) {
        if (initialManagementKey == address(0)) revert ZeroAddressNotAllowed();

        ISMARTSystem system_ = _getSystem();
        address implementation = _getSpecificImplementationAddress(system_);

        bytes memory data = abi.encodeWithSelector(ISMARTIdentity.initialize.selector, initialManagementKey);

        _performInitializationDelegatecall(implementation, data);
    }

    /// @dev Retrieves the implementation address for the Identity module from the `ISMARTSystem` contract.
    /// @dev Reverts with `IdentityImplementationNotSet` if the implementation address is zero.
    /// @param system The `ISMARTSystem` contract instance.
    /// @return The address of the `SMARTIdentityImplementation` contract.
    /// @inheritdoc SMARTSystemProxy
    function _getSpecificImplementationAddress(ISMARTSystem system) internal view override returns (address) {
        address implementation = system.identityImplementation();
        if (implementation == address(0)) {
            revert IdentityImplementationNotSet();
        }
        return implementation;
    }
}
