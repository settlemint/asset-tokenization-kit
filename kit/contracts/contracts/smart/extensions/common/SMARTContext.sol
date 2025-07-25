// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Abstract Contract for SMART Sender Context
/// @author SettleMint
/// @notice This abstract contract defines a common interface for retrieving the effective sender
///         of a transaction within the SMART token ecosystem. It helps abstract away complexities
///         related to meta-transactions (where `msg.sender` might be a forwarder contract rather
///         than the original user).
/// @dev It declares an `internal virtual` function `_smartSender()`. Concrete implementations
///      (like `SMARTExtension` or `SMARTExtensionUpgradeable`) will override this function
///      to return the actual initiator of a call, typically by using OpenZeppelin's `_msgSender()`
///      from `Context.sol` or `ERC2771Context.sol` (if meta-transactions are supported).
///      An 'abstract contract' provides a template or a partial implementation that other contracts can inherit and
/// complete.
///      It cannot be deployed on its own.

abstract contract SMARTContext {
    /// @notice Returns the effective sender of the current transaction.
    /// @dev This function is intended to be overridden by implementing contracts to provide
    ///      the correct sender address, especially in systems that might use meta-transactions.
    ///      If meta-transactions are used, `msg.sender` would be the forwarder, while `_smartSender()`
    ///      (or its underlying `_msgSender()`) would return the original user who signed the transaction.
    ///      `internal` means it's callable only from this contract and derived contracts.
    ///      `virtual` means it can be overridden by derived contracts.
    /// @return address The address of the transaction initiator.
    function _smartSender() internal view virtual returns (address);
}
