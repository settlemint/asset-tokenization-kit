// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol"; // Added for
    // completeness, though _SMARTYieldLogic itself doesn't inherit Initializable directly for its own init

// Base contract imports
import { SMARTExtensionUpgradeable } from "../common/SMARTExtensionUpgradeable.sol";
import { SMARTHooks } from "../common/SMARTHooks.sol"; // Note: For upgradeable, hooks might be handled by
    // SMARTUpgradeable which inherits SMARTHooks indirectly.

// Internal implementation imports
import { _SMARTYieldLogic } from "./internal/_SMARTYieldLogic.sol";

// Interface imports
import { ISMARTYield } from "./ISMARTYield.sol";

/// @title Upgradeable SMART Yield Extension
/// @author SettleMint
/// @notice This contract provides an upgradeable implementation for the SMART Yield extension.
/// It allows a token to have an associated yield schedule. Being "upgradeable" means its logic
/// can be updated after deployment via a proxy pattern.
/// @dev This is an `abstract` contract, designed to be inherited by a final, concrete upgradeable token contract.
/// It inherits from:
/// - `ContextUpgradeable`: Provides `_msgSender()` in an upgradeable context.
/// - `SMARTExtensionUpgradeable`: Provides common functionalities for SMART extensions in an upgradeable context (e.g.,
/// ERC165 registration).
/// - `_SMARTYieldLogic`: Contains the core logic for managing `yieldSchedule` and the `_beforeMint` hook logic.
/// It also implicitly requires `Initializable` for its own `__SMARTYield_init` function.
/// This contract integrates `_SMARTYieldLogic` into an upgradeable token structure.
/// It overrides the `_beforeMint` hook (expected to be available from an inherited `SMARTUpgradeable` or similar base
/// that includes `SMARTHooks`)
/// to include the yield-specific minting condition from `__yield_beforeMintLogic`.
/// The final concrete token is expected to inherit `ERC20Upgradeable`, `SMARTUpgradeable`, and call
/// `__SMARTYield_init()` in its main initializer.
/// It must also implement other `ISMARTYield` functions.
abstract contract SMARTYieldUpgradeable is
    Initializable,

    // Added to explicitly acknowledge its use for __SMARTYield_init
    ContextUpgradeable,
    SMARTExtensionUpgradeable,
    _SMARTYieldLogic
{
    /// @notice Register the interface ID for ERC165.
    /// @dev This allows factories to check if the
    /// contract
    /// supports the `ISMARTYield` interface based on the upgradeable implementation.
    constructor() {
        _registerInterface(type(ISMARTYield).interfaceId);
    }

    // -- Initializer --

    /// @notice Initializes the upgradeable SMART Yield extension.
    /// @dev This function should be called once, typically within the main `initialize` function of the concrete
    /// upgradeable token contract that inherits `SMARTYieldUpgradeable`.
    /// The `onlyInitializing` modifier (from OpenZeppelin's `Initializable`) ensures this function can only be called
    /// during the contract's initialization phase, preventing re-initialization.
    /// It calls `__SMARTYield_init_unchained()` from the inherited `_SMARTYieldLogic` contract.
    /// This primarily serves to register the `ISMARTYield` interface for ERC165 `supportsInterface` discovery.
    function __SMARTYield_init() internal onlyInitializing {
        // Calls the unchained initializer from the logic contract. This handles ERC165 interface registration.
        __SMARTYield_init_unchained();
    }

    // -- Hooks (Overrides) --

    /// @notice Overrides the `_beforeMint` hook to incorporate yield-specific logic in an upgradeable context.
    /// @dev This function is called internally before any tokens are minted. It assumes that the base upgradeable
    /// token contract (e.g., `SMARTUpgradeable`) provides a virtual `_beforeMint` hook by inheriting `SMARTHooks`.
    /// It first executes `__yield_beforeMintLogic()` from `_SMARTYieldLogic`.
    /// This logic checks if a yield schedule is active and might prevent minting (reverting with
    /// `YieldScheduleActive`).
    /// After the yield-specific check, it calls `super._beforeMint(to, amount)` to ensure that `_beforeMint` hooks
    /// from other parent contracts in the inheritance chain (like `SMARTHooks` itself or other extensions) are also
    /// executed.
    /// `internal virtual override(SMARTHooks)` indicates it's internal, can be further overridden,
    /// and specifically overrides `_beforeMint` from a contract in the hierarchy that provides `SMARTHooks` (e.g.,
    /// `SMARTUpgradeable`).
    /// @inheritdoc SMARTHooks
    /// @param to The address that will receive the minted tokens.
    /// @param amount The quantity of tokens to be minted.
    function _beforeMint(address to, uint256 amount) internal virtual override(SMARTHooks) {
        // Execute the yield-specific logic before minting.
        // This might revert if minting is not allowed due to an active yield schedule.
        __yield_beforeMintLogic();

        // Call the _beforeMint hook of the next contract in the inheritance chain.
        super._beforeMint(to, amount);
    }
}
