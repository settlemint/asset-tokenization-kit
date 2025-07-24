// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

/// @title Interface for ATK Contract Identity
/// @author SettleMint Tokenization Services
/// @notice Interface for on-chain identities associated with contracts implementing IContractWithIdentity
/// @dev This interface replaces IATKTokenIdentity with a more generic solution that works for any contract
///      (tokens, vaults, etc.) that implements IContractWithIdentity. Permission checks are delegated
///      to the contract itself via canAddClaim/canRemoveClaim.
interface IATKContractIdentity is IIdentity {
    /// @notice Initializes the contract identity with its owner contract address
    /// @param contractAddr The address of the contract that owns this identity
    /// @param claimAuthorizationContracts Array of addresses implementing IClaimAuthorizer to register as claim
    /// authorizers
    function initialize(address contractAddr, address[] calldata claimAuthorizationContracts) external;

    /// @notice Returns the address of the contract that owns this identity
    /// @return The contract address
    function contractAddress() external view returns (address);

    /// @notice Registers a claim authorization contract
    /// @param authorizationContract The address of the contract implementing IClaimAuthorizer
    function registerClaimAuthorizationContract(address authorizationContract) external;

    /// @notice Removes a claim authorization contract
    /// @param authorizationContract The address of the contract to remove
    function removeClaimAuthorizationContract(address authorizationContract) external;

    /// @notice Returns all registered claim authorization contracts
    /// @return Array of authorization contract addresses
    function getClaimAuthorizationContracts() external view returns (address[] memory);

    /// @notice Checks if a contract is registered as a claim authorization contract
    /// @param authorizationContract The address to check
    /// @return True if registered, false otherwise
    function isClaimAuthorizationContractRegistered(address authorizationContract) external view returns (bool);
}
