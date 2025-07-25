// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

// Base contract imports
import { _SMARTExtension } from "./_SMARTExtension.sol";
import { SMARTContext } from "./SMARTContext.sol";
/// @title Upgradeable SMART Token Extension Base
/// @author SettleMint
/// @notice This abstract contract serves as a foundational base for all upgradeable SMART token
/// extensions.
///         It combines common SMART functionalities with an upgradeable ERC20 token framework.
///         'Upgradeable' means the contract's logic can be changed after deployment via a proxy pattern,
///         without changing the contract's address.
/// @dev It inherits from `Initializable` (for managing initialization in upgradeable contracts),
///      `_SMARTExtension` (for common SMART logic and hooks), and OpenZeppelin's `ERC20Upgradeable`.
///      It provides an implementation for `_smartSender()` from `SMARTContext` by delegating to `_msgSender()`,
///      which in `ERC20Upgradeable` (via `ContextUpgradeable` and potentially `ERC2771ContextUpgradeable`
///      if further inherited) can support meta-transactions.
///      The constructor calls `_disableInitializers()` to prevent re-initialization of this base contract part
///      when an inheriting contract is initialized through a proxy. This is a standard safety measure for
///      OpenZeppelin Upgradeable contracts.
///      The comment "These hooks should be called first in any override implementation" is a general guideline
///      for developers extending SMART hooks: always call `super.hookFunction(...)` in overrides.

abstract contract SMARTExtensionUpgradeable is Initializable, _SMARTExtension, ERC20Upgradeable {
    /// @notice Constructor for the upgradeable extension base.
    /// @dev This constructor is typically called when the implementation contract (logic contract)
    ///      is deployed, but not when it's initialized via a proxy.
    ///      It calls `_disableInitializers()` as a safeguard. In OpenZeppelin's upgradeable contracts pattern,
    ///      initialization logic is placed in `initializer` functions (like `__ERC20_init`), not constructors.
    ///      `_disableInitializers()` sets a flag indicating that all `initializer` modifiers in this contract
    ///      and its `Initializable` parents should prevent their respective `initializer` functions from running again.
    ///      The `@custom:oz-upgrades-unsafe-allow constructor` tag is used to inform OpenZeppelin's upgrade tools
    ///      that this constructor is intentionally present and understood in an upgradeable contract context.
    constructor() {
        _disableInitializers();
    }

    /// @notice Returns the effective sender of the current transaction, supporting meta-transactions if configured.
    /// @dev This function overrides `_smartSender()` from `SMARTContext`.
    ///      It calls `_msgSender()`, which in `ERC20Upgradeable` (potentially via `ERC2771ContextUpgradeable`
    ///      if the final contract uses it for meta-transactions) will return the original user's address
    ///      even if the call came through a trusted forwarder.
    ///      If not using ERC2771, it defaults to `msg.sender` (via `ContextUpgradeable`).
    /// @return address The address of the transaction initiator.
    function _smartSender() internal view virtual override(SMARTContext) returns (address) {
        return _msgSender(); // In ERC20Upgradeable, _msgSender() can support meta-tx via ERC2771ContextUpgradeable.
    }
}
