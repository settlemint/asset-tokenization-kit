// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base contract imports
import { SMARTExtension } from "../common/SMARTExtension.sol";
import { SMARTHooks } from "../common/SMARTHooks.sol";
// Internal implementation imports
import { _SMARTCollateralLogic } from "./internal/_SMARTCollateralLogic.sol";

/// @title Standard (Non-Upgradeable) SMART Collateral Extension
/// @author SettleMint
/// @notice This contract adds a collateral verification requirement to a standard,
/// non-upgradeable
///         SMART token. Before new tokens can be minted, this extension checks for a valid
///         collateral claim on the token contract's own OnchainID identity.
///         'Non-upgradeable' means the contract's code is fixed after deployment.
/// @dev This is an `abstract contract` and must be inherited by a concrete token contract to be used.
///      It pulls in the core collateral checking logic from `_SMARTCollateralLogic`.
///      For this extension to work, the final token contract must also inherit:
///      1. A standard ERC20 implementation (e.g., OpenZeppelin's `ERC20.sol`) to provide `totalSupply()`.
///      2. The core SMART contract implementation (e.g., `SMART.sol`) to provide access to `onchainID()`
///         (the token's own identity contract) and `identityRegistry()`.
///      3. `SMARTHooks` (from the SMART framework) to provide the `_beforeMint` hook mechanism.
///      The collateral check is enforced by overriding the `_beforeMint` hook. This hook runs before
///      any minting operation, and this extension uses it to call `__collateral_beforeMintLogic`,
///      which performs the actual validation against the collateral claim.
abstract contract SMARTCollateral is SMARTExtension, _SMARTCollateralLogic {
    /// @notice Constructor to initialize the collateral extension.
    /// @dev This constructor is called when a contract inheriting `SMARTCollateral` is deployed.
    ///      It sets the ERC-735 claim topic ID that will be used to identify relevant collateral claims.
    ///      This is done by calling `__SMARTCollateral_init_unchained` from the inherited `_SMARTCollateralLogic`.
    /// @param collateralProofTopic_ The `uint256` topic ID for the collateral proof claim. This ID is used
    ///                              to look up specific claims on an OnchainID identity contract.
    constructor(uint256 collateralProofTopic_) {
        __SMARTCollateral_init_unchained(collateralProofTopic_);
    }

    /// @notice Returns the total supply of tokens for collateral calculations.
    /// @return The total supply of tokens.
    /// @inheritdoc _SMARTCollateralLogic
    function __collateral_totalSupply() internal view virtual override returns (uint256) {
        return totalSupply();
    }

    // -- Hooks (Overrides) --

    /// @notice Hook that is executed by the `SMARTHooks` system before any mint operation.
    /// @dev This function overrides the `_beforeMint` hook from the `SMARTHooks` contract.
    ///      Its primary role here is to inject the collateral verification logic. It calls
    ///      `__collateral_beforeMintLogic` (from `_SMARTCollateralLogic`). This logic function
    ///      will attempt to find a valid collateral claim on the token contract's own identity
    ///      and ensure the collateral amount is sufficient for the proposed new total supply.
    ///      If the check fails (e.g., no valid claim, or insufficient collateral), `__collateral_beforeMintLogic` will
    /// revert.
    ///      After its check, it calls `super._beforeMint(to, amount)`.
    ///      The `super` keyword is vital: it calls the `_beforeMint` function of the next contract
    ///      in the inheritance hierarchy. This ensures that if other extensions also use this hook,
    ///      their logic is executed, maintaining a chain of hook calls.
    /// @param to The address that will receive the minted tokens (not directly used by this specific collateral check,
    ///           as the collateral is global to the token contract itself).
    /// @param amount The amount of tokens to be minted.
    /// @inheritdoc SMARTHooks
    function _beforeMint(address to, uint256 amount) internal virtual override(SMARTHooks) {
        // Perform the collateral check: ensures a valid claim exists on the token's own identity
        // and that the collateral amount covers the (current total supply + amount to be minted).
        __collateral_beforeMintLogic(amount);
        super._beforeMint(to, amount); // Proceed to the next hook in the inheritance chain.
    }
}
