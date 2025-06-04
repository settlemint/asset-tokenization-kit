// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title SMART Compliance Whitelist Interface
/// @author SettleMint Tokenization Services
/// @notice Interface for managing compliance whitelist functionality
/// @dev This interface defines the standard functions for whitelist management in SMART compliance contracts
interface ISMARTComplianceWhitelist {
    // --- Events ---
    /// @notice Emitted when an address is added to the compliance whitelist
    /// @param account The address that was added to the whitelist
    /// @param manager The address that performed the whitelist addition
    event AddressWhitelisted(address indexed account, address indexed manager);

    /// @notice Emitted when an address is removed from the compliance whitelist
    /// @param account The address that was removed from the whitelist
    /// @param manager The address that performed the whitelist removal
    event AddressRemovedFromWhitelist(address indexed account, address indexed manager);

    // --- Custom Errors ---
    /// @notice Error thrown when trying to remove an address that is not whitelisted
    error AddressNotWhitelisted(address account);

    /// @notice Error thrown when trying to add an address that is already whitelisted
    error AddressAlreadyWhitelisted(address account);

    // --- Functions ---
    /// @notice Adds an address to the compliance whitelist
    /// @dev Only addresses with WHITELIST_MANAGER_ROLE can call this function.
    /// Whitelisted addresses can bypass compliance checks in canTransfer function.
    /// @param account The address to add to the whitelist
    function addToWhitelist(address account) external;

    /// @notice Removes an address from the compliance whitelist
    /// @dev Only addresses with WHITELIST_MANAGER_ROLE can call this function.
    /// @param account The address to remove from the whitelist
    function removeFromWhitelist(address account) external;

    /// @notice Adds multiple addresses to the compliance whitelist in a single transaction
    /// @dev Only addresses with WHITELIST_MANAGER_ROLE can call this function.
    /// This is a gas-efficient way to whitelist multiple addresses at once.
    /// @param accounts Array of addresses to add to the whitelist
    function addMultipleToWhitelist(address[] calldata accounts) external;

    /// @notice Removes multiple addresses from the compliance whitelist in a single transaction
    /// @dev Only addresses with WHITELIST_MANAGER_ROLE can call this function.
    /// @param accounts Array of addresses to remove from the whitelist
    function removeMultipleFromWhitelist(address[] calldata accounts) external;

    /// @notice Checks if an address is whitelisted
    /// @param account The address to check
    /// @return True if the address is whitelisted, false otherwise
    function isWhitelisted(address account) external view returns (bool);
}
