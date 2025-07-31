// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

/**
 * @title IATKIdentity
 * @author SettleMint
 * @notice Interface for ATK Identity contracts representing on-chain identities
 * @dev Extends the OnChainID IIdentity interface to provide ATK-specific initialization.
 *      These identity contracts store claims and keys for identity verification within
 *      the ATK ecosystem.
 */
interface IATKIdentity is IIdentity {
    /// @notice Initializes the ATK Identity contract
    /// @dev Sets up the initial management key and registers claim authorization contracts
    /// @param initialManagementKey The address to be set as the initial management key
    /// @param claimAuthorizationContracts Array of addresses implementing IClaimAuthorizer to register as claim
    /// authorizers
    function initialize(address initialManagementKey, address[] calldata claimAuthorizationContracts) external;

    /// @notice Registers a claim authorization contract
    /// @param authorizationContract The address of the contract implementing IClaimAuthorizer
    function registerClaimAuthorizationContract(address authorizationContract) external;

    /// @notice Removes a claim authorization contract
    /// @param authorizationContract The address of the contract to remove
    function removeClaimAuthorizationContract(address authorizationContract) external;
}
