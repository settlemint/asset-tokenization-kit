// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { IATKSystem } from "../../IATKSystem.sol";
import { IdentityImplementationNotSet } from "../../ATKSystemErrors.sol";
import { ZeroAddressNotAllowed } from "../ATKIdentityErrors.sol";
import { IATKContractIdentity } from "./IATKContractIdentity.sol";
import { AbstractATKSystemProxy } from "../../AbstractATKSystemProxy.sol";

/// @title ATK Contract Identity Proxy Contract
/// @author SettleMint
/// @notice This contract serves as an upgradeable proxy for an on-chain identity bound to any contract
///         that implements IContractWithIdentity (tokens, vaults, etc.)
/// @dev This proxy contract adheres to EIP-1967 for upgradeability. It holds the contract identity's storage
///      (claims, etc.) and its public address, while delegating all logic calls to a
///      `ATKContractIdentityImplementation` contract.
///      The address of this logic implementation is retrieved from the central `IATKSystem` contract,
///      allowing the underlying contract identity logic to be upgraded without changing this proxy's address
///      or losing its state.
contract ATKContractIdentityProxy is AbstractATKSystemProxy {
    /// @notice Constructor for the `ATKContractIdentityProxy`.
    /// @dev This function is called only once when this proxy contract is deployed.
    ///      It initializes the proxy and the underlying contract identity state.
    /// @param systemAddress The address of the `IATKSystem` contract.
    /// @param contractAddress The address of the contract that will own this identity.
    /// @param claimAuthorizationContracts Array of addresses implementing IClaimAuthorizer to register as claim
    /// authorizers.
    constructor(address systemAddress, address contractAddress, address[] memory claimAuthorizationContracts)
        AbstractATKSystemProxy(systemAddress)
    {
        if (contractAddress == address(0)) revert ZeroAddressNotAllowed();

        IATKSystem system_ = _getSystem();
        address implementation = _getSpecificImplementationAddress(system_);

        bytes memory data = abi.encodeWithSelector(
            IATKContractIdentity.initialize.selector, contractAddress, claimAuthorizationContracts
        );

        _performInitializationDelegatecall(implementation, data);
    }

    /// @notice Gets the specific implementation address for the contract identity proxy
    /// @dev Retrieves the implementation address for the Contract Identity module from the `IATKSystem` contract.
    /// @dev Reverts with `IdentityImplementationNotSet` if the implementation address is zero.
    /// @param system The `IATKSystem` contract instance.
    /// @return The address of the `ATKContractIdentityImplementation` contract.
    /// @inheritdoc AbstractATKSystemProxy
    function _getSpecificImplementationAddress(IATKSystem system) internal view override returns (address) {
        address implementation = system.contractIdentityImplementation();
        if (implementation == address(0)) {
            revert IdentityImplementationNotSet();
        }
        return implementation;
    }
}
