// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC20Yield } from "../extensions/ERC20Yield.sol";

/// @title Interface for FixedYield contract
/// @notice Defines the functions needed for external interaction with FixedYield schedules
interface IFixedYield {
    /// @notice Returns all period end timestamps for this yield schedule
    function allPeriods() external view returns (uint256[] memory);

    /// @notice Returns the period end timestamp for a specific period
    function periodEnd(uint256 period) external view returns (uint256);

    /// @notice Returns the current ongoing period number
    function currentPeriod() external view returns (uint256);

    /// @notice Returns the last completed period number that can be claimed
    function lastCompletedPeriod() external view returns (uint256);

    /// @notice Returns time until next period starts in seconds
    function timeUntilNextPeriod() external view returns (uint256);

    /// @notice Returns the last claimed period for a holder
    function lastClaimedPeriod(address holder) external view returns (uint256);

    /// @notice Calculates the total unclaimed yield across all holders
    function totalUnclaimedYield() external view returns (uint256);

    /// @notice Calculates the total yield that will be needed for the next period
    function totalYieldForNextPeriod() external view returns (uint256);

    /// @notice Calculates the total accrued yield including pro-rated current period for a holder
    function calculateAccruedYield(address holder) external view returns (uint256);

    /// @notice Claims all available yield for the caller
    function claimYield() external;

    /// @notice Allows topping up the contract with underlying assets for yield payments
    function topUpUnderlyingAsset(uint256 amount) external;

    /// @notice Withdraws underlying assets (Admin only)
    function withdrawUnderlyingAsset(address to, uint256 amount) external;

    /// @notice Withdraws all underlying assets (Admin only)
    function withdrawAllUnderlyingAsset(address to) external;

    /// @notice Returns the token this schedule is for
    function token() external view returns (ERC20Yield);

    /// @notice Returns the underlying asset used for yield payments
    function underlyingAsset() external view returns (IERC20);

    /// @notice Returns the start date of the yield schedule
    function startDate() external view returns (uint256);

    /// @notice Returns the end date of the yield schedule
    function endDate() external view returns (uint256);

    /// @notice Returns the yield rate
    function rate() external view returns (uint256);

    /// @notice Returns the distribution interval
    function interval() external view returns (uint256);

    /// @notice Pauses the contract (Admin only)
    function pause() external;

    /// @notice Unpauses the contract (Admin only)
    function unpause() external;
}
