// SPDX-License-Identifier: FSL-1.1-MIT

pragma solidity ^0.8.28;

/// @title ATK Airdrop Errors
/// @notice Custom errors for the ATK Airdrop contracts (Merkle-based airdrops)
/// @dev These errors are used by ATKAirdrop and its inheritors for efficient and descriptive revert reasons.

/// @notice Error indicating that a provided Merkle proof is invalid for the claim parameters.
error InvalidMerkleProof();

/// @notice Error indicating that a provided Merkle root is invalid.
error InvalidMerkleRoot();

/// @notice Error indicating that a claim is attempted for an index that has already been claimed.
error IndexAlreadyClaimed();

/// @notice Error indicating that an invalid token address was provided.
error InvalidTokenAddress();

/// @notice Error indicating that input array lengths do not match in batch operations.
error InvalidInputArrayLengths();

/// @notice Error indicating that an invalid withdrawal address was provided.
error InvalidWithdrawalAddress();

/// @notice Error indicating that an invalid claim tracker address was provided.
error InvalidClaimTrackerAddress();

/// @notice Error indicating that the claim amount exceeds the total allocated amount for the index.
error InvalidClaimAmount();

/// @notice Error indicating that the claim amount is zero.
error ZeroClaimAmount();

/// @notice Error indicating that the batch size exceeds the maximum allowed limit.
error BatchSizeExceedsLimit();

/// @notice Thrown when the airdrop name is empty or invalid.
error InvalidAirdropName();
