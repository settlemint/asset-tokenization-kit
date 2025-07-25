// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { _SMARTExtension } from "../../common/_SMARTExtension.sol";
import { ISMARTBurnable } from "../ISMARTBurnable.sol";

/// @title Internal Logic for SMART Burnable Extension
/// @author SettleMint
/// @notice This abstract contract encapsulates the core, shared logic for token burning
/// operations
///         within the SMART framework. It is not meant to be deployed directly but serves as a base
///         for both standard (`SMARTBurnable`) and upgradeable (`SMARTBurnableUpgradeable`) burnable extensions.
///         It defines the common structure for burn functions and an event, while delegating the actual
///         token destruction to an abstract hook.
/// @dev This contract provides the public `burn` and `batchBurn` functions (as defined in `ISMARTBurnable`)
///      by calling internal `_smart_burn` and `_smart_batchBurn` helpers. These helpers, in turn,
///      rely on an abstract function `__burnable_executeBurn` which must be implemented by concrete
///      inheriting contracts (like `SMARTBurnable` or `SMARTBurnableUpgradeable`). This pattern separates
///      the general logic from the specific ERC20 implementation details.
///      It also handles the emission of the `BurnCompleted` event.

abstract contract _SMARTBurnableLogic is _SMARTExtension, ISMARTBurnable {
    // -- Internal Setup Function --

    /// @notice Internal unchained initializer for the burnable logic.
    /// @dev This function is intended to be called by the initializers or constructors of inheriting contracts.
    ///      Its primary role here is to register the `ISMARTBurnable` interface, making the contract
    ///      discoverable as supporting burnable operations via ERC165 introspection.
    ///      An "unchained" initializer does not call initializers of its parent contracts, giving more
    ///      control to the inheriting contract on how to chain initializations.
    function __SMARTBurnable_init_unchained() internal {
        _registerInterface(type(ISMARTBurnable).interfaceId);
    }

    // -- Abstract Functions (Dependencies) --

    /// @notice Abstract internal function that represents the actual token burning mechanism.
    /// @dev This function MUST be implemented by any concrete contract that inherits `_SMARTBurnableLogic`.
    ///      The implementation will be responsible for calling the appropriate low-level burn function
    ///      of the specific ERC20 token standard being used (e.g., `_burn` from OpenZeppelin's
    ///      `ERC20.sol` or `ERC20Upgradeable.sol`).
    ///      The `internal` visibility means it's only callable from within the contract hierarchy.
    ///      The `virtual` keyword signifies that this function is intended to be overridden.
    /// @param from The address from which tokens are to be burned.
    /// @param amount The quantity of tokens to burn.
    function __burnable_executeBurn(address from, uint256 amount) internal virtual;

    // -- Internal Implementation for Burnable Functions --

    /// @notice Internal core function to perform a single burn operation.
    /// @dev This function first calls the `__burnable_executeBurn` hook (which must be implemented
    ///      by the inheriting contract to do the actual token destruction) and then emits the
    ///      `BurnCompleted` event.
    ///      The `_smartSender()` function (from `_SMARTExtension`) is used to get the initiator of the transaction,
    ///      supporting meta-transactions if applicable.
    /// @param from The address from which tokens are burned.
    /// @param amount The amount of tokens to burn.
    function _smart_burn(address from, uint256 amount) internal virtual {
        __burnable_executeBurn(from, amount); // Execute the actual burn via the hook
        emit ISMARTBurnable.BurnCompleted(_smartSender(), from, amount); // Emit the event
    }

    /// @notice Internal core function to perform a batch burn operation.
    /// @dev This function iterates through the provided addresses and amounts, calling `_smart_burn`
    ///      for each pair. It first checks if the lengths of the input arrays match, reverting with
    ///      `LengthMismatch` if they don't.
    ///      The loop uses `unchecked { ++i; }` for minor gas optimization on the increment, as overflow is not possible
    /// here
    ///      given the loop condition `i < length`.
    /// @param userAddresses An array of addresses from which tokens are burned.
    /// @param amounts An array of corresponding token amounts to burn.
    function _smart_batchBurn(address[] calldata userAddresses, uint256[] calldata amounts) internal virtual {
        if (userAddresses.length != amounts.length) revert LengthMismatch();
        uint256 length = userAddresses.length;
        for (uint256 i = 0; i < length;) {
            _smart_burn(userAddresses[i], amounts[i]);
            unchecked {
                ++i;
            }
        }
    }
}
