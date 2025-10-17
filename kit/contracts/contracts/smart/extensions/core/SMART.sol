// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { ERC165 } from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
// Interface imports
import { SMARTComplianceModuleParamPair } from "../../interface/structs/SMARTComplianceModuleParamPair.sol";

// Base contract imports
import { SMARTExtension } from "../common/SMARTExtension.sol";
import { SMARTHooks } from "../common/SMARTHooks.sol";

// Internal implementation imports
import { _SMARTLogic } from "./internal/_SMARTLogic.sol";

/// @title Standard (Non-Upgradeable) SMART Token Implementation
/// @author SettleMint
/// @notice This abstract contract provides a concrete, non-upgradeable implementation of a SMART
/// token.
///         It combines standard ERC20 functionality with the core SMART features like identity verification
///         and compliance checks, managed through the `_SMARTLogic` base contract.
/// @dev This contract is 'abstract' because it expects an accompanying authorization contract
///      (e.g., one implementing role-based access control for permissioned functions like minting or
///      updating settings) to be inherited by the final, deployable token contract.
///      It inherits from:
///      - `SMARTExtension`: Provides base SMART functionalities and context (like `_smartSender`).
///      - `_SMARTLogic`: Contains the core state variables and internal logic for SMART features.
///      - `ERC20`: OpenZeppelin's standard ERC20 token implementation.
///      - `ERC165`: OpenZeppelin's utility for ERC165 interface detection.
///      The constructor initializes both the ERC20 part (name, symbol) and the SMART logic part
///      (decimals, identity registry, compliance settings, etc.) via `__SMART_init_unchained`.
///      It overrides key ERC20 functions and hooks (`transfer`, `_update`, `_beforeMint`, etc.)
///      to integrate the SMART compliance and verification logic.
abstract contract SMART is SMARTExtension, _SMARTLogic, ERC165 {
    // --- Constructor ---
    /// @notice Initializes the standard SMART token contract during deployment.
    /// @dev This constructor is called only once when the contract is deployed.
    ///      It first calls the `ERC20` constructor to set the token's `name_` and `symbol_`.
    ///      Then, it calls `__SMART_init_unchained` (from `_SMARTLogic`) to initialize all core SMART
    ///      functionalities, including setting `decimals_`, `onchainID_`, linking the `identityRegistry_` and
    ///      `compliance_` contracts, and configuring `requiredClaimTopics_` and `initialModulePairs_`.
    ///      The `payable` keyword here is a common Solidity pattern for constructors, even if this specific
    ///      constructor doesn't directly receive Ether. It doesn't harm and allows flexibility if future base
    ///      constructors were to become payable.
    /// @param name_ The name of the token (e.g., "My SMART Token").
    /// @param symbol_ The symbol of the token (e.g., "MST").
    /// @param decimals_ The number of decimal places the token uses (e.g., 18).
    /// @param onchainID_ Optional on-chain identifier address for the token.
    /// @param identityRegistry_ Address of the `ISMARTIdentityRegistry` contract.
    /// @param compliance_ Address of the `ISMARTCompliance` contract.
    /// @param initialModulePairs_ An initial list of `SMARTComplianceModuleParamPair` structs, defining active
    /// compliance modules and their parameters.
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address onchainID_,
        address identityRegistry_,
        address compliance_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_
    )
        ERC20(name_, symbol_) // Initialize OpenZeppelin ERC20 with name and symbol.

    {
        // Initialize the core SMART logic state using the internal unchained initializer.
        __SMART_init_unchained(decimals_, onchainID_, identityRegistry_, compliance_, initialModulePairs_);
    }

    /// @notice Transfers `amount` tokens from `msg.sender` to address `to`.
    /// @dev Overrides the standard `ERC20.transfer` and `IERC20.transfer`.
    ///      Delegates the core transfer logic to `_smart_transfer` from `_SMARTLogic`,
    ///      which incorporates SMART compliance and verification checks via hooks.
    /// @param to The recipient address.
    /// @param amount The amount of tokens to transfer.
    /// @return bool Returns `true` upon successful transfer completion (reverts on failure).
    function transfer(address to, uint256 amount) public virtual override(ERC20, IERC20) returns (bool) {
        return _smart_transfer(to, amount); // Uses the SMART logic's transfer helper
    }

    /// @notice Transfers tokens to multiple recipients in a batch.
    /// @dev Implements the `batchTransfer` function from `ISMART` (via `_SMARTExtension`).
    ///      Delegates to `_smart_batchTransfer` from `_SMARTLogic` for execution.
    /// @param toList An array of recipient addresses.
    /// @param amounts An array of corresponding token amounts to transfer.
    function batchTransfer(address[] calldata toList, uint256[] calldata amounts) external virtual override {
        _smart_batchTransfer(toList, amounts); // Uses the SMART logic's batch transfer helper
    }

    /// @notice Recovers SMART tokens from a lost wallet to the caller's address.
    /// @dev Implements the `recoverTokens` function from `ISMART` (via `_SMARTExtension`).
    ///      Delegates to `_smart_recoverTokens` from `_SMARTLogic` for execution.
    /// @param lostWallet The address of the lost wallet containing tokens to recover.
    function recoverTokens(address lostWallet) external virtual override {
        _smart_recoverTokens(lostWallet, _smartSender());
    }

    // -- Internal Hook Implementations (Dependencies for _SMARTLogic) --

    /// @inheritdoc _SMARTLogic
    /// @notice Implements the abstract `__smart_balanceOf` from `_SMARTLogic`.
    /// @dev Provides the concrete token balance retrieval action by calling OpenZeppelin `ERC20.balanceOf`.
    /// @param account The address to query the balance of.
    /// @return The balance of the specified account.
    function __smart_balanceOf(address account) internal virtual override returns (uint256) {
        return balanceOf(account);
    }

    /// @inheritdoc _SMARTLogic
    /// @notice Implements the abstract `__smart_executeMint` from `_SMARTLogic`.
    /// @dev This function provides the concrete minting action by calling the standard OpenZeppelin `ERC20._mint`.
    ///      It's called by `_SMARTLogic._smart_mint` after pre-mint checks and authorization.
    /// @param to The address to mint tokens to.
    /// @param amount The amount of tokens to mint.
    function __smart_executeMint(address to, uint256 amount) internal virtual override {
        _mint(to, amount); // Calls OZ ERC20 _mint function
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

    // --- View Functions ---

    /// @inheritdoc ERC20
    /// @notice Returns the number of decimals used to represent token amounts.
    /// @dev Overrides `ERC20.decimals` and `IERC20Metadata.decimals`.
    ///      It fetches the `__decimals` value stored in `_SMARTLogic`'s state, ensuring consistency
    ///      with the value set during initialization.
    /// @return uint8 The number of decimals.
    function decimals() public view virtual override(ERC20, IERC20Metadata) returns (uint8) {
        return __decimals; // Return decimals from _SMARTLogic state, set during __SMART_init_unchained.
    }

    /**
     * @notice Overrides the internal `ERC20._update` function to integrate SMART hooks.
     * @dev This is a critical function in ERC20 that handles the low-level logic for mints, burns, and transfers.
     *      By overriding it, SMART injects its compliance and verification logic before and after the actual
     *      balance update occurs.
     *      1. Calls `__smart_beforeUpdateLogic` (from `_SMARTLogic`): This dispatcher determines if it's a mint,
     *         burn, or transfer and calls the relevant `_before<Action>` hook (e.g., `_beforeMint`). These hooks
     *         then call `__smart_before<Action>Logic` for SMART-specific checks.
     *      2. Calls `super._update(from, to, value)`: This executes the original `ERC20._update` logic from
     *         OpenZeppelin, which actually changes token balances and emits the standard `Transfer` event.
     *      3. Calls `__smart_afterUpdateLogic` (from `_SMARTLogic`): Similar to the before-logic, this dispatches
     *         to `_after<Action>` hooks, which then call `__smart_after<Action>Logic` for post-operation tasks
     *         like notifying compliance systems.
     *      This entire process is skipped if `__isForcedUpdate` (a flag in `_SMARTExtension`) is true.
     * @param from The sender address (`address(0)` for mints).
     * @param to The recipient address (`address(0)` for burns).
     * @param value The amount of tokens being affected.
     */
    function _update(address from, address to, uint256 value) internal virtual override(ERC20) {
        // Call SMART pre-update logic (identity/compliance checks via hooks)
        __smart_beforeUpdateLogic(from, to, value);
        // Call original OpenZeppelin ERC20 _update to modify balances and emit Transfer event
        super._update(from, to, value);
        // Call SMART post-update logic (notifications via hooks)
        __smart_afterUpdateLogic(from, to, value);
    }

    // --- Hooks (Overrides from SMARTHooks, called by _SMARTLogic dispatchers) ---

    /// @inheritdoc SMARTHooks
    /// @notice Overrides `_beforeMint` from `SMARTHooks` to integrate SMART-specific pre-mint logic.
    /// @dev This function is called by `__smart_beforeUpdateLogic` (which is called by `_update`) when a mint
    ///      is detected (`from == address(0)`).
    ///      1. Calls `__smart_beforeMintLogic` (from `_SMARTLogic`) to perform identity verification
    ///         and compliance checks for the mint operation.
    ///      2. Calls `super._beforeMint(to, amount)` to ensure any other extensions inheriting `SMARTHooks`
    ///         also get their `_beforeMint` logic executed. This maintains the hook chain.
    /// @param to The address that will receive the minted tokens.
    /// @param amount The amount of tokens to be minted.
    function _beforeMint(address to, uint256 amount) internal virtual override(SMARTHooks) {
        __smart_beforeMintLogic(to, amount); // Perform core SMART pre-mint checks
        super._beforeMint(to, amount); // Ensure parent/other extension hooks are called
    }

    /// @inheritdoc SMARTHooks
    /// @notice Overrides `_afterMint` from `SMARTHooks` for post-mint actions.
    /// @dev Called by `__smart_afterUpdateLogic` after a mint has occurred.
    ///      1. Calls `__smart_afterMintLogic` (from `_SMARTLogic`) to notify compliance systems.
    ///      2. Calls `super._afterMint(to, amount)` for other extensions.
    /// @param to The address that received the minted tokens.
    /// @param amount The amount of tokens that were minted.
    function _afterMint(address to, uint256 amount) internal virtual override(SMARTHooks) {
        __smart_afterMintLogic(to, amount); // Perform core SMART post-mint notifications
        super._afterMint(to, amount); // Ensure parent/other extension hooks are called
    }

    /// @inheritdoc SMARTHooks
    /// @notice Overrides `_beforeTransfer` from `SMARTHooks` for pre-transfer checks.
    /// @dev Called by `__smart_beforeUpdateLogic` for regular transfers.
    ///      1. Calls `__smart_beforeTransferLogic` (from `_SMARTLogic`) for identity/compliance checks.
    ///      2. Calls `super._beforeTransfer(from, to, amount)` for other extensions.
    /// @param from The address sending the tokens.
    /// @param to The address receiving the tokens.
    /// @param amount The amount of tokens being transferred.
    function _beforeTransfer(address from, address to, uint256 amount) internal virtual override(SMARTHooks) {
        __smart_beforeTransferLogic(from, to, amount); // Perform core SMART pre-transfer checks
        super._beforeTransfer(from, to, amount); // Ensure parent/other extension hooks are called
    }

    /// @inheritdoc SMARTHooks
    /// @notice Overrides `_afterTransfer` from `SMARTHooks` for post-transfer actions.
    /// @dev Called by `__smart_afterUpdateLogic` after a transfer.
    ///      1. Calls `__smart_afterTransferLogic` (from `_SMARTLogic`) to emit `TransferCompleted` and notify
    /// compliance.
    ///      2. Calls `super._afterTransfer(from, to, amount)` for other extensions.
    /// @param from The address that sent the tokens.
    /// @param to The address that received the tokens.
    /// @param amount The amount of tokens that were transferred.
    function _afterTransfer(address from, address to, uint256 amount) internal virtual override(SMARTHooks) {
        __smart_afterTransferLogic(from, to, amount); // Perform core SMART post-transfer notifications
        super._afterTransfer(from, to, amount); // Ensure parent/other extension hooks are called
    }

    /// @inheritdoc SMARTHooks
    /// @notice Overrides `_afterBurn` from `SMARTHooks` for post-burn actions.
    /// @dev Called by `__smart_afterUpdateLogic` after a burn operation.
    ///      1. Calls `__smart_afterBurnLogic` (from `_SMARTLogic`) to notify compliance systems.
    ///      2. Calls `super._afterBurn(from, amount)` for other extensions.
    /// @param from The address from which tokens were burned.
    /// @param amount The amount of tokens that were burned.
    ///      Note: `_beforeBurn` is also a hook in `SMARTHooks` but might be overridden by a specific "Burnable"
    /// extension if pre-burn checks are needed beyond what `_beforeTransfer` (to address(0)) covers.
    function _afterBurn(address from, uint256 amount) internal virtual override(SMARTHooks) {
        __smart_afterBurnLogic(from, amount); // Perform core SMART post-burn notifications
        super._afterBurn(from, amount); // Ensure parent/other extension hooks are called
    }

    /**
     * @notice Standard ERC165 function to check if the contract supports a specific interface.
     * @dev This implementation enhances OpenZeppelin's `ERC165.supportsInterface`.
     *      It first calls `__smart_supportsInterface(interfaceId)` (from `_SMARTLogic`). This checks if the
     *      `interfaceId` was registered by any SMART extension (via `_registerInterface`) or if it is the core
     *      `type(ISMART).interfaceId`.
     *      If that returns `false`, it then calls `super.supportsInterface(interfaceId)`, which invokes the
     *      standard OpenZeppelin `ERC165` logic (checking for `type(IERC165).interfaceId` and any interfaces
     *      registered directly with OZ's `_registerInterface` if it were used, though SMART uses its own).
     *      It is recommended that the final concrete contract also explicitly registers `type(IERC165).interfaceId`
     *      using `_SMARTExtension._registerInterface` in its constructor for full ERC165 compliance discovery.
     * @param interfaceId The `bytes4` interface identifier, as specified in ERC-165.
     * @return bool `true` if the contract implements `interfaceId` (either through SMART logic or standard ERC165),
     *         `false` otherwise. Interface ID `0xffffffff` always returns `false`.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        // Check SMART-specific interfaces first (custom extensions + ISMART itself)
        // Then, fall back to OpenZeppelin's ERC165 check (which includes IERC165 itself).
        return __smart_supportsInterface(interfaceId) || super.supportsInterface(interfaceId);
    }
}
