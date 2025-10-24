// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

// Base contract imports
import { SMARTExtensionUpgradeable } from "../common/SMARTExtensionUpgradeable.sol";

// Interface imports
import { _SMARTRedeemableLogic } from "./internal/_SMARTRedeemableLogic.sol";

/// @title Upgradeable SMART Redeemable Extension
/// @author SettleMint
/// @notice Provides ERC165 registration and common redemption helpers for SMART tokens.
abstract contract SMARTRedeemableUpgradeable is
    Initializable,
    ContextUpgradeable,
    SMARTExtensionUpgradeable,
    _SMARTRedeemableLogic
{
    /// @notice Initialises interface registration for the upgradeable variant.
    constructor() {
        __SMARTRedeemable_init_unchained();
    }

    /// @notice Registers the interface id during proxy initialization.
    function __SMARTRedeemable_init() internal onlyInitializing {
        __SMARTRedeemable_init_unchained();
    }

    /// @notice Performs the token burn for a redemption in upgradeable context.
    /// @param owner The address whose balance will be reduced.
    /// @param amount The amount of tokens to burn.
    function __redeemable_redeem(address owner, uint256 amount) internal virtual override {
        _burn(owner, amount);
    }
}
