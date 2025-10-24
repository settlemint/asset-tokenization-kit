// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { AbstractATKSystemProxy } from "../../AbstractATKSystemProxy.sol";
import { IATKSystem } from "../../IATKSystem.sol";
import { IdentityImplementationNotSet } from "../../ATKSystemErrors.sol";
import { ZeroAddressNotAllowed } from "../ATKIdentityErrors.sol";
import { IATKIdentity } from "./IATKIdentity.sol";

/// @title ATK Identity Proxy Contract (for Wallet Identities)
/// @author SettleMint
/// @notice This contract serves as an upgradeable proxy for an individual on-chain identity associated with a user
/// wallet.
///         It is based on the ERC725 (OnchainID) standard for identity and uses ERC734 for key management.
/// @dev This proxy contract adheres to EIP-1967 for upgradeability. It holds the identity's storage (keys, claims,
/// etc.)
///      and its public address, while delegating all logic calls to a `ATKIdentityImplementation` contract.
///      The address of this logic implementation is retrieved from the central `IATKSystem` contract, allowing the
///      underlying identity logic to be upgraded without changing this proxy's address or losing its state.
///      This proxy is typically created by the `ATKIdentityFactoryImplementation`.
///      Inherits from `ATKSystemProxy`.
contract ATKIdentityProxy is AbstractATKSystemProxy {
    /// @notice Constructor for the `ATKIdentityProxy`.
    /// @dev This function is called only once when this proxy contract is deployed (typically by the
    /// `ATKIdentityFactory`).
    /// It initializes the proxy and the underlying identity state:
    /// 1. Stores `systemAddress` (handled by `ATKSystemProxy` constructor).
    /// 2. Validates `initialManagementKey`: Ensures it's not `address(0)`.
    /// 3. Retrieves the `ATKIdentityImplementation` address from the `IATKSystem` contract.
    /// 4. Ensures this implementation address is configured (not `address(0)`), reverting with
    /// `IdentityImplementationNotSet` if not.
    /// 5. Performs a `delegatecall` to the `initialize` function of the `Identity` contract (which
    /// `ATKIdentityImplementation` inherits) via `_performInitializationDelegatecall`.
    /// @param systemAddress The address of the `IATKSystem` contract.
    /// @param initialManagementKey The address to be set as the first management key for this identity.
    /// @param claimAuthorizationContracts Array of addresses implementing IClaimAuthorizer to register as claim
    /// authorizers.
    constructor(address systemAddress, address initialManagementKey, address[] memory claimAuthorizationContracts)
        AbstractATKSystemProxy(systemAddress)
    {
        if (initialManagementKey == address(0)) revert ZeroAddressNotAllowed();

        IATKSystem system_ = _getSystem();
        address implementation = _getSpecificImplementationAddress(system_);

        bytes memory data =
            abi.encodeWithSelector(IATKIdentity.initialize.selector, initialManagementKey, claimAuthorizationContracts);

        _performInitializationDelegatecall(implementation, data);
    }

    /// @notice Gets the specific implementation address for the identity proxy
    /// @dev Retrieves the implementation address for the Identity module from the `IATKSystem` contract.
    /// @dev Reverts with `IdentityImplementationNotSet` if the implementation address is zero.
    /// @param system The `IATKSystem` contract instance.
    /// @return The address of the `ATKIdentityImplementation` contract.
    /// @inheritdoc AbstractATKSystemProxy
    function _getSpecificImplementationAddress(IATKSystem system) internal view override returns (address) {
        address implementation = system.identityImplementation();
        if (implementation == address(0)) {
            revert IdentityImplementationNotSet();
        }
        return implementation;
    }
}
