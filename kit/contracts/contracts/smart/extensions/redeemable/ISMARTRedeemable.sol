// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Interface for the SMART Redeemable Extension
/// @author SettleMint
/// @notice This interface defines the functions that a SMART Redeemable token extension must
/// implement.
/// It allows token holders to redeem (burn) their own tokens, effectively reducing the total supply.
/// @dev This interface is intended to be implemented by contracts that provide redeemable token functionality.
/// The functions defined here are external, meaning they can be called from outside the contract.
interface ISMARTRedeemable {
    /// @notice Emitted when tokens are successfully redeemed (burned by the token holder).
    /// @dev This event is crucial for tracking the reduction of token supply due to redemptions.
    /// It signifies that a token holder has voluntarily exchanged their tokens to have them permanently removed from
    /// circulation.
    /// Off-chain services can listen to this event to update balances, statistics, or trigger other processes.
    /// The `indexed` keyword for `sender` allows for efficient searching and filtering of these events based on the
    /// sender's address.
    /// @param sender The address of the token holder who redeemed their tokens. This address initiated the redeem
    /// transaction.
    /// @param amount The quantity of tokens that were redeemed and thus burned. This is the amount by which the
    /// sender's
    /// balance and the total supply decreased.
    event Redeemed(address indexed sender, uint256 indexed amount);

    // -- State-Changing Functions --

    /// @notice Allows the caller (the token holder) to redeem a specific amount of their own tokens.
    /// @dev When a token holder calls this function, the specified `amount` of their tokens will be burned (destroyed).
    /// This action reduces both the token holder's balance and the total supply of the token.
    /// The function should:
    /// 1. Optionally execute a `_beforeRedeem` hook for pre-redemption logic.
    /// 2. Perform the burn operation via an internal function like `_redeemable_executeBurn`.
    /// 3. Optionally execute an `_afterRedeem` hook for post-redemption logic.
    /// 4. Emit a `Redeemed` event to log the transaction on the blockchain.
    /// The contract implementing this interface is expected to use `_msgSender()` to identify the caller.
    /// @param amount The quantity of tokens the caller wishes to redeem. Must be less than or equal to the caller's
    /// balance.
    /// @return success A boolean value indicating whether the redemption was successful (typically `true`).
    function redeem(uint256 amount) external returns (bool success);

    /// @notice Allows the caller (the token holder) to redeem all of their own tokens.
    /// @dev When a token holder calls this function, their entire balance of this token will be burned (destroyed).
    /// This action reduces the token holder's balance to zero and decreases the total supply of the token accordingly.
    /// The function should:
    /// 1. Determine the caller's current token balance.
    /// 2. Optionally execute a `_beforeRedeem` hook for pre-redemption logic with the full balance amount.
    /// 3. Perform the burn operation for the full balance via an internal function like `_redeemable_executeBurn`.
    /// 4. Optionally execute an `_afterRedeem` hook for post-redemption logic with the full balance amount.
    /// 5. Emit a `Redeemed` event to log the transaction on the blockchain.
    /// The contract implementing this interface is expected to use `_msgSender()` to identify the caller.
    /// @return success A boolean value indicating whether the redemption of all tokens was successful (typically
    /// `true`).
    function redeemAll() external returns (bool success);
}
