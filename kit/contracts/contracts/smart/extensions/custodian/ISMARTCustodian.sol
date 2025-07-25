// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Interface for SMART Custodian Extension
/// @author SettleMint
/// @notice Defines the external functions exposed by a SMART Custodian extension.
/// @dev This interface outlines the capabilities for managing token custody, including freezing assets,
///      performing forced transfers, and recovering assets from lost wallets. Implementations of this
///      interface are expected to handle necessary authorization checks for these sensitive operations.
///      A Solidity 'interface' is like a contract blueprint that only declares functions without implementing
///      them. Other contracts can then be written to implement this interface, guaranteeing they provide
///      these functions. This promotes interoperability and standardized interactions.
interface ISMARTCustodian {
    /// @notice Error indicating that the amount requested to be frozen exceeds the user's available (unfrozen) balance.
    /// @param available The available, unfrozen balance of the user.
    /// @param requested The amount of tokens requested to be frozen.
    error FreezeAmountExceedsAvailableBalance(uint256 available, uint256 requested);

    /// @notice Error indicating that an attempt to unfreeze or use frozen tokens failed because the
    ///         amount requested exceeds the currently frozen token balance for the address.
    /// @param frozenBalance The current amount of tokens specifically frozen for the address.
    /// @param requested The amount requested to be unfrozen or used from the frozen portion.
    error InsufficientFrozenTokens(uint256 frozenBalance, uint256 requested);

    /// @notice Error indicating that an operation (e.g., mint, transfer) cannot proceed because the recipient address
    /// is
    /// frozen.
    error RecipientAddressFrozen();

    /// @notice Error indicating that an operation (e.g., transfer, burn, redeem) cannot proceed because the sender
    /// address
    /// is frozen.
    error SenderAddressFrozen();

    /// @notice Emitted when an address's full frozen status (i.e., the entire address is frozen or unfrozen)
    ///         is changed by an authorized custodian.
    /// @param sender The address (e.g., custodian, admin) that initiated the freeze/unfreeze operation.
    ///               `indexed` for easier filtering of operations by a specific admin.
    /// @param userAddress The address whose frozen status was changed. `indexed` for tracking a specific user.
    /// @param isFrozen The new frozen status: `true` if the address is now frozen, `false` if unfrozen.
    ///                 `indexed` to quickly find all freeze or unfreeze events.
    event AddressFrozen(address indexed sender, address indexed userAddress, bool indexed isFrozen);

    /// @notice Emitted when assets are successfully recovered from a lost or compromised wallet to a new wallet
    ///         belonging to the same verified identity.
    /// @param sender The address (e.g., custodian) that initiated the recovery operation. `indexed`.
    /// @param lostWallet The address from which assets were recovered. `indexed`.
    /// @param newWallet The address to which assets were transferred and identity re-associated. `indexed`.
    /// @param investorOnchainID The on-chain ID contract address that links the `lostWallet` and `newWallet`,
    ///                          confirming they belong to the same beneficial owner.
    ///                          Not typically indexed as it might be a shared contract for many users.
    event RecoverySuccess(
        address indexed sender, address indexed lostWallet, address indexed newWallet, address investorOnchainID
    );

    /// @notice Emitted when a specific amount of tokens is partially frozen for an address.
    /// @dev This refers to freezing a portion of an address's tokens, distinct from freezing the entire address.
    /// @param sender The address that initiated the partial freeze operation. `indexed`.
    /// @param user The address for which a specific amount of tokens was frozen. `indexed`.
    /// @param amount The quantity of tokens that were specifically frozen.
    event TokensFrozen(address indexed sender, address indexed user, uint256 indexed amount);

    /// @notice Emitted when a specific amount of previously partially frozen tokens is unfrozen for an address.
    /// @param sender The address that initiated the partial unfreeze operation. `indexed`.
    /// @param user The address for which a specific amount of tokens was unfrozen. `indexed`.
    /// @param amount The quantity of tokens that were unfrozen from the partial freeze.
    event TokensUnfrozen(address indexed sender, address indexed user, uint256 indexed amount);

    /// @notice Emitted when a forced transfer of tokens is executed by a custodian.
    /// @param sender The address of the custodian who initiated the forced transfer. `indexed`.
    /// @param from The source address of the tokens. `indexed`.
    /// @param to The destination address of the tokens. `indexed`.
    /// @param amount The amount of tokens transferred.
    event ForcedTransfer(address indexed sender, address indexed from, address indexed to, uint256 amount);

    /// @notice Freezes or unfreezes an entire address, preventing or allowing standard token operations.
    /// @dev When an address is frozen, typically all standard transfers, mints (to it), and burns (from it)
    ///      are blocked. Unfreezing reverses this.
    ///      Implementations should ensure this function requires proper authorization (e.g., a FREEZER_ROLE).
    /// @param userAddress The target address whose frozen status is to be changed.
    /// @param freeze `true` to freeze the address, `false` to unfreeze it.
    function setAddressFrozen(address userAddress, bool freeze) external;

    /// @notice Freezes a specific amount of tokens for a given address.
    /// @dev This prevents the specified `amount` of tokens from being used in standard operations by `userAddress`.
    ///      The user can still transact with their unfrozen balance.
    ///      Reverts if the `amount` to freeze exceeds the user's available (currently unfrozen) balance.
    ///      Requires authorization.
    /// @param userAddress The address for which to freeze tokens.
    /// @param amount The quantity of tokens to freeze.
    function freezePartialTokens(address userAddress, uint256 amount) external;

    /// @notice Unfreezes a specific amount of previously partially frozen tokens for an address.
    /// @dev Reduces the partially frozen amount for `userAddress` by the specified `amount`.
    ///      Reverts if `amount` exceeds the currently frozen token amount for that address.
    ///      Requires authorization.
    /// @param userAddress The address for which to unfreeze tokens.
    /// @param amount The quantity of tokens to unfreeze.
    function unfreezePartialTokens(address userAddress, uint256 amount) external;

    /// @notice Freezes or unfreezes multiple addresses in a batch operation.
    /// @dev A gas-efficient way to update the frozen status for several addresses at once.
    ///      Requires authorization for each underlying freeze/unfreeze operation.
    ///      The `userAddresses` and `freeze` arrays must be of the same length.
    /// @param userAddresses A list of target addresses.
    /// @param freeze A list of corresponding boolean freeze statuses (`true` for freeze, `false` for unfreeze).
    function batchSetAddressFrozen(address[] calldata userAddresses, bool[] calldata freeze) external;

    /// @notice Freezes specific amounts of tokens for multiple addresses in a batch.
    /// @dev Allows freezing different amounts for different users simultaneously.
    ///      Requires authorization for each partial freeze operation.
    ///      Arrays must be of the same length.
    /// @param userAddresses A list of target addresses.
    /// @param amounts A list of corresponding token amounts to freeze.
    function batchFreezePartialTokens(address[] calldata userAddresses, uint256[] calldata amounts) external;

    /// @notice Unfreezes specific amounts of tokens for multiple addresses in a batch.
    /// @dev Allows unfreezing different amounts for different users simultaneously.
    ///      Requires authorization for each partial unfreeze operation.
    ///      Arrays must be of the same length.
    /// @param userAddresses A list of target addresses.
    /// @param amounts A list of corresponding token amounts to unfreeze.
    function batchUnfreezePartialTokens(address[] calldata userAddresses, uint256[] calldata amounts) external;

    /// @notice Forcefully transfers tokens from one address to another, bypassing standard transfer restrictions.
    /// @dev This is a powerful administrative function. It can move tokens even if addresses are frozen or
    ///      if other transfer conditions (like compliance checks) would normally fail.
    ///      If the `from` address has partially frozen tokens, this function may automatically unfreeze
    ///      the necessary amount to cover the transfer.
    ///      The implementation typically uses an internal flag (like `__isForcedUpdate`) to bypass standard hooks
    ///      (e.g., `_beforeTransfer`) during the actual token movement.
    ///      Requires strong authorization (e.g., a FORCED_TRANSFER_ROLE).
    /// @param from The address from which tokens will be transferred.
    /// @param to The address to which tokens will be transferred.
    /// @param amount The quantity of tokens to transfer.
    /// @return bool Returns `true` upon successful execution (should revert on failure).
    function forcedTransfer(address from, address to, uint256 amount) external returns (bool);

    /// @notice Forcefully transfers tokens for multiple address pairs in a batch.
    /// @dev A gas-efficient version of `forcedTransfer` for multiple operations.
    ///      Requires strong authorization for the entire batch.
    ///      Arrays `fromList`, `toList`, and `amounts` must be of the same length.
    /// @param fromList A list of sender addresses.
    /// @param toList A list of recipient addresses.
    /// @param amounts A list of corresponding token amounts to transfer.
    function batchForcedTransfer(
        address[] calldata fromList,
        address[] calldata toList,
        uint256[] calldata amounts
    )
        external;

    /// @notice Forcefully recovers tokens from a lost or compromised wallet to a new wallet belonging to the same
    ///         verified identity.
    /// @dev This is a powerful administrative function. It can recover tokens even if addresses are frozen or
    ///      if other transfer conditions (like compliance checks) would normally fail.
    ///      Requires strong authorization (e.g., a FORCED_TRANSFER_ROLE).
    /// @param lostWallet The address from which tokens will be recovered.
    /// @param newWallet The address to which tokens will be recovered.
    function forcedRecoverTokens(address lostWallet, address newWallet) external;

    // -- View Functions --

    /// @notice Checks if an address is currently fully frozen.
    /// @dev A `view` function does not modify blockchain state and does not cost gas when called externally.
    /// @param userAddress The address to check.
    /// @return bool `true` if the address is frozen, `false` otherwise.
    function isFrozen(address userAddress) external view returns (bool);

    /// @notice Gets the amount of tokens that are specifically (partially) frozen for an address.
    /// @dev This does not include tokens that are implicitly frozen because the entire address is frozen.
    /// @param userAddress The address to check.
    /// @return uint256 The amount of tokens partially frozen for the address.
    function getFrozenTokens(address userAddress) external view returns (uint256);
}
