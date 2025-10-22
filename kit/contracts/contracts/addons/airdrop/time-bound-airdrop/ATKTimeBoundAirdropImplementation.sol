// SPDX-License-Identifier: FSL-1.1-MIT

pragma solidity ^0.8.28;

import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ATKAirdrop } from "../ATKAirdrop.sol";
import { ATKAmountClaimTracker } from "../claim-tracker/ATKAmountClaimTracker.sol";
import { IATKTimeBoundAirdrop } from "./IATKTimeBoundAirdrop.sol";
import { IATKAirdrop } from "../IATKAirdrop.sol";

/// @title ATK Time-Bound Airdrop Implementation
/// @author SettleMint
/// @notice Implementation of a time-bound airdrop contract where claims are restricted to a specific time window
/// in the ATK Protocol.
/// @dev This contract implements a time-restricted claim system where:
///      - Claims can only be made within a specified time window (startTime to endTime)
///      - Users can claim their full allocation or partial amounts
///      - Uses Merkle proof verification for secure claim validation
///      - Tracks claimed amounts using ATKAmountClaimTracker for partial claims support
///      - Supports both single and batch claims
///      - Extends ATKAirdrop base functionality with time constraints
///
///      The contract is designed for standard airdrops where all users can claim during the active period.
contract ATKTimeBoundAirdropImplementation is IATKTimeBoundAirdrop, ATKAirdrop, ReentrancyGuardUpgradeable {
    using SafeERC20 for IERC20;

    // --- Storage Variables ---

    /// @notice The timestamp when claims become available.
    /// @dev Claims cannot be made before this time.
    uint256 private _startTime;

    /// @notice The timestamp when claims are no longer available.
    /// @dev Claims cannot be made after this time.
    uint256 private _endTime;

    // --- Modifiers ---

    /// @notice Modifier to ensure the airdrop is currently active (within the time window).
    modifier onlyActive() {
        _onlyActive();
        _;
    }

    /// @notice Validates the claim window is currently open.
    function _onlyActive() internal view {
        if (block.timestamp < _startTime) revert AirdropNotStarted();
        if (block.timestamp > _endTime) revert AirdropEnded();
    }

    // --- Events ---

    /// @custom:oz-upgrades-unsafe-allow constructor
    /// @notice Initializes the implementation contract and disables initialization.
    /// @param forwarder_ The address of the forwarder contract.
    constructor(address forwarder_) ATKAirdrop(forwarder_) {
        _disableInitializers();
    }

    /// @notice Initializes the time-bound airdrop contract with specified parameters.
    /// @dev Sets up the base airdrop functionality and time-bound specific parameters.
    ///      Deploys its own amount claim tracker for partial claims support.
    /// @param name_ The human-readable name for this airdrop.
    /// @param token_ The address of the ERC20 token to be distributed.
    /// @param root_ The Merkle root for verifying claims.
    /// @param owner_ The initial owner of the contract.
    /// @param startTime_ The timestamp when claims can begin.
    /// @param endTime_ The timestamp when claims end.
    function initialize(
        string calldata name_,
        address token_,
        bytes32 root_,
        address owner_,
        uint256 startTime_,
        uint256 endTime_
    )
        external
        initializer
    {
        // Validate time window
        if (startTime_ < block.timestamp) revert InvalidStartTime();
        if (endTime_ < startTime_ + 1) revert InvalidEndTime();

        // Deploy amount claim tracker for this contract
        address claimTracker_ = address(new ATKAmountClaimTracker(address(this)));

        // Initialize base airdrop contract
        __ATKAirdrop_init(name_, token_, root_, owner_, claimTracker_);
        __ReentrancyGuard_init();

        // Set time-bound specific state
        _startTime = startTime_;
        _endTime = endTime_;
    }

    // --- View Functions ---

    /// @notice Returns the start time when claims become available.
    /// @return The timestamp when claims can begin.
    function startTime() external view returns (uint256) {
        return _startTime;
    }

    /// @notice Returns the end time when claims are no longer available.
    /// @return The timestamp when claims end.
    function endTime() external view returns (uint256) {
        return _endTime;
    }

    /// @notice Checks if the airdrop is currently active (within the time window).
    /// @return active True if the current time is within the claim window.
    function isActive() external view returns (bool active) {
        return block.timestamp > _startTime - 1 && block.timestamp < _endTime + 1;
    }

    /// @notice Returns the time remaining until the airdrop starts (if not started) or ends (if active).
    /// @return timeRemaining The number of seconds remaining, 0 if ended.
    function getTimeRemaining() external view returns (uint256 timeRemaining) {
        if (block.timestamp < _startTime) {
            return _startTime - block.timestamp;
        } else if (block.timestamp < _endTime + 1) {
            return _endTime - block.timestamp;
        } else {
            return 0;
        }
    }

    // --- External Functions ---

    /// @notice Claims an airdrop allocation for the caller within the time window.
    /// @dev Validates time constraints, Merkle proof, and processes claims.
    /// @param index The index of the claim in the Merkle tree.
    /// @param totalAmount The total amount allocated for this index.
    /// @param merkleProof The Merkle proof array for verification.
    function claim(
        uint256 index,
        uint256 totalAmount,
        bytes32[] calldata merkleProof
    )
        external
        override(ATKAirdrop, IATKAirdrop)
        onlyActive
        nonReentrant
    {
        _processClaim(index, _msgSender(), totalAmount, totalAmount, merkleProof);
    }

    /// @notice Claims multiple airdrop allocations for the caller in a single transaction.
    /// @dev Batch version for gas efficiency. Uses onlyActive modifier for time validation.
    /// @param indices The indices of the claims in the Merkle tree.
    /// @param totalAmounts The total amounts allocated for each index.
    /// @param merkleProofs The Merkle proof arrays for verification of each claim.
    function batchClaim(
        uint256[] calldata indices,
        uint256[] calldata totalAmounts,
        bytes32[][] calldata merkleProofs
    )
        external
        override(ATKAirdrop, IATKAirdrop)
        onlyActive
        nonReentrant
        checkBatchSize(indices.length)
    {
        _processBatchClaim(indices, _msgSender(), totalAmounts, totalAmounts, merkleProofs);
    }
}
