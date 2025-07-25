// SPDX-License-Identifier: FSL-1.1-MIT

pragma solidity ^0.8.28;

import { IATKVestingStrategy } from "./IATKVestingStrategy.sol";

/// @title IATKLinearVestingStrategy
/// @author SettleMint
/// @notice Interface for a linear vesting strategy contract.
/// @dev Extends the base vesting strategy with functions specific to linear vesting.
interface IATKLinearVestingStrategy is IATKVestingStrategy {
    /// @notice Returns the total vesting duration.
    /// @return The vesting duration in seconds.
    function vestingDuration() external view returns (uint256);

    /// @notice Returns the cliff duration.
    /// @return The cliff duration in seconds.
    function cliffDuration() external view returns (uint256);
}
