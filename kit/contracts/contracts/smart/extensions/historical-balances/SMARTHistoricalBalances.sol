// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
// import { Context } from "@openzeppelin/contracts/utils/Context.sol"; // Context is inherited via SMARTExtension

// Base contract imports
import { SMARTExtension } from "../common/SMARTExtension.sol"; // Provides base functionalities for SMART extensions
import { SMARTHooks } from "../common/SMARTHooks.sol"; // Defines common hooks like _afterMint, _afterBurn

// Internal implementation imports
import { _SMARTHistoricalBalancesLogic } from "./internal/_SMARTHistoricalBalancesLogic.sol"; // Contains core logic

/// @title Standard (Non-Upgradeable) SMART Historical Balances Extension
/// @author SettleMint
/// @notice This abstract contract provides the non-upgradeable implementation for tracking
/// historical
///         token balances and total supply for a SMART token.
/// @dev It integrates the core checkpointing logic from `_SMARTHistoricalBalancesLogic` into the standard
///      (non-upgradeable) SMART token lifecycle. This is achieved by overriding the `SMARTHooks`
///      (`_afterMint`, `_afterBurn`, `_afterTransfer`) to call the corresponding internal logic functions
///      from `_SMARTHistoricalBalancesLogic` that update the checkpoints.
///      This contract is 'abstract' and is intended to be inherited by a final, deployable, non-upgradeable
///      SMART token contract. The final token contract would also inherit a standard ERC20 implementation
///      and the main `SMART.sol` (or equivalent).
///      The constructor calls `__SMARTHistoricalBalances_init_unchained()` to ensure the historical balances
///      interface is registered for ERC165 introspection.
abstract contract SMARTHistoricalBalances is SMARTExtension, _SMARTHistoricalBalancesLogic {
    /// @notice Constructor for the standard Historical Balances extension.
    /// @dev Calls the unchained initializer from `_SMARTHistoricalBalancesLogic`.
    ///      This is primarily to register the `ISMARTHistoricalBalances` interface ID via `_registerInterface`,
    ///      making the extension discoverable through ERC165 `supportsInterface`.
    constructor() {
        // Initialize the core historical balances logic (mainly for ERC165 interface registration).
        __SMARTHistoricalBalances_init_unchained();
    }

    /// @notice Hook that is called *after* any token minting operation.
    /// @dev Overrides `SMARTHooks._afterMint`. It first calls `super._afterMint` to ensure that any
    ///      `_afterMint` logic from other inherited contracts (like the base `SMART.sol` or other extensions)
    ///      is executed. Then, it calls `__historical_balances_afterMintLogic` from `_SMARTHistoricalBalancesLogic`
    ///      to update the total supply checkpoint and the recipient's balance checkpoint.
    /// @param to The address that received the minted tokens.
    /// @param amount The amount of tokens minted.
    function _afterMint(address to, uint256 amount) internal virtual override(SMARTHooks) {
        super._afterMint(to, amount); // Preserve hook chain: call parent/other extension's _afterMint logic first.
            // Call the specific logic from _SMARTHistoricalBalancesLogic to update checkpoints.
        __historical_balances_afterMintLogic(to, amount);
    }

    /// @notice Hook that is called *after* any token burning operation.
    /// @dev Overrides `SMARTHooks._afterBurn`. Calls `super._afterBurn` first, then invokes
    ///      `__historical_balances_afterBurnLogic` to update the total supply and the burner's balance checkpoints.
    /// @param from The address whose tokens were burned.
    /// @param amount The amount of tokens burned.
    function _afterBurn(address from, uint256 amount) internal virtual override(SMARTHooks) {
        super._afterBurn(from, amount); // Preserve hook chain.
            // Update historical checkpoints for the burn operation.
        __historical_balances_afterBurnLogic(from, amount);
    }

    /// @notice Hook that is called *after* any token transfer operation.
    /// @dev Overrides `SMARTHooks._afterTransfer`. Calls `super._afterTransfer` first, then calls
    ///      `__historical_balances_afterTransferLogic` to update the balance checkpoints for both the sender
    ///      and the recipient involved in the transfer.
    /// @param from The address that sent the tokens.
    /// @param to The address that received the tokens.
    /// @param amount The amount of tokens transferred.
    function _afterTransfer(address from, address to, uint256 amount) internal virtual override(SMARTHooks) {
        super._afterTransfer(from, to, amount); // Preserve hook chain.
            // Update historical checkpoints for the transfer operation.
        __historical_balances_afterTransferLogic(from, to, amount);
    }
}
