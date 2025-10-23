// SPDX-License-Identifier: FSL-1.1-MIT

pragma solidity ^0.8.28;

import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ATKAirdrop } from "../ATKAirdrop.sol";
import { ATKAmountClaimTracker } from "../claim-tracker/ATKAmountClaimTracker.sol";
import { IATKVestingStrategy } from "./IATKVestingStrategy.sol";
import { IATKVestingAirdrop } from "./IATKVestingAirdrop.sol";
import { IATKAirdrop } from "../IATKAirdrop.sol";
import { InvalidInputArrayLengths, InvalidMerkleProof } from "../ATKAirdropErrors.sol";

/// @title ATK Vesting Airdrop Implementation
/// @author SettleMint
/// @notice Implementation of a vesting airdrop contract that uses pluggable claim strategies in the ATK Protocol.
/// @dev This contract implements a two-phase vesting airdrop process:
///      1. `initializeVesting` or `batchInitializeVesting`: User proves their allocation and starts the vesting clock.
///         No tokens are transferred at this stage.
///      2. `claim` or `batchClaim`: User claims the vested portion of their tokens at any time after initialization.
///
///      The contract uses a pluggable vesting strategy pattern to allow different vesting calculations.
///      It extends ATKAirdrop for Merkle proof verification and meta-transaction support.
///      It deploys its own claim tracker for secure claim management.
contract ATKVestingAirdropImplementation is IATKVestingAirdrop, ATKAirdrop, ReentrancyGuardUpgradeable {
    using SafeERC20 for IERC20;

    // --- Storage Variables ---
    /// @notice The vesting strategy contract that handles vesting calculations.
    /// @dev Can be updated by the owner to change vesting logic.
    IATKVestingStrategy private _vestingStrategy;

    /// @notice The timestamp after which no new vesting can be initialized.
    /// @dev Set once at initialization and immutable thereafter.
    uint256 private _initializationDeadline;

    /// @notice Mapping to track initialization timestamps for each claim index.
    /// @dev Maps claim index to the timestamp when vesting was initialized for that index.
    mapping(uint256 => uint256) private _initializationTimestamp;

    // --- Events ---
    /// @notice Emitted when vesting is initialized for a specific claim index.
    /// @param account The address that initialized the vesting.
    /// @param totalAmount The total amount allocated for this index.
    /// @param index The index of the claim in the Merkle tree.
    event VestingInitialized(address indexed account, uint256 indexed totalAmount, uint256 indexed index);

    /// @notice Emitted when vesting is initialized for multiple claim indices in a batch.
    /// @param account The address that initialized the vesting.
    /// @param indices The indices of the claims in the Merkle tree.
    /// @param totalAmounts The amounts allocated for each index.
    event BatchVestingInitialized(address indexed account, uint256[] indices, uint256[] totalAmounts);

    /// @notice Emitted when the vesting strategy is updated.
    /// @param oldStrategy The address of the previous vesting strategy.
    /// @param newStrategy The address of the new vesting strategy.
    event VestingStrategyUpdated(address indexed oldStrategy, address indexed newStrategy);

    // --- Constructor ---
    /// @notice Constructor that prevents initialization of the implementation contract
    /// @dev Uses the OpenZeppelin pattern to prevent the implementation from being initialized
    /// @custom:oz-upgrades-unsafe-allow constructor
    /// @param forwarder_ The address of the forwarder contract.
    constructor(address forwarder_) ATKAirdrop(forwarder_) {
        _disableInitializers();
    }

    // --- Initializer ---
    /// @notice Initializes the vesting airdrop contract with specified parameters.
    /// @dev Sets up the base airdrop functionality and vesting-specific parameters.
    ///      Deploys its own claim tracker for secure claim management.
    /// @param name_ The human-readable name for this airdrop.
    /// @param token_ The address of the ERC20 token to be distributed.
    /// @param root_ The Merkle root for verifying claims.
    /// @param owner_ The initial owner of the contract.
    /// @param vestingStrategy_ The address of the vesting strategy contract for vesting calculations.
    /// @param initializationDeadline_ The timestamp after which no new vesting can be initialized.
    function initialize(
        string calldata name_,
        address token_,
        bytes32 root_,
        address owner_,
        address vestingStrategy_,
        uint256 initializationDeadline_
    )
        external
        initializer
    {
        if (vestingStrategy_ == address(0)) revert InvalidVestingStrategyAddress();
        if (initializationDeadline_ < block.timestamp + 1) revert InvalidInitializationDeadline();

        // Verify the vesting strategy supports multiple claims (required for vesting)
        try IATKVestingStrategy(vestingStrategy_).supportsMultipleClaims() returns (bool supportsMultiple) {
            if (!supportsMultiple) revert InvalidVestingStrategy(vestingStrategy_);
        } catch {
            revert InvalidVestingStrategy(vestingStrategy_);
        }

        // Deploy claim tracker for this contract
        address claimTracker_ = address(new ATKAmountClaimTracker(address(this)));

        // Initialize base airdrop contract
        __ATKAirdrop_init(name_, token_, root_, owner_, claimTracker_);
        __ReentrancyGuard_init();

        // Set vesting-specific state
        _vestingStrategy = IATKVestingStrategy(vestingStrategy_);
        _initializationDeadline = initializationDeadline_;
    }

    // --- View Functions ---
    /// @notice Returns the current vesting strategy contract.
    /// @return The vesting strategy contract.
    function vestingStrategy() external view returns (IATKVestingStrategy) {
        return _vestingStrategy;
    }

    /// @notice Returns the initialization deadline timestamp.
    /// @return The timestamp after which no new vesting can be initialized.
    function initializationDeadline() external view returns (uint256) {
        return _initializationDeadline;
    }

    /// @notice Returns the initialization timestamp for a specific claim index.
    /// @param index The index to check.
    /// @return timestamp The timestamp when vesting was initialized for this index (0 if not initialized).
    function getInitializationTimestamp(uint256 index) external view returns (uint256) {
        return _initializationTimestamp[index];
    }

    /// @notice Checks if vesting has been initialized for a specific index.
    /// @param index The index to check.
    /// @return initialized True if vesting has been initialized for this index.
    function isVestingInitialized(uint256 index) public view returns (bool) {
        return _initializationTimestamp[index] != 0;
    }

    // --- External Functions ---
    /// @notice Updates the vesting strategy contract.
    /// @dev Only the owner can update the vesting strategy. The new strategy must support multiple claims.
    /// @param newVestingStrategy_ The address of the new vesting strategy contract.
    function setVestingStrategy(address newVestingStrategy_) external onlyOwner {
        if (newVestingStrategy_ == address(0)) revert InvalidVestingStrategyAddress();

        // Verify the new vesting strategy supports multiple claims
        try IATKVestingStrategy(newVestingStrategy_).supportsMultipleClaims() returns (bool supportsMultiple) {
            if (!supportsMultiple) revert InvalidVestingStrategy(newVestingStrategy_);
        } catch {
            revert InvalidVestingStrategy(newVestingStrategy_);
        }

        address oldStrategy = address(_vestingStrategy);
        _vestingStrategy = IATKVestingStrategy(newVestingStrategy_);
        emit VestingStrategyUpdated(oldStrategy, newVestingStrategy_);
    }

    /// @notice Initializes vesting for a specific allocation without transferring tokens.
    /// @dev Users must call this function first to start their vesting schedule before they can claim tokens.
    ///      The vesting start time is recorded when this function is called.
    /// @param index The index of the claim in the Merkle tree.
    /// @param totalAmount The total amount allocated for this index.
    /// @param merkleProof The Merkle proof array for verification.
    function initializeVesting(
        uint256 index,
        uint256 totalAmount,
        bytes32[] calldata merkleProof
    )
        external
        nonReentrant
    {
        if (_initializationTimestamp[index] != 0) revert VestingAlreadyInitialized();
        if (block.timestamp > _initializationDeadline) revert InitializationDeadlinePassed();

        // Verify Merkle proof
        if (!_verifyMerkleProof(index, _msgSender(), totalAmount, merkleProof)) {
            revert InvalidMerkleProof();
        }

        // Record initialization timestamp
        _initializationTimestamp[index] = block.timestamp;
        emit VestingInitialized(_msgSender(), totalAmount, index);
    }

    /// @notice Initializes vesting for multiple allocations in a single transaction.
    /// @dev Batch version of initializeVesting for gas efficiency when handling multiple indices.
    /// @param indices The indices of the claims in the Merkle tree.
    /// @param totalAmounts The total amounts allocated for each index.
    /// @param merkleProofs The Merkle proof arrays for verification of each index.
    function batchInitializeVesting(
        uint256[] calldata indices,
        uint256[] calldata totalAmounts,
        bytes32[][] calldata merkleProofs
    )
        external
        nonReentrant
        checkBatchSize(indices.length)
    {
        if (indices.length != totalAmounts.length || totalAmounts.length != merkleProofs.length) {
            revert InvalidInputArrayLengths();
        }

        address sender = _msgSender();
        uint256 currentTimestamp = block.timestamp;

        if (currentTimestamp > _initializationDeadline) revert InitializationDeadlinePassed();

        for (uint256 i = 0; i < indices.length; ++i) {
            uint256 index = indices[i];
            uint256 totalAmount = totalAmounts[i];

            if (_initializationTimestamp[index] != 0) revert VestingAlreadyInitialized();

            // Verify Merkle proof
            if (!_verifyMerkleProof(index, sender, totalAmount, merkleProofs[i])) {
                revert InvalidMerkleProof();
            }

            // Record initialization timestamp
            _initializationTimestamp[index] = currentTimestamp;
        }

        emit BatchVestingInitialized(sender, indices, totalAmounts);
    }

    /// @notice Claims vested tokens for a specific allocation after vesting initialization.
    /// @dev Overrides the abstract claim function from ATKAirdrop. Requires vesting to be initialized first.
    ///      The amount claimed is determined by the vesting strategy based on time elapsed since initialization.
    /// @param index The index of the claim in the Merkle tree.
    /// @param totalAmount The total amount allocated for this index.
    /// @param merkleProof The Merkle proof array (required by base contract but not used in verification here).
    function claim(
        uint256 index,
        uint256 totalAmount,
        bytes32[] calldata merkleProof
    )
        external
        override(ATKAirdrop, IATKAirdrop)
        nonReentrant
    {
        if (_initializationTimestamp[index] == 0) revert VestingNotInitialized();

        uint256 vestingStart = _initializationTimestamp[index];
        uint256 claimedAmount = getClaimedAmount(index);
        address sender = _msgSender();

        // Calculate claimable amount using the vesting strategy
        uint256 claimableAmount =
            _vestingStrategy.calculateClaimableAmount(sender, totalAmount, vestingStart, claimedAmount);

        if (claimableAmount == 0) revert ZeroAmountToTransfer();

        // Process the claim using the inherited helper
        _processClaim(index, sender, claimableAmount, totalAmount, merkleProof);
    }

    /// @notice Claims vested tokens for multiple allocations in a single transaction.
    /// @dev Overrides the abstract batchClaim function from ATKAirdrop. All indices must have vesting initialized.
    /// @param indices The indices of the claims in the Merkle tree.
    /// @param totalAmounts The total amounts allocated for each index.
    /// @param merkleProofs The Merkle proof arrays (required by base contract but not used in verification here).
    function batchClaim(
        uint256[] calldata indices,
        uint256[] calldata totalAmounts,
        bytes32[][] calldata merkleProofs
    )
        external
        override(ATKAirdrop, IATKAirdrop)
        nonReentrant
        checkBatchSize(indices.length)
    {
        if (indices.length != totalAmounts.length || totalAmounts.length != merkleProofs.length) {
            revert InvalidInputArrayLengths();
        }

        address sender = _msgSender();
        uint256[] memory claimableAmounts = new uint256[](indices.length);

        for (uint256 i = 0; i < indices.length; ++i) {
            uint256 index = indices[i];
            if (_initializationTimestamp[index] == 0) revert VestingNotInitialized();

            uint256 totalAmount = totalAmounts[i];
            uint256 vestingStart = _initializationTimestamp[index];
            uint256 claimedAmount = getClaimedAmount(index);

            uint256 claimableAmount =
                _vestingStrategy.calculateClaimableAmount(sender, totalAmount, vestingStart, claimedAmount);

            claimableAmounts[i] = claimableAmount;
        }

        _processBatchClaim(indices, sender, claimableAmounts, totalAmounts, merkleProofs);
    }
}
