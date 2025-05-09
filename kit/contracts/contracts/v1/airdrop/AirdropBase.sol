// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";

/**
 * @title AirdropBase
 * @dev Abstract base contract for reusable airdrop distributions
 * Contains the core functionality for Merkle-based verification
 * Now includes ERC2771 support for meta-transactions.
 */
abstract contract AirdropBase is Ownable, ERC2771Context {
    using SafeERC20 for IERC20;

    // Common state variables
    IERC20 public immutable token;
    bytes32 public immutable merkleRoot;

    // Track claimed status with bitmap for gas efficiency
    mapping(uint256 => uint256) private claimedBitMap;

    // Events
    event Claimed(address indexed claimant, uint256 amount);
    event TokensWithdrawn(address indexed to, uint256 amount);
    event BatchClaimed(address indexed claimant, uint256 totalAmount, uint256[] indices, uint256[] amounts);

    // Custom errors
    error InvalidMerkleProof();
    error AlreadyClaimed();
    error ZeroAddress();
    error ArrayLengthMismatch();

    /**
     * @dev Creates the base airdrop contract
     * @param tokenAddress The token to be distributed
     * @param root The Merkle root for verifying claims
     * @param initialOwner The initial owner of the contract
     * @param trustedForwarder The address of the trusted forwarder for ERC2771
     */
    constructor(
        address tokenAddress,
        bytes32 root,
        address initialOwner,
        address trustedForwarder
    )
        Ownable(initialOwner)
        ERC2771Context(trustedForwarder)
    {
        if (tokenAddress == address(0)) revert ZeroAddress();
        token = IERC20(tokenAddress);
        merkleRoot = root;
    }

    /**
     * @dev Checks if a claim has been made for a specific index
     * @param index The index to check
     * @return Whether the index has been claimed
     */
    function isClaimed(uint256 index) public view returns (bool) {
        uint256 wordIndex = index / 256;
        uint256 bitIndex = index % 256;
        uint256 word = claimedBitMap[wordIndex];
        uint256 mask = 1 << bitIndex;
        return (word & mask) != 0;
    }

    /**
     * @dev Internal function to mark an index as claimed
     * @param index The index to mark as claimed
     */
    function _setClaimed(uint256 index) internal {
        uint256 wordIndex = index / 256;
        uint256 bitIndex = index % 256;
        claimedBitMap[wordIndex] |= (1 << bitIndex);
    }

    /**
     * @dev Internal function to verify a Merkle proof
     * @param index The index of the claim in the Merkle tree
     * @param account The address claiming the tokens
     * @param amount The amount of tokens being claimed
     * @param merkleProof The proof to verify
     * @return verified Whether the proof is valid
     * @dev IMPORTANT: Derived contracts implementing `claim` must ensure `account` == `_msgSender()`.
     */
    function _verifyMerkleProof(
        uint256 index,
        address account,
        uint256 amount,
        bytes32[] calldata merkleProof
    )
        internal
        view
        returns (bool verified)
    {
        // Double hash the leaf node for domain separation and security
        bytes32 node = keccak256(abi.encode(keccak256(abi.encode(index, account, amount))));
        return MerkleProof.verify(merkleProof, merkleRoot, node);
    }

    /**
     * @notice Allows the owner to withdraw any tokens remaining in the contract
     * @param to The address to send the tokens to
     */
    function withdrawTokens(address to) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        uint256 balance = token.balanceOf(address(this));
        token.safeTransfer(to, balance);
        emit TokensWithdrawn(to, balance);
    }

    /**
     * @dev Abstract function that must be implemented by derived contracts
     * This allows different implementations to define their own claim logic
     * @dev Implementations must use `_msgSender()` instead of `msg.sender` and pass it to `_verifyMerkleProof`.
     */
    function claim(uint256 index, uint256 amount, bytes32[] calldata merkleProof) external virtual;

    /**
     * @notice Allows users to claim multiple allocations in a single transaction
     * @param indices The indices in the Merkle tree
     * @param amounts The amounts allocated for each index
     * @param merkleProofs The proofs for verification for each index
     * @dev Implementations must use `_msgSender()` instead of `msg.sender` and pass it to `_verifyMerkleProof` in a
     * loop.
     */
    function batchClaim(
        uint256[] calldata indices,
        uint256[] calldata amounts,
        bytes32[][] calldata merkleProofs
    )
        external
        virtual;

    // --- ERC2771 Context Overrides ---

    /**
     * @dev Overrides the underlying `_msgSender` logic to support ERC2771.
     */
    function _msgSender() internal view virtual override(Context, ERC2771Context) returns (address sender) {
        return ERC2771Context._msgSender();
    }

    /**
     * @dev Overrides the underlying `_msgData` logic to support ERC2771.
     */
    function _msgData() internal view virtual override(Context, ERC2771Context) returns (bytes calldata data) {
        return ERC2771Context._msgData();
    }

    /**
     * @dev Overrides the underlying `_contextSuffixLength` logic for ERC2771 compatibility.
     */
    function _contextSuffixLength() internal view virtual override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }
}
