// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC3643IdentityRegistryStorage } from "./ERC-3643/IERC3643IdentityRegistryStorage.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

/// @title ISMARTIdentityRegistryStorage Interface
/// @author SettleMint
/// @notice Interface for SMART protocol identity registry storage with lost wallet recovery features
/// @dev Extends ERC-3643 identity registry storage with additional functionality for managing lost wallets
///      and recovery links, enabling secure token recovery mechanisms
interface ISMARTIdentityRegistryStorage is IERC3643IdentityRegistryStorage {
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
    /// @param _identityWallet is the address on which the country has been updated.
    /// @param _country is the numeric code (ISO 3166-1) of the new country.
    event CountryModified(address indexed _identityWallet, uint16 indexed _country);

    /// @notice Emitted when an Identity Registry is bound to the storage contract
    /// @dev This event is emitted when an Identity Registry is bound to the storage contract.
    /// @param _identityRegistry is the address of the identity registry added.
    event IdentityRegistryBound(address indexed _identityRegistry);

    /// @notice Emitted when an Identity Registry is unbound from the storage contract
    /// @dev This event is emitted when an Identity Registry is unbound from the storage contract.
    /// @param _identityRegistry is the address of the identity registry removed.
    event IdentityRegistryUnbound(address indexed _identityRegistry);

    /// @notice Emitted when a user wallet is marked as lost for a specific identity contract within the storage.
    /// @param identityContract The IIdentity contract associated with the user wallet.
    /// @param userWallet The user wallet address that was marked as lost.
    /// @param markedBy The address (typically the Identity Registry contract) that initiated this action.
    event IdentityWalletMarkedAsLost(
        address indexed identityContract, address indexed userWallet, address indexed markedBy
    );

    /// @notice Emitted when a wallet recovery link is established between a lost wallet and its replacement.
    /// @param lostWallet The lost wallet address.
    /// @param newWallet The new replacement wallet address.
    /// @param establishedBy The address that established this recovery link.
    event WalletRecoveryLinked(address indexed lostWallet, address indexed newWallet, address indexed establishedBy);

    // --- Lost Wallet Management ---

    /// @notice Marks a user wallet as lost for a specific identity contract in the storage.
    /// @dev Called by an authorized Identity Registry. This indicates the wallet should no longer be considered active
    ///      for verification or operations related to this specific identity, and potentially globally.
    /// @param identityContract The IIdentity contract address to which the userWallet was associated.
    /// @param userWallet The user wallet address to be marked as lost.
    function markWalletAsLost(address identityContract, address userWallet) external;

    /// @notice Establishes a recovery link between a lost wallet and its replacement.
    /// @dev This creates a bidirectional mapping for token recovery purposes.
    /// @param lostWallet The lost wallet address.
    /// @param newWallet The new replacement wallet address.
    function linkWalletRecovery(address lostWallet, address newWallet) external;

    /// @notice Checks if a user wallet is globally marked as lost in the storage.
    /// @dev A "globally lost" wallet means it has been declared lost in the context of at least one identity
    ///      it was associated with.
    /// @param userWallet The user wallet address to check.
    /// @return True if the wallet has been marked as lost at least once, false otherwise.
    function isWalletMarkedAsLost(address userWallet) external view returns (bool);

    /// @notice Gets the new wallet address that replaced a lost wallet during recovery.
    /// @dev This is the key function for token recovery - allows checking if caller is authorized to recover from
    /// lostWallet.
    /// @param lostWallet The lost wallet address.
    /// @return The new wallet address that replaced the lost wallet, or address(0) if not found.
    function getRecoveredWalletFromStorage(address lostWallet) external view returns (address);
}
