// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Context } from "@openzeppelin/contracts/utils/Context.sol";

// Base contract imports
import { SMARTExtension } from "../common/SMARTExtension.sol";

// Internal implementation imports
import { _SMARTRedeemableLogic } from "./internal/_SMARTRedeemableLogic.sol";

/// @title Standard SMART Redeemable Extension (Non-Upgradeable)
/// @author SettleMint
/// @notice This contract provides a standard, non-upgradeable implementation for the redeemable
/// token functionality.
/// It allows token holders to redeem (burn) their own tokens.
/// @dev This is an `abstract` contract, meaning it's not meant to be deployed directly but rather inherited by a final,
/// concrete token contract.
/// It inherits from:
/// - `Context`: Provides access to `_msgSender()`, which identifies the caller of a function.
/// - `SMARTExtension`: Provides common functionalities for SMART extensions, like ERC165 interface registration.
/// - `_SMARTRedeemableLogic`: Contains the core logic for redeeming tokens (e.g., `redeem`, `redeemAll` functions,
/// hooks, event emission).
/// This contract specifically implements the abstract functions `__redeemable_getBalance` and `__redeemable_redeem`
/// that were defined in `_SMARTRedeemableLogic`.
/// It assumes that the final concrete contract will also inherit a standard ERC20 implementation (like OpenZeppelin's
/// `ERC20.sol` or `ERC20Burnable.sol`)
/// which provides the `balanceOf(address)` and internal `_burn(address, uint256)` functions.
abstract contract SMARTRedeemable is Context, SMARTExtension, _SMARTRedeemableLogic {
    // Developer Note: The final concrete contract that inherits `SMARTRedeemable` must also inherit
    // a standard ERC20 implementation (e.g., `ERC20.sol` along with `ERC20Burnable.sol` for the `_burn` function)
    // and the core `SMART.sol` logic contract.

    /// @notice Constructor for the `SMARTRedeemable` extension.
    /// @dev When a contract inheriting `SMARTRedeemable` is deployed, this constructor will be called.
    /// It calls `__SMARTRedeemable_init_unchained()` from the inherited `_SMARTRedeemableLogic` contract.
    /// This primarily serves to register the `ISMARTRedeemable` interface (for ERC165 `supportsInterface`).
    constructor() {
        // Calls the initializer in the logic contract to register the ISMARTRedeemable interface.
        __SMARTRedeemable_init_unchained();
    }

    // -- Internal Hook Implementations --

    /// @notice Gets the token balance of a given account.
    /// @dev This function implements the abstract `__redeemable_getBalance` from `_SMARTRedeemableLogic`.
    /// It relies on the `balanceOf` function being available from an inherited ERC20 contract (e.g., `ERC20.sol`).
    /// `internal view virtual override` means it can only be called from within the contract or derived contracts,
    /// does not modify state, can be overridden by further child contracts, and is overriding a function from a parent.
    /// @inheritdoc _SMARTRedeemableLogic
    /// @param account The address for which to retrieve the token balance.
    /// @return The token balance of the `account`.
    function __redeemable_getBalance(address account) internal view virtual override returns (uint256) {
        // Assumes that `balanceOf` is available from an inherited ERC20 contract.
        return balanceOf(account);
    }

    /// @notice Executes the token burn operation for a redemption.
    /// @dev This function implements the abstract `__redeemable_redeem` from `_SMARTRedeemableLogic`.
    /// It performs the actual burning of tokens by calling the internal `_burn` function.
    /// This `_burn` function is expected to be available from an inherited ERC20 contract, typically
    /// `ERC20Burnable.sol`
    /// or a similar contract that handles token burning (reducing `from`'s balance and `totalSupply`).
    /// Allowance checks (`_spendAllowance`) are generally not needed for self-redemption/burn, as the owner is burning
    /// their own tokens.
    /// The balance check is implicitly handled by the `_burn` function, which would typically revert if `amount`
    /// exceeds `from`'s balance.
    /// `internal virtual override` means it can only be called from within the contract or derived contracts,
    /// can be overridden by further child contracts, and is overriding a function from a parent.
    /// @inheritdoc _SMARTRedeemableLogic
    /// @param from The address of the token holder whose tokens are being burned.
    /// @param amount The quantity of tokens to burn.
    function __redeemable_redeem(address from, uint256 amount) internal virtual override {
        // Allowance checks are typically not needed for self-burn/redeem operations
        // as the owner (`from`) is burning their own tokens.
        // The `_burn` function (expected from ERC20Burnable or similar) will handle balance checks.
        // _spendAllowance(from, _msgSender(), amount); // This line is commented out as it's generally not applicable
        // here.
        _burn(from, amount); // Assumes `_burn` is available from an inherited ERC20Burnable contract.
    }
}
