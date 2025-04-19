// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC2771Context} from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PushAirdrop
 * @dev Contract for admin-initiated token distributions with Merkle proof verification
 * This allows project owners to push tokens to recipients in batches.
 */
contract PushAirdrop is Ownable, ReentrancyGuard, ERC2771Context {
    using SafeERC20 for IERC20;

    // Token to distribute
    IERC20 public immutable token;

    // Merkle root of the distribution list
    bytes32 public merkleRoot;

    // Tracking distributed status (address => distributed)
    mapping(address => bool) public distributed;

    // Total tokens distributed so far
    uint256 public totalDistributed;

    // Max tokens that can be distributed (optional cap)
    uint256 public distributionCap;

    // Maximum batch size to prevent excessive gas usage
    uint256 public constant MAX_BATCH_SIZE = 100;

    // Events
    event TokensDistributed(address indexed recipient, uint256 amount);
    event BatchDistributed(uint256 recipientCount, uint256 totalAmount);
    event MerkleRootUpdated(bytes32 oldRoot, bytes32 newRoot);
    event DistributionCapUpdated(uint256 oldCap, uint256 newCap);
    event TokensWithdrawn(address indexed to, uint256 amount);

    // Custom errors
    error InvalidMerkleProof();
    error AlreadyDistributed();
    error ZeroAddress();
    error ArrayLengthMismatch();
    error DistributionCapExceeded();
    error DistributionActive();
    error FailedTransfer();
    error BatchSizeTooLarge();

    /**
     * @dev Creates a new push airdrop contract
     * @param tokenAddress The token to be distributed
     * @param root The Merkle root of the distribution list
     * @param initialOwner The admin who can initiate distributions
     * @param _distributionCap Maximum tokens that can be distributed (0 for no cap)
     * @param trustedForwarder The address of the trusted forwarder for ERC2771
     */
    constructor(
        address tokenAddress,
        bytes32 root,
        address initialOwner,
        uint256 _distributionCap,
        address trustedForwarder
    ) Ownable(initialOwner) ERC2771Context(trustedForwarder) {
        if (tokenAddress == address(0)) revert ZeroAddress();
        token = IERC20(tokenAddress);
        merkleRoot = root;
        distributionCap = _distributionCap;
    }

    /**
     * @notice Updates the Merkle root
     * @param newRoot The new Merkle root
     * @dev Only callable by the contract owner
     */
    function updateMerkleRoot(bytes32 newRoot) external onlyOwner {
        emit MerkleRootUpdated(merkleRoot, newRoot);
        merkleRoot = newRoot;
    }

    /**
     * @notice Updates the distribution cap
     * @param newCap The new distribution cap (0 for no cap)
     * @dev Only callable by the contract owner
     */
    function updateDistributionCap(uint256 newCap) external onlyOwner {
        emit DistributionCapUpdated(distributionCap, newCap);
        distributionCap = newCap;
    }

    /**
     * @notice Distributes tokens to a single recipient with Merkle proof verification
     * @param recipient The address to receive tokens
     * @param amount The amount of tokens to distribute
     * @param merkleProof The proof verifying this distribution
     * @dev Only callable by the contract owner
     */
    function distribute(
        address recipient,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external onlyOwner nonReentrant {
        // Check if already distributed
        if (distributed[recipient]) revert AlreadyDistributed();

        // Verify Merkle proof
        if (!_verifyMerkleProof(recipient, amount, merkleProof))
            revert InvalidMerkleProof();

        // Check distribution cap
        if (distributionCap > 0 && totalDistributed + amount > distributionCap)
            revert DistributionCapExceeded();

        // Mark as distributed
        distributed[recipient] = true;

        // Update total distributed
        totalDistributed += amount;

        // Transfer tokens
        token.safeTransfer(recipient, amount);

        emit TokensDistributed(recipient, amount);
    }

    /**
     * @notice Distributes tokens to multiple recipients in a batch
     * @param recipients The addresses to receive tokens
     * @param amounts The amounts to distribute to each address
     * @param merkleProofs The proofs for each distribution
     * @dev Only callable by the contract owner
     * @dev Limited to MAX_BATCH_SIZE recipients per transaction to prevent gas issues
     */
    function batchDistribute(
        address[] calldata recipients,
        uint256[] calldata amounts,
        bytes32[][] calldata merkleProofs
    ) external onlyOwner nonReentrant {
        // Check batch size
        if (recipients.length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();

        // Validate input arrays have matching lengths
        if (
            recipients.length != amounts.length ||
            amounts.length != merkleProofs.length
        ) {
            revert ArrayLengthMismatch();
        }

        uint256 batchTotal = 0;
        uint256 distributedCount = 0;

        // Process each distribution
        for (uint256 i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            uint256 amount = amounts[i];
            bytes32[] calldata merkleProof = merkleProofs[i];

            // Skip if already distributed
            if (distributed[recipient]) {
                continue;
            }

            // Verify Merkle proof
            if (!_verifyMerkleProof(recipient, amount, merkleProof)) {
                continue;
            }

            // Mark as distributed
            distributed[recipient] = true;

            // Add to batch total
            batchTotal += amount;
            distributedCount++;

            // Transfer tokens
            token.safeTransfer(recipient, amount);

            emit TokensDistributed(recipient, amount);
        }

        // Check distribution cap after calculating batch total
        if (
            distributionCap > 0 &&
            totalDistributed + batchTotal > distributionCap
        ) revert DistributionCapExceeded();

        // Update total distributed
        totalDistributed += batchTotal;

        emit BatchDistributed(distributedCount, batchTotal);
    }

    /**
     * @notice Marks multiple addresses as distributed without sending tokens
     * @param recipients The addresses to mark as distributed
     * @dev Useful for tracking addresses that have received tokens through other means
     * @dev Only callable by the contract owner
     * @dev Limited to MAX_BATCH_SIZE recipients per transaction to prevent gas issues
     */
    function markAsDistributed(
        address[] calldata recipients
    ) external onlyOwner {
        // Check batch size
        if (recipients.length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();

        for (uint256 i = 0; i < recipients.length; i++) {
            distributed[recipients[i]] = true;
        }
    }

    /**
     * @notice Allows the owner to withdraw tokens from the contract
     * @param to The address to send the tokens to
     * @dev Only callable by the contract owner
     */
    function withdrawTokens(address to) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        uint256 balance = token.balanceOf(address(this));
        token.safeTransfer(to, balance);
        emit TokensWithdrawn(to, balance);
    }

    /**
     * @dev Internal function to verify a Merkle proof
     * @param recipient The address claiming the tokens
     * @param amount The amount of tokens being claimed
     * @param merkleProof The proof to verify
     * @return verified Whether the proof is valid
     */
    function _verifyMerkleProof(
        address recipient,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) internal view returns (bool verified) {
        // Double hash the leaf node for domain separation and security
        bytes32 node = keccak256(
            abi.encode(keccak256(abi.encode(recipient, amount)))
        );
        return MerkleProof.verify(merkleProof, merkleRoot, node);
    }

    /**
     * @notice Checks if a recipient has already received their distribution
     * @param recipient The address to check
     * @return Whether the address has already received tokens
     */
    function isDistributed(address recipient) external view returns (bool) {
        return distributed[recipient];
    }

    // --- ERC2771 Context Overrides ---

    /**
     * @dev Overrides the underlying `_msgSender` logic to support ERC2771.
     */
    function _msgSender()
        internal
        view
        virtual
        override(Context, ERC2771Context)
        returns (address sender)
    {
        return ERC2771Context._msgSender();
    }

    /**
     * @dev Overrides the underlying `_msgData` logic to support ERC2771.
     */
    function _msgData()
        internal
        view
        virtual
        override(Context, ERC2771Context)
        returns (bytes calldata data)
    {
        return ERC2771Context._msgData();
    }

    /**
     * @dev Overrides the underlying `_contextSuffixLength` logic for ERC2771 compatibility.
     */
    function _contextSuffixLength()
        internal
        view
        virtual
        override(Context, ERC2771Context)
        returns (uint256)
    {
        return ERC2771Context._contextSuffixLength();
    }
}
