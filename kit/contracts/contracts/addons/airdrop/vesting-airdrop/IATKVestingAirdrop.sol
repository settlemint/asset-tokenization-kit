// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Interface imports
import { IATKVestingStrategy } from "./IATKVestingStrategy.sol";
import { IATKAirdrop } from "../IATKAirdrop.sol";

/// @title Interface for a ATK Vesting Airdrop
/// @author SettleMint
/// @notice Defines the core functionality for a vesting airdrop contract that uses pluggable claim strategies in the
/// ATK Protocol.
/// @dev This interface extends IATKAirdrop and defines a two-phase vesting airdrop process:
///      1. `initializeVesting` or `batchInitializeVesting`: User proves their allocation and starts the vesting clock.
///      2. `claim` or `batchClaim`: User claims the vested portion of their tokens at any time after initialization.
interface IATKVestingAirdrop is IATKAirdrop {
    /// @notice Error indicating that the initialization deadline has passed and no new vesting can be initialized.
    error InitializationDeadlinePassed();

    /// @notice Error indicating that the user is not eligible to claim at this time.
    error ClaimNotEligible();

    /// @notice Error indicating that there are zero tokens available to transfer.
    error ZeroAmountToTransfer();

    /// @notice Error indicating that an invalid vesting strategy address was provided.
    error InvalidVestingStrategyAddress();

    /// @notice Error indicating that an invalid initialization deadline was provided.
    error InvalidInitializationDeadline();

    /// @notice Error indicating that the provided vesting strategy is invalid for this use case.
    /// @param vestingStrategy The address of the invalid vesting strategy.
    error InvalidVestingStrategy(address vestingStrategy);

    /// @notice Error indicating that vesting has not been initialized for the specified index.
    error VestingNotInitialized();

    /// @notice Error indicating that vesting has already been initialized for the specified index.
    error VestingAlreadyInitialized();

    /// @notice Error indicating that the vesting airdrop implementation is not set or invalid.
    error VestingAirdropImplementationNotSet();

    /// @notice Initializes the vesting airdrop contract with specified parameters.
    /// @param name_ The human-readable name for this airdrop.
    /// @param token_ The address of the ERC20 token to be distributed.
    /// @param root_ The Merkle root for verifying claims.
    /// @param owner_ The initial owner of the contract.
    /// @param vestingStrategy_ The address of the vesting strategy contract for vesting calculations.
    /// @param initializationDeadline_ The timestamp after which no new vesting can be initialized.
    function initialize(
        string memory name_,
        address token_,
        bytes32 root_,
        address owner_,
        address vestingStrategy_,
        uint256 initializationDeadline_
    )
        external;

    // --- View Functions ---

    /// @notice Returns the current vesting strategy contract.
    /// @return The vesting strategy contract.
    function vestingStrategy() external view returns (IATKVestingStrategy);

    /// @notice Returns the initialization deadline timestamp.
    /// @return The timestamp after which no new vesting can be initialized.
    function initializationDeadline() external view returns (uint256);

    /// @notice Returns the initialization timestamp for a specific claim index.
    /// @param index The index to check.
    /// @return timestamp The timestamp when vesting was initialized for this index (0 if not initialized).
    function getInitializationTimestamp(uint256 index) external view returns (uint256);

    /// @notice Checks if vesting has been initialized for a specific index.
    /// @param index The index to check.
    /// @return initialized True if vesting has been initialized for this index.
    function isVestingInitialized(uint256 index) external view returns (bool);

    // --- State-Changing Functions (Vesting-specific) ---

    /// @notice Updates the vesting strategy contract.
    /// @param newVestingStrategy_ The address of the new vesting strategy contract.
    function setVestingStrategy(address newVestingStrategy_) external;

    /// @notice Initializes vesting for a specific allocation without transferring tokens.
    /// @param index The index of the claim in the Merkle tree.
    /// @param totalAmount The total amount allocated for this index.
    /// @param merkleProof The Merkle proof array for verification.
    function initializeVesting(uint256 index, uint256 totalAmount, bytes32[] calldata merkleProof) external;

    /// @notice Initializes vesting for multiple allocations in a single transaction.
    /// @param indices The indices of the claims in the Merkle tree.
    /// @param totalAmounts The total amounts allocated for each index.
    /// @param merkleProofs The Merkle proof arrays for verification of each index.
    function batchInitializeVesting(
        uint256[] calldata indices,
        uint256[] calldata totalAmounts,
        bytes32[][] calldata merkleProofs
    )
        external;
}
