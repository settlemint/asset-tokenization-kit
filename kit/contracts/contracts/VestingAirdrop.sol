// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { AirdropBase } from "./airdrop/AirdropBase.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IClaimStrategy } from "./airdrop/interfaces/IClaimStrategy.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VestingAirdrop
 * @dev Airdrop contract that implements vesting using pluggable strategies
 */
contract VestingAirdrop is AirdropBase, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // The claim strategy contract
    IClaimStrategy public claimStrategy;
    uint256 public immutable claimPeriodEnd;

    // Track initialization status for vesting-based claims
    mapping(uint256 => bool) private initializedClaims;

    // Track claim timestamps for each user's index for vesting strategies
    mapping(uint256 => uint256) private claimTimestamps;

    // Track already claimed amounts for each user's index for vesting
    mapping(uint256 => uint256) private claimedAmounts;

    // Additional errors
    error ClaimPeriodEnded();
    error ClaimNotEligible();
    error ZeroAmountToTransfer();

    // Events for claim initialization
    event ClaimInitialized(address indexed claimant, uint256 allocatedAmount);

    /**
     * @dev Creates a vesting airdrop with a pluggable strategy
     * @param tokenAddress The token to distribute
     * @param root The Merkle root for verification
     * @param initialOwner The owner of the contract
     * @param _claimStrategy The vesting strategy contract
     * @param _claimPeriodEnd When users can no longer initialize vesting
     * @param trustedForwarder The address of the trusted forwarder for ERC2771
     */
    constructor(
        address tokenAddress,
        bytes32 root,
        address initialOwner,
        address _claimStrategy,
        uint256 _claimPeriodEnd,
        address trustedForwarder
    )
        AirdropBase(tokenAddress, root, initialOwner, trustedForwarder)
    {
        require(_claimStrategy != address(0), "Invalid claim strategy");
        require(_claimPeriodEnd > block.timestamp, "Claim period must be in the future");
        claimStrategy = IClaimStrategy(_claimStrategy);
        require(claimStrategy.supportsMultipleClaims(), "Strategy must support vesting");
        claimPeriodEnd = _claimPeriodEnd;
    }

    /**
     * @notice Updates the claim strategy
     * @param newStrategy The new claim strategy to use
     */
    function setClaimStrategy(address newStrategy) external onlyOwner {
        require(newStrategy != address(0), "Invalid claim strategy");
        claimStrategy = IClaimStrategy(newStrategy);
        require(claimStrategy.supportsMultipleClaims(), "Strategy must support vesting");
    }

    /**
     * @notice Allows users to claim tokens based on the current vesting strategy
     * @param index The index in the Merkle tree
     * @param amount The amount allocated
     * @param merkleProof The proof for verification
     */
    function claim(uint256 index, uint256 amount, bytes32[] calldata merkleProof) external override nonReentrant {
        // Check if already initialized (replaces isClaimed check for vesting)
        if (initializedClaims[index]) {
            // If already initialized, subsequent claims don't check claimPeriodEnd
            // but still need proof verification etc.
        } else {
            // Check claim period only for the initial claim/initialization
            if (block.timestamp > claimPeriodEnd) revert ClaimPeriodEnded();
        }

        // Verify Merkle proof first
        if (!_verifyMerkleProof(index, _msgSender(), amount, merkleProof)) {
            revert InvalidMerkleProof();
        }

        // Calculate the amount to transfer using vesting logic
        uint256 amountToTransfer = _processVestingClaim(index, amount);

        // If there's an amount to transfer, transfer tokens and record the claim
        if (amountToTransfer > 0) {
            token.safeTransfer(_msgSender(), amountToTransfer);
            claimStrategy.recordClaim(_msgSender(), amountToTransfer);
            emit Claimed(_msgSender(), amountToTransfer);
        } else if (!initializedClaims[index]) {
            // For zero amounts on first claim (e.g., cliff), still emit initialization event
            emit ClaimInitialized(_msgSender(), amount);
        }
    }

    /**
     * @dev Internal function to process a vesting claim
     * @param index The index in the Merkle tree
     * @param amount The amount allocated to the account
     * @return amountToTransfer The amount to transfer immediately
     */
    function _processVestingClaim(uint256 index, uint256 amount) internal returns (uint256 amountToTransfer) {
        bool isInitialization = !initializedClaims[index];

        // For the first claim, initialize vesting
        if (isInitialization) {
            // Mark as initialized and store timestamp
            initializedClaims[index] = true;
            claimTimestamps[index] = block.timestamp;
            claimedAmounts[index] = 0;

            // Initialize vesting and get initial amount if any
            amountToTransfer = claimStrategy.initializeVesting(_msgSender(), amount);

            // Update claimed amount if there's an immediate transfer
            if (amountToTransfer > 0) {
                // Update VestingAirdrop's tracked amount for this index
                claimedAmounts[index] = amountToTransfer;
            }
        } else {
            // This is a subsequent claim for an already initialized vesting

            // Calculate claimable amount through strategy
            uint256 vestingStart = claimTimestamps[index];
            uint256 alreadyClaimed = claimedAmounts[index];

            amountToTransfer =
                claimStrategy.calculateClaimableAmount(_msgSender(), amount, vestingStart, alreadyClaimed);

            if (amountToTransfer > 0) {
                // Update VestingAirdrop's claimed amount for this index
                claimedAmounts[index] += amountToTransfer;

                // Strategy state updated via recordClaim after transfer
            }
        }

        return amountToTransfer;
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
        nonReentrant
    {
        // Validate input arrays have matching lengths
        if (indices.length != amounts.length || amounts.length != merkleProofs.length) {
            revert ArrayLengthMismatch();
        }

        uint256 totalAmountToTransfer = 0;

        // First, verify proofs and check eligibility
        for (uint256 i = 0; i < indices.length; i++) {
            uint256 index = indices[i];
            uint256 amount = amounts[i];
            bytes32[] calldata merkleProof = merkleProofs[i];

            // Check claim period only for the initial claim/initialization
            if (!initializedClaims[index]) {
                if (block.timestamp > claimPeriodEnd) revert ClaimPeriodEnded();
            }

            // Verify Merkle proof
            if (!_verifyMerkleProof(index, _msgSender(), amount, merkleProof)) {
                revert InvalidMerkleProof();
            }
        }

        // Process vesting for each allocation
        totalAmountToTransfer = _processBatchVestingClaim(indices, amounts);

        // Transfer total tokens if not zero
        if (totalAmountToTransfer > 0) {
            token.safeTransfer(_msgSender(), totalAmountToTransfer);
            emit BatchClaimed(_msgSender(), totalAmountToTransfer, indices, amounts);
        }
    }

    /**
     * @dev Internal function to process batch claim with vesting strategy
     * @param indices The indices in the Merkle tree
     * @param amounts The amounts allocated for each index
     * @return totalAmountToTransfer The total amount to transfer
     */
    function _processBatchVestingClaim(
        uint256[] calldata indices,
        uint256[] calldata amounts
    )
        internal
        returns (uint256 totalAmountToTransfer)
    {
        totalAmountToTransfer = 0;

        for (uint256 i = 0; i < indices.length; i++) {
            uint256 index = indices[i];
            uint256 amount = amounts[i];
            bool isInitialization = !initializedClaims[index];

            if (isInitialization) {
                // Mark as initialized and store timestamp
                initializedClaims[index] = true;
                uint256 initTimestamp = block.timestamp;
                if (claimTimestamps[index] == 0) {
                    claimTimestamps[index] = initTimestamp;
                } else {
                    initTimestamp = claimTimestamps[index];
                }
                claimedAmounts[index] = 0;

                // Initialize vesting through strategy
                uint256 immediateAmount = claimStrategy.initializeVesting(_msgSender(), amount);

                if (immediateAmount > 0) {
                    totalAmountToTransfer += immediateAmount;
                    claimedAmounts[index] = immediateAmount;
                }
                emit ClaimInitialized(_msgSender(), amount);
            } else {
                // Process already initialized claim
                uint256 vestingStart = claimTimestamps[index];
                uint256 alreadyClaimed = claimedAmounts[index];

                uint256 claimableAmount =
                    claimStrategy.calculateClaimableAmount(_msgSender(), amount, vestingStart, alreadyClaimed);

                if (claimableAmount > 0) {
                    totalAmountToTransfer += claimableAmount;
                    claimedAmounts[index] += claimableAmount;
                }
            }
        }

        // Finalize the batch in the strategy
        claimStrategy.finalizeBatch(_msgSender());

        return totalAmountToTransfer;
    }

    /**
     * @dev Internal helper function to record claims with the strategy after a batch transfer.
     * NOTE: This assumes the strategy can handle multiple `recordClaim` calls correctly
     * or aggregates internally. If precise batch atomicity is needed in the strategy state,
     * the strategy interface might need a `batchRecordClaim` method.
     * @param indices The indices claimed in the batch
     * @param amounts The original allocated amounts for the indices
     * @param totalAmountTransferred The total amount successfully transferred in the batch
     */
    function _recordBatchClaim(
        uint256[] calldata indices,
        uint256[] calldata amounts,
        uint256 totalAmountTransferred
    )
        internal
    {
        // Simple approach: Call recordClaim for the total amount.
        // This assumes the strategy primarily cares about the total claimed by the user.
        // If index-specific details matter *within the strategy* after the claim,
        // a more complex recording mechanism (like looping or a dedicated batch function)
        // would be needed in the strategy.
        if (totalAmountTransferred > 0) {
            claimStrategy.recordClaim(_msgSender(), totalAmountTransferred);
        }
        // Suppress unused warnings if the simple approach is taken
        indices;
        amounts;
    }
}
