// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

interface IATKIdentity is IIdentity {
    function initialize(address initialManagementKey, address[] calldata claimAuthorizationContracts) external;

    /// @notice Registers a claim authorization contract
    /// @param authorizationContract The address of the contract implementing IClaimAuthorizer
    function registerClaimAuthorizationContract(address authorizationContract) external;

    /// @notice Removes a claim authorization contract
    /// @param authorizationContract The address of the contract to remove
    function removeClaimAuthorizationContract(address authorizationContract) external;
}
