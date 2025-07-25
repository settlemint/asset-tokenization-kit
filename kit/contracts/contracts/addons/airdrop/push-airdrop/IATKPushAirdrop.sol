// SPDX-License-Identifier: FSL-1.1-MIT

pragma solidity ^0.8.28;

import { IATKAirdrop } from "../IATKAirdrop.sol";

/// @title IATKPushAirdrop
/// @author SettleMint
/// @notice Interface for push airdrop contracts in the ATK Protocol.
/// @dev Defines the functions specific to push airdrops where only admins can distribute tokens.
interface IATKPushAirdrop is IATKAirdrop {
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

    // --- View Functions ---

    /// @notice Returns the total amount of tokens distributed so far.
    /// @return The total amount distributed.
    function totalDistributed() external view returns (uint256);

    /// @notice Returns the distribution cap.
    /// @return The maximum tokens that can be distributed (0 for no cap).
    function distributionCap() external view returns (uint256);

    /// @notice Checks if tokens have been distributed to a specific index.
    /// @param index The index to check.
    /// @return distributed True if tokens have been distributed for this index.
    function isDistributed(uint256 index) external view returns (bool);

    // --- External Functions ---

    /// @notice Updates the distribution cap.
    /// @dev Only the owner can update the distribution cap.
    /// @param newDistributionCap_ The new distribution cap (0 for no cap).
    function setDistributionCap(uint256 newDistributionCap_) external;

    /// @notice Distributes tokens to a single recipient with Merkle proof verification.
    /// @dev Only the contract owner can distribute tokens.
    /// @param index The index of the distribution in the Merkle tree.
    /// @param recipient The address to receive tokens.
    /// @param amount The amount of tokens to distribute.
    /// @param merkleProof The Merkle proof array for verification.
    function distribute(uint256 index, address recipient, uint256 amount, bytes32[] calldata merkleProof) external;

    /// @notice Distributes tokens to multiple recipients in a single transaction.
    /// @dev Only the contract owner can distribute tokens.
    /// @param indices The indices of the distributions in the Merkle tree.
    /// @param recipients The addresses to receive tokens.
    /// @param amounts The amounts of tokens to distribute to each recipient.
    /// @param merkleProofs The Merkle proof arrays for verification of each distribution.
    function batchDistribute(
        uint256[] calldata indices,
        address[] calldata recipients,
        uint256[] calldata amounts,
        bytes32[][] calldata merkleProofs
    )
        external;
}
