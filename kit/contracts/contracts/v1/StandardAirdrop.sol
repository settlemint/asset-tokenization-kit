// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { AirdropBase } from "./airdrop/AirdropBase.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title StandardAirdrop
 * @dev A simple time-bound Merkle airdrop implementation
 */
contract StandardAirdrop is AirdropBase {
    using SafeERC20 for IERC20;

    // Time-bound constraints
    uint256 public immutable startTime;
    uint256 public immutable endTime;

    // Additional errors
    error AirdropNotStarted();
    error AirdropEnded();
    error EndTimeNotAfterStartTime(uint256 startTime, uint256 endTime);

    /**
     * @dev Creates a standard airdrop with time-bound claiming
     * @param tokenAddress The token to be distributed
     * @param root The Merkle root for verifying claims
     * @param initialOwner The initial owner of the contract
     * @param _startTime When claims can begin
     * @param _endTime When claims end
     * @param trustedForwarder The address of the trusted forwarder for ERC2771
     */
    constructor(
        address tokenAddress,
        bytes32 root,
        address initialOwner,
        uint256 _startTime,
        uint256 _endTime,
        address trustedForwarder
    )
        AirdropBase(tokenAddress, root, initialOwner, trustedForwarder)
    {
        if (_endTime <= _startTime) {
            revert EndTimeNotAfterStartTime(_startTime, _endTime);
        }
        startTime = _startTime;
        endTime = _endTime;
    }

    /**
     * @notice Allows users to claim their allocated tokens
     * @param index The index in the Merkle tree
     * @param amount The amount to claim
     * @param merkleProof The proof for verification
     */
    function claim(uint256 index, uint256 amount, bytes32[] calldata merkleProof) external override {
        // Check if already claimed
        if (isClaimed(index)) revert AlreadyClaimed();

        // Check time constraints
        if (block.timestamp < startTime) revert AirdropNotStarted();
        if (block.timestamp > endTime) revert AirdropEnded();

        // Verify proof
        if (!_verifyMerkleProof(index, _msgSender(), amount, merkleProof)) {
            revert InvalidMerkleProof();
        }

        // Mark as claimed
        _setClaimed(index);

        // Transfer tokens
        token.safeTransfer(_msgSender(), amount);

        emit Claimed(_msgSender(), amount);
    }

    /**
     * @notice Allows users to claim multiple allocations in a single transaction
     * @param indices The indices in the Merkle tree
     * @param amounts The amounts allocated for each index
     * @param merkleProofs The proofs for verification for each index
     */
    function batchClaim(
        uint256[] calldata indices,
        uint256[] calldata amounts,
        bytes32[][] calldata merkleProofs
    )
        external
        override
    {
        // Validate input arrays have matching lengths
        if (indices.length != amounts.length || amounts.length != merkleProofs.length) {
            revert ArrayLengthMismatch();
        }

        // Check time constraints (do this once for the entire batch)
        if (block.timestamp < startTime) revert AirdropNotStarted();
        if (block.timestamp > endTime) revert AirdropEnded();

        uint256 totalAmount = 0;

        // Process each claim
        for (uint256 i = 0; i < indices.length; i++) {
            uint256 index = indices[i];
            uint256 amount = amounts[i];
            bytes32[] calldata merkleProof = merkleProofs[i];

            // Check if already claimed
            if (isClaimed(index)) revert AlreadyClaimed();

            // Verify Merkle proof
            if (!_verifyMerkleProof(index, _msgSender(), amount, merkleProof)) {
                revert InvalidMerkleProof();
            }

            // Mark as claimed
            _setClaimed(index);

            // Add to total amount
            totalAmount += amount;
        }

        // Transfer total tokens
        if (totalAmount > 0) {
            token.safeTransfer(_msgSender(), totalAmount);
            emit BatchClaimed(_msgSender(), totalAmount, indices, amounts);
        }
    }
}
