// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { AccessControlEnumerable } from "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IContractWithIdentity } from "../../system/identity-factory/IContractWithIdentity.sol";

/// @title ATKVault - Enhanced multi-signature wallet using OpenZeppelin 5.4.0 features
/// @author SettleMint
/// @notice This contract allows multiple signers to propose, confirm, and execute transactions with enhanced signature
/// verification
/// @dev Uses OpenZeppelin 5.4.0's SignatureChecker for improved multi-sig capabilities
/// @custom:security-contact support@settlemint.com
contract ATKVault is ERC2771Context, AccessControlEnumerable, Pausable, ReentrancyGuard, IContractWithIdentity {
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice Role identifier for signers who can submit and confirm transactions
    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");
    /// @notice Role identifier for emergency operations (pause/unpause)
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    /// @notice Role identifier for governance operations (changing requirements, setting onchain ID)
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    /// @notice Emitted when ETH is deposited to the vault
    /// @param sender Address that sent the ETH
    /// @param value Amount of ETH deposited
    /// @param balance New total balance of the vault
    event Deposit(address indexed sender, uint256 indexed value, uint256 indexed balance);

    /// @notice Emitted when a transaction is submitted with signature-based execution
    /// @param submitter Address of the signer who submitted the transaction
    /// @param txIndex Index of the transaction in the transactions array
    /// @param to Destination address for the transaction
    /// @param value Amount of ETH to send with the transaction
    /// @param data Function call data
    /// @param comment Description of the transaction
    /// @param requiredSignatures Number of signatures required for execution
    event SubmitTransactionWithSignatures(
        address indexed submitter,
        uint256 indexed txIndex,
        address indexed to,
        uint256 value,
        bytes data,
        string comment,
        uint256 requiredSignatures
    );

    /// @notice Emitted when signatures are provided for a transaction
    /// @param signer Address that provided the signatures
    /// @param txIndex Index of the transaction
    /// @param signerAddresses Array of addresses that signed
    /// @param signatureCount Total number of valid signatures collected
    event SignaturesProvided(
        address indexed signer, uint256 indexed txIndex, address[] signerAddresses, uint256 signatureCount
    );

    /// @notice Emitted when a transaction is executed
    /// @param executor Address of the signer who triggered execution
    /// @param txIndex Index of the executed transaction
    event ExecuteTransaction(address indexed executor, uint256 indexed txIndex);

    /// @notice Emitted when the confirmation requirement changes
    /// @param account Address of the account that changed the requirement
    /// @param required New number of required confirmations
    event RequirementChanged(address indexed account, uint256 indexed required);

    /// @notice Emitted when weighted thresholds are enabled/disabled
    /// @param enabled Whether weighted signatures are enabled
    event WeightedSignaturesToggled(bool indexed enabled);

    /// @notice Emitted when a signer's weight is updated
    /// @param signer Address of the signer
    /// @param weight New weight value
    event SignerWeightUpdated(address indexed signer, uint256 indexed weight);

    /// @notice Emitted when the onchainId is set
    /// @param onchainId The address of the new OnchainID (IIdentity contract)
    event OnchainIdSet(address indexed onchainId);

    /// @notice Structure to store transaction details with enhanced signature support
    /// @dev Each transaction is stored in the transactions array
    struct Transaction {
        address to; // Destination address (20 bytes)
        bool executed; // Whether the transaction has been executed (1 byte)
            // 11 bytes padding here, total 32 bytes for first slot
        uint256 value; // ETH value to send (32 bytes - second slot)
        uint256 requiredSignatures; // Number of signatures required for this specific transaction (32 bytes - third
            // slot)
        bytes32 dataHash; // Hash of the transaction data for signature verification (32 bytes - fourth slot)
        bytes data; // Call data for the transaction (dynamic)
        string comment; // Description of the transaction (dynamic)
        address[] signers; // Array of addresses that have signed (dynamic)
        bytes[] signatures; // Array of signatures (dynamic)
    }

    /// @notice Array of all transactions (pending and executed)
    Transaction[] public transactions;

    /// @notice Number of confirmations required to execute a transaction (default)
    uint256 public required;

    /// @notice Optional: Enable weighted signatures where different signers have different voting power
    bool public useWeightedSignatures;

    /// @notice Mapping of signer addresses to their voting weight (only used if useWeightedSignatures is true)
    mapping(address => uint256) public signerWeights;

    /// @notice Total weight required for transaction execution (only used if useWeightedSignatures is true)
    uint256 public totalWeightRequired;

    /// @notice OnchainID address associated with this vault (IIdentity contract)
    address private _onchainId;

    /// @notice Flag to ensure onchainId can only be set once
    bool private _onchainIdSet;

    /// @notice Domain separator for EIP-712 signatures
    bytes32 private immutable _domainSeparator;

    /// @notice Type hash for transaction signatures
    bytes32 private constant TRANSACTION_TYPEHASH =
        keccak256("Transaction(address to,uint256 value,bytes data,uint256 nonce,string comment)");

    /// @notice Error thrown when trying to set onchainId when it's already set
    error OnchainIdAlreadySet();

    /// @notice Error thrown when trying to set an invalid onchainId
    error InvalidOnchainId();

    /// @notice Error thrown when an invalid requirement is set
    /// @param requested The requested number of confirmations
    /// @param signerCount The total number of signers
    error InvalidRequirement(uint256 requested, uint256 signerCount);

    /// @notice Error thrown when no initial admins are provided
    error NoInitialAdmins();

    /// @notice Error thrown when accessing a non-existent transaction
    /// @param txIndex The requested transaction index
    /// @param maxIndex The maximum valid index
    error TxDoesNotExist(uint256 txIndex, uint256 maxIndex);

    /// @notice Error thrown when trying to execute an already executed transaction
    /// @param txIndex The transaction index
    error TxExecuted(uint256 txIndex);

    /// @notice Error thrown when insufficient signatures are provided
    /// @param provided Number of signatures provided
    /// @param required Number of signatures required
    error InsufficientSignatures(uint256 provided, uint256 required);

    /// @notice Error thrown when array lengths don't match
    error ArrayLengthMismatch();

    /// @notice Error thrown when a signer is not authorized
    /// @param signer The unauthorized signer address
    error UnauthorizedSigner(address signer);

    /// @notice Error thrown when duplicate signatures are detected
    /// @param signer The duplicate signer address
    error DuplicateSignature(address signer);

    /// @notice Error thrown when insufficient weight for weighted signatures
    /// @param providedWeight Total weight provided
    /// @param requiredWeight Required weight threshold
    error InsufficientWeight(uint256 providedWeight, uint256 requiredWeight);

    /// @notice Error thrown when transaction execution fails
    error ExecutionFailed();

    /// @notice Initializes the Vault with a set of signers and confirmation threshold
    /// @param _signers Array of initial signer addresses
    /// @param _required Number of confirmations required to execute a transaction
    /// @param forwarder Address of the ERC2771 forwarder for meta-transactions
    /// @param onchainId Address of the OnchainID (IIdentity contract) to associate with this vault (can be address(0)
    /// to set later)
    /// @param initialAdmins Addresses that will have admin role
    constructor(
        address[] memory _signers,
        uint256 _required,
        address forwarder,
        address onchainId,
        address[] memory initialAdmins
    )
        ERC2771Context(forwarder)
    {
        uint256 len = _signers.length;
        // Validate that the required confirmations is a sensible number
        if (len == 0 || _required == 0 || _required > len) revert InvalidRequirement(_required, len);

        if (initialAdmins.length == 0) {
            revert NoInitialAdmins();
        }

        // Grant admin role to the initial admins
        for (uint256 i = 0; i < initialAdmins.length; ++i) {
            _grantRole(DEFAULT_ADMIN_ROLE, initialAdmins[i]);
        }

        // Grant signer role to all initial signers
        for (uint256 i = 0; i < len; ++i) {
            _grantRole(SIGNER_ROLE, _signers[i]);
        }
        required = _required;
        emit RequirementChanged(_msgSender(), _required);

        // Set the OnchainID if provided
        if (onchainId != address(0)) {
            _onchainId = onchainId;
            _onchainIdSet = true;
        }

        // Initialize domain separator for EIP-712
        _domainSeparator = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("ATKVault")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    /// @notice Allows the contract to receive ETH
    /// @dev Only works when the contract is not paused
    receive() external payable whenNotPaused {
        emit Deposit(_msgSender(), msg.value, address(this).balance);
    }

    /// @notice Pauses the contract, preventing most operations
    /// @dev Can only be called by emergency role
    function pause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }

    /// @notice Unpauses the contract, allowing operations to resume
    /// @dev Can only be called by emergency role
    function unpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }

    /// @notice Gets the number of confirmations required to execute a transaction
    /// @return The number of required confirmations
    function requirement() external view returns (uint256) {
        return required;
    }

    /// @notice Changes the number of confirmations required
    /// @param _required New number of required confirmations
    /// @dev Can only be called by governance role
    function setRequirement(uint256 _required) external onlyRole(GOVERNANCE_ROLE) {
        uint256 ownerCount = getRoleMemberCount(SIGNER_ROLE);
        // Ensure the requirement is valid (between 1 and number of signers)
        if (_required == 0 || _required > ownerCount) revert InvalidRequirement(_required, ownerCount);
        required = _required;
        emit RequirementChanged(_msgSender(), _required);
    }

    /// @notice Enables or disables weighted signatures
    /// @param enabled Whether to use weighted signatures
    /// @dev Can only be called by governance role
    function setWeightedSignatures(bool enabled) external onlyRole(GOVERNANCE_ROLE) {
        useWeightedSignatures = enabled;
        emit WeightedSignaturesToggled(enabled);
    }

    /// @notice Sets the weight for a signer (only used if weighted signatures are enabled)
    /// @param signer Address of the signer
    /// @param weight Voting weight for the signer
    /// @dev Can only be called by governance role
    function setSignerWeight(address signer, uint256 weight) external onlyRole(GOVERNANCE_ROLE) {
        if (!hasRole(SIGNER_ROLE, signer)) revert UnauthorizedSigner(signer);
        signerWeights[signer] = weight;
        emit SignerWeightUpdated(signer, weight);
    }

    /// @notice Sets the total weight required for weighted signature execution
    /// @param weightRequired Total weight threshold
    /// @dev Can only be called by governance role
    function setTotalWeightRequired(uint256 weightRequired) external onlyRole(GOVERNANCE_ROLE) {
        totalWeightRequired = weightRequired;
        emit RequirementChanged(_msgSender(), weightRequired);
    }

    /// @notice Sets the OnchainID address for this vault
    /// @dev Can only be called by the governance role
    /// @param newOnchainId The new OnchainID address
    function setOnchainId(address newOnchainId) external onlyRole(GOVERNANCE_ROLE) {
        if (_onchainIdSet) revert OnchainIdAlreadySet();
        if (newOnchainId == address(0)) revert InvalidOnchainId();
        _onchainId = newOnchainId;
        _onchainIdSet = true;
        emit OnchainIdSet(newOnchainId);
    }

    /// @notice Submits a new transaction that requires signatures for execution
    /// @param to Destination address
    /// @param value Amount of ETH to send
    /// @param data Call data for the transaction
    /// @param comment Description of the transaction
    /// @param requiredSigs Number of signatures required (0 uses default requirement)
    /// @param signerAddresses Array of signer addresses
    /// @param signatures Array of signatures corresponding to signerAddresses
    /// @return txIndex Index of the created transaction
    function submitTransactionWithSignatures(
        address to,
        uint256 value,
        bytes calldata data,
        string calldata comment,
        uint256 requiredSigs,
        address[] calldata signerAddresses,
        bytes[] calldata signatures
    )
        external
        onlyRole(SIGNER_ROLE)
        whenNotPaused
        nonReentrant
        returns (uint256 txIndex)
    {
        if (signerAddresses.length != signatures.length) revert ArrayLengthMismatch();

        // Use default requirement if not specified
        uint256 actualRequired = requiredSigs == 0 ? required : requiredSigs;

        // Create transaction hash for signature verification
        bytes32 dataHash = _getTransactionHash(to, value, data, transactions.length, comment);

        // Store the transaction
        txIndex = transactions.length;
        Transaction storage txn = transactions.push();
        txn.to = to;
        txn.value = value;
        txn.data = data;
        txn.executed = false;
        txn.comment = comment;
        txn.dataHash = dataHash;
        txn.requiredSignatures = actualRequired;

        emit SubmitTransactionWithSignatures(_msgSender(), txIndex, to, value, data, comment, actualRequired);

        // Process initial signatures if provided
        if (signerAddresses.length > 0) {
            _processSignatures(txIndex, signerAddresses, signatures);
        }
    }

    /// @notice Adds signatures to an existing transaction
    /// @param txIndex Index of the transaction
    /// @param signerAddresses Array of signer addresses
    /// @param signatures Array of signatures
    function addSignatures(uint256 txIndex, address[] calldata signerAddresses, bytes[] calldata signatures)
        external
        onlyRole(SIGNER_ROLE)
        whenNotPaused
        nonReentrant
    {
        if (signerAddresses.length != signatures.length) revert ArrayLengthMismatch();
        if (txIndex > transactions.length - 1) {
            revert TxDoesNotExist(txIndex, transactions.length > 0 ? transactions.length - 1 : 0);
        }

        Transaction storage txn = transactions[txIndex];
        if (txn.executed) revert TxExecuted(txIndex);

        _processSignatures(txIndex, signerAddresses, signatures);
    }

    /// @notice Internal function to process and validate signatures
    /// @param txIndex Index of the transaction
    /// @param signerAddresses Array of signer addresses
    /// @param sigs Array of signatures
    function _processSignatures(uint256 txIndex, address[] memory signerAddresses, bytes[] memory sigs) internal {
        Transaction storage txn = transactions[txIndex];

        // Check for duplicates in new signatures
        for (uint256 i = 0; i < signerAddresses.length; ++i) {
            // Verify signer is authorized
            if (!hasRole(SIGNER_ROLE, signerAddresses[i])) {
                revert UnauthorizedSigner(signerAddresses[i]);
            }

            // Check for duplicates in existing signatures
            for (uint256 j = 0; j < txn.signers.length; ++j) {
                if (txn.signers[j] == signerAddresses[i]) {
                    revert DuplicateSignature(signerAddresses[i]);
                }
            }

            // Verify signature
            if (!SignatureChecker.isValidSignatureNow(signerAddresses[i], txn.dataHash, sigs[i])) {
                revert UnauthorizedSigner(signerAddresses[i]);
            }

            // Add to transaction
            txn.signers.push(signerAddresses[i]);
            txn.signatures.push(sigs[i]);
        }

        emit SignaturesProvided(_msgSender(), txIndex, signerAddresses, txn.signers.length);

        // Check if we can execute
        _tryExecute(txIndex);
    }

    /// @notice Tries to execute a transaction if enough signatures are collected
    /// @param txIndex Index of the transaction
    function _tryExecute(uint256 txIndex) internal {
        Transaction storage txn = transactions[txIndex];

        if (txn.executed) return;

        bool canExecute = false;

        if (useWeightedSignatures) {
            // Calculate total weight
            uint256 totalWeight = 0;
            for (uint256 i = 0; i < txn.signers.length; ++i) {
                uint256 weight = signerWeights[txn.signers[i]];
                // Default weight is 1 if not set
                totalWeight += weight == 0 ? 1 : weight;
            }

            if (totalWeight > totalWeightRequired - 1) {
                canExecute = true;
            }
        } else {
            // Simple threshold check
            if (txn.signers.length > txn.requiredSignatures - 1) {
                canExecute = true;
            }
        }

        if (canExecute) {
            txn.executed = true;

            // Execute the transaction
            (bool success,) = txn.to.call{ value: txn.value }(txn.data);
            if (!success) {
                txn.executed = false;
                revert ExecutionFailed();
            }

            emit ExecuteTransaction(_msgSender(), txIndex);
        }
    }

    /// @notice Generates EIP-712 compliant transaction hash
    /// @param to Destination address
    /// @param value ETH value
    /// @param data Call data
    /// @param nonce Transaction nonce (index)
    /// @param comment Transaction comment
    /// @return Transaction hash for signature verification
    function _getTransactionHash(address to, uint256 value, bytes memory data, uint256 nonce, string memory comment)
        internal
        view
        returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(
                "\x19\x01",
                _domainSeparator,
                keccak256(
                    abi.encode(TRANSACTION_TYPEHASH, to, value, keccak256(data), nonce, keccak256(bytes(comment)))
                )
            )
        );
    }

    /// @notice Returns detailed information about a transaction
    /// @param txIndex Index of the transaction
    /// @return to Destination address
    /// @return value ETH value
    /// @return data Call data
    /// @return executed Execution status
    /// @return comment Transaction description
    /// @return requiredSignatures Number of signatures required
    /// @return signersList Array of addresses that signed
    function getTransaction(uint256 txIndex)
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data,
            bool executed,
            string memory comment,
            uint256 requiredSignatures,
            address[] memory signersList
        )
    {
        if (txIndex > transactions.length - 1) {
            revert TxDoesNotExist(txIndex, transactions.length > 0 ? transactions.length - 1 : 0);
        }

        Transaction storage txn = transactions[txIndex];
        return (txn.to, txn.value, txn.data, txn.executed, txn.comment, txn.requiredSignatures, txn.signers);
    }

    /// @notice Returns the transaction hash for signature generation
    /// @param txIndex Index of the transaction
    /// @return dataHash The hash to be signed
    function getTransactionHash(uint256 txIndex) external view returns (bytes32) {
        if (txIndex > transactions.length - 1) {
            revert TxDoesNotExist(txIndex, transactions.length > 0 ? transactions.length - 1 : 0);
        }
        return transactions[txIndex].dataHash;
    }

    /// @notice Returns a list of all current signers
    /// @return signers_ Array of signer addresses
    function signers() external view returns (address[] memory signers_) {
        uint256 count = getRoleMemberCount(SIGNER_ROLE);
        signers_ = new address[](count);
        for (uint256 i = 0; i < count; ++i) {
            signers_[i] = getRoleMember(SIGNER_ROLE, i);
        }
        return signers_;
    }

    // ═══════════════════════════════════════════════════════════════════════════════════
    // IContractWithIdentity Implementation
    // ═══════════════════════════════════════════════════════════════════════════════════

    /// @notice Returns the ONCHAINID associated with this vault
    /// @return The address of the ONCHAINID (IIdentity contract)
    function onchainID() external view override returns (address) {
        return _onchainId;
    }

    /// @notice Permission check: can `actor` add a claim to the vault's identity?
    /// @dev Vaults implement permission logic directly - only governance role can manage claims
    /// @param actor The address requesting to add a claim
    /// @return True if the actor can add claims, false otherwise
    function canAddClaim(address actor) external view override returns (bool) {
        return hasRole(GOVERNANCE_ROLE, actor);
    }

    /// @notice Permission check: can `actor` remove a claim from the vault's identity?
    /// @dev Vaults implement permission logic directly - only governance role can manage claims
    /// @param actor The address requesting to remove a claim
    /// @return True if the actor can remove claims, false otherwise
    function canRemoveClaim(address actor) external view override returns (bool) {
        return hasRole(GOVERNANCE_ROLE, actor);
    }

    /// @notice Checks if this contract implements an interface (ERC-165)
    /// @param interfaceId The interface identifier to check
    /// @return True if the contract implements the interface
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlEnumerable, IERC165)
        returns (bool)
    {
        return interfaceId == type(IContractWithIdentity).interfaceId || super.supportsInterface(interfaceId);
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
