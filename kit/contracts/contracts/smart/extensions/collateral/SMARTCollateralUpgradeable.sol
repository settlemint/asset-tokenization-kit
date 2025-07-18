// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

// Base contract imports
import { SMARTExtensionUpgradeable } from "../common/SMARTExtensionUpgradeable.sol";
import { SMARTHooks } from "../common/SMARTHooks.sol"; // Consider SMARTHooksUpgradeable if available and preferred

// Internal implementation imports
import { _SMARTCollateralLogic } from "./internal/_SMARTCollateralLogic.sol";

// Interface imports
import { ISMARTCollateral } from "./ISMARTCollateral.sol";

/// @title Upgradeable SMART Collateral Extension
/// @notice This contract adds a collateral verification requirement to an upgradeable SMART token.
///         Before new tokens can be minted, it checks for a valid collateral claim on the token
///         contract's own OnchainID identity.
///         'Upgradeable' means the contract's logic can be changed post-deployment via a proxy,
///         without altering the contract's address.
/// @dev This `abstract contract` must be inherited by a concrete upgradeable token contract.
///      It uses `Initializable` for managing initialization in an upgradeable proxy context.
///      It inherits core logic from `_SMARTCollateralLogic` and common features from `SMARTExtensionUpgradeable`.
///      The final token contract must also inherit:
///      1. An upgradeable ERC20 (e.g., `ERC20Upgradeable`) for `totalSupply()`.
///      2. The core upgradeable SMART contract (e.g., `SMARTUpgradeable`) for `onchainID()` and `identityRegistry()`.
///      3. `SMARTHooks` (or `SMARTHooksUpgradeable`) for the `_beforeMint` hook mechanism.
///      Careful attention to storage layout is crucial when working with upgradeable contracts to avoid
///      storage slot collisions during upgrades.
abstract contract SMARTCollateralUpgradeable is Initializable, SMARTExtensionUpgradeable, _SMARTCollateralLogic {
    /// @dev Register the `ISMARTCollateral` interface ID for ERC165. This allows factories to check if the
    /// contract
    /// supports the `ISMARTCollateral` interface based on the upgradeable implementation.
    constructor() {
        _registerInterface(type(ISMARTCollateral).interfaceId);
    }

    /// @notice Initializer for the upgradeable collateral extension.
    /// @dev This function should be called only once, typically within the main contract's `initialize` function,
    ///      when deploying or upgrading the implementation contract behind a proxy.
    ///      The `onlyInitializing` modifier (from OpenZeppelin's `Initializable`) prevents this function
    ///      from being called multiple times, which is a critical security feature for upgradeable contracts.
    ///      It sets the ERC-735 claim topic ID for collateral verification by calling
    ///      `__SMARTCollateral_init_unchained` from `_SMARTCollateralLogic`.
    /// @param collateralProofTopic_ The `uint256` topic ID for the collateral proof claim. This ID is used
    ///                              to identify the specific type of claim on an OnchainID identity contract.
    function __SMARTCollateral_init(uint256 collateralProofTopic_) internal onlyInitializing {
        // Calls the internal initializer from the logic contract to set the topic ID.
        __SMARTCollateral_init_unchained(collateralProofTopic_);
    }

    /// @inheritdoc _SMARTCollateralLogic
    function __collateral_totalSupply() internal view virtual override returns (uint256) {
        return totalSupply();
    }

    // -- Hooks (Overrides) --

    /// @notice Hook that is executed by the `SMARTHooks` system before any mint operation.
    /// @dev This function overrides the `_beforeMint` hook from the `SMARTHooks` contract.
    ///      It injects the collateral verification logic by calling `__collateral_beforeMintLogic`
    ///      (from `_SMARTCollateralLogic`). This logic checks for a valid collateral claim on the
    ///      token's own identity and ensures the collateral amount is sufficient for the new total supply.
    ///      If the check fails, `__collateral_beforeMintLogic` will revert the transaction.
    ///      It then calls `super._beforeMint(to, amount)` to pass control to the next `_beforeMint` hook
    ///      in the inheritance chain. This is crucial for composability with other extensions.
    /// @param to The address that will receive the minted tokens (not directly used by this collateral check,
    ///           as collateral is global to the token contract).
    /// @param amount The amount of tokens to be minted.
    /// @inheritdoc SMARTHooks
    function _beforeMint(address to, uint256 amount) internal virtual override(SMARTHooks) {
        // Perform the collateral check: ensures a valid claim on the token's own identity
        // covers the (current total supply + amount to be minted).
        __collateral_beforeMintLogic(amount);
        super._beforeMint(to, amount); // Proceed to the next hook in the inheritance chain.
    }
}
