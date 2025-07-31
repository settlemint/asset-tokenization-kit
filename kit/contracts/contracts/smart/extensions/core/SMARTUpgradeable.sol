// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
// Interface imports
import { SMARTComplianceModuleParamPair } from "../../interface/structs/SMARTComplianceModuleParamPair.sol";
// Base contract imports
import { SMARTExtensionUpgradeable } from "../common/SMARTExtensionUpgradeable.sol";
import { SMARTHooks } from "../common/SMARTHooks.sol";

// Internal implementation imports
import { _SMARTLogic } from "./internal/_SMARTLogic.sol";

// Error imports

/// @title Upgradeable SMART Token Implementation (UUPS Pattern)
/// @author SettleMint
/// @notice This abstract contract provides an upgradeable version of a SMART token, utilizing
/// OpenZeppelin's
///         UUPS (Universal Upgradeable Proxy Standard) proxy pattern. It integrates ERC20 functionality,
///         identity verification, and compliance checks from the `_SMARTLogic` base.
/// @dev This contract is 'abstract' because it needs to be combined with:
///      1. A UUPS-compatible access control contract (e.g., `OwnableUpgradeable` or `AccessControlUpgradeable`
///         from OpenZeppelin) by the final, deployable token contract to manage the `_authorizeUpgrade` function.
///      2. An authorization contract (e.g., one implementing role-based access for permissioned SMART functions)
///         if such functions are exposed publicly in the final contract.
///      It inherits from:
///      - `Initializable`: Manages initialization for upgradeable contracts.
///      - `SMARTExtensionUpgradeable`: Provides base upgradeable SMART functionalities and context.
///      - `ERC165Upgradeable`: OpenZeppelin's upgradeable ERC165 interface detection.
///      - `_SMARTLogic`: Contains the core state and internal logic for SMART features.
///      The `__SMART_init` function serves as the initializer, called once when the proxy contract is linked to this
///      implementation. It initializes the ERC20 parts and then the core SMART logic via `__SMART_init_unchained`.
///      Like `SMART.sol`, it overrides key ERC20 functions and hooks to weave in SMART logic.
///      The final contract inheriting this MUST also inherit `UUPSUpgradeable` and implement `_authorizeUpgrade`.
abstract contract SMARTUpgradeable is Initializable, SMARTExtensionUpgradeable, ERC165Upgradeable, _SMARTLogic {
    // -- Initializer --
    /// @notice Internal initializer function for the upgradeable SMART token's core state.
    /// @dev This function MUST be called by the `initialize` function of the final concrete (deployable) contract.
    ///      It uses the `onlyInitializing` modifier from `Initializable` to ensure it can only be executed once
    ///      during the proxy's initialization (or an upgrade that reinitializes specific parts, if designed so).
    ///      Order of initialization in the final contract is crucial:
    ///      1. Call initializers for `UUPSUpgradeable` (if managing upgrades here) and chosen access control
    ///         (e.g., `__Ownable_init`).
    ///      2. Call `__ERC20_init(name_, symbol_)` from `ERC20Upgradeable`.
    ///      3. Call this `__SMART_init(...)` function.
    ///      4. Call initializers for any other inherited extensions.
    ///      This function first calls `__ERC20_init` to set the token's `name_` and `symbol_` (decimals are handled by
    /// `__SMART_init_unchained`).
    ///      Then, it invokes `__SMART_init_unchained` from `_SMARTLogic` to set up all core SMART functionalities.
    /// @param name_ The name of the token (e.g., "My Upgradeable SMART Token").
    /// @param symbol_ The symbol of the token (e.g., "MUST").
    /// @param decimals_ The number of decimal places for the token (e.g., 18).
    /// @param onchainID_ Optional on-chain identifier address.
    /// @param identityRegistry_ Address of the `ISMARTIdentityRegistry` contract.
    /// @param compliance_ Address of the `ISMARTCompliance` contract.
    /// @param initialModulePairs_ Initial list of `SMARTComplianceModuleParamPair` structs for compliance modules.
    function __SMART_init(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address onchainID_,
        address identityRegistry_,
        address compliance_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_
    )
        internal
        onlyInitializing // Ensures this logic runs only once during the proxy initialization process.
    {
        // Initialize the ERC20 part (name and symbol).
        // Decimals are handled by __SMART_init_unchained as it's part of _SMARTLogic's state.
        __ERC20_init(name_, symbol_);

        // Initialize the core SMART logic state using the unchained initializer from _SMARTLogic.
        __SMART_init_unchained(decimals_, onchainID_, identityRegistry_, compliance_, initialModulePairs_);
        // Developer Note: In the final contract's `initialize` function, ensure that initializers for
        // UUPSUpgradeable, ERC20Upgradeable (done above), AccessControl/Ownable patterns are called
        // *before* this `__SMART_init` function if they set up state this depends on or if order matters for them.
    }

    /// @notice Transfers `amount` tokens from the effective sender to address `to`.
    /// @dev Overrides `ERC20Upgradeable.transfer` and `IERC20.transfer`.
    ///      Delegates to `_smart_transfer` from `_SMARTLogic`, which integrates SMART compliance/verification.
    ///      The effective sender is determined by `_smartSender()` (from `SMARTContext` via
    /// `SMARTExtensionUpgradeable`), which supports meta-transactions if `ERC2771ContextUpgradeable` is used.
    /// @param to The recipient address.
    /// @param amount The amount of tokens to transfer.
    /// @return bool Returns `true` on success (reverts on failure).
    function transfer(address to, uint256 amount) public virtual override(ERC20Upgradeable, IERC20) returns (bool) {
        return _smart_transfer(to, amount);
    }

    /// @notice Transfers tokens to multiple recipients in a batch from the effective sender.
    /// @dev Implements `ISMART.batchTransfer` (via `_SMARTExtension`). Delegates to `_smart_batchTransfer`.
    /// @param toList An array of recipient addresses.
    /// @param amounts An array of corresponding token amounts.
    function batchTransfer(address[] calldata toList, uint256[] calldata amounts) external virtual override {
        _smart_batchTransfer(toList, amounts);
    }

    /// @notice Recovers SMART tokens from a lost wallet to the caller's address.
    /// @dev Implements the `recoverTokens` function from `ISMART` (via `_SMARTExtension`).
    ///      Delegates to `_smart_recoverTokens` from `_SMARTLogic` for execution.
    /// @param lostWallet The address of the lost wallet containing tokens to recover.
    function recoverTokens(address lostWallet) external virtual override {
        _smart_recoverTokens(lostWallet, _smartSender()); // Uses the SMART logic's recover tokens helper
    }

    // -- Internal Hook Implementations (Dependencies for _SMARTLogic) --

    /// @inheritdoc _SMARTLogic
    /// @notice Implements `__smart_executeMint` from `_SMARTLogic` for upgradeable contracts.
    /// @dev Calls `ERC20Upgradeable._mint` to perform the actual minting.
    /// @param to The address to mint tokens to.
    /// @param amount The amount of tokens to mint.
    function __smart_executeMint(address to, uint256 amount) internal virtual override {
        _mint(to, amount); // Calls OZ ERC20Upgradeable._mint
    }

    /// @inheritdoc _SMARTLogic
    /// @notice Implements the abstract `__smart_executeTransfer` from `_SMARTLogic`.
    /// @dev Provides the concrete token transfer action by calling OpenZeppelin `ERC20._transfer`.
    ///      Called by `_SMARTLogic._smart_transfer`.
    /// @param from The sender address.
    /// @param to The recipient address.
    /// @param amount The amount of tokens to transfer.
    function __smart_executeTransfer(address from, address to, uint256 amount) internal virtual override {
        _transfer(from, to, amount); // Calls OZ ERC20 _transfer function
    }

    /// @inheritdoc _SMARTLogic
    /// @notice Implements the abstract `__smart_balanceOf` from `_SMARTLogic`.
    /// @dev Provides the concrete token balance retrieval action by calling OpenZeppelin `ERC20.balanceOf`.
    /// @param account The address to query the balance of.
    /// @return The balance of the specified account.
    function __smart_balanceOf(address account) internal virtual override returns (uint256) {
        return balanceOf(account);
    }

    // -- View Functions (ERC20 Overrides) --

    /// @inheritdoc ERC20Upgradeable
    /// @notice Returns the number of decimals for the token.
    /// @dev Overrides `ERC20Upgradeable.decimals` and `IERC20Metadata.decimals`.
    ///      Retrieves `__decimals` from `_SMARTLogic`'s state.
    /// @return uint8 The number of decimals.
    function decimals() public view virtual override(ERC20Upgradeable, IERC20Metadata) returns (uint8) {
        return __decimals; // Fetches decimals stored in _SMARTLogic state.
    }

    // -- Internal Hooks & Overrides --

    /**
     * @notice Overrides `ERC20Upgradeable._update` to integrate SMART hooks in an upgradeable context.
     * @dev This function is central to ERC20 operations. The override injects SMART logic:
     *      1. `__smart_beforeUpdateLogic`: SMART pre-operation checks (identity, compliance).
     *      2. `super._update`: Original OpenZeppelin `ERC20Upgradeable._update` (balance changes, `Transfer` event).
     *      3. `__smart_afterUpdateLogic`: SMART post-operation actions (notifications).
     *      These steps mirror the non-upgradeable `SMART` contract but use the upgradeable versions of functions.
     *      Checks are skipped if `__isForcedUpdate` (from `SMARTExtensionUpgradeable`) is true.
     * @param from Sender address (`address(0)` for mints).
     * @param to Recipient address (`address(0)` for burns).
     * @param value Amount of tokens.
     */
    function _update(address from, address to, uint256 value) internal virtual override(ERC20Upgradeable) {
        __smart_beforeUpdateLogic(from, to, value); // SMART pre-update (verification, compliance)
        super._update(from, to, value); // OZ ERC20Upgradeable core update (balances, event)
        __smart_afterUpdateLogic(from, to, value); // SMART post-update (notifications)
    }

    // --- Hooks (Overrides from SMARTHooks, called by _SMARTLogic dispatchers) ---
    // These hooks ensure that SMART-specific logic is executed alongside any other
    // extension logic by always calling the __smart_<action>Logic and then super.<hook>.

    /// @inheritdoc SMARTHooks
    /// @notice Integrates SMART core pre-mint logic into the `_beforeMint` hook chain.
    /// @dev Calls `__smart_beforeMintLogic` to perform identity verification and compliance checks.
    /// @param to The address that will receive the minted tokens.
    /// @param amount The amount of tokens to be minted.
    function _beforeMint(address to, uint256 amount) internal virtual override(SMARTHooks) {
        __smart_beforeMintLogic(to, amount);
        super._beforeMint(to, amount);
    }

    /// @inheritdoc SMARTHooks
    /// @notice Integrates SMART core post-mint logic into the `_afterMint` hook chain.
    /// @dev Calls `__smart_afterMintLogic` to notify compliance systems and other extensions.
    /// @param to The address that received the minted tokens.
    /// @param amount The amount of tokens that were minted.
    function _afterMint(address to, uint256 amount) internal virtual override(SMARTHooks) {
        __smart_afterMintLogic(to, amount);
        super._afterMint(to, amount);
    }

    /// @inheritdoc SMARTHooks
    /// @notice Integrates SMART core pre-transfer logic into the `_beforeTransfer` hook chain.
    /// @dev Calls `__smart_beforeTransferLogic` for identity and compliance checks.
    /// @param from The address sending the tokens.
    /// @param to The address receiving the tokens.
    /// @param amount The amount of tokens being transferred.
    function _beforeTransfer(address from, address to, uint256 amount) internal virtual override(SMARTHooks) {
        __smart_beforeTransferLogic(from, to, amount);
        super._beforeTransfer(from, to, amount);
    }

    /// @inheritdoc SMARTHooks
    /// @notice Integrates SMART core post-transfer logic into the `_afterTransfer` hook chain.
    /// @dev Calls `__smart_afterTransferLogic` to emit events and notify compliance systems.
    /// @param from The address that sent the tokens.
    /// @param to The address that received the tokens.
    /// @param amount The amount of tokens that were transferred.
    function _afterTransfer(address from, address to, uint256 amount) internal virtual override(SMARTHooks) {
        __smart_afterTransferLogic(from, to, amount);
        super._afterTransfer(from, to, amount);
    }

    /// @inheritdoc SMARTHooks
    /// @notice Integrates SMART core post-burn logic into the `_afterBurn` hook chain.
    /// @dev Calls `__smart_afterBurnLogic` to notify compliance systems of the burn operation.
    /// @param from The address from which tokens were burned.
    /// @param amount The amount of tokens that were burned.
    function _afterBurn(address from, uint256 amount) internal virtual override(SMARTHooks) {
        __smart_afterBurnLogic(from, amount);
        super._afterBurn(from, amount);
    }

    /**
     * @notice Standard ERC165 function to check interface support in an upgradeable context.
     * @dev Combines SMART-specific interface checks (via `__smart_supportsInterface` from `_SMARTLogic`)
     *      with OpenZeppelin's `ERC165Upgradeable.supportsInterface`.
     *      This ensures that interfaces registered by SMART extensions, the core `ISMART` interface, and
     *      standard interfaces like `IERC165Upgradeable` are correctly reported.
     * @param interfaceId The `bytes4` interface identifier.
     * @return bool `true` if the interface is supported, `false` otherwise.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Upgradeable, IERC165)
        returns (bool)
    {
        return __smart_supportsInterface(interfaceId) || super.supportsInterface(interfaceId);
    }
}
