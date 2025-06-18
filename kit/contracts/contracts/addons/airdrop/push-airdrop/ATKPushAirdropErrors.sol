// SPDX-License-Identifier: FSL-1.1-MIT

pragma solidity ^0.8.28;

// --- Push Airdrop Specific Errors ---

/// @notice Thrown when attempting to claim tokens from a push airdrop.
/// @dev Push airdrops only allow admin-initiated distributions, not user claims.
error PushAirdropClaimNotAllowed();

/// @notice Thrown when attempting to distribute to an invalid address.
error InvalidDistributionAddress();

/// @notice Thrown when tokens have already been distributed to a specific index.
error AlreadyDistributed();

/// @notice Thrown when a distribution would exceed the configured distribution cap.
error DistributionCapExceeded();

/// @notice Thrown when attempting to distribute zero tokens.
error ZeroAmountToDistribute();
