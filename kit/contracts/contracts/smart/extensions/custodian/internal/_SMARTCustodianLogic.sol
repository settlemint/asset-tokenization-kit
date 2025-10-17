// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { IERC20Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

// Interface imports
import { _SMARTExtension } from "../../common/_SMARTExtension.sol";

import { ISMARTCustodian } from "../ISMARTCustodian.sol";

/// @title Internal Core Logic for SMART Custodian Extension
/// @author SettleMint
/// @notice This abstract contract encapsulates the shared state variables (for tracking frozen
/// assets),
///         core business logic, event emissions, and placeholders for authorization hooks related to
///         custodian functionalities.
/// @dev It is designed to be inherited by both standard (`SMARTCustodian.sol`) and upgradeable
///      (`SMARTCustodianUpgradeable.sol`) concrete custodian extension implementations. This ensures
///      consistent behavior for features like freezing addresses/tokens, forced transfers, and wallet recovery.
///      An 'abstract contract' provides a template or partial implementation and cannot be deployed directly.
///      It relies on inheriting contracts to provide concrete implementations for abstract functions like
///      `__custodian_getBalance` and `__custodian_executeTransferUpdate` which interact with the base token's
///      ledger (e.g., ERC20).
///      It inherits `_SMARTExtension` for common utilities and `ISMARTCustodian` to ensure it fulfills the
///      custodian interface contract (primarily for registering the interface ID).
abstract contract _SMARTCustodianLogic is _SMARTExtension, ISMARTCustodian {
    // -- Storage Variables --

    /// @notice Mapping to store the "full freeze" status of an address.
    /// @dev `mapping(address account => bool isFrozen)`: If `__frozen[someAddress]` is `true`,
    ///      it means `someAddress` is entirely frozen, and standard operations are typically blocked.
    ///      `internal` visibility means it's accessible here and in derived contracts.
    mapping(address account => bool isFrozen) internal __frozen;

    /// @notice Mapping to store the amount of tokens specifically (partially) frozen for an address.
    /// @dev `mapping(address account => uint256 amount)`: `__frozenTokens[someAddress]` holds the quantity
    ///      of tokens that are frozen for `someAddress`, independent of the full `__frozen` status.
    ///      This allows for scenarios where only a portion of a user's balance is locked.
    mapping(address account => uint256 amount) internal __frozenTokens;

    // -- Internal Setup Function --

    /// @notice Internal initializer function for the custodian logic, typically called once.
    /// @dev This function's primary role is to register the `ISMARTCustodian` interface ID using
    ///      `_registerInterface` (from `_SMARTExtension`). This enables ERC165 introspection, allowing
    ///      other contracts to discover that this token contract supports custodian functionalities.
    ///      It should be called by the constructor (for non-upgradeable) or initializer (for upgradeable)
    ///      of the concrete custodian extension contract.
    function __SMARTCustodian_init_unchained() internal {
        _registerInterface(type(ISMARTCustodian).interfaceId);
    }

    // -- Abstract Functions (Dependencies) --

    /// @notice Abstract function to retrieve the total token balance of a given account.
    /// @dev This function must be implemented by the concrete custodian contract (e.g., `SMARTCustodian`)
    ///      to call the actual balance-retrieving function of the underlying token (e.g., `balanceOf`
    ///      from an ERC20 contract).
    ///      `internal view virtual` means it doesn't modify state, is callable internally and by derived
    ///      contracts, and can be overridden.
    /// @param account The address whose token balance is being queried.
    /// @return uint256 The total token balance of the `account`.
    function __custodian_getBalance(address account) internal view virtual returns (uint256);

    /// @notice Abstract function to execute the underlying token transfer/update mechanism.
    /// @dev This function must be implemented by the concrete custodian contract to call the core
    ///      token ledger update function (e.g., `_update` from an ERC20 contract, which handles mints,
    ///      burns, and transfers).
    /// @param from The address sending tokens (or `address(0)` for mints).
    /// @param to The address receiving tokens (or `address(0)` for burns).
    /// @param amount The quantity of tokens to be affected.
    function __custodian_executeTransferUpdate(address from, address to, uint256 amount) internal virtual;

    // -- Internal Implementation for ISMARTCustodian interface functions --
    // These `_smart_` functions provide the core logic for the ISMARTCustodian interface functions.
    // They are typically called by the public-facing functions in the concrete custodian contracts
    // after appropriate authorization checks.

    /// @notice Internal logic to set the "full freeze" status of an address.
    /// @dev Updates the `__frozen` mapping for `userAddress` and emits an `AddressFrozen` event.
    /// @param userAddress The address whose frozen status is to be set.
    /// @param freeze `true` to freeze the address, `false` to unfreeze.
    function _smart_setAddressFrozen(address userAddress, bool freeze) internal virtual {
        __frozen[userAddress] = freeze;
        emit ISMARTCustodian.AddressFrozen(_smartSender(), userAddress, freeze);
    }

    /// @notice Internal logic to set the "full freeze" status for multiple addresses in a batch.
    /// @dev Iterates through `userAddresses` and `freeze` arrays, calling `_smart_setAddressFrozen` for each.
    ///      Reverts with `LengthMismatch` if array lengths do not match.
    /// @param userAddresses An array of addresses.
    /// @param freeze An array of corresponding boolean freeze statuses.
    function _smart_batchSetAddressFrozen(address[] calldata userAddresses, bool[] calldata freeze) internal virtual {
        if (userAddresses.length != freeze.length) revert LengthMismatch();
        uint256 length = userAddresses.length;
        for (uint256 i = 0; i < length;) {
            _smart_setAddressFrozen(userAddresses[i], freeze[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Internal logic to partially freeze a specific amount of tokens for an address.
    /// @dev Increases the `__frozenTokens` count for `userAddress` by `amount`.
    ///      Calculates `availableBalance` as total balance minus currently frozen tokens.
    ///      Reverts with `FreezeAmountExceedsAvailableBalance` if `amount` is greater than `availableBalance`.
    ///      Emits a `TokensFrozen` event.
    /// @param userAddress The address for which to freeze tokens.
    /// @param amount The quantity of tokens to freeze.
    function _smart_freezePartialTokens(address userAddress, uint256 amount) internal virtual {
        uint256 currentFrozen = __frozenTokens[userAddress];
        uint256 availableBalance = __custodian_getBalance(userAddress) - currentFrozen;
        if (availableBalance < amount) {
            revert FreezeAmountExceedsAvailableBalance(availableBalance, amount);
        }
        __frozenTokens[userAddress] = currentFrozen + amount;
        emit ISMARTCustodian.TokensFrozen(_smartSender(), userAddress, amount);
    }

    /// @notice Internal logic to partially freeze tokens for multiple addresses in a batch.
    /// @dev Iterates and calls `_smart_freezePartialTokens` for each pair in the arrays.
    ///      Reverts with `LengthMismatch` if array lengths differ.
    /// @param userAddresses An array of addresses.
    /// @param amounts An array of corresponding token amounts to freeze.
    function _smart_batchFreezePartialTokens(address[] calldata userAddresses, uint256[] calldata amounts)
        internal
        virtual
    {
        if (userAddresses.length != amounts.length) revert LengthMismatch();
        uint256 length = userAddresses.length;
        for (uint256 i = 0; i < length;) {
            _smart_freezePartialTokens(userAddresses[i], amounts[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Internal logic to unfreeze a specific amount of partially frozen tokens.
    /// @dev Decreases `__frozenTokens` for `userAddress` by `amount`.
    ///      Reverts with `InsufficientFrozenTokens` if `amount` is greater than `currentFrozen` tokens.
    ///      Emits a `TokensUnfrozen` event.
    /// @param userAddress The address for which to unfreeze tokens.
    /// @param amount The quantity of tokens to unfreeze.
    function _smart_unfreezePartialTokens(address userAddress, uint256 amount) internal virtual {
        uint256 currentFrozen = __frozenTokens[userAddress];
        if (currentFrozen < amount) {
            revert InsufficientFrozenTokens(currentFrozen, amount);
        }
        __frozenTokens[userAddress] = currentFrozen - amount;
        emit ISMARTCustodian.TokensUnfrozen(_smartSender(), userAddress, amount);
    }

    /// @notice Internal logic to unfreeze partially frozen tokens for multiple addresses in a batch.
    /// @dev Iterates and calls `_smart_unfreezePartialTokens` for each pair.
    ///      Reverts with `LengthMismatch` if array lengths differ.
    /// @param userAddresses An array of addresses.
    /// @param amounts An array of corresponding token amounts to unfreeze.
    function _smart_batchUnfreezePartialTokens(address[] calldata userAddresses, uint256[] calldata amounts)
        internal
        virtual
    {
        if (userAddresses.length != amounts.length) revert LengthMismatch();
        uint256 length = userAddresses.length;
        for (uint256 i = 0; i < length;) {
            _smart_unfreezePartialTokens(userAddresses[i], amounts[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Internal core logic for a forced token transfer.
    /// @dev This powerful function bypasses standard transfer restrictions (including freeze status and hooks).
    ///      1. Checks if `from` address has sufficient total balance; reverts with `ERC20InsufficientBalance` if not.
    ///      2. If `from` address has partially frozen tokens (`__frozenTokens[from] > 0`):
    ///         Calculates `freeBalance` (total balance - partially frozen tokens).
    ///         If `amount` to transfer exceeds `freeBalance`, it means some frozen tokens must be used.
    ///         It then unfreezes just enough tokens (`neededFromFrozen`) to cover the shortfall,
    ///         updates `__frozenTokens[from]`, and emits `TokensUnfrozen`.
    ///      3. Sets `__isForcedUpdate = true` (from `_SMARTExtension`) to signal that hooks should be bypassed.
    ///      4. Calls `__custodian_executeTransferUpdate` to perform the actual token ledger update.
    ///      5. Resets `__isForcedUpdate = false`.
    /// @param from The address from which tokens are to be forcefully transferred.
    /// @param to The address to which tokens will be transferred.
    /// @param amount The quantity of tokens to transfer.
    /// @return bool Always returns `true` on successful execution (reverts on failure).
    function _smart_forcedTransfer(address from, address to, uint256 amount) internal virtual returns (bool) {
        uint256 currentBalance = __custodian_getBalance(from);
        if (currentBalance < amount) revert IERC20Errors.ERC20InsufficientBalance(from, currentBalance, amount);

        // If tokens are partially frozen, unfreeze the necessary amount for the transfer.
        uint256 currentFrozen = __frozenTokens[from];
        if (currentFrozen > 0) {
            uint256 freeBalance = currentBalance - currentFrozen;
            if (amount > freeBalance) {
                // Need to dip into the frozen part
                uint256 neededFromFrozen = amount - freeBalance;
                // We know currentFrozen >= neededFromFrozen because currentBalance >= amount
                uint256 newAmountFrozen = currentFrozen - neededFromFrozen;
                __frozenTokens[from] = newAmountFrozen;
                emit ISMARTCustodian.TokensUnfrozen(_smartSender(), from, neededFromFrozen);
            }
        }

        // Execute the transfer, bypassing standard hooks.
        __isForcedUpdate = true;
        __custodian_executeTransferUpdate(from, to, amount);
        __isForcedUpdate = false;

        emit ISMARTCustodian.ForcedTransfer(_smartSender(), from, to, amount);

        return true;
    }

    /// @notice Internal logic for batch forced token transfers.
    /// @dev Iterates and calls `_smart_forcedTransfer` for each set of `from`, `to`, and `amount`.
    ///      Reverts with `LengthMismatch` if array lengths are inconsistent.
    /// @param fromList An array of sender addresses.
    /// @param toList An array of recipient addresses.
    /// @param amounts An array of corresponding token amounts.
    function _smart_batchForcedTransfer(
        address[] calldata fromList,
        address[] calldata toList,
        uint256[] calldata amounts
    )
        internal
        virtual
    {
        if (fromList.length != toList.length) {
            revert LengthMismatch();
        }
        if (toList.length != amounts.length) {
            revert LengthMismatch();
        }
        uint256 length = fromList.length;
        for (uint256 i = 0; i < length;) {
            _smart_forcedTransfer(fromList[i], toList[i], amounts[i]);
            unchecked {
                ++i;
            }
        }
    }

    // -- View Functions --

    /// @inheritdoc ISMARTCustodian
    /// @notice Checks if an address is currently fully frozen.
    /// @return bool `true` if `__frozen[userAddress]` is true, `false` otherwise.
    function isFrozen(address userAddress) external view virtual override returns (bool) {
        return __frozen[userAddress];
    }

    /// @inheritdoc ISMARTCustodian
    /// @notice Gets the amount of tokens specifically (partially) frozen for an address.
    /// @return uint256 The value stored in `__frozenTokens[userAddress]`.
    function getFrozenTokens(address userAddress) external view virtual override returns (uint256) {
        return __frozenTokens[userAddress];
    }

    // -- Internal Hook Helper Functions --
    // These `__custodian_...Logic` functions are called by the SMARTHooks overrides in the concrete
    // custodian contracts (SMARTCustodian.sol / SMARTCustodianUpgradeable.sol).

    /// @notice Internal logic executed *before* a mint operation to check if the recipient is frozen.
    /// @dev Called by the concrete custodian contract's `_beforeMint` hook override.
    ///      Reverts with `RecipientAddressFrozen` if `__frozen[to]` is true.
    /// @param to The address intended to receive the minted tokens.
    function __custodian_beforeMintLogic(address to) internal view virtual {
        if (__frozen[to]) revert RecipientAddressFrozen();
    }

    /// @notice Internal logic executed *before* a transfer operation.
    /// @dev Called by the concrete custodian contract's `_beforeTransfer` hook override.
    ///      If `__isForcedUpdate` is true (meaning it's a forced transfer), these checks are skipped.
    ///      Otherwise:
    ///      1. Reverts with `SenderAddressFrozen` if `__frozen[from]` is true.
    ///      2. Reverts with `RecipientAddressFrozen` if `__frozen[to]` is true.
    ///      3. Calculates `availableUnfrozen` balance for `from` (total balance - `__frozenTokens[from]`).
    ///      4. Reverts with `ERC20InsufficientBalance` (from OZ) if `amount` exceeds `availableUnfrozen`.
    /// @param from The address sending tokens.
    /// @param to The address receiving tokens.
    /// @param amount The quantity of tokens being transferred.
    function __custodian_beforeTransferLogic(address from, address to, uint256 amount) internal view virtual {
        if (!__isForcedUpdate) {
            // Standard transfers are subject to freeze checks.
            if (__frozen[from]) revert SenderAddressFrozen();
            if (__frozen[to]) revert RecipientAddressFrozen();

            uint256 frozenTokens = __frozenTokens[from];
            // Check against available *unfrozen* balance for standard transfers.
            uint256 availableUnfrozen = __custodian_getBalance(from) - frozenTokens;
            if (availableUnfrozen < amount) {
                // Using standard ERC20 error to indicate insufficient *spendable* balance.
                revert IERC20Errors.ERC20InsufficientBalance(from, availableUnfrozen, amount);
            }
        }
    }

    /// @notice Internal logic executed *before* a burn operation (often admin-initiated in custodian contexts).
    /// @dev Called by the concrete custodian contract's `_beforeBurn` hook override.
    ///      1. Checks if `from` has sufficient `totalBalance` for the burn; reverts with `ERC20InsufficientBalance`
    ///         if not (unless `__isForcedUpdate` is true, though forced burns are less common via this hook).
    ///      2. If `from` has partially frozen tokens (`currentFrozen > 0`):
    ///         Calculates `freeBalance` (total balance - `currentFrozen`).
    ///         If `amount` to burn exceeds `freeBalance`, it means some frozen tokens must be used.
    ///         It then calls `_smart_unfreezePartialTokens` to unfreeze just enough tokens (`tokensToUnfreeze`)
    ///         to cover the shortfall. This implies an administrative decision to burn into the frozen portion.
    /// @param from The address whose tokens are being burned.
    /// @param amount The quantity of tokens to burn.
    function __custodian_beforeBurnLogic(address from, uint256 amount) internal virtual {
        uint256 totalBalance = __custodian_getBalance(from);
        if (!__isForcedUpdate) {
            // Normal burn operations should check total balance.
            if (totalBalance < amount) {
                revert IERC20Errors.ERC20InsufficientBalance(from, totalBalance, amount);
            }
        }

        uint256 currentFrozen = __frozenTokens[from];
        if (currentFrozen > 0) {
            uint256 freeBalance = totalBalance - currentFrozen;
            if (amount > freeBalance) {
                // Amount requires dipping into frozen tokens, so unfreeze the difference.
                // This implies the burn is authorized to consume frozen tokens.
                uint256 tokensToUnfreeze = amount - freeBalance;
                // The totalBalance check above (if !__isForcedUpdate) ensures currentFrozen >= tokensToUnfreeze
                // if totalBalance was sufficient. If forced, direct unfreeze happens.
                _smart_unfreezePartialTokens(from, tokensToUnfreeze); // Use internal logic with its events/checks.
            }
        }
        // The actual ERC20 `_burn` (or equivalent `_update`) should occur after this hook in the inheriting contract.
    }

    /// @notice Internal logic executed *before* a redeem operation (typically user-initiated).
    /// @dev Called by the concrete custodian contract's `_beforeRedeem` hook override.
    ///      1. Reverts with `SenderAddressFrozen` if `__frozen[from]` is true (user cannot redeem if fully frozen).
    ///      2. Calculates `availableUnfrozen` balance for `from`.
    ///      3. Reverts with `ERC20InsufficientBalance` if `amount` to redeem exceeds `availableUnfrozen`.
    /// @param from The address redeeming (burning their own) tokens.
    /// @param amount The quantity of tokens being redeemed.
    function __custodian_beforeRedeemLogic(address from, uint256 amount) internal view virtual {
        if (__frozen[from]) revert SenderAddressFrozen(); // User cannot redeem if their address is fully frozen.

        uint256 frozenTokens = __frozenTokens[from];
        uint256 availableUnfrozen = __custodian_getBalance(from) - frozenTokens;
        if (availableUnfrozen < amount) {
            revert IERC20Errors.ERC20InsufficientBalance(from, availableUnfrozen, amount);
        }
    }

    /// @notice Internal logic executed *after* a recover operation.
    /// @dev Called by the concrete custodian contract's `_afterRecoverTokens` hook override.
    ///      Migrates partial freeze state and full freeze state from `lostWallet` to `newWallet`.
    /// @param lostWallet The address of the wallet that lost its tokens.
    /// @param newWallet The address of the wallet that will receive the tokens.
    function __custodian_afterRecoverTokensLogic(address lostWallet, address newWallet) internal virtual {
        uint256 frozenTokens = __frozenTokens[lostWallet];

        // Migrate partial freeze state.
        if (frozenTokens > 0) {
            emit TokensUnfrozen(_smartSender(), lostWallet, frozenTokens);
            __frozenTokens[lostWallet] = 0;
            __frozenTokens[newWallet] = frozenTokens;
            emit TokensFrozen(_smartSender(), newWallet, frozenTokens);
        }

        bool walletFrozen = __frozen[lostWallet];

        // Migrate full freeze state.
        if (walletFrozen) {
            __frozen[newWallet] = true;
            __frozen[lostWallet] = false; // Ensure old wallet is explicitly unfrozen.
            emit AddressFrozen(_smartSender(), newWallet, true);
            emit AddressFrozen(_smartSender(), lostWallet, false);
        } else if (__frozen[newWallet]) {
            // Defensive: If newWallet was somehow frozen but old wasn't, ensure newWallet is unfrozen post-recovery.
            __frozen[newWallet] = false;
            emit AddressFrozen(_smartSender(), newWallet, false);
        }
    }
}
