// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title SMART Compliance AllowList Interface
/// @author SettleMint Tokenization Services
/// @notice Interface for managing compliance allowlist functionality
/// @dev This interface defines the standard functions for allowlist management in SMART compliance contracts
interface ISMARTComplianceAllowList {
    // --- Events ---
    /// @notice Emitted when an address is added to the compliance allowlist
    /// @param account The address that was added to the allowlist
    /// @param manager The address that performed the allowlist addition
    event AddressAllowListed(address indexed account, address indexed manager);

    /// @notice Emitted when an address is removed from the compliance allowlist
    /// @param account The address that was removed from the allowlist
    /// @param manager The address that performed the allowlist removal
    event AddressRemovedFromAllowList(address indexed account, address indexed manager);

    // --- Custom Errors ---
    /// @notice Error thrown when trying to remove an address that is not on the allowlist
    error AddressNotAllowListed(address account);

    /// @notice Error thrown when trying to add an address that is already on the allowlist
    error AddressAlreadyAllowListed(address account);

    // --- Functions ---
    /// @notice Adds an address to the compliance allowlist
    /// @dev Only addresses with WHITELIST_MANAGER_ROLE can call this function.
    /// AllowListed addresses can bypass compliance checks in canTransfer function.
    /// @param account The address to add to the allowlist
    function addToAllowList(address account) external;

    /// @notice Removes an address from the compliance allowlist
    /// @dev Only addresses with WHITELIST_MANAGER_ROLE can call this function.
    /// @param account The address to remove from the allowlist
    function removeFromAllowList(address account) external;

    /// @notice Adds multiple addresses to the compliance allowlist in a single transaction
    /// @dev Only addresses with WHITELIST_MANAGER_ROLE can call this function.
    /// This is a gas-efficient way to allowlist multiple addresses at once.
    /// @param accounts Array of addresses to add to the allowlist
    function addMultipleToAllowList(address[] calldata accounts) external;

    /// @notice Removes multiple addresses from the compliance allowlist in a single transaction
    /// @dev Only addresses with WHITELIST_MANAGER_ROLE can call this function.
    /// @param accounts Array of addresses to remove from the allowlist
    function removeMultipleFromAllowList(address[] calldata accounts) external;

    /// @notice Checks if an address is on the allowlist
    /// @param account The address to check
    /// @return True if the address is on the allowlist, false otherwise
    function isAllowListed(address account) external view returns (bool);
}
