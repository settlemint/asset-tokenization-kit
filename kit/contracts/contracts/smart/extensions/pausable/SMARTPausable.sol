// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// Note: We don't inherit OpenZeppelin's `ERC20Pausable` directly. This is often done to have more
// granular control over the pausable logic, potentially to avoid state variable clashes if `_SMARTPausableLogic`
// (which brings its own `_paused` variable and modifiers) is also used, or to integrate with a custom
// authorization system for `pause`/`unpause` that differs from `ERC20Pausable`'s `Ownable`-based approach.
// Instead, this contract inherits pausable logic via `_SMARTPausableLogic` and then re-applies
// the `whenNotPaused` modifier to the relevant ERC20 functions (specifically `_update`).
// import { Context } from "@openzeppelin/contracts/utils/Context.sol"; // Context is inherited via SMARTExtension

// Base contract imports
import { SMARTExtension } from "../common/SMARTExtension.sol"; // Provides common functionalities for SMART
    // extensions.

// Internal implementation imports
import { _SMARTPausableLogic } from "./internal/_SMARTPausableLogic.sol"; // Contains core pausable state and modifiers.

/// @title Standard (Non-Upgradeable) SMART Pausable Extension
/// @author SettleMint
/// @notice This abstract contract provides the non-upgradeable implementation of pausable
/// functionality
///         for a SMART token. It allows core token operations (transfers, mints, burns) to be halted.
/// @dev It integrates the pausable logic from `_SMARTPausableLogic` (which includes the `_paused` state
///      variable and `whenNotPaused` modifier) with a standard `ERC20` token.
///      This is achieved by overriding the `ERC20._update` function and applying the `whenNotPaused`
///      modifier to it. Since `_update` is the internal function used by `_transfer`, `_mint`, and `_burn`
///      in OpenZeppelin's ERC20, this effectively pauses all standard token movements.
///      This contract is 'abstract' and is intended to be inherited by a final, deployable, non-upgradeable
///      SMART token. The final token would also inherit a full `ERC20` implementation (like `SMART.sol`),
///      the main `SMART.sol` logic itself, and an authorization mechanism (e.g.,
///      `SMARTPausableAccessControlAuthorization.sol`) to control who can call `pause` and `unpause`.
///      The constructor calls `__SMARTPausable_init_unchained()` to register the pausable interface.
abstract contract SMARTPausable is SMARTExtension, _SMARTPausableLogic {
    // Developer Note: The final concrete contract inheriting `SMARTPausable` must also inherit:
    // 1. A standard ERC20 implementation (e.g., `SMART.sol` which inherits OpenZeppelin's `ERC20.sol`).
    // 2. An authorization contract (e.g., `SMARTPausableAccessControlAuthorization.sol`) that implements
    //    the necessary authorization checks (like `_authorizePause`) for the `pause`/`unpause` functions
    //    which would internally call `_SMARTPausableLogic._smart_pause()` and `_smart_unpause()`.

    /// @notice Constructor for the standard Pausable extension.
    /// @param initiallyPaused If true, the contract will be initialized in a paused state.
    /// @dev Calls the unchained initializer from `_SMARTPausableLogic`.
    ///      This is primarily to register the `ISMARTPausable` interface ID via `_registerInterface`,
    ///      making the extension discoverable through ERC165 `supportsInterface`.
    constructor(bool initiallyPaused) {
        // Initialize the core pausable logic (mainly for ERC165 interface registration).
        __SMARTPausable_init_unchained(initiallyPaused);
    }

    // -- Internal Hooks & Overrides --

    /**
     * @notice Overrides the base `ERC20._update` function to integrate pausable functionality.
     * @dev This is a key integration point. By applying the `whenNotPaused` modifier (inherited from
     *      `_SMARTPausableLogic`) to `_update`, all standard token operations that rely on `_update`
     *      (i.e., `_transfer`, `_mint`, `_burn` in OpenZeppelin ERC20) are effectively paused when the
     *      contract is in a paused state.
     *      It then calls `super._update` to delegate the actual token ledger update to the next contract
     *      in the inheritance chain (which is typically `SMART.sol` or the base `ERC20.sol` if `SMART.sol`
     *      itself calls super in its own `_update` override).
     * @param from The address from which tokens are being sent (or `address(0)` for mints).
     * @param to The address to which tokens are being sent (or `address(0)` for burns).
     * @param value The amount of tokens being affected.
     */
    function _update(address from, address to, uint256 value) internal virtual override(ERC20) whenNotPaused {
        // The `whenNotPaused` modifier is inherited from `_SMARTPausableLogic`.
        // It will cause a revert with `TokenPaused` error if `paused()` is true.

        // `super._update` calls the `_update` function of the parent contract in the inheritance hierarchy
        // that also overrides `_update`. In a typical SMART token setup, this would be `SMART.sol`'s `_update`,
        // which in turn calls `SMARTHooks` and then potentially the base `ERC20._update`.
        super._update(from, to, value);
    }
}
