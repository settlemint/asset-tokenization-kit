// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.28;

// OnchainID imports
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

// Interface imports
import { IERC3643IdentityRegistryStorage } from "./IERC3643IdentityRegistryStorage.sol";
import { IERC3643TrustedIssuersRegistry } from "./IERC3643TrustedIssuersRegistry.sol";
import { IERC3643ClaimTopicsRegistry } from "./IERC3643ClaimTopicsRegistry.sol";

/// Events

/// @notice Emitted when the ClaimTopicsRegistry has been set for the IdentityRegistry
/// @dev This event is emitted when the ClaimTopicsRegistry has been set for the IdentityRegistry.
/// @param _claimTopicsRegistry is the address of the Claim Topics Registry contract.
event ClaimTopicsRegistrySet(address indexed _claimTopicsRegistry);

/// @notice Emitted when the IdentityRegistryStorage has been set for the IdentityRegistry
/// @dev This event is emitted when the IdentityRegistryStorage has been set for the IdentityRegistry.
/// @param _identityStorage is the address of the Identity Registry Storage contract.
event IdentityStorageSet(address indexed _identityStorage);

/// @notice Emitted when the TrustedIssuersRegistry has been set for the IdentityRegistry
/// @dev This event is emitted when the TrustedIssuersRegistry has been set for the IdentityRegistry.
/// @param _trustedIssuersRegistry is the address of the Trusted Issuers Registry contract.
event TrustedIssuersRegistrySet(address indexed _trustedIssuersRegistry);

/// @notice Emitted when an Identity is registered into the Identity Registry
/// @dev This event is emitted when an Identity is registered into the Identity Registry.
/// @param _investorAddress is the address of the investor's wallet.
/// @param _identity is the address of the Identity smart contract (onchainID).
event IdentityRegistered(address indexed _investorAddress, IIdentity indexed _identity);

/// @notice Emitted when an Identity is removed from the Identity Registry
/// @dev This event is emitted when an Identity is removed from the Identity Registry.
/// @param _investorAddress is the address of the investor's wallet.
/// @param _identity is the address of the Identity smart contract (onchainID).
event IdentityRemoved(address indexed _investorAddress, IIdentity indexed _identity);

/// @notice Emitted when an Identity has been updated
/// @dev This event is emitted when an Identity has been updated.
/// @param _oldIdentity is the old Identity contract's address to update.
/// @param _newIdentity is the new Identity contract's.
event IdentityUpdated(IIdentity indexed _oldIdentity, IIdentity indexed _newIdentity);

/// @notice Emitted when an Identity's country has been updated
/// @dev This event is emitted when an Identity's country has been updated.
/// @param _investorAddress is the address on which the country has been updated
/// @param _country is the numeric code (ISO 3166-1) of the new country
event CountryUpdated(address indexed _investorAddress, uint16 indexed _country);

/**
 * @title IERC3643IdentityRegistry
 * @author Tokeny
 * @notice Interface for ERC-3643 compliant Identity Registry managing investor identities
 * @dev This interface defines the standard for managing on-chain identities in security token ecosystems.
 *      It handles the registration, verification, and management of investor identities, ensuring
 *      compliance with regulatory requirements through claim verification.
 */
interface IERC3643IdentityRegistry {
    /// Functions
    /// Identity Registry Setters
    /**
     *  @notice Sets the identity registry storage contract address
     *  @dev Replace the actual identityRegistryStorage contract with a new one.
     *  This function can only be called by the wallet set as owner of the smart contract
     *  @param _identityRegistryStorage The address of the new Identity Registry Storage
     *  emits `IdentityStorageSet` event
     */
    function setIdentityRegistryStorage(address _identityRegistryStorage) external;

    /**
     *  @notice Sets the claim topics registry contract address
     *  @dev Replace the actual claimTopicsRegistry contract with a new one.
     *  This function can only be called by the wallet set as owner of the smart contract
     *  @param _claimTopicsRegistry The address of the new claim Topics Registry
     *  emits `ClaimTopicsRegistrySet` event
     */
    function setClaimTopicsRegistry(address _claimTopicsRegistry) external;

    /**
     *  @notice Sets the trusted issuers registry contract address
     *  @dev Replace the actual trustedIssuersRegistry contract with a new one.
     *  This function can only be called by the wallet set as owner of the smart contract
     *  @param _trustedIssuersRegistry The address of the new Trusted Issuers Registry
     *  emits `TrustedIssuersRegistrySet` event
     */
    function setTrustedIssuersRegistry(address _trustedIssuersRegistry) external;

    /// Registry Actions
    /**
     *  @notice Registers an identity contract for a user address
     *  @dev Register an identity contract corresponding to a user address.
     *  Requires that the user doesn't have an identity contract already registered.
     *  This function can only be called by a wallet set as agent of the smart contract
     *  @param _userAddress The address of the user
     *  @param _identity The address of the user's identity contract
     *  @param _country The country of the investor
     *  emits `IdentityRegistered` event
     */
    function registerIdentity(address _userAddress, IIdentity _identity, uint16 _country) external;

    /**
     *  @notice Removes a user from the identity registry
     *  @dev Removes an user from the identity registry.
     *  Requires that the user have an identity contract already deployed that will be deleted.
     *  This function can only be called by a wallet set as agent of the smart contract
     *  @param _userAddress The address of the user to be removed
     *  emits `IdentityRemoved` event
     */
    function deleteIdentity(address _userAddress) external;

    /**
     *  @notice Updates the country for a user address
     *  @dev Updates the country corresponding to a user address.
     *  Requires that the user should have an identity contract already deployed that will be replaced.
     *  This function can only be called by a wallet set as agent of the smart contract
     *  @param _userAddress The address of the user
     *  @param _country The new country of the user
     *  emits `CountryUpdated` event
     */
    function updateCountry(address _userAddress, uint16 _country) external;

    /**
     *  @notice Updates the identity contract for a user address
     *  @dev Updates an identity contract corresponding to a user address.
     *  Requires that the user address should be the owner of the identity contract.
     *  Requires that the user should have an identity contract already deployed that will be replaced.
     *  This function can only be called by a wallet set as agent of the smart contract
     *  @param _userAddress The address of the user
     *  @param _identity The address of the user's new identity contract
     *  emits `IdentityUpdated` event
     */
    function updateIdentity(address _userAddress, IIdentity _identity) external;

    /**
     *  @notice Registers multiple identities in a single transaction
     *  @dev function allowing to register identities in batch
     *  This function can only be called by a wallet set as agent of the smart contract
     *  Requires that none of the users has an identity contract already registered.
     *  IMPORTANT : THIS TRANSACTION COULD EXCEED GAS LIMIT IF `_userAddresses.length` IS TOO HIGH,
     *  USE WITH CARE OR YOU COULD LOSE TX FEES WITH AN "OUT OF GAS" TRANSACTION
     *  @param _userAddresses The addresses of the users
     *  @param _identities The addresses of the corresponding identity contracts
     *  @param _countries The countries of the corresponding investors
     *  emits _userAddresses.length `IdentityRegistered` events
     */
    function batchRegisterIdentity(
        address[] calldata _userAddresses,
        IIdentity[] calldata _identities,
        uint16[] calldata _countries
    )
        external;

    /// Registry Consultation

    /**
     *  @notice Checks if a wallet has an identity registered
     *  @dev This functions checks whether a wallet has its Identity registered or not
     *  in the Identity Registry.
     *  @param _userAddress The address of the user to be checked.
     *  @return bool 'True' if the address is contained in the Identity Registry, 'false' if not.
     */
    function contains(address _userAddress) external view returns (bool);

    /**
     *  @notice Verifies if a user has the required claims
     *  @dev This functions checks whether an identity contract
     *  corresponding to the provided user address has the required claims or not based
     *  on the data fetched from trusted issuers registry and from the claim topics registry
     *  @param _userAddress The address of the user to be verified.
     *  @return bool 'True' if the address is verified, 'false' if not.
     */
    function isVerified(address _userAddress) external view returns (bool);

    /**
     *  @notice Returns the onchainID of an investor
     *  @dev Returns the onchainID of an investor.
     *  @param _userAddress The wallet of the investor
     *  @return IIdentity The identity contract of the investor
     */
    function identity(address _userAddress) external view returns (IIdentity);

    /**
     *  @notice Returns the country code of an investor
     *  @dev Returns the country code of an investor.
     *  @param _userAddress The wallet of the investor
     *  @return uint16 The country code of the investor (ISO 3166-1 numeric code)
     */
    function investorCountry(address _userAddress) external view returns (uint16);

    // identity registry getters
    /**
     *  @notice Returns the linked IdentityRegistryStorage contract
     *  @dev Returns the IdentityRegistryStorage linked to the current IdentityRegistry.
     *  @return IERC3643IdentityRegistryStorage The address of the IdentityRegistryStorage contract
     */
    function identityStorage() external view returns (IERC3643IdentityRegistryStorage);

    /**
     *  @notice Returns the linked TrustedIssuersRegistry contract
     *  @dev Returns the TrustedIssuersRegistry linked to the current IdentityRegistry.
     *  @return IERC3643TrustedIssuersRegistry The address of the TrustedIssuersRegistry contract
     */
    function issuersRegistry() external view returns (IERC3643TrustedIssuersRegistry);

    /**
     *  @notice Returns the linked ClaimTopicsRegistry contract
     *  @dev Returns the ClaimTopicsRegistry linked to the current IdentityRegistry.
     *  @return IERC3643ClaimTopicsRegistry The address of the ClaimTopicsRegistry contract
     */
    function topicsRegistry() external view returns (IERC3643ClaimTopicsRegistry);
}
