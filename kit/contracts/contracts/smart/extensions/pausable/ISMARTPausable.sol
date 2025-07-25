// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Interface for SMART Pausable Extension
/// @author SettleMint
/// @notice Defines the external functions for a pausable SMART token.
/// @dev This interface outlines the standard functions for pausing, unpausing, and checking the paused
///      state of a contract. Implementations of this interface are expected to restrict the `pause` and
///      `unpause` functions to authorized addresses (e.g., an address with a PAUSER_ROLE).
///      A Solidity 'interface' is a contract blueprint: it declares functions (name, parameters, visibility,
///      return types) but doesn't implement them. Other contracts implement interfaces to guarantee they
///      provide specific functionalities, promoting interoperability.
interface ISMARTPausable {
    /// @notice Error reverted when an action is attempted that requires the contract to be unpaused (not paused),
    ///         but the contract is currently paused.
    /// @dev For example, this error is typically used in a `whenNotPaused` modifier if a function like `transfer`
    ///      is called while the token operations are halted.
    error TokenPaused();

    /// @notice Error reverted when an action is attempted that requires the contract to be in a paused state,
    ///         but the contract is currently not paused (i.e., it is unpaused).
    /// @dev For example, this might be used if an `unpause()` function is called when the contract is already unpaused,
    ///      or if a specific admin action is only allowed during a maintenance (paused) period.
    error ExpectedPause();

    // -- Events --
    /// @notice Emitted when the contract transitions to a paused state.
    /// @dev This event signals that standard operations (like transfers) are likely now blocked.
    /// @param sender The address that initiated the `pause` operation. This is typically an authorized
    ///               account with a PAUSER_ROLE. `indexed` for easier filtering of events initiated
    ///               by a specific admin or pauser address.
    event Paused(address indexed sender);

    /// @notice Emitted when the contract transitions out of a paused state (i.e., is unpaused).
    /// @dev This event signals that standard operations are likely resumed.
    /// @param sender The address that initiated the `unpause` operation. Similar to `Paused` event, this is
    ///               typically an authorized account. `indexed` for filtering.
    event Unpaused(address indexed sender);

    // -- View Functions --

    /// @notice Returns `true` if the contract is currently paused, and `false` otherwise.
    /// @dev This is a `view` function, meaning it does not modify the blockchain state and does not
    ///      cost gas when called externally (e.g., from an off-chain script or another contract's view function).
    /// @return bool The current paused state of the contract.
    function paused() external view returns (bool);

    // -- State-Changing Functions (Admin/Authorized) --

    /// @notice Pauses the contract, which typically prevents certain actions like token transfers.
    /// @dev Implementations should ensure this function can only be called by an authorized address
    ///      (e.g., through a modifier like `onlyPauser`). It should revert if the contract is already paused
    ///      to prevent redundant operations or event emissions.
    function pause() external;

    /// @notice Unpauses the contract, resuming normal operations (e.g., allowing token transfers again).
    /// @dev Similar to `pause()`, this function should be restricted to authorized addresses and should
    ///      revert if the contract is not currently paused.
    function unpause() external;
}
