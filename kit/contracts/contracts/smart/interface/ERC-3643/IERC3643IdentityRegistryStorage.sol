// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.28;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// OnchainID imports
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

/// events

/// @notice Emitted when an Identity is registered into the storage contract
/// @dev This event is emitted when an Identity is registered into the storage contract.
/// @param _investorAddress is the address of the investor's wallet.
/// @param _identity is the address of the Identity smart contract (onchainID).
/// @param _country is the numeric country code associated with the investor.
event IdentityStored(address indexed _investorAddress, IIdentity indexed _identity, uint16 indexed _country);

/// @notice Emitted when an Identity is removed from the storage contract
/// @dev This event is emitted when an Identity is removed from the storage contract.
/// @param _investorAddress is the address of the investor's wallet.
/// @param _identity is the address of the Identity smart contract (onchainID).
event IdentityUnstored(address indexed _investorAddress, IIdentity indexed _identity);

/// @notice Emitted when an Identity has been updated
/// @dev This event is emitted when an Identity has been updated.
/// @param _investorAddress is the wallet address whose linked identity changed.
/// @param _oldIdentity is the old Identity contract's address to update.
/// @param _newIdentity is the new Identity contract's.
event IdentityModified(
    address indexed _investorAddress, IIdentity indexed _oldIdentity, IIdentity indexed _newIdentity
);

/// @notice Emitted when an Identity's country has been updated
/// @dev This event is emitted when an Identity's country has been updated.
/// @param _investorAddress is the address on which the country has been updated.
/// @param _country is the numeric code (ISO 3166-1) of the new country.
event CountryModified(address indexed _investorAddress, uint16 indexed _country);

/// @notice Emitted when an Identity Registry is bound to the storage contract
/// @dev This event is emitted when an Identity Registry is bound to the storage contract.
/// @param _identityRegistry is the address of the identity registry added.
event IdentityRegistryBound(address indexed _identityRegistry);

/// @notice Emitted when an Identity Registry is unbound from the storage contract
/// @dev This event is emitted when an Identity Registry is unbound from the storage contract.
/// @param _identityRegistry is the address of the identity registry removed.
event IdentityRegistryUnbound(address indexed _identityRegistry);

/// @title IERC3643IdentityRegistryStorage Interface
/// @author Tokeny
/// @notice Interface for ERC-3643 compliant Identity Registry Storage managing identity data persistence
/// @dev This interface extends IERC165 for interface detection support and defines the standard
///      for storing and managing investor identity data across multiple identity registries.
interface IERC3643IdentityRegistryStorage is IERC165 {
    /// functions
    /**
     *  @notice Adds an identity contract corresponding to a user address in the storage
     *  @dev adds an identity contract corresponding to a user address in the storage.
     *  Requires that the user doesn't have an identity contract already registered.
     *  This function can only be called by an address set as agent of the smart contract
     *  @param _userAddress The address of the user
     *  @param _identity The address of the user's identity contract
     *  @param _country The country of the investor
     *  emits `IdentityStored` event
     */
    function addIdentityToStorage(address _userAddress, IIdentity _identity, uint16 _country) external;

    /**
     *  @notice Removes an user from the storage
     *  @dev Removes an user from the storage.
     *  Requires that the user have an identity contract already deployed that will be deleted.
     *  This function can only be called by an address set as agent of the smart contract
     *  @param _userAddress The address of the user to be removed
     *  emits `IdentityUnstored` event
     */
    function removeIdentityFromStorage(address _userAddress) external;

    /**
     *  @notice Updates the country corresponding to a user address
     *  @dev Updates the country corresponding to a user address.
     *  Requires that the user should have an identity contract already deployed that will be replaced.
     *  This function can only be called by an address set as agent of the smart contract
     *  @param _userAddress The address of the user
     *  @param _country The new country of the user
     *  emits `CountryModified` event
     */
    function modifyStoredInvestorCountry(address _userAddress, uint16 _country) external;

    /**
     *  @notice Updates an identity contract corresponding to a user address
     *  @dev Updates an identity contract corresponding to a user address.
     *  Requires that the user address should be the owner of the identity contract.
     *  Requires that the user should have an identity contract already deployed that will be replaced.
     *  This function can only be called by an address set as agent of the smart contract
     *  @param _userAddress The address of the user
     *  @param _identity The address of the user's new identity contract
     *  emits `IdentityModified` event
     */
    function modifyStoredIdentity(address _userAddress, IIdentity _identity) external;

    /**
     *  @notice Adds an identity registry as agent of the Identity Registry Storage Contract.
     *  This function can only be called by the wallet set as owner of the smart contract
     *  This function adds the identity registry to the list of identityRegistries linked to the storage contract
     *  cannot bind more than 300 IR to 1 IRS
     *  @param _identityRegistry The identity registry address to add.
     */
    function bindIdentityRegistry(address _identityRegistry) external;

    /**
     *  @notice Removes an identity registry from being agent of the Identity Registry Storage Contract.
     *  This function can only be called by the wallet set as owner of the smart contract
     *  This function removes the identity registry from the list of identityRegistries linked to the storage contract
     *  @param _identityRegistry The identity registry address to remove.
     */
    function unbindIdentityRegistry(address _identityRegistry) external;

    /**
     *  @notice Returns the identity registries linked to the storage contract
     *  @dev Returns the identity registries linked to the storage contract
     *  @return Array of addresses of all linked identity registries
     */
    function linkedIdentityRegistries() external view returns (address[] memory);

    /**
     *  @notice Returns the onchainID of an investor
     *  @dev Returns the onchainID of an investor.
     *  @param _userAddress The wallet of the investor
     *  @return The identity contract address of the investor
     */
    function storedIdentity(address _userAddress) external view returns (IIdentity);

    /**
     *  @notice Returns the country code of an investor
     *  @dev Returns the country code of an investor.
     *  @param _userAddress The wallet of the investor
     *  @return The country code (ISO 3166-1 numeric) of the investor
     */
    function storedInvestorCountry(address _userAddress) external view returns (uint16);
}
