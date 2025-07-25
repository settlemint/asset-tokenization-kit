// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Base contract imports
import { _SMARTExtension } from "./_SMARTExtension.sol";
import { SMARTContext } from "./SMARTContext.sol";

/// @title Standard (Non-Upgradeable) SMART Token Extension Base
/// @author SettleMint
/// @notice This abstract contract serves as a foundational base for all standard
/// (non-upgradeable)
///         SMART token extensions. It combines common SMART functionalities with a standard ERC20 token.
/// @dev It inherits from `_SMARTExtension` (which provides common SMART logic like interface registration
///      and hook definitions via `SMARTHooks`) and OpenZeppelin's `ERC20.sol` (the standard ERC20 token
/// implementation).
///      It provides a concrete implementation for `_smartSender()` from `SMARTContext` by delegating to
///      `_msgSender()` from OpenZeppelin's `Context.sol` (which `ERC20.sol` inherits).
///      This ensures that extensions built on `SMARTExtension` have access to both ERC20 token features
///      and the SMART framework's context and hook system.
///      An 'abstract contract' is a template and cannot be deployed directly; it must be inherited.
///      The comment "These hooks should be called first in any override implementation" is a reminder
///      to developers creating new extensions that if they override any hook (e.g., `_beforeMint` from `SMARTHooks`),
///      they should typically call `super._beforeMint(...)` to ensure the original hook logic (and any other
///      extensions' logic) is also executed.
abstract contract SMARTExtension is _SMARTExtension, ERC20 {
    /// @notice Returns the effective sender of the current transaction for standard (non-meta-transaction) contexts.
    /// @dev This function overrides `_smartSender()` from `SMARTContext`.
    ///      It directly calls `_msgSender()` which, in a standard non-ERC2771 context (as provided by `ERC20.sol`
    ///      via `Context.sol`), will return `msg.sender` (the direct caller of the contract).
    ///      `internal view virtual override(SMARTContext)` means:
    ///      - `internal`: Callable only from this contract and derived contracts.
    ///      - `view`: Does not modify state.
    ///      - `virtual`: Can be overridden by further derived contracts.
    ///      - `override(SMARTContext)`: Specifically states it's overriding `_smartSender` from `SMARTContext`.
    /// @return address The address of the transaction initiator (typically `msg.sender`).
    function _smartSender() internal view virtual override(SMARTContext) returns (address) {
        return _msgSender(); // In ERC20 (via Context.sol), _msgSender() returns msg.sender.
    }
}
