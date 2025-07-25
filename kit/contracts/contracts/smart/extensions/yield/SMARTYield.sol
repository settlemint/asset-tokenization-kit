// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Context } from "@openzeppelin/contracts/utils/Context.sol";

// Base contract imports
import { SMARTExtension } from "../common/SMARTExtension.sol";
import { SMARTHooks } from "../common/SMARTHooks.sol";

// Internal implementation imports
import { _SMARTYieldLogic } from "./internal/_SMARTYieldLogic.sol";

/// @title Standard SMART Yield Extension (Non-Upgradeable)
/// @author SettleMint
/// @notice This contract provides a standard, non-upgradeable implementation for the SMART Yield
/// extension.
/// It allows a token to have an associated yield schedule, dictating how yield is accrued and potentially paid out.
/// @dev This is an `abstract` contract, meaning it is not meant to be deployed directly but rather inherited by a
/// final, concrete token contract.
/// It inherits from:
/// - `Context`: Provides access to `_msgSender()`, identifying the caller of a function.
/// - `SMARTExtension`: Provides common functionalities for SMART extensions (e.g., ERC165 interface registration via
/// `_SMARTYieldLogic`).
/// - `_SMARTYieldLogic`: Contains the core logic for managing the `yieldSchedule` address and the `_beforeMint` hook
/// logic.
/// This contract primarily serves to integrate the `_SMARTYieldLogic` into a non-upgradeable token structure.
/// It overrides the `_beforeMint` hook from `SMARTHooks` to include the yield-specific minting condition from
/// `__yield_beforeMintLogic`.
/// The final concrete token contract is expected to also inherit a standard ERC20 implementation and the core
/// `SMART.sol` logic.
/// It must also provide implementations for other `ISMARTYield` functions like `setYieldSchedule`, `yieldBasisPerUnit`,
/// `yieldToken`, and `canManageYield`,
/// typically by exposing `_smart_setYieldSchedule` with appropriate access control and defining the other view
/// functions.
abstract contract SMARTYield is Context, SMARTExtension, _SMARTYieldLogic {
    /// @notice Constructor for the `SMARTYield` extension.
    /// @dev When a contract inheriting `SMARTYield` is deployed, this constructor is called.
    /// It calls `__SMARTYield_init_unchained()` from the inherited `_SMARTYieldLogic` contract.
    /// This primarily serves to register the `ISMARTYield` interface (for ERC165 `supportsInterface` discovery).
    constructor() {
        // Calls the initializer in the logic contract to register the ISMARTYield interface.
        __SMARTYield_init_unchained();
    }

    // -- Hooks (Overrides) --

    /// @notice Overrides the `_beforeMint` hook from `SMARTHooks` to incorporate yield-specific logic.
    /// @dev This function is called internally before any tokens are minted.
    /// It first executes the `__yield_beforeMintLogic()` from `_SMARTYieldLogic`.
    /// This logic checks if a yield schedule is active and, if so, might prevent minting (reverting with
    /// `YieldScheduleActive`).
    /// After executing the yield-specific logic, it calls `super._beforeMint(to, amount)` to ensure that any
    /// `_beforeMint` hooks
    /// from other parent contracts in the inheritance chain are also executed. This maintains the composability of
    /// hooks.
    /// `internal virtual override(SMARTHooks)` indicates it's an internal function, can be further overridden,
    /// and specifically overrides the `_beforeMint` function from the `SMARTHooks` contract.
    /// @inheritdoc SMARTHooks
    /// @param to The address that will receive the minted tokens.
    /// @param amount The quantity of tokens to be minted.
    function _beforeMint(address to, uint256 amount) internal virtual override(SMARTHooks) {
        // Execute the yield-specific logic before minting.
        // This might revert if minting is not allowed due to an active yield schedule.
        __yield_beforeMintLogic();

        // Call the _beforeMint hook of the next contract in the inheritance chain (e.g., SMARTHooks itself, or another
        // extension).
        super._beforeMint(to, amount);
    }
}
