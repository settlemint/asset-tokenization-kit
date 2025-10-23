// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Context } from "@openzeppelin/contracts/utils/Context.sol";

// Base contract imports
import { SMARTExtension } from "../common/SMARTExtension.sol";
import { _SMARTRedeemableLogic } from "./internal/_SMARTRedeemableLogic.sol";

/// @title Standard SMART Redeemable Extension (Non-Upgradeable)
/// @author SettleMint
/// @notice Provides interface registration and common redemption helpers for SMART tokens.
/// @dev The external redemption entrypoint must still be implemented by inheriting contracts. This base only
///      exposes helpers that ensure redemptions invoke the correct ERC20 burn mechanics.
abstract contract SMARTRedeemable is Context, SMARTExtension, _SMARTRedeemableLogic {
    /// @notice Sets up interface registration for inheriting contracts.
    constructor() {
        __SMARTRedeemable_init_unchained();
    }

    /// @notice Performs the actual token burn for a redemption.
    /// @param owner The address whose balance will be reduced.
    /// @param amount The amount of tokens to burn.
    function __redeemable_redeem(address owner, uint256 amount) internal virtual override {
        _burn(owner, amount);
    }
}
