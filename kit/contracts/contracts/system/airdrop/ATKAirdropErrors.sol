// SPDX-License-Identifier: FSL-1.1-MIT

pragma solidity ^0.8.28;

/// @title ATK Airdrop Errors
/// @notice Custom errors for the ATK Airdrop contracts (Merkle-based airdrops)
/// @dev These errors are used by ATKAirdrop and its inheritors for efficient and descriptive revert reasons.

/// @notice Error indicating that a provided Merkle proof is invalid for the claim parameters.
error InvalidMerkleProof();

/// @notice Error indicating that a claim is attempted for an index that has already been claimed.
error IndexAlreadyClaimed();

/// @notice Error indicating that a zero address was provided where a non-zero address is required.
error InvalidTokenAddress();

/// @notice Error indicating that input array lengths do not match in batch operations.
error InvalidInputArrayLengths();

/// @notice Error indicating that a zero address was provided where a non-zero address is required.
error InvalidRecipientAddress();

/// @notice Error indicating that a zero address was provided where a non-zero address is required.
error InvalidWithdrawalAddress();
