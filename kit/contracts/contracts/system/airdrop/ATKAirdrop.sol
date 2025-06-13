// SPDX-License-Identifier: FSL-1.1-MIT

pragma solidity ^0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import {
    InvalidMerkleProof,
    IndexAlreadyClaimed,
    InvalidTokenAddress,
    InvalidInputArrayLengths,
    InvalidWithdrawalAddress,
    InvalidMerkleRoot
} from "./ATKAirdropErrors.sol";

/// @title ATK Airdrop (Abstract)
/// @author SettleMint Tokenization Services
/// @notice Abstract base contract for reusable Merkle-based airdrop distributions in the ATK Protocol.
///         This contract provides the core logic for Merkle proof-based airdrop claims, including:
///         - Efficient claim tracking using a bitmap (gas-optimized)
///         - Meta-transaction support via ERC2771 (trusted forwarder)
///         - Withdrawals of unclaimed tokens by the owner
///         - Abstract claim and batchClaim functions for extension by concrete airdrop implementations
///
/// @dev This contract provides the core logic for Merkle proof-based airdrop claims, including:
///  - Efficient claim tracking using a bitmap (gas-optimized)
///  - Meta-transaction support via ERC2771 (trusted forwarder)
///  - Withdrawals of unclaimed tokens by the owner
///  - Abstract claim and batchClaim functions for extension by concrete airdrop implementations
///
/// The contract is intended to be inherited by specific airdrop implementations (e.g., standard, vesting, push).
/// It is not meant to be deployed directly.
abstract contract ATKAirdrop is Ownable, ERC2771Context {
    using SafeERC20 for IERC20;

    // --- Storage Variables ---

    /// @notice The ERC20 token being distributed in this airdrop.
    /// @dev Set once at construction and immutable thereafter.
    IERC20 public immutable _token;

    /// @notice The Merkle root for verifying airdrop claims.
    /// @dev Set once at construction and immutable thereafter. Used for Merkle proof verification.
    bytes32 public immutable _merkleRoot;

    /// @notice Bitmap tracking which claim indices have already been claimed.
    /// @dev Maps word index to 256-bit word, where each bit represents a claim index (claimed = 1).
    mapping(uint256 => uint256) private _claimedBitMap;

    // --- Events ---

    /// @notice Emitted when a user successfully claims their airdrop allocation.
    /// @param claimant The address that claimed the tokens.
    /// @param amount The amount of tokens claimed.
    /// @param index The index of the claim in the Merkle tree.
    event Claimed(address indexed claimant, uint256 amount, uint256 index);
    /// @notice Emitted when the contract owner withdraws unclaimed tokens.
    /// @param to The address receiving the withdrawn tokens.
    /// @param amount The amount of tokens withdrawn.
    event TokensWithdrawn(address indexed to, uint256 amount);
    /// @notice Emitted when a user claims multiple allocations in a single transaction.
    /// @param claimant The address that claimed the tokens.
    /// @param totalAmount The total amount of tokens claimed in the batch.
    /// @param indices The indices of the claims in the Merkle tree.
    /// @param amounts The amounts claimed for each index.
    event BatchClaimed(address indexed claimant, uint256 totalAmount, uint256[] indices, uint256[] amounts);

    // --- Constructor ---
    /// @notice Initializes the base airdrop contract.
    /// @dev Sets the token, Merkle root, owner, and trusted forwarder for meta-transactions.
    /// @param token_ The address of the ERC20 token to be distributed.
    /// @param root_ The Merkle root for verifying claims.
    /// @param owner_ The initial owner of the contract.
    /// @param trustedForwarder_ The address of the trusted forwarder for ERC2771 meta-transactions.
    constructor(
        address token_,
        bytes32 root_,
        address owner_,
        address trustedForwarder_
    )
        Ownable(owner_)
        ERC2771Context(trustedForwarder_)
    {
        if (token_ == address(0)) revert InvalidTokenAddress();
        if (root_ == bytes32(0)) revert InvalidMerkleRoot();

        // Verify the token contract exists and implements IERC20 by attempting to call a view function
        try IERC20(token_).totalSupply() returns (uint256) {
            // Contract exists and implements IERC20
        } catch {
            revert InvalidTokenAddress();
        }

        _token = IERC20(token_);
        _merkleRoot = root_;
    }

    // --- View Functions ---

    /// @notice Returns the token being distributed in this airdrop.
    /// @return The ERC20 token being distributed.
    function token() external view returns (IERC20) {
        return _token;
    }

    /// @notice Returns the Merkle root for verifying airdrop claims.
    /// @return The Merkle root for verifying airdrop claims.
    function merkleRoot() external view returns (bytes32) {
        return _merkleRoot;
    }

    /// @notice Checks if a claim has already been made for a specific index.
    /// @param index The index to check in the Merkle tree.
    /// @return claimed True if the index has been claimed, false otherwise.
    function claimed(uint256 index) public view returns (bool) {
        uint256 wordIndex = index / 256;
        uint256 bitIndex = index % 256;
        uint256 word = _claimedBitMap[wordIndex];
        uint256 mask = 1 << bitIndex;
        return (word & mask) != 0;
    }

    // --- External Functions ---

    /// @notice Claims an airdrop allocation for the caller.
    /// @dev Must be implemented by derived contracts. Implementations must use `_msgSender()` instead of `msg.sender`
    /// and pass it to `_verifyMerkleProof`.
    /// @param index The index of the claim in the Merkle tree.
    /// @param amount The amount of tokens being claimed.
    /// @param merkleProof The Merkle proof array.
    function claim(uint256 index, uint256 amount, bytes32[] calldata merkleProof) external virtual;

    /// @notice Claims multiple airdrop allocations for the caller in a single transaction.
    /// @dev Must be implemented by derived contracts. Implementations must use `_msgSender()` instead of `msg.sender`
    /// and pass it to `_verifyMerkleProof` in a loop.
    /// @param indices The indices of the claims in the Merkle tree.
    /// @param amounts The amounts allocated for each index.
    /// @param merkleProofs The Merkle proofs for each index.
    function batchClaim(
        uint256[] calldata indices,
        uint256[] calldata amounts,
        bytes32[][] calldata merkleProofs
    )
        external
        virtual;

    /// @notice Allows the owner to withdraw any tokens remaining in the contract.
    /// @param to The address to send the withdrawn tokens to.
    function withdrawTokens(address to) external onlyOwner {
        if (to == address(0)) revert InvalidWithdrawalAddress();
        uint256 balance = _token.balanceOf(address(this));
        _token.safeTransfer(to, balance);
        emit TokensWithdrawn(to, balance);
    }

    // --- Internal Functions ---

    /// @dev Marks a specific index as claimed in the bitmap.
    /// @param index The index to mark as claimed.
    function _setClaimed(uint256 index) internal {
        uint256 wordIndex = index / 256;
        uint256 bitIndex = index % 256;
        _claimedBitMap[wordIndex] |= (1 << bitIndex);
    }

    /// @dev Verifies a Merkle proof for a claim.
    /// @param index The index of the claim in the Merkle tree.
    /// @param account The address claiming the tokens.
    /// @param amount The amount of tokens being claimed.
    /// @param merkleProof The Merkle proof array.
    /// @return verified True if the proof is valid, false otherwise.
    /// @dev IMPORTANT: Derived contracts implementing `claim` must ensure `account` == `_msgSender()`.
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
        return MerkleProof.verify(merkleProof, _merkleRoot, node);
    }

    // --- Context Overrides (ERC2771) ---

    /// @dev Returns the sender of the transaction, supporting ERC2771 meta-transactions.
    function _msgSender() internal view virtual override(Context, ERC2771Context) returns (address sender) {
        return ERC2771Context._msgSender();
    }

    /// @dev Returns the calldata of the transaction, supporting ERC2771 meta-transactions.
    function _msgData() internal view virtual override(Context, ERC2771Context) returns (bytes calldata data) {
        return ERC2771Context._msgData();
    }

    /// @dev Returns the context suffix length for ERC2771 compatibility.
    function _contextSuffixLength() internal view virtual override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }
}
