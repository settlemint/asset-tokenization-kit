// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base contract imports
import { SMARTExtension } from "../common/SMARTExtension.sol";
import { SMARTHooks } from "../common/SMARTHooks.sol";

// Internal implementation imports
import { _SMARTCappedLogic } from "./internal/_SMARTCappedLogic.sol";

/// @title Standard (Non-Upgradeable) SMART Capped Token Extension
/// @author SettleMint
/// @notice This contract adds a maximum total supply (a "cap") to a standard, non-upgradeable
///         SMART token. Once the total supply reaches this cap, no more tokens can be minted.
///         'Non-upgradeable' means the contract's code cannot be changed after deployment.
/// @dev This is an `abstract contract`, meaning it provides some implementations but might rely
///      on other contracts (that inherit it) to provide further details. It cannot be deployed directly.
///      It inherits the core capping logic from `_SMARTCappedLogic`.
///      To function correctly, the final token contract that uses `SMARTCapped` must also inherit:
///      1. A standard ERC20 implementation (e.g., OpenZeppelin's `ERC20.sol`), which provides the `totalSupply()`
/// function.
///      2. `SMARTHooks` (from the SMART framework), which provides the `_beforeMint` hook mechanism.
///      The capping check is enforced by overriding the `_beforeMint` hook. Before any tokens are minted,
///      this extension will verify that the new total supply will not exceed the defined cap.
abstract contract SMARTCapped is SMARTExtension, _SMARTCappedLogic {
    /// @notice Constructor to initialize the capped supply extension.
    /// @dev This constructor is called when a contract inheriting `SMARTCapped` is deployed.
    ///      It sets the maximum total supply (`cap_`) for the token by calling the
    ///      `__SMARTCapped_init_unchained` function from the inherited `_SMARTCappedLogic`.
    /// @param cap_ The maximum total supply allowed for this token. This value must be greater than 0.
    constructor(uint256 cap_) {
        __SMARTCapped_init_unchained(cap_);
    }

    // -- Internal Hook Implementations --

    /// @notice Internal function to retrieve the current total supply of the token.
    /// @dev This function implements the `__capped_totalSupply` abstract hook from `_SMARTCappedLogic`.
    ///      It relies on the final contract inheriting a standard ERC20 implementation that provides
    ///      a `totalSupply()` function (e.g., from OpenZeppelin's `ERC20.sol`).
    ///      `internal view virtual override` means:
    ///      - `internal`: Callable only within this contract and derived contracts.
    ///      - `view`: Does not modify state and doesn't consume gas if called externally (though it's internal here).
    ///      - `virtual`: Can be overridden by further derived contracts.
    ///      - `override`: Indicates it's implementing/replacing a function from a base contract (`_SMARTCappedLogic`).
    /// @return uint256 The current total number of tokens in existence.
    function __capped_totalSupply() internal view virtual override returns (uint256) {
        // Assumes the contract also inherits a standard ERC20, which provides totalSupply().
        return totalSupply();
    }

    // -- Hooks (Overrides) --

    /// @notice Hook that is executed by the `SMARTHooks` system before any mint operation.
    /// @dev This function overrides the `_beforeMint` hook from the `SMARTHooks` contract.
    ///      Its purpose here is to inject the supply capping logic. It calls `__capped_beforeMintLogic`
    ///      (from `_SMARTCappedLogic`) to check if minting the `amount` would exceed the `cap`.
    ///      After performing its check, it calls `super._beforeMint(to, amount)`.
    ///      The `super` keyword calls the `_beforeMint` function of the next contract in the inheritance
    ///      hierarchy. This is crucial for ensuring that if other extensions also use this hook,
    ///      their logic is also executed. It maintains a chain of hook calls.
    /// @param to The address that will receive the minted tokens.
    /// @param amount The amount of tokens to be minted.
    /// @inheritdoc SMARTHooks
    function _beforeMint(address to, uint256 amount) internal virtual override(SMARTHooks) {
        __capped_beforeMintLogic(amount); // Perform the cap check before minting.
        super._beforeMint(to, amount); // Call the next `_beforeMint` hook in the inheritance chain.
    }
}
