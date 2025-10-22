// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base contract imports
import { SMARTExtension } from "../common/SMARTExtension.sol";
import { ISMARTRedeemable } from "./ISMARTRedeemable.sol";
import { _SMARTRedeemableLogic } from "./internal/_SMARTRedeemableLogic.sol";

/// @title Standard SMART Redeemable Extension (Non-Upgradeable)
/// @author SettleMint
/// @notice Provides interface registration and common redemption helpers for SMART tokens.
/// @dev The external redemption entrypoint must still be implemented by inheriting contracts. This base only
///      exposes helpers that ensure redemptions invoke the correct ERC20 burn mechanics.
abstract contract SMARTRedeemable is SMARTExtension, _SMARTRedeemableLogic {
    constructor() {
        __SMARTRedeemable_init_unchained();
    }

    function __redeemable_redeem(address owner, uint256 amount) internal virtual override {
        _burn(owner, amount);
    }
}
