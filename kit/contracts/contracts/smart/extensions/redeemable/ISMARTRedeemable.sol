// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Interface for the SMART Redeemable Extension (delegated model)
/// @notice Contracts implementing this interface must expose a delegated redemption entrypoint and
///         take full responsibility for prerequisite checks, authorization, burning, payouts, and event emission.
interface ISMARTRedeemable {
    /// @notice Emitted when tokens are redeemed from `owner` and burned.
    /// @param sender The message sender that initiated the redemption.
    /// @param owner The holder whose balance decreased.
    /// @param amount The amount of tokens redeemed.
    event Redeemed(address indexed sender, address indexed owner, uint256 amount);

    /// @notice Redeem `amount` of tokens from `owner`.
    /// @dev Implementations must enforce access policy, run hooks, burn tokens, route payouts, and emit the event.
    /// @param owner The account whose balance is reduced.
    /// @param amount The quantity of tokens to redeem.
    /// @return success True when the redemption flow completes.
    function redeemFor(address owner, uint256 amount) external returns (bool success);
}
