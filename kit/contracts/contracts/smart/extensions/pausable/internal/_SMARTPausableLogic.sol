// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Common base extension for _smartSender() and _registerInterface()
import { _SMARTExtension } from "../../common/_SMARTExtension.sol";

// Interface for ERC165 registration and type compatibility
import { ISMARTPausable } from "../ISMARTPausable.sol";

/// @title Internal Core Logic for SMART Pausable Extension
/// @author SettleMint
/// @notice This abstract contract encapsulates the shared state (`_paused`), core logic for
/// pause/unpause
///         operations, event emissions, and modifiers (`whenNotPaused`, `whenPaused`) related to pausable
///         functionality.
/// @dev It is designed to be inherited by both standard (`SMARTPausable.sol`) and upgradeable
///      (`SMARTPausableUpgradeable.sol`) concrete pausable extension implementations. This ensures consistent
///      behavior for pausing and unpausing the token's core operations (like transfers).
///      An 'abstract contract' provides a template or partial implementation and cannot be deployed directly.
///      It relies on inheriting contracts to provide any further concrete implementations or connect to authorization
///      mechanisms.
///      The actual `pause()` and `unpause()` external functions that users/admins call are expected to be in
///      the concrete inheriting contracts, which would then call `_smart_pause()` and `_smart_unpause()`
///      internally after performing necessary authorization checks.
abstract contract _SMARTPausableLogic is _SMARTExtension, ISMARTPausable {
    // -- State Variables --

    /// @notice Internal boolean flag indicating the paused state of the contract.
    /// @dev `true` if the contract is paused, `false` otherwise. Initialized to `false` by default.
    ///      `private` visibility restricts direct access to this contract only. Derived contracts interact
    ///      with this state via the `paused()`, `_smart_pause()`, and `_smart_unpause()` functions and modifiers.
    bool private _paused;

    // -- Internal Setup Function --

    /// @notice Internal initializer function for the pausable logic.
    /// @param initiallyPaused If true, the contract will be initialized in a paused state.
    /// @dev This function should be called ONLY ONCE during the setup of the concrete pausable extension
    ///      (either in its constructor for non-upgradeable or initializer for upgradeable versions).
    ///      Its primary role is to register the `ISMARTPausable` interface ID using `_registerInterface`
    ///      and optionally set the initial state to paused.
    ///      If initialized as paused, it will emit a `Paused` event with `_smartSender()` as the initiator.
    function __SMARTPausable_init_unchained(bool initiallyPaused) internal {
        _registerInterface(type(ISMARTPausable).interfaceId);
        if (initiallyPaused) {
            _paused = true;
            emit Paused(_smartSender());
        }
    }

    // -- View Functions (ISMARTPausable Implementation) --

    /// @inheritdoc ISMARTPausable
    /// @notice Returns `true` if the contract is currently paused, and `false` otherwise.
    /// @dev Reads the private `_paused` state variable.
    function paused() public view virtual override returns (bool) {
        return _paused;
    }

    // -- Internal State-Changing Functions --
    // These are called by the public pause/unpause functions in concrete contracts after authorization.

    /// @notice Internal function to transition the contract to the paused state.
    /// @dev Sets the `_paused` flag to `true` and emits a `Paused` event with `_smartSender()` as the initiator.
    ///      Reverts with `ExpectedPause` if the contract is already paused. (Note: The error name might seem
    ///      counter-intuitive; it implies an expectation that the contract *was not* paused before this call).
    ///      This function itself does not contain authorization; that is expected to be handled by the caller
    ///      in the concrete contract (e.g., using an `onlyPauserRole` modifier on the public `pause()` function).
    function _smart_pause() internal virtual {
        if (_paused) revert ExpectedPause(); // Already paused, prevent re-pausing.
        _paused = true;
        emit Paused(_smartSender()); // _smartSender() is from _SMARTExtension, providing the msg.sender of the
            // external call.
    }

    /// @notice Internal function to transition the contract out of the paused state (unpause).
    /// @dev Sets the `_paused` flag to `false` and emits an `Unpaused` event with `_smartSender()`.
    ///      Reverts with `TokenPaused` if the contract is not currently paused. (Note: Error name might suggest
    ///      it expects the token *to be* paused for unpausing to be valid).
    ///      Authorization is handled by the caller in the concrete contract.
    function _smart_unpause() internal virtual {
        if (!_paused) revert TokenPaused(); // Not paused, cannot unpause.
        _paused = false;
        emit Unpaused(_smartSender());
    }

    // -- Modifiers --

    /// @notice Modifier to restrict a function to be callable only when the contract is *not* paused.
    /// @dev If `paused()` returns `true`, the function call will revert with a `TokenPaused` error.
    ///      This is typically applied to functions like `transfer`, `mint`, `burn` to halt these
    ///      operations during a pause.
    ///      The `_;` statement indicates where the modified function's body will be executed.
    modifier whenNotPaused() {
        _whenNotPaused();
        _;
    }

    /// @notice Guards logic that can only run while the token is active.
    function _whenNotPaused() internal view {
        if (paused()) {
            revert TokenPaused();
        }
    }

    /// @notice Modifier to restrict a function to be callable only when the contract *is* paused.
    /// @dev If `paused()` returns `false` (i.e., not paused), the function call will revert with an
    ///      `ExpectedPause` error.
    ///      This might be used for specific administrative functions that should only run during a maintenance
    ///      (paused) period.
    modifier whenPaused() {
        _whenPaused();
        _;
    }

    /// @notice Guards logic that executes exclusively during maintenance pauses.
    function _whenPaused() internal view {
        if (!paused()) {
            revert ExpectedPause();
        }
    }
}
