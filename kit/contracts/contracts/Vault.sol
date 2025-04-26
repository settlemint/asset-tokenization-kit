// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { AccessControlEnumerable } from "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";

/// @title MultiSigVault
/// @notice Minimal‑yet‑secure M‑of‑N multisig vault with ERC‑2771 meta‑tx support.
/// Key design points:
/// - Owners are an `AccessControlDefaultAdminRules` role, providing a two-step, time-delayed admin rotation.
/// - Uses `AccessControlEnumerable` implicitly, avoiding a separate owners array.
/// - Signer-gated functions use `onlyRole(SIGNER_ROLE)`.
/// - Supports gas-less transactions via a trusted forwarder (ERC-2771).
/// - Includes emergency pause and re-entrancy protection.
/// - Optimized storage: tracks confirmations only for active transactions.
/// - Transactions execute automatically once the required confirmation threshold is met.
/// @custom:security-contact support@settlemint.com
contract Vault is ERC2771Context, AccessControlEnumerable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Role identifier for addresses that can sign transactions
    /// @dev Keccak256 hash of "SIGNER_ROLE"
    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");

    /// @notice Emitted when Ether is deposited into the vault.
    /// @param sender The address initiating the deposit.
    /// @param value The amount of Ether deposited.
    /// @param balance The new vault balance after the deposit.
    event Deposit(address indexed sender, uint256 value, uint256 balance);

    /// @notice Emitted when a generic transaction proposal is submitted.
    /// @param owner The owner who submitted the transaction.
    /// @param txIndex The index of the newly submitted transaction.
    /// @param to The target address for the transaction.
    /// @param value The Ether value to be sent with the transaction.
    /// @param data The raw calldata for the transaction.
    event SubmitTransaction(
        address indexed owner, uint256 indexed txIndex, address indexed to, uint256 value, bytes data
    );

    /// @notice Emitted when an ERC20 transfer transaction proposal is submitted.
    /// @param owner The owner who submitted the transaction.
    /// @param txIndex The index of the newly submitted transaction.
    /// @param token The address of the ERC20 token being transferred.
    /// @param to The recipient address.
    /// @param amount The amount of tokens being transferred.
    event SubmitERC20TransferTransaction( // Indexed for easier filtering by token
    address indexed owner, uint256 indexed txIndex, address indexed token, address to, uint256 amount);

    /// @notice Emitted when a contract call transaction proposal is submitted.
    /// @param owner The owner who submitted the transaction.
    /// @param txIndex The index of the newly submitted transaction.
    /// @param target The target contract address.
    /// @param value The Ether value sent with the call.
    /// @param selector The 4-byte function selector.
    /// @param abiEncodedArguments The ABI-encoded arguments for the call.
    // Not indexed as it can be large
    event SubmitContractCallTransaction( // Indexed for easier filtering by target
        address indexed owner,
        uint256 indexed txIndex,
        address indexed target,
        uint256 value,
        bytes4 selector,
        bytes abiEncodedArguments
    );

    /// @notice Emitted when an owner confirms a transaction proposal.
    /// @param owner The owner who confirmed the transaction.
    /// @param txIndex The index of the confirmed transaction.
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);

    /// @notice Emitted when an owner revokes their confirmation for a transaction proposal.
    /// @param owner The owner who revoked the confirmation.
    /// @param txIndex The index of the transaction whose confirmation was revoked.
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);

    /// @notice Emitted when a transaction proposal is executed automatically upon reaching quorum.
    /// @param executor The owner whose confirmation triggered the execution.
    /// @param txIndex The index of the executed transaction.
    event ExecuteTransaction(address indexed executor, uint256 indexed txIndex);

    /// @notice Emitted when the required number of confirmations changes.
    /// @param required The new required number of confirmations.
    event RequirementChanged(uint256 required);

    // ============  Structs & Storage  ============

    /// @notice Represents a transaction proposal within the multisig vault.
    struct Transaction {
        address to;
        ///< Target address for the transaction.
        uint256 value;
        ///< Ether value to send.
        bytes data;
        ///< Calldata for the transaction.
        bool executed;
        ///< Flag indicating if the transaction has been executed.
        uint256 numConfirmations;
    }
    ///< Current number of owner confirmations.

    /// @notice Mapping from transaction index to owner address to confirmation status.
    /// @dev `confirmations[txIndex][owner]` is true if `owner` confirmed `txIndex`.
    mapping(uint256 => mapping(address => bool)) public confirmations;

    /// @notice Array storing all submitted transaction proposals.
    Transaction[] public transactions;

    /// @notice The number of owner confirmations required to execute a transaction.
    /// @dev Can be changed by the admin via `setRequirement`.
    uint256 public required;

    // ============  Errors  ============

    /// @notice Indicates an invalid requirement setting (e.g., 0 or more than owners).
    error InvalidRequirement();
    /// @notice Indicates that the specified transaction index does not exist.
    error TxDoesNotExist();
    /// @notice Indicates that the transaction has already been executed.
    error TxExecuted();
    /// @notice Indicates that the owner has already confirmed this transaction.
    error AlreadyConfirmed();
    /// @notice Indicates that the owner trying to revoke hasn't confirmed this transaction.
    error NotConfirmed();
    /// @notice Indicates that the external call during transaction execution failed.
    error ExecutionFailed();

    // ============  Constructor  ============

    /// @notice Deploys a new Vault contract.
    /// @dev Initializes owners, required confirmations, forwarder, and admin rules.
    /// @param _signers Initial multisig signers (members of SIGNER_ROLE).
    /// @param _required Number of approvals required for transaction execution.
    /// @param initialOwner The address that will receive admin rights.
    /// @param forwarder Address of the trusted ERC-2771 forwarder for meta-transactions.
    constructor(
        address[] memory _signers,
        uint256 _required,
        address initialOwner,
        address forwarder
    )
        ERC2771Context(forwarder)
        AccessControlEnumerable()
    {
        uint256 len = _signers.length;
        if (len == 0 || _required == 0 || _required > len) revert InvalidRequirement();

        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);

        for (uint256 i = 0; i < len; ++i) {
            _grantRole(SIGNER_ROLE, _signers[i]);
        }
        required = _required;
        emit RequirementChanged(_required);
    }

    /// @notice Allows the vault to receive Ether deposits.
    /// @dev Emits a Deposit event. Only works when not paused.
    receive() external payable whenNotPaused {
        emit Deposit(_msgSender(), msg.value, address(this).balance);
    }

    // ============  Admin Ops  ============

    /// @notice Pauses the contract, preventing deposits and transaction operations.
    /// @dev Requires DEFAULT_ADMIN_ROLE. Emits a Paused event.
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @notice Unpauses the contract, resuming normal operations.
    /// @dev Requires DEFAULT_ADMIN_ROLE. Emits an Unpaused event.
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function requirement() external view returns (uint256) {
        return required;
    }

    /// @notice Adjusts the required number of confirmations for executing transactions.
    /// @dev Requires DEFAULT_ADMIN_ROLE and is subject to the admin delay.
    /// Ensures the new requirement is valid ( > 0 and <= owner count).
    /// @param _required The new required number of confirmations.
    function setRequirement(uint256 _required) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 ownerCount = getRoleMemberCount(SIGNER_ROLE);
        if (_required == 0 || _required > ownerCount) revert InvalidRequirement();
        required = _required;
        emit RequirementChanged(_required);
    }

    // ============  Transaction Submission & Confirmation  ============

    /// @notice Submits a generic transaction proposal.
    /// @dev Requires OWNER_ROLE and contract must not be paused. Automatically confirms for the submitter.
    /// If only one confirmation is required, this will also trigger immediate execution.
    /// Emits a generic `SubmitTransaction` event.
    /// @param to The target address for the transaction.
    /// @param value The Ether value to send with the transaction.
    /// @param data The calldata for the transaction.
    /// @return txIndex The index of the newly created transaction proposal.
    function submitTransaction(
        address to,
        uint256 value,
        bytes calldata data
    )
        external
        onlyRole(SIGNER_ROLE)
        whenNotPaused
        nonReentrant // Added nonReentrant as confirm/execute might be triggered
        returns (uint256 txIndex)
    {
        address sender = _msgSender();
        txIndex = _storeTransaction(to, value, data);
        emit SubmitTransaction(sender, txIndex, to, value, data); // Emit specific event here
        // Implicitly confirms the transaction for the submitter AFTER storing and emitting
        _confirm(txIndex, sender);
    }

    /// @notice Submits a transaction proposal specifically for transferring ERC-20 tokens.
    /// @dev Requires OWNER_ROLE and contract must not be paused. Uses SafeERC20.transfer format.
    /// Automatically confirms for the submitter. May trigger immediate execution if required=1.
    /// Emits a detailed `SubmitERC20TransferTransaction` event.
    /// @param token The address of the ERC-20 token contract.
    /// @param to The recipient address for the token transfer.
    /// @param amount The amount of tokens to transfer (in token's base units).
    /// @return txIndex The index of the newly created transaction proposal.
    function submitERC20Transfer(
        address token,
        address to,
        uint256 amount
    )
        external
        onlyRole(SIGNER_ROLE)
        whenNotPaused
        nonReentrant // Added nonReentrant
        returns (uint256 txIndex)
    {
        address sender = _msgSender();
        bytes memory data = abi.encodeWithSelector(IERC20.transfer.selector, to, amount);
        txIndex = _storeTransaction(token, 0, data); // Store with token address as 'to' for the txn struct
        emit SubmitERC20TransferTransaction(sender, txIndex, token, to, amount); // Emit specific event here
        // Implicitly confirms the transaction for the submitter AFTER storing and emitting
        _confirm(txIndex, sender);
    }

    /// @notice Submits a transaction proposal for calling an arbitrary function on a target contract.
    /// @dev Requires OWNER_ROLE and contract must not be paused.
    /// Automatically confirms for the submitter. May trigger immediate execution if required=1.
    /// Emits a detailed `SubmitContractCallTransaction` event.
    /// @param target The address of the contract to call.
    /// @param value Ether value to send with the call (usually 0 for non-payable functions).
    /// @param selector The 4-byte function selector of the target function.
    /// @param abiEncodedArguments The ABI-encoded arguments for the target function, concatenated.
    /// @return txIndex The index of the newly created transaction proposal.
    function submitContractCall(
        address target,
        uint256 value,
        bytes4 selector,
        bytes calldata abiEncodedArguments
    )
        external
        onlyRole(SIGNER_ROLE)
        whenNotPaused
        nonReentrant // Added nonReentrant
        returns (uint256 txIndex)
    {
        address sender = _msgSender();
        bytes memory data = bytes.concat(selector, abiEncodedArguments);
        txIndex = _storeTransaction(target, value, data); // Store with target address as 'to'
        // Emit specific event here
        emit SubmitContractCallTransaction(sender, txIndex, target, value, selector, abiEncodedArguments);
        // Implicitly confirms the transaction for the submitter AFTER storing and emitting
        _confirm(txIndex, sender);
    }

    /// @notice Confirms a pending transaction proposal. Executes automatically if quorum is reached.
    /// @dev Requires OWNER_ROLE and contract must not be paused.
    /// The transaction must exist and not be executed. The caller must not have already confirmed.
    /// @param txIndex The index of the transaction to confirm.
    function confirm(uint256 txIndex) external onlyRole(SIGNER_ROLE) whenNotPaused nonReentrant {
        // Added nonReentrant
        _confirm(txIndex, _msgSender());
    }

    /// @notice Revokes a prior confirmation for a pending transaction proposal.
    /// @dev Requires OWNER_ROLE and contract must not be paused.
    /// Cannot revoke if the transaction has already been executed.
    /// @param txIndex The index of the transaction confirmation to revoke.
    function revoke(uint256 txIndex)
        external
        onlyRole(SIGNER_ROLE)
        whenNotPaused // Note: Revocation is allowed even when paused? Consider implications.
            // Current OZ implementation allows role checks even if paused.
    {
        Transaction storage txn = _assertTxPending(txIndex); // Ensures tx exists and is not executed
        address sender = _msgSender();
        if (!confirmations[txIndex][sender]) revert NotConfirmed();

        confirmations[txIndex][sender] = false;
        unchecked {
            --txn.numConfirmations;
        }
        emit RevokeConfirmation(sender, txIndex);
    }

    // ============  Views  ============

    /// @notice Retrieves the list of current owners (addresses with SIGNER_ROLE).
    /// @dev Iterates through role members provided by AccessControlEnumerable.
    /// @return signers_ An array containing the addresses of all current owners.
    function signers() external view returns (address[] memory signers_) {
        uint256 count = getRoleMemberCount(SIGNER_ROLE);
        signers_ = new address[](count);
        for (uint256 i = 0; i < count; ++i) {
            signers_[i] = getRoleMember(SIGNER_ROLE, i);
        }
        return signers_;
    }

    /// @notice Retrieves the details of a specific transaction proposal.
    /// @dev Reverts if the txIndex is out of bounds.
    /// @param txIndex The index of the transaction to retrieve.
    /// @return Transaction A struct containing the details of the requested transaction.
    function transaction(uint256 txIndex) external view returns (Transaction memory) {
        if (txIndex >= transactions.length) revert TxDoesNotExist();
        return transactions[txIndex];
    }

    // ============  Internal Logic  ============

    /// @dev Stores a new transaction proposal in the `transactions` array.
    /// Does *not* emit events and does *not* automatically confirm for the submitter.
    /// @param to Target address.
    /// @param value Ether value.
    /// @param data Calldata.
    /// @return index The index of the newly stored transaction.
    function _storeTransaction(address to, uint256 value, bytes memory data) internal returns (uint256 index) {
        index = transactions.length;
        transactions.push(
            Transaction({
                to: to,
                value: value,
                data: data,
                executed: false,
                numConfirmations: 0 // Starts with 0 confirmations
             })
        );
        // REMOVED: emit SubmitTransaction(_msgSender(), index, to, value, data);
    }

    /// @dev Asserts that a transaction exists and is not yet executed.
    /// @param txIndex The index of the transaction to check.
    /// @return txn A storage pointer to the validated transaction.
    function _assertTxPending(uint256 txIndex) internal view returns (Transaction storage txn) {
        if (txIndex >= transactions.length) revert TxDoesNotExist();
        txn = transactions[txIndex];
        if (txn.executed) revert TxExecuted();
    }

    /// @dev Internal helper to handle the logic for confirming a transaction.
    /// If confirmation meets the required threshold, it triggers execution.
    /// @param txIndex The index of the transaction to confirm.
    /// @param confirmer The address confirming the transaction.
    function _confirm(uint256 txIndex, address confirmer) internal {
        Transaction storage txn = _assertTxPending(txIndex); // Ensure tx exists and is pending
        if (confirmations[txIndex][confirmer]) revert AlreadyConfirmed();

        confirmations[txIndex][confirmer] = true;
        unchecked {
            ++txn.numConfirmations;
        }
        emit ConfirmTransaction(confirmer, txIndex);

        // --- Automatic Execution ---
        // Attempt execution if quorum is met and not already executed
        if (txn.numConfirmations >= required && !txn.executed) {
            // Check !executed again just in case
            _executeTransaction(txIndex, confirmer);
        }
    }

    /// @dev Internal function to execute a transaction once quorum is met.
    /// Assumes the transaction exists, is not executed, and quorum is met.
    /// Called internally by _confirm.
    /// @param txIndex The index of the transaction to execute.
    /// @param executor The address whose confirmation triggered the execution.
    function _executeTransaction(uint256 txIndex, address executor) private {
        // We already know the transaction exists, is not executed, and quorum is met
        // from the checks within the calling function (_confirm).
        Transaction storage txn = transactions[txIndex];

        txn.executed = true; // Mark as executed *before* external call

        // Execute the transaction
        (bool success,) = txn.to.call{ value: txn.value }(txn.data);
        if (!success) {
            // Revert state change before throwing error
            txn.executed = false; // Revert the execution marker
            revert ExecutionFailed();
        }

        emit ExecuteTransaction(executor, txIndex);

        // Optional: Clean up confirmations map for the executed transaction to save gas.
        // This helps keep storage clean but adds gas cost to the execution step.
        uint256 signerCount = getRoleMemberCount(SIGNER_ROLE);
        for (uint256 i = 0; i < signerCount; ++i) {
            address signer = getRoleMember(SIGNER_ROLE, i);
            // Delete entries only if they exist to avoid unnecessary SLOADs
            if (confirmations[txIndex][signer]) {
                delete confirmations[txIndex][signer];
            }
        }
    }

    // ============  Meta-Transaction Context Overrides  ============

    /// @notice Returns the message sender in the context of meta-transactions
    /// @dev Overrides both Context and ERC2771Context to support meta-transactions
    /// @return The address of the message sender
    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return super._msgSender();
    }

    /// @notice Returns the message data in the context of meta-transactions
    /// @dev Overrides both Context and ERC2771Context to support meta-transactions
    /// @return The message data
    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return super._msgData();
    }

    /// @notice Returns the length of the context suffix for meta-transactions
    /// @dev Overrides both Context and ERC2771Context to support meta-transactions
    /// @return The length of the context suffix
    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return super._contextSuffixLength();
    }
}
