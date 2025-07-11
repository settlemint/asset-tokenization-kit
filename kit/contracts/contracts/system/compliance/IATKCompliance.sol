// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ISMARTCompliance } from "../../smart/interface/ISMARTCompliance.sol";

/// @title ATK Compliance Bypass List Interface
/// @author SettleMint Tokenization Services
/// @notice Interface for managing the compliance bypass list functionality.
/// @dev This interface defines the standard functions for managing addresses that bypass compliance checks.
interface IATKCompliance is ISMARTCompliance {
    // --- Events ---
    /// @notice Emitted when an address is added to the compliance bypass list.
    /// @param account The address that was added to the bypass list.
    /// @param manager The address that performed the addition.
    event AddressAddedToBypassList(address indexed account, address indexed manager);

    /// @notice Emitted when an address is removed from the compliance bypass list.
    /// @param account The address that was removed from the bypass list.
    /// @param manager The address that performed the removal.
    event AddressRemovedFromBypassList(address indexed account, address indexed manager);

    // --- Custom Errors ---
    /// @notice Error thrown when trying to remove an address that is not on the bypass list.
    error AddressNotOnBypassList(address account);

    /// @notice Error thrown when trying to add an address that is already on the bypass list.
    error AddressAlreadyOnBypassList(address account);

    // --- Functions ---
    function initialize(
        address initialAdmin,
        address[] memory initialBypassListManagers,
        address systemAccessManager
    )
        external;

    // --- Functions ---
    /// @notice Adds an address to the compliance bypass list.
    /// @dev Only addresses with BYPASS_LIST_MANAGER_ROLE can call this function.
    /// Addresses on the bypass list can bypass compliance checks in canTransfer function.
    /// @param account The address to add to the bypass list.
    function addToBypassList(address account) external;

    /// @notice Removes an address from the compliance bypass list.
    /// @dev Only addresses with BYPASS_LIST_MANAGER_ROLE can call this function.
    /// @param account The address to remove from the bypass list.
    function removeFromBypassList(address account) external;

    /// @notice Adds multiple addresses to the compliance bypass list in a single transaction.
    /// @dev Only addresses with BYPASS_LIST_MANAGER_ROLE can call this function.
    /// This is a gas-efficient way to add multiple addresses to the bypass list at once.
    /// @param accounts Array of addresses to add to the bypass list.
    function addMultipleToBypassList(address[] calldata accounts) external;

    /// @notice Removes multiple addresses from the compliance bypass list in a single transaction.
    /// @dev Only addresses with BYPASS_LIST_MANAGER_ROLE can call this function.
    /// @param accounts Array of addresses to remove from the bypass list.
    function removeMultipleFromBypassList(address[] calldata accounts) external;

    /// @notice Checks if an address is on the bypass list.
    /// @param account The address to check.
    /// @return True if the address is on the bypass list, false otherwise.
    function isBypassed(address account) external view returns (bool);
}
