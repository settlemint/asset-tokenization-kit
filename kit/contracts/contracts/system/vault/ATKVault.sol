// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { AccessControlEnumerable } from "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/// @title ATKVault - A multi-signature wallet with role-based access control
/// @notice This contract allows multiple signers to propose, confirm, and execute transactions
/// @dev Implements OpenZeppelin's AccessControl, ERC2771Context, Pausable, and ReentrancyGuard
/// @custom:security-contact support@settlemint.com
contract ATKVault is ERC2771Context, AccessControlEnumerable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice Role identifier for signers who can submit and confirm transactions
    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");

    /// @notice Emitted when ETH is deposited to the vault
    /// @param sender Address that sent the ETH
    /// @param value Amount of ETH deposited
    /// @param balance New total balance of the vault
    event Deposit(address indexed sender, uint256 value, uint256 balance);

    /// @notice Emitted when a general transaction is submitted
    /// @param signer Address of the signer who submitted the transaction
    /// @param txIndex Index of the transaction in the transactions array
    /// @param to Destination address for the transaction
    /// @param value Amount of ETH to send with the transaction
    /// @param data Function call data
    /// @param comment Description of the transaction
    event SubmitTransaction(
        address indexed signer, uint256 indexed txIndex, address indexed to, uint256 value, bytes data, string comment
    );

    /// @notice Emitted when an ERC20 transfer transaction is submitted
    /// @param signer Address of the signer who submitted the transaction
    /// @param txIndex Index of the transaction in the transactions array
    /// @param token Address of the ERC20 token to transfer
    /// @param to Recipient address for the token transfer
    /// @param amount Amount of tokens to transfer
    /// @param comment Description of the transaction
    event SubmitERC20TransferTransaction(
        address indexed signer,
        uint256 indexed txIndex,
        address indexed token,
        address to,
        uint256 amount,
        string comment
    );

    /// @notice Emitted when a contract call transaction is submitted
    /// @param signer Address of the signer who submitted the transaction
    /// @param txIndex Index of the transaction in the transactions array
    /// @param target Contract address to call
    /// @param value Amount of ETH to send with the call
    /// @param selector Function selector (first 4 bytes of the function signature)
    /// @param abiEncodedArguments ABI-encoded arguments for the function call
    /// @param comment Description of the transaction
    event SubmitContractCallTransaction(
        address indexed signer,
        uint256 indexed txIndex,
        address indexed target,
        uint256 value,
        bytes4 selector,
        bytes abiEncodedArguments,
        string comment
    );

    /// @notice Emitted when a transaction is confirmed by a signer
    /// @param signer Address of the signer who confirmed the transaction
    /// @param txIndex Index of the confirmed transaction
    event ConfirmTransaction(address indexed signer, uint256 indexed txIndex);

    /// @notice Emitted when a signer revokes their confirmation
    /// @param signer Address of the signer who revoked confirmation
    /// @param txIndex Index of the transaction
    event RevokeConfirmation(address indexed signer, uint256 indexed txIndex);

    /// @notice Emitted when a transaction is executed
    /// @param signer Address of the signer who triggered execution
    /// @param txIndex Index of the executed transaction
    event ExecuteTransaction(address indexed signer, uint256 indexed txIndex);

    /// @notice Emitted when the confirmation requirement changes
    /// @param account Address of the account that changed the requirement
    /// @param required New number of required confirmations
    event RequirementChanged(address indexed account, uint256 required);

    /// @notice Emitted when transaction execution fails after reaching the required confirmations
    /// @param txIndex Index of the failed transaction
    /// @param to Destination address of the failed call
    /// @param data Call data of the failed call
    event TransactionExecutionFailed(uint256 indexed txIndex, address to, bytes data);

    /// @notice Structure to store transaction details
    /// @dev Each transaction is stored in the transactions array
    struct Transaction {
        address to; // Destination address
        uint256 value; // ETH value to send
        bytes data; // Call data for the transaction
        bool executed; // Whether the transaction has been executed
        uint256 numConfirmations; // Number of confirmations received
        string comment; // Description of the transaction
    }

    // Store confirmers separately to avoid issues with struct containing mapping
    mapping(uint256 => EnumerableSet.AddressSet) private _txConfirmers;

    /// @notice Quick lookup to check if a signer has confirmed a transaction
    /// @dev txIndex => signer address => has confirmed
    mapping(uint256 => mapping(address => bool)) public confirmations;

    /// @notice Array of all transactions (pending and executed)
    Transaction[] public transactions;

    /// @notice Number of confirmations required to execute a transaction
    uint256 public required;

    /// @notice Error thrown when an invalid requirement is set
    /// @param requested The requested number of confirmations
    /// @param signerCount The total number of signers
    error InvalidRequirement(uint256 requested, uint256 signerCount);

    /// @notice Error thrown when accessing a non-existent transaction
    /// @param txIndex The requested transaction index
    /// @param maxIndex The maximum valid index
    error TxDoesNotExist(uint256 txIndex, uint256 maxIndex);

    /// @notice Error thrown when trying to confirm an already executed transaction
    /// @param txIndex The transaction index
    error TxExecuted(uint256 txIndex);

    /// @notice Error thrown when a signer tries to confirm a transaction they already confirmed
    /// @param txIndex The transaction index
    /// @param signer The signer's address
    error AlreadyConfirmed(uint256 txIndex, address signer);

    /// @notice Error thrown when a signer tries to revoke a confirmation they didn't make
    /// @param txIndex The transaction index
    /// @param signer The signer's address
    error NotConfirmed(uint256 txIndex, address signer);

    /// @notice Error thrown when transaction execution fails
    /// @param txIndex The transaction index
    /// @param to The destination address
    /// @param data The call data
    error ExecutionFailed(uint256 txIndex, address to, bytes data);

    /// @notice Error thrown when an empty array is provided for batch operations
    error EmptyBatchArray();

    /// @notice Error thrown when array lengths don't match in batch operations
    error ArrayLengthMismatch();

    /// @notice Initializes the Vault with a set of signers and confirmation threshold
    /// @param _signers Array of initial signer addresses
    /// @param _required Number of confirmations required to execute a transaction
    /// @param initialOwner Address that will have admin role
    /// @param forwarder Address of the ERC2771 forwarder for meta-transactions
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
        // Validate that the required confirmations is a sensible number
        if (len == 0 || _required == 0 || _required > len) revert InvalidRequirement(_required, len);

        // Grant admin role to the initial owner
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);

        // Grant signer role to all initial signers
        for (uint256 i = 0; i < len; ++i) {
            _grantRole(SIGNER_ROLE, _signers[i]);
        }
        required = _required;
        emit RequirementChanged(_msgSender(), _required);
    }

    /// @notice Allows the contract to receive ETH
    /// @dev Only works when the contract is not paused
    receive() external payable whenNotPaused {
        emit Deposit(_msgSender(), msg.value, address(this).balance);
    }

    /// @notice Pauses the contract, preventing most operations
    /// @dev Can only be called by admin
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @notice Unpauses the contract, allowing operations to resume
    /// @dev Can only be called by admin
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /// @notice Gets the number of confirmations required to execute a transaction
    /// @return The number of required confirmations
    function requirement() external view returns (uint256) {
        return required;
    }

    /// @notice Changes the number of confirmations required
    /// @param _required New number of required confirmations
    /// @dev Can only be called by admin
    function setRequirement(uint256 _required) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 ownerCount = getRoleMemberCount(SIGNER_ROLE);
        // Ensure the requirement is valid (between 1 and number of signers)
        if (_required == 0 || _required > ownerCount) revert InvalidRequirement(_required, ownerCount);
        required = _required;
        emit RequirementChanged(_msgSender(), _required);
    }

    /// @notice Submits a new transaction to the vault
    /// @param to Destination address
    /// @param value Amount of ETH to send
    /// @param data Call data for the transaction
    /// @param comment Description of the transaction
    /// @return txIndex Index of the created transaction
    function submitTransaction(
        address to,
        uint256 value,
        bytes calldata data,
        string calldata comment
    )
        external
        onlyRole(SIGNER_ROLE)
        whenNotPaused
        nonReentrant // Prevents reentrancy during confirmation and execution
        returns (uint256 txIndex)
    {
        address sender = _msgSender();
        // Store the transaction details
        txIndex = _storeTransaction(to, value, data, comment);
        emit SubmitTransaction(sender, txIndex, to, value, data, comment);

        // Automatically confirm the transaction for the submitter
        _confirm(txIndex, sender);
    }

    /// @notice Submits multiple transactions in a single call
    /// @param to Array of destination addresses
    /// @param value Array of ETH amounts
    /// @param data Array of call data
    /// @param comments Array of transaction descriptions
    /// @return txIndices Array of created transaction indices
    function batchSubmitTransactions(
        address[] calldata to,
        uint256[] calldata value,
        bytes[] calldata data,
        string[] calldata comments
    )
        external
        onlyRole(SIGNER_ROLE)
        whenNotPaused
        nonReentrant
        returns (uint256[] memory txIndices)
    {
        uint256 batchSize = to.length;
        if (batchSize == 0) revert EmptyBatchArray();
        // Ensure all arrays have the same length
        if (batchSize != value.length || batchSize != data.length || batchSize != comments.length) {
            revert ArrayLengthMismatch();
        }

        address sender = _msgSender();
        txIndices = new uint256[](batchSize);

        // Process each transaction in the batch
        for (uint256 i = 0; i < batchSize; i++) {
            txIndices[i] = _storeTransaction(to[i], value[i], data[i], comments[i]);
            emit SubmitTransaction(sender, txIndices[i], to[i], value[i], data[i], comments[i]);

            // Automatically confirm each transaction
            _confirm(txIndices[i], sender);
        }
    }

    /// @notice Submits a new ERC20 token transfer transaction
    /// @param token Address of the ERC20 token
    /// @param to Recipient address
    /// @param amount Amount of tokens to transfer
    /// @param comment Description of the transaction
    /// @return txIndex Index of the created transaction
    function submitERC20Transfer(
        address token,
        address to,
        uint256 amount,
        string calldata comment
    )
        external
        onlyRole(SIGNER_ROLE)
        whenNotPaused
        nonReentrant
        returns (uint256 txIndex)
    {
        address sender = _msgSender();
        // Encode the transfer function call
        bytes memory data = abi.encodeWithSelector(IERC20.transfer.selector, to, amount);
        txIndex = _storeTransaction(token, 0, data, comment); // Token address as 'to'
        emit SubmitERC20TransferTransaction(sender, txIndex, token, to, amount, comment);

        // Automatically confirm the transaction
        _confirm(txIndex, sender);
    }

    /// @notice Submits multiple ERC20 token transfer transactions in a single call
    /// @param tokens Array of ERC20 token addresses
    /// @param to Array of recipient addresses
    /// @param amounts Array of token amounts
    /// @param comments Array of transaction descriptions
    /// @return txIndices Array of created transaction indices
    function batchSubmitERC20Transfers(
        address[] calldata tokens,
        address[] calldata to,
        uint256[] calldata amounts,
        string[] calldata comments
    )
        external
        onlyRole(SIGNER_ROLE)
        whenNotPaused
        nonReentrant
        returns (uint256[] memory txIndices)
    {
        uint256 batchSize = tokens.length;
        if (batchSize == 0) revert EmptyBatchArray();
        // Ensure all arrays have the same length
        if (batchSize != to.length || batchSize != amounts.length || batchSize != comments.length) {
            revert ArrayLengthMismatch();
        }

        address sender = _msgSender();
        txIndices = new uint256[](batchSize);

        // Process each token transfer in the batch
        for (uint256 i = 0; i < batchSize; i++) {
            bytes memory data = abi.encodeWithSelector(IERC20.transfer.selector, to[i], amounts[i]);
            txIndices[i] = _storeTransaction(tokens[i], 0, data, comments[i]);
            emit SubmitERC20TransferTransaction(sender, txIndices[i], tokens[i], to[i], amounts[i], comments[i]);

            // Automatically confirm each transaction
            _confirm(txIndices[i], sender);
        }
    }

    /// @notice Submits a contract call transaction
    /// @param target Address of the contract to call
    /// @param value Amount of ETH to send with the call
    /// @param selector Function selector (first 4 bytes of the function signature)
    /// @param abiEncodedArguments ABI-encoded arguments for the function call
    /// @param comment Description of the transaction
    /// @return txIndex Index of the created transaction
    function submitContractCall(
        address target,
        uint256 value,
        bytes4 selector,
        bytes calldata abiEncodedArguments,
        string calldata comment
    )
        external
        onlyRole(SIGNER_ROLE)
        whenNotPaused
        nonReentrant
        returns (uint256 txIndex)
    {
        address sender = _msgSender();
        // Combine the selector and arguments into complete call data
        bytes memory data = bytes.concat(selector, abiEncodedArguments);
        txIndex = _storeTransaction(target, value, data, comment);

        emit SubmitContractCallTransaction(sender, txIndex, target, value, selector, abiEncodedArguments, comment);

        // Automatically confirm the transaction
        _confirm(txIndex, sender);
    }

    /// @notice Submits multiple contract call transactions in a single call
    /// @param targets Array of contract addresses
    /// @param values Array of ETH amounts
    /// @param selectors Array of function selectors
    /// @param abiEncodedArguments Array of ABI-encoded arguments
    /// @param comments Array of transaction descriptions
    /// @return txIndices Array of created transaction indices
    function batchSubmitContractCalls(
        address[] calldata targets,
        uint256[] calldata values,
        bytes4[] calldata selectors,
        bytes[] calldata abiEncodedArguments,
        string[] calldata comments
    )
        external
        onlyRole(SIGNER_ROLE)
        whenNotPaused
        nonReentrant
        returns (uint256[] memory txIndices)
    {
        uint256 batchSize = targets.length;
        if (batchSize == 0) revert EmptyBatchArray();
        // Ensure all arrays have the same length
        if (
            batchSize != values.length || batchSize != selectors.length || batchSize != abiEncodedArguments.length
                || batchSize != comments.length
        ) revert ArrayLengthMismatch();

        address sender = _msgSender();
        txIndices = new uint256[](batchSize);

        // Process each contract call in the batch
        for (uint256 i = 0; i < batchSize; i++) {
            bytes memory data = bytes.concat(selectors[i], abiEncodedArguments[i]);
            txIndices[i] = _storeTransaction(targets[i], values[i], data, comments[i]);

            emit SubmitContractCallTransaction(
                sender, txIndices[i], targets[i], values[i], selectors[i], abiEncodedArguments[i], comments[i]
            );

            // Automatically confirm each transaction
            _confirm(txIndices[i], sender);
        }
    }

    /// @notice Confirms a pending transaction
    /// @param txIndex Index of the transaction to confirm
    function confirm(uint256 txIndex) external onlyRole(SIGNER_ROLE) whenNotPaused nonReentrant {
        _confirm(txIndex, _msgSender());
    }

    /// @notice Confirms multiple pending transactions in a single call
    /// @param txIndices Array of transaction indices to confirm
    function batchConfirm(uint256[] calldata txIndices) external onlyRole(SIGNER_ROLE) whenNotPaused nonReentrant {
        if (txIndices.length == 0) revert EmptyBatchArray();

        address sender = _msgSender();
        // Confirm each transaction in the batch
        for (uint256 i = 0; i < txIndices.length; i++) {
            _confirm(txIndices[i], sender);
        }
    }

    /// @notice Revokes a confirmation from a pending transaction
    /// @param txIndex Index of the transaction
    function revoke(uint256 txIndex) external onlyRole(SIGNER_ROLE) whenNotPaused {
        Transaction storage txn = _assertTxPending(txIndex); // Ensures tx exists and is not executed
        address sender = _msgSender();

        // Check that the sender has previously confirmed this transaction
        if (!_txConfirmers[txIndex].contains(sender)) revert NotConfirmed(txIndex, sender);

        // Remove from both the EnumerableSet and the lookup mapping
        _txConfirmers[txIndex].remove(sender);
        confirmations[txIndex][sender] = false;

        // Decrease confirmation count safely
        unchecked {
            --txn.numConfirmations;
        }
        emit RevokeConfirmation(sender, txIndex);
    }

    /// @notice Returns a list of all current signers
    /// @return signers_ Array of signer addresses
    function signers() external view returns (address[] memory signers_) {
        uint256 count = getRoleMemberCount(SIGNER_ROLE);
        signers_ = new address[](count);
        // Get each signer from the role-based access control
        for (uint256 i = 0; i < count; ++i) {
            signers_[i] = getRoleMember(SIGNER_ROLE, i);
        }
        return signers_;
    }

    /// @notice Returns detailed information about a transaction
    /// @param txIndex Index of the transaction
    /// @return Transaction struct containing all transaction details
    function transaction(uint256 txIndex) external view returns (Transaction memory) {
        if (txIndex >= transactions.length) {
            revert TxDoesNotExist(txIndex, transactions.length > 0 ? transactions.length - 1 : 0);
        }
        return transactions[txIndex];
    }

    /// @notice Checks if a signer has confirmed a transaction
    /// @param txIndex Index of the transaction
    /// @param signer Address of the signer
    /// @return True if the signer has confirmed the transaction
    function hasConfirmed(uint256 txIndex, address signer) external view returns (bool) {
        return _txConfirmers[txIndex].contains(signer);
    }

    /// @notice Returns a list of all signers who confirmed a transaction
    /// @param txIndex Index of the transaction
    /// @return Array of signer addresses who confirmed the transaction
    function getConfirmers(uint256 txIndex) external view returns (address[] memory) {
        if (txIndex >= transactions.length) {
            revert TxDoesNotExist(txIndex, transactions.length > 0 ? transactions.length - 1 : 0);
        }

        uint256 count = _txConfirmers[txIndex].length();
        address[] memory result = new address[](count);

        // Get each confirmer from the EnumerableSet
        for (uint256 i = 0; i < count; i++) {
            result[i] = _txConfirmers[txIndex].at(i);
        }

        return result;
    }

    /// @notice Internal helper to store a new transaction
    /// @param to Destination address
    /// @param value ETH amount to send
    /// @param data Call data
    /// @param comment Transaction description
    /// @return index Index of the newly created transaction
    function _storeTransaction(
        address to,
        uint256 value,
        bytes memory data,
        string memory comment
    )
        internal
        returns (uint256 index)
    {
        index = transactions.length;
        // Add the new transaction to the array
        transactions.push(
            Transaction({ to: to, value: value, data: data, executed: false, numConfirmations: 0, comment: comment })
        );
        // _txConfirmers[index] is automatically initialized as an empty set
    }

    /// @notice Checks that a transaction exists and is not yet executed
    /// @param txIndex Index of the transaction
    /// @return txn Reference to the transaction struct
    function _assertTxPending(uint256 txIndex) internal view returns (Transaction storage txn) {
        if (txIndex >= transactions.length) {
            revert TxDoesNotExist(txIndex, transactions.length > 0 ? transactions.length - 1 : 0);
        }
        txn = transactions[txIndex];
        if (txn.executed) revert TxExecuted(txIndex);
    }

    /// @notice Internal helper to confirm a transaction
    /// @param txIndex Index of the transaction
    /// @param confirmer Address of the signer confirming the transaction
    function _confirm(uint256 txIndex, address confirmer) internal {
        Transaction storage txn = _assertTxPending(txIndex); // Ensure tx exists and is pending

        // Check that the signer hasn't already confirmed
        if (_txConfirmers[txIndex].contains(confirmer)) revert AlreadyConfirmed(txIndex, confirmer);

        // Add to both the EnumerableSet and the lookup mapping
        _txConfirmers[txIndex].add(confirmer);
        confirmations[txIndex][confirmer] = true;

        // Increment confirmation count safely
        unchecked {
            ++txn.numConfirmations;
        }
        emit ConfirmTransaction(confirmer, txIndex);

        // Automatically execute the transaction if enough confirmations
        if (txn.numConfirmations >= required && !txn.executed) {
            bool executedSuccessfully = _executeTransaction(txIndex, confirmer);
            if (!executedSuccessfully) {
                // Execution was attempted but failed. Revert the entire confirm transaction.
                // State changes in _confirm (adding confirmer, incrementing count) will be rolled back.
                revert ExecutionFailed(txIndex, txn.to, txn.data);
            }
        }
    }

    /// @notice Internal helper to execute a transaction. Returns true on success, false on failure.
    /// @param txIndex Index of the transaction
    /// @param executor Address of the signer who triggered execution
    /// @return success True if execution succeeded, false otherwise.
    function _executeTransaction(uint256 txIndex, address executor) private returns (bool success) {
        Transaction storage txn = transactions[txIndex];

        // Prevent execution if already executed (belt-and-suspenders check)
        if (txn.executed) return true; // Already done, consider it success for the caller

        // Mark as executed BEFORE external call to prevent reentrancy attacks
        txn.executed = true;

        // Make the external call
        (bool callSuccess,) = txn.to.call{ value: txn.value }(txn.data);
        if (!callSuccess) {
            txn.executed = false; // Revert the execution marker
            // Do NOT revert here, return false instead
            return false;
        }

        emit ExecuteTransaction(executor, txIndex);

        // Clear all confirmations to save gas on future operations
        uint256 confirmerCount = _txConfirmers[txIndex].length();
        for (uint256 i = 0; i < confirmerCount; i++) {
            // Always get the first one since we're removing them
            address confirmer = _txConfirmers[txIndex].at(0);
            confirmations[txIndex][confirmer] = false; // Clear the lookup mapping
            _txConfirmers[txIndex].remove(confirmer); // Remove from set
        }

        // Reset numConfirmations to 0
        txn.numConfirmations = 0;

        return true; // Indicate success
    }

    /// @notice Internal override to support meta-transactions
    /// @return Address of the message sender (could be forwarded)
    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return super._msgSender();
    }

    /// @notice Internal override to support meta-transactions
    /// @return Message data, potentially modified by the trusted forwarder
    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return super._msgData();
    }

    /// @notice Internal override to support meta-transactions
    /// @return Length of the trusted forwarder suffix
    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return super._contextSuffixLength();
    }
}
