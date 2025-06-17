// SPDX-License-Identifier: FSL-1.1-MIT

pragma solidity ^0.8.28;

/// @title ATK Vesting Airdrop Errors
/// @notice Custom errors for the ATK Vesting Airdrop contracts
/// @dev These errors are used by ATKVestingAirdropImplementation and related contracts for efficient and descriptive
/// revert reasons.

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

/// @notice Error indicating that an invalid vesting duration was provided.
error InvalidVestingDuration();

/// @notice Error indicating that the cliff duration exceeds the vesting duration.
error CliffExceedsVestingDuration();

/// @notice Error indicating that the vesting airdrop implementation is not set or invalid.
error VestingAirdropImplementationNotSet();
