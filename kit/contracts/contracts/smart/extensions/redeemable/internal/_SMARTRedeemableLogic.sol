// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { _SMARTExtension } from "../../common/_SMARTExtension.sol";
import { ISMARTRedeemable } from "../ISMARTRedeemable.sol";
/// @title Internal Logic for SMART Redeemable Extension
/// @author SettleMint
/// @notice This abstract contract provides the core, reusable logic for the redeemable token
/// functionality.
/// It allows token holders to burn (redeem) their own tokens.
/// @dev This contract is designed to be inherited by other contracts (either standard or upgradeable versions
/// of the redeemable extension) that will provide the full implementation details (like how `_burn` works or
/// how context like `_smartSender` is obtained).
/// It implements the `ISMARTRedeemable` interface.
/// The `abstract` keyword means this contract itself cannot be deployed directly; it must be inherited.
/// It uses `_SMARTExtension` for common extension functionalities like interface registration (ERC165).
/// Key functionalities include:
/// - Registering the `ISMARTRedeemable` interface for discovery.
/// - Defining `redeem` and `redeemAll` functions as specified in `ISMARTRedeemable`.
/// - Introducing abstract functions `__redeemable_getBalance` and `__redeemable_redeem` which must be implemented by
/// child contracts.
/// - Providing a central internal function `__smart_redeemLogic` to handle the redemption flow including hooks and
/// event emission.

abstract contract _SMARTRedeemableLogic is _SMARTExtension, ISMARTRedeemable {
    // -- Initializer --

    /// @notice Internal initializer function for the redeemable logic.
    /// @dev This function is intended to be called by the initializer of the inheriting contract.
    /// Its primary purpose is to register the `ISMARTRedeemable` interfaceId using `_registerInterface`.
    /// This makes the contract's support for `ISMARTRedeemable` discoverable via ERC165 `supportsInterface` checks.
    /// The `_unchained` suffix suggests it doesn't call initializers of its own parent contracts here, which is typical
    /// for logic contracts.
    function __SMARTRedeemable_init_unchained() internal {
        _registerInterface(type(ISMARTRedeemable).interfaceId);
    }

    // -- Abstract Functions (Dependencies) --

    /// @notice Abstract function to retrieve the token balance of a specific account.
    /// @dev This function *must* be implemented by any contract that inherits `_SMARTRedeemableLogic`.
    /// The implementation should call the actual balance-checking function of the underlying token standard
    /// (e.g., `balanceOf(account)` from an ERC20 contract).
    /// It's declared `internal view virtual`, meaning it doesn't modify state, can be overridden, and is only callable
    /// from within the contract or derived contracts.
    /// @param account The address of the token holder whose balance is being queried.
    /// @return balance The current token balance of the specified `account`.
    function __redeemable_getBalance(address account) internal view virtual returns (uint256 balance);

    /// @notice Abstract function that performs the actual token burning (destruction) operation.
    /// @dev This function *must* be implemented by any contract that inherits `_SMARTRedeemableLogic`.
    /// The implementation should call the internal burn function of the underlying token standard
    /// (e.g., `_burn(from, amount)` from an ERC20Burnable contract).
    /// This function encapsulates the core action of removing tokens from the `from` address and reducing total supply.
    /// It's declared `internal virtual`, meaning it can be overridden and is only callable from within the contract or
    /// derived contracts.
    /// @param from The address of the token holder whose tokens are being burned (the redeemer).
    /// @param amount The quantity of tokens to burn from the `from` address's balance.
    function __redeemable_redeem(address from, uint256 amount) internal virtual;

    // -- Internal Implementation for SMARTRedeemable interface functions --

    /// @inheritdoc ISMARTRedeemable
    /// @dev This function implements the `redeem` function from the `ISMARTRedeemable` interface.
    /// It allows a token holder to burn a specific `amount` of their own tokens.
    /// It delegates the core logic to the internal `__smart_redeemLogic` function.
    /// Marked `external virtual` so it can be called from outside and overridden if necessary.
    function redeem(uint256 amount) external virtual override returns (bool) {
        __smart_redeemLogic(amount);
        return true;
    }

    /// @inheritdoc ISMARTRedeemable
    /// @dev This function implements the `redeemAll` function from the `ISMARTRedeemable` interface.
    /// It allows a token holder to burn their entire token balance.
    /// First, it retrieves the caller's full balance using `__redeemable_getBalance`.
    /// Then, it delegates the core logic to the internal `__smart_redeemLogic` function with the retrieved balance.
    /// Marked `external virtual` so it can be called from outside and overridden if necessary.
    function redeemAll() external virtual override returns (bool) {
        address owner = _smartSender(); // Gets the address of the original caller (msg.sender or relayed sender)
        uint256 balance = __redeemable_getBalance(owner); // Retrieves the full balance of the caller
        __smart_redeemLogic(balance); // Executes the redeem logic for the full balance
        return true;
    }

    // -- Internal Functions --

    /// @notice Internal core logic for handling token redemptions.
    /// @dev This function orchestrates the redemption process:
    /// 1. Identifies the `owner` (the token holder redeeming tokens) using `_smartSender()`.
    /// 2. Calls the `_beforeRedeem` hook (a standard SMARTHook), allowing for custom pre-redemption logic (e.g.,
    /// checks, logging).
    /// 3. Executes the actual token burn by calling the abstract `__redeemable_redeem` function, which must be
    /// implemented by the child contract.
    /// 4. Calls the `_afterRedeem` hook (a standard SMARTHook), allowing for custom post-redemption logic (e.g.,
    /// updating state, interacting with other contracts).
    /// 5. Emits the `Redeemed` event to log the redemption on the blockchain.
    /// This centralized logic ensures consistency and proper hook execution for all redemption paths (`redeem` and
    /// `redeemAll`).
    /// Marked `internal virtual` so it can be called by derived contracts and potentially overridden for further
    /// customization.
    /// @param amount The quantity of tokens to be redeemed by the `owner`.
    function __smart_redeemLogic(uint256 amount) internal virtual {
        address owner = _smartSender();
        _beforeRedeem(owner, amount); // Standard SMARTHook: actions before redeeming tokens
        __redeemable_redeem(owner, amount); // Abstract burn execution: child contract implements the actual burn
        _afterRedeem(owner, amount); // Standard SMARTHook: actions after redeeming tokens

        emit ISMARTRedeemable.Redeemed(owner, amount); // Logs the event that tokens have been redeemed
    }
}
