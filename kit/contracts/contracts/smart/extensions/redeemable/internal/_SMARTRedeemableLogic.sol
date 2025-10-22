// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ISMARTRedeemable } from "../ISMARTRedeemable.sol";

/// @title Internal helper logic for SMART redeemable extensions
/// @notice Centralises hook orchestration and interface registration for redeemable flows.
abstract contract _SMARTRedeemableLogic {
    function _registerInterface(bytes4 interfaceId) internal virtual;
    function _smartSender() internal view virtual returns (address);
    function _beforeRedeem(address owner, uint256 amount) internal virtual;
    function _afterRedeem(address owner, uint256 amount) internal virtual;
    function __redeemable_redeem(address owner, uint256 amount) internal virtual;

    /// @notice Registers the ISMARTRedeemable interface.
    function __SMARTRedeemable_init_unchained() internal {
        _registerInterface(type(ISMARTRedeemable).interfaceId);
    }

    /// @notice Executes the shared redemption flow (hooks → burn → event).
    function _smart_redeemFor(address owner, uint256 amount) internal virtual {
        address caller = _smartSender();
        _beforeRedeem(owner, amount);
        __redeemable_redeem(owner, amount);
        _afterRedeem(owner, amount);
        emit ISMARTRedeemable.Redeemed(owner, caller, amount);
    }
}
