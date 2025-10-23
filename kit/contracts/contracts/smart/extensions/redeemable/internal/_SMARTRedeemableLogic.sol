// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { _SMARTExtension } from "../../common/_SMARTExtension.sol";
import { ISMARTRedeemable } from "../ISMARTRedeemable.sol";

/// @title Internal helper logic for SMART redeemable extensions
/// @author SettleMint
/// @notice Centralises hook orchestration and interface registration for redeemable flows.
abstract contract _SMARTRedeemableLogic is _SMARTExtension, ISMARTRedeemable {
    /// @notice Registers the redeeemable interface on inheriting contracts.
    function __SMARTRedeemable_init_unchained() internal {
        _registerInterface(type(ISMARTRedeemable).interfaceId);
    }

    /// @notice Performs the token burn for a redemption.
    /// @param owner The address whose balance is reduced.
    /// @param amount The quantity of tokens to burn.
    function __redeemable_redeem(address owner, uint256 amount) internal virtual;

    /// @notice Executes the shared redemption flow (hooks → burn → event).
    /// @param owner The address whose tokens are redeemed.
    /// @param amount The number of tokens redeemed.
    function _smart_redeemFor(address owner, uint256 amount) internal virtual {
        _beforeRedeem(owner, amount);
        __redeemable_redeem(owner, amount);
        _afterRedeem(owner, amount);
        emit ISMARTRedeemable.Redeemed(_smartSender(), owner, amount);
    }
}
