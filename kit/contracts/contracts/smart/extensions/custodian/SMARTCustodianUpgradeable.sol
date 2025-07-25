// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

// Base contract imports
import { SMARTExtensionUpgradeable } from "../common/SMARTExtensionUpgradeable.sol";
import { SMARTHooks } from "../common/SMARTHooks.sol";

// Internal implementation imports
import { _SMARTCustodianLogic } from "./internal/_SMARTCustodianLogic.sol";
import { ISMARTCustodian } from "./ISMARTCustodian.sol";

// Error imports

/// @title Upgradeable SMART Custodian Extension
/// @author SettleMint
/// @notice This abstract contract provides the upgradeable (UUPS proxy pattern) implementation of
/// custodian
///         features (like freezing, forced transfers, recovery) for a SMART token.
/// @dev It integrates the core logic from `_SMARTCustodianLogic` with an `ERC20Upgradeable` token.
///      This contract is 'abstract' because the final, deployable (and upgradeable) token contract must:
///      1. Inherit `UUPSUpgradeable` (from OpenZeppelin) and implement `_authorizeUpgrade` to control upgrades.
///      2. Inherit a full `ERC20Upgradeable` implementation.
///      3. Inherit the main `SMARTUpgradeable` token contract.
///      4. Inherit an authorization mechanism (e.g., an upgradeable version of
///         `SMARTCustodianAccessControlAuthorization`) to control access to custodian functions.
///      It uses `Initializable` for managing the initialization process suitable for proxies.
///      The `__SMARTCustodian_init` function serves as its initializer, calling `__SMARTCustodian_init_unchained`.
///      It implements `__custodian_getBalance` and `__custodian_executeTransferUpdate` using
///      `ERC20Upgradeable.balanceOf` and `ERC20Upgradeable._update` respectively.
///      It overrides `SMARTHooks` to inject custodian checks, similar to its non-upgradeable counterpart.
abstract contract SMARTCustodianUpgradeable is Initializable, SMARTExtensionUpgradeable, _SMARTCustodianLogic {
    // Developer Note: The final concrete contract inheriting this `SMARTCustodianUpgradeable` must also inherit:
    // 1. `UUPSUpgradeable` and implement `_authorizeUpgrade`.
    // 2. An `ERC20Upgradeable` implementation (e.g., OpenZeppelin's or the project's `SMARTUpgradeable` which
    //    inherits it).
    // 3. An upgradeable authorization contract for custodian functions.
    // 4. The core `SMARTUpgradeable.sol` if not already covered.
    // In the final contract's `initialize` function, ensure `__SMARTCustodian_init()` is called after other
    // essential initializers like `__ERC20_init`, `__Ownable_init` (or `__AccessControl_init`), and `__SMART_init`.

    /// @notice Register the interface ID for ERC165.
    /// @dev This allows factories to check if the contract
    /// supports the `ISMARTCustodian` interface based on the upgradeable implementation.
    constructor() {
        _registerInterface(type(ISMARTCustodian).interfaceId);
    }

    // -- Initializer --

    /// @notice Initializer for the upgradeable SMART Custodian extension.
    /// @dev This function should be called once by the `initialize` function of the final concrete (and proxy-deployed)
    ///      contract. It uses the `onlyInitializing` modifier from `Initializable` to ensure it's run only during
    ///      the proxy setup or a reinitialization phase if the upgrade pattern allows.
    ///      It calls `__SMARTCustodian_init_unchained` from `_SMARTCustodianLogic` to perform essential setup,
    ///      such as registering the `ISMARTCustodian` interface ID for ERC165.
    function __SMARTCustodian_init() internal onlyInitializing {
        // Call the unchained initializer from the base logic contract.
        __SMARTCustodian_init_unchained();
    }

    // -- Internal Hook Implementations (Dependencies for _SMARTCustodianLogic) --

    /// @notice Provides the concrete implementation for `_SMARTCustodianLogic`'s balance getter in an upgradeable
    /// context.
    /// @dev Called by `_SMARTCustodianLogic` to get an account's token balance.
    ///      Assumes the final contract inherits `ERC20Upgradeable` which provides `balanceOf`.
    /// @inheritdoc _SMARTCustodianLogic
    /// @param account The address whose balance is queried.
    /// @return uint256 The token balance.
    function __custodian_getBalance(address account) internal view virtual override returns (uint256) {
        // Delegates to `balanceOf` from the inherited `ERC20Upgradeable` contract.
        return balanceOf(account);
    }

    /// @notice Provides the concrete implementation for `_SMARTCustodianLogic`'s transfer executor in an upgradeable
    /// context.
    /// @dev Called by `_SMARTCustodianLogic` to perform token ledger updates.
    ///      Assumes the final contract inherits `ERC20Upgradeable` (and `SMARTUpgradeable`) which provides an
    ///      `_update` function that correctly integrates the `SMARTHooks` system.
    /// @inheritdoc _SMARTCustodianLogic
    /// @param from Sender address (or `address(0)` for mints).
    /// @param to Recipient address (or `address(0)` for burns).
    /// @param amount Amount of tokens.
    function __custodian_executeTransferUpdate(address from, address to, uint256 amount) internal virtual override {
        // Delegates to `_update` from the inherited `ERC20Upgradeable` (via `SMARTUpgradeable`).
        // This `_update` is expected to handle the full hook lifecycle.
        _update(from, to, amount);
    }

    // -- Hooks (Overrides of SMARTHooks) --
    // These overrides integrate custodian checks into the standard token operation lifecycle for the upgradeable
    // version.

    /// @inheritdoc SMARTHooks
    /// @notice Overrides `_beforeMint` for upgradeable custodian checks (e.g., recipient not frozen).
    /// @dev Calls `__custodian_beforeMintLogic` to prevent minting to a frozen address.
    /// @param to The address that will receive the minted tokens.
    /// @param amount The amount of tokens to be minted.
    function _beforeMint(address to, uint256 amount) internal virtual override(SMARTHooks) {
        __custodian_beforeMintLogic(to);
        super._beforeMint(to, amount); // Maintain hook chain.
    }

    /// @inheritdoc SMARTHooks
    /// @notice Overrides `_beforeTransfer` for upgradeable custodian checks (frozen accounts, unfrozen balance).
    /// @dev Calls `__custodian_beforeTransferLogic` to verify sender and recipient status.
    /// @param from The address sending the tokens.
    /// @param to The address receiving the tokens.
    /// @param amount The amount of tokens being transferred.
    function _beforeTransfer(address from, address to, uint256 amount) internal virtual override(SMARTHooks) {
        __custodian_beforeTransferLogic(from, to, amount);
        super._beforeTransfer(from, to, amount); // Maintain hook chain.
    }

    /// @inheritdoc SMARTHooks
    /// @notice Overrides `_beforeBurn` for upgradeable custodian logic (e.g., admin burn consuming frozen tokens).
    /// @dev Calls `__custodian_beforeBurnLogic` for custodian-specific burn processing.
    /// @param from The address from which tokens will be burned.
    /// @param amount The amount of tokens to be burned.
    function _beforeBurn(address from, uint256 amount) internal virtual override(SMARTHooks) {
        __custodian_beforeBurnLogic(from, amount);
        super._beforeBurn(from, amount); // Maintain hook chain.
    }

    /// @inheritdoc SMARTHooks
    /// @notice Overrides `_beforeRedeem` for upgradeable custodian checks (user redeem, frozen status, balance).
    /// @dev Calls `__custodian_beforeRedeemLogic` to verify the redeemer's status.
    /// @param from The address redeeming the tokens.
    /// @param amount The amount of tokens to be redeemed.
    function _beforeRedeem(address from, uint256 amount) internal virtual override(SMARTHooks) {
        __custodian_beforeRedeemLogic(from, amount);
        super._beforeRedeem(from, amount); // Maintain hook chain.
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
