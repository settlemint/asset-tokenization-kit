// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base contract imports
import { SMARTExtension } from "../common/SMARTExtension.sol";
import { SMARTHooks } from "../common/SMARTHooks.sol";

// Internal implementation imports
import { _SMARTCustodianLogic } from "./internal/_SMARTCustodianLogic.sol";

// Error imports

/// @title Standard (Non-Upgradeable) SMART Custodian Extension
/// @author SettleMint
/// @notice This abstract contract provides the non-upgradeable implementation of custodian
/// features
///         (like freezing, forced transfers, recovery) for a SMART token.
/// @dev It integrates the core logic from `_SMARTCustodianLogic` with a standard ERC20 token.
///      This contract is 'abstract' because it expects the final, deployable token contract to:
///      1. Inherit a full ERC20 implementation (which provides `balanceOf` and `_update`).
///      2. Inherit the main `SMART` token contract (which provides core SMART functionalities and hooks).
///      3. Inherit an authorization mechanism (e.g., `SMARTCustodianAccessControlAuthorization` or a custom one)
///         to control access to the sensitive custodian functions exposed by `_SMARTCustodianLogic`.
///      The constructor calls `__SMARTCustodian_init_unchained()` to register the custodian interface.
///      It implements the abstract functions `__custodian_getBalance` and `__custodian_executeTransferUpdate`
///      from `_SMARTCustodianLogic` using standard `ERC20.balanceOf` and `ERC20._update` respectively.
///      It also overrides `SMARTHooks` (`_beforeMint`, `_beforeTransfer`, etc.) to inject custodian-specific
///      checks (e.g., preventing transfers involving frozen addresses) by calling the corresponding
///      `__custodian_...Logic` helper functions from `_SMARTCustodianLogic` and then `super.hook()`
///      to maintain the hook chain.
abstract contract SMARTCustodian is SMARTExtension, _SMARTCustodianLogic {
    // Developer Note: The final concrete contract inheriting this `SMARTCustodian` must also inherit:
    // 1. A standard ERC20 implementation (e.g., OpenZeppelin's `ERC20.sol` or the project's `SMART.sol` which
    //    itself inherits `ERC20`).
    // 2. An authorization contract that implements the authorization hooks required by `_SMARTCustodianLogic`
    //    (e.g., `SMARTCustodianAccessControlAuthorization.sol` or a custom variant).
    // 3. The core `SMART.sol` (or equivalent) if not already covered by point 1, to ensure all SMART features and
    //    hooks are present.

    /// @notice Constructor for the standard SMART Custodian extension.
    /// @dev Calls the `__SMARTCustodian_init_unchained` internal initializer from `_SMARTCustodianLogic`.
    ///      This step is crucial for registering the `ISMARTCustodian` interface ID for ERC165 introspection,
    ///      allowing other contracts to discover that this token supports custodian functionalities.
    constructor() {
        // Initialize the custodian logic, primarily for ERC165 interface registration.
        __SMARTCustodian_init_unchained();
    }

    // -- Internal Hook Implementations (Dependencies for _SMARTCustodianLogic) --

    /// @notice Provides the concrete implementation for `_SMARTCustodianLogic`'s abstract balance getter.
    /// @dev This function is called by `_SMARTCustodianLogic` whenever it needs to know the token balance
    ///      of an account.
    ///      It assumes that the final contract inheriting `SMARTCustodian` also inherits a standard ERC20
    ///      contract that provides the public `balanceOf(address account)` view function.
    /// @inheritdoc _SMARTCustodianLogic
    /// @param account The address whose balance is to be retrieved.
    /// @return uint256 The token balance of the `account`.
    function __custodian_getBalance(address account) internal view virtual override returns (uint256) {
        // Delegates to the `balanceOf` function assumed to be available from an inherited ERC20 contract.
        return balanceOf(account);
    }

    /// @notice Provides the concrete implementation for `_SMARTCustodianLogic`'s abstract transfer executor.
    /// @dev This function is called by `_SMARTCustodianLogic` (e.g., during a `forcedTransfer` or `recoveryAddress`)
    ///      to perform the actual token ledger update (mint, transfer, or burn).
    ///      It assumes the final contract inherits an ERC20 implementation that has an internal `_update` function
    ///      (like OpenZeppelin's `ERC20._update`). Crucially, this `_update` function in the final SMART token
    ///      is expected to be overridden to call the `SMARTHooks` system, ensuring that all relevant pre and post
    ///      processing logic (including custodian checks for non-forced updates) is executed.
    /// @inheritdoc _SMARTCustodianLogic
    /// @param from The sender address (or `address(0)` for mints).
    /// @param to The recipient address (or `address(0)` for burns).
    /// @param amount The amount of tokens to be affected.
    function __custodian_executeTransferUpdate(address from, address to, uint256 amount) internal virtual override {
        // Delegates to the `_update` function from the inherited ERC20 contract.
        // This `_update` is expected to be the one from `SMART.sol` (or similar) which calls
        // `__smart_beforeUpdateLogic` and `__smart_afterUpdateLogic`, thus integrating all hooks.
        _update(from, to, amount);
    }

    // -- Hooks (Overrides of SMARTHooks) --
    // These overrides integrate custodian checks into the standard token operation lifecycle.
    // They call the specific `__custodian_...Logic` helper from `_SMARTCustodianLogic`
    // and then `super.<hookName>(...)` to ensure the hook chain is preserved for other extensions.

    /// @inheritdoc SMARTHooks
    /// @notice Overrides the `_beforeMint` hook to add custodian-specific checks.
    /// @dev Specifically, it calls `__custodian_beforeMintLogic` to prevent minting to a frozen address.
    /// @param to The address that will receive the minted tokens.
    /// @param amount The amount of tokens to be minted.
    function _beforeMint(address to, uint256 amount) internal virtual override(SMARTHooks) {
        __custodian_beforeMintLogic(to); // Custodian check: e.g., is recipient frozen?
        super._beforeMint(to, amount); // Call the next hook in the chain (e.g., core SMART logic, other
            // extensions).
    }

    /// @inheritdoc SMARTHooks
    /// @notice Overrides the `_beforeTransfer` hook to add custodian-specific checks.
    /// @dev Calls `__custodian_beforeTransferLogic` to check if sender or recipient are frozen, and if
    ///      the sender has sufficient *unfrozen* balance for standard transfers.
    /// @param from The address sending the tokens.
    /// @param to The address receiving the tokens.
    /// @param amount The amount of tokens being transferred.
    function _beforeTransfer(address from, address to, uint256 amount) internal virtual override(SMARTHooks) {
        __custodian_beforeTransferLogic(from, to, amount); // Custodian checks for standard transfers.
        super._beforeTransfer(from, to, amount); // Continue with other hooks.
    }

    /// @inheritdoc SMARTHooks
    /// @notice Overrides the `_beforeBurn` hook to add custodian-specific logic.
    /// @dev Calls `__custodian_beforeBurnLogic`, which might, for example, automatically unfreeze a portion
    ///      of tokens if an administrative burn needs to consume partially frozen tokens.
    /// @param from The address from which tokens will be burned.
    /// @param amount The amount of tokens to be burned.
    function _beforeBurn(address from, uint256 amount) internal virtual override(SMARTHooks) {
        __custodian_beforeBurnLogic(from, amount); // Custodian logic for burns.
        super._beforeBurn(from, amount); // Continue with other hooks.
    }

    /// @inheritdoc SMARTHooks
    /// @notice Overrides the `_beforeRedeem` hook (often user-initiated burns) for custodian checks.
    /// @dev Calls `__custodian_beforeRedeemLogic` to check if the redeemer is frozen or has insufficient
    ///      unfrozen balance.
    /// @param from The address redeeming the tokens.
    /// @param amount The amount of tokens to be redeemed.
    function _beforeRedeem(address from, uint256 amount) internal virtual override(SMARTHooks) {
        __custodian_beforeRedeemLogic(from, amount); // Custodian checks for user-initiated redeems.
        super._beforeRedeem(from, amount); // Continue with other hooks.
    }

    /// @inheritdoc SMARTHooks
    /// @notice Overrides the `_afterRecoverTokens` hook to add custodian-specific logic.
    /// @dev Calls `__custodian_afterRecoverTokensLogic` to check if the new wallet is frozen.
    /// @param lostWallet The address of the wallet that has lost access to its tokens.
    /// @param newWallet The address of the wallet that will receive the recovered tokens.
    function _afterRecoverTokens(address lostWallet, address newWallet) internal virtual override(SMARTHooks) {
        __custodian_afterRecoverTokensLogic(lostWallet, newWallet); // Custodian logic for recover tokens.
        super._afterRecoverTokens(lostWallet, newWallet); // Continue with other hooks.
    }
}
