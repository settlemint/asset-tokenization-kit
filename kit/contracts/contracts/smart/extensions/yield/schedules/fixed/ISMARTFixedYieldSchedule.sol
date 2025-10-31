// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ISMARTYield } from "../../ISMARTYield.sol";
import { ISMARTYieldSchedule } from "../ISMARTYieldSchedule.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @title Interface for a SMART Fixed Yield Schedule Contract
/// @author SettleMint
/// @notice This interface defines the set of functions that a fixed yield schedule contract must
/// implement.
/// A fixed yield schedule typically involves distributing a predetermined rate of yield at regular intervals over a
/// defined period.
/// This interface extends `ISMARTYieldSchedule`, inheriting its `startDate()` function, and adds many more specific
/// functions for managing and querying the fixed yield mechanism.
/// @dev Implementing contracts will manage the lifecycle of yield distribution, including calculating yield based on
/// historical balances,
/// allowing users to claim their yield, and administrative functions like topping up the denomination asset used for
/// payments.
/// Functions are `external`, meaning they are designed to be called from other contracts or off-chain applications.
/// Many are `view` functions, which read state but don't modify it.
interface ISMARTFixedYieldSchedule is ISMARTYieldSchedule, IERC165 {
    /// @notice Defines custom error types for more gas-efficient and descriptive error handling.
    /// @dev Using custom errors (Solidity 0.8.4+) saves gas compared to `require` with string messages.
    /// @dev Reverted if the `tokenAddress` provided in the constructor is the zero address.
    error InvalidToken();
    /// @dev Reverted if the `startDate_` provided in the constructor is not in the future (i.e., less than or equal to
    /// `block.timestamp`).
    error InvalidStartDate();
    /// @dev Reverted if the `endDate_` provided in the constructor is not after the `startDate_`.
    error InvalidEndDate();
    /// @dev Reverted if the `rate_` (yield rate in basis points) provided in the constructor is zero.
    error InvalidRate();
    /// @dev Reverted if the `interval_` (distribution interval in seconds) provided in the constructor is zero.
    error InvalidInterval();
    /// @dev Reverted by `claimYield` if there is no accumulated yield for the caller to claim for completed periods.
    error NoYieldAvailable();
    /// @dev Reverted by `calculateAccruedYield` if the schedule has not yet started (i.e., `block.timestamp <
    /// _startDate`).
    error ScheduleNotActive();
    /// @dev Reverted by `topUpDenominationAsset` or `withdrawDenominationAsset` if the denomination asset transfer
    /// fails or
    /// if there's not enough balance.
    /// @param currentBalance The current balance of the denomination asset in the contract.
    /// @param requiredBalance The required balance of the denomination asset for the operation.
    error InsufficientDenominationAssetBalance(uint256 currentBalance, uint256 requiredBalance); // Could also be used
        // if a
        // transferFrom fails.
        /// @dev Reverted if the `_denominationAsset` (derived from `_token.yieldToken()`) is the zero address, or if
        // `to`
        /// address in withdrawal is zero.
    error InvalidDenominationAsset();
    /// @dev Reverted by `withdrawDenominationAsset` if the withdrawal `amount` is zero.
    error InvalidAmount();
    /// @dev Reverted by `withdrawDenominationAsset` if the denomination asset balance is zero.
    error NoDenominationAssetBalance();
    /// @dev Reverted by `periodEnd` if an invalid period number (0 or out of bounds) is requested.
    error InvalidPeriod();

    // Errors for UUPS/Initializable pattern
    /// @dev Reverted if the `initialize` function is called more than once.
    error AlreadyInitialized();
    /// @dev Reverted if `initialize` is called directly on a logic contract that was configured via constructor.
    error CannotInitializeLogicContract();
    /// @dev Reverted if a re-entrant call occurs during the initialization process.
    error ReentrantInitialization();

    /// @notice Emitted when a new fixed yield schedule is set.
    /// @param startDate The start date of the yield schedule.
    /// @param endDate The end date of the yield schedule.
    /// @param rate The rate of the yield schedule.
    /// @param interval The interval of the yield schedule.
    /// @param periodEndTimestamps The timestamps of the end of each period.
    /// @param denominationAsset The denomination asset of the yield schedule.
    event FixedYieldScheduleSet(
        uint256 startDate,
        uint256 endDate,
        uint256 rate,
        uint256 interval,
        uint256[] periodEndTimestamps,
        IERC20 denominationAsset
    );

    /// @notice Emitted when an administrator or funder successfully deposits `_denominationAsset` into the contract to
    /// fund yield payments.
    /// @param from The address that sent the `_denominationAsset` tokens (the funder).
    /// @param amount The quantity of `_denominationAsset` tokens deposited.
    event DenominationAssetTopUp(address indexed from, uint256 indexed amount);

    /// @notice Emitted when an administrator successfully withdraws `_denominationAsset` from the contract.
    /// @param to The address that received the withdrawn `_denominationAsset` tokens.
    /// @param amount The quantity of `_denominationAsset` tokens withdrawn.
    event DenominationAssetWithdrawn(address indexed to, uint256 indexed amount);

    /// @notice Emitted when a token holder successfully claims their accrued yield.
    /// @param holder The address of the token holder who claimed the yield.
    /// @param claimedAmount The total quantity of `_denominationAsset` transferred to the holder in this claim.
    /// @param fromPeriod The first period number (1-indexed) included in this claim.
    /// @param toPeriod The last period number (1-indexed) included in this claim.
    /// @param periodAmounts An array containing the amount of yield claimed for each specific period within the
    /// `fromPeriod` to `toPeriod` range.
    /// The length of this array is `toPeriod - fromPeriod + 1`.
    /// @param periodYields An array containing the total yield for each specific period within the
    /// `fromPeriod` to `toPeriod` range.
    /// The length of this array is `toPeriod - fromPeriod + 1`.
    /// @param totalYieldPerPeriod The estimated total yield required for a period.
    event YieldClaimed( // Amounts per period, matches the range fromPeriod to toPeriod
        address indexed holder,
        uint256 claimedAmount,
        uint256 fromPeriod,
        uint256 toPeriod,
        uint256[] periodAmounts,
        uint256[] periodYields,
        uint256 totalYieldPerPeriod
    );

    /// @notice Returns an array of all period end timestamps for this yield schedule.
    /// @dev Each timestamp in the array marks the conclusion of a yield distribution period.
    /// The number of elements in this array corresponds to the total number of periods in the schedule.
    /// This is useful for understanding the full timeline of the yield schedule.
    /// @return timestamps An array of Unix timestamps, each representing the end of a distribution period.
    function allPeriods() external view returns (uint256[] memory timestamps);

    /// @notice Returns the end timestamp for a specific yield distribution period.
    /// @dev Periods are typically 1-indexed. Requesting period `0` or a period number greater than the total number of
    /// periods should be handled (e.g., revert).
    /// @param period The period number (e.g., 1 for the first period, 2 for the second, etc.) whose end timestamp is
    /// being queried.
    /// @return timestamp The Unix timestamp marking the end of the specified `period`.
    function periodEnd(uint256 period) external view returns (uint256 timestamp);

    /// @notice Returns the current, ongoing period number of the yield schedule.
    /// @dev If the schedule has not yet started (`block.timestamp < startDate()`), this might return 0.
    /// If the schedule has ended (`block.timestamp >= endDate()`), this might return the total number of periods.
    /// Otherwise, it returns the 1-indexed number of the period that is currently in progress.
    /// @return periodNumber The current period number (1-indexed), or 0 if not started / an indicator if ended.
    function currentPeriod() external view returns (uint256 periodNumber);

    /// @notice Returns the most recent period number that has been fully completed and is eligible for yield claims.
    /// @dev This indicates up to which period users can typically claim their accrued yield.
    /// If no periods have completed (e.g., `block.timestamp < periodEnd(1)`), this might return 0.
    /// @return periodNumber The 1-indexed number of the last fully completed period.
    function lastCompletedPeriod() external view returns (uint256 periodNumber);

    /// @notice Returns the remaining time in seconds until the start of the next yield distribution period.
    /// @dev If the schedule has not started, this could be time until `startDate()`.
    /// If the schedule is ongoing, this is the time left in the `currentPeriod()`.
    /// If the schedule has ended, this might return 0.
    /// @return timeRemaining The time in seconds until the next period begins or current period ends.
    function timeUntilNextPeriod() external view returns (uint256 timeRemaining);

    /// @notice Returns the last period number for which a specific token holder has successfully claimed their yield.
    /// @dev This is crucial for tracking individual claim statuses. If a holder has never claimed, this might return 0.
    /// @param holder The address of the token holder whose last claimed period is being queried.
    /// @return periodNumber The 1-indexed number of the last period claimed by the `holder`.
    function lastClaimedPeriod(address holder) external view returns (uint256 periodNumber);

    /// @notice Calculates the total amount of yield that has been accrued by all token holders across all completed
    /// periods but has not yet been claimed.
    /// @dev This requires iterating through completed periods and historical token supplies/balances, so it can be
    /// gas-intensive if called on-chain frequently.
    /// It gives an overview of the outstanding yield liability of the schedule contract.
    /// @return totalAmount The total sum of unclaimed yield tokens.
    function totalUnclaimedYield() external view returns (uint256 totalAmount);

    /// @notice Calculates the total amount of yield that will be required to cover all token holders for
    /// a distribution period.
    /// @dev This is a projection based on current total supply (or relevant historical supply measure) and the yield
    /// rate.
    /// Useful for administrators to ensure sufficient denomination assets are available in the contract for future
    /// payouts.
    /// @return totalAmount The estimated total yield tokens needed for the current period's distribution.
    function estimateTotalYieldPerPeriod() external view returns (uint256 totalAmount);

    /// @notice Calculates the total accrued yield for a specific token holder up to the current moment, including any
    /// pro-rata share for the ongoing period.
    /// @dev This provides an up-to-the-second estimate of what a holder is entitled to, combining fully completed
    /// unclaimed periods and a partial calculation for the current period.
    /// The pro-rata calculation typically depends on the time elapsed in the current period and the holder's current
    /// balance.
    /// @param holder The address of the token holder for whom to calculate accrued yield.
    /// @return totalAmount The total amount of yield tokens accrued by the `holder`.
    function calculateAccruedYield(address holder) external view returns (uint256 totalAmount);

    /// @notice Allows the caller (a token holder) to claim all their available (accrued and unclaimed) yield from
    /// completed periods.
    /// @dev This function will typically:
    /// 1. Determine the periods for which the caller has not yet claimed yield.
    /// 2. Calculate the yield owed for those periods based on their historical token balance at the end of each
    /// respective period.
    /// 3. Transfer the total calculated yield (in `denominationAsset()`) to the caller.
    /// 4. Update the caller's `lastClaimedPeriod`.
    /// This is a state-changing function and will emit events (e.g., `YieldClaimed`).
    function claimYield() external; // Consider adding `returns (uint256 claimedAmount)`

    /// @notice Allows anyone to deposit (top-up) the denomination asset into the schedule contract to fund yield
    /// payments.
    /// @dev This function is used to ensure the contract has sufficient reserves of the `denominationAsset()` to pay
    /// out
    /// accrued yield.
    /// It typically involves the caller first approving the schedule contract to spend their `denominationAsset`
    /// tokens,
    /// then this function calls `transferFrom`.
    /// @param amount The quantity of the `denominationAsset` to deposit into the schedule contract.
    function topUpDenominationAsset(uint256 amount) external;

    /// @notice Allows an authorized administrator to withdraw a specific `amount` of the `denominationAsset` from the
    /// schedule contract.
    /// @dev This is an administrative function and should be strictly access-controlled (e.g., `onlyRole(ADMIN_ROLE)`).
    /// Useful for managing excess funds or in emergency situations.
    /// @param to The address to which the withdrawn `denominationAsset` tokens will be sent.
    /// @param amount The quantity of `denominationAsset` tokens to withdraw.
    function withdrawDenominationAsset(address to, uint256 amount) external;

    /// @notice Allows an authorized administrator to withdraw all available `denominationAsset` tokens from the
    /// schedule
    /// contract.
    /// @dev Similar to `withdrawDenominationAsset`, but withdraws the entire balance of `denominationAsset` held by the
    /// contract.
    /// Should also be strictly access-controlled.
    /// @param to The address to which all `denominationAsset` tokens will be sent.
    function withdrawAllDenominationAsset(address to) external;

    /// @notice Returns the address of the SMART token contract for which this yield schedule is defined.
    /// @dev The schedule contract needs to interact with this token contract to query historical balances (e.g.,
    /// `balanceOfAt`) and total supplies (`totalSupplyAt`).
    /// The returned token contract should implement the `ISMARTYield` interface.
    /// @return tokenContract The `ISMARTYield` compliant token contract address.
    function token() external view returns (ISMARTYield tokenContract);

    /// @notice Returns the ERC20 token contract that is used for making yield payments.
    /// @dev This is the actual token that holders will receive when they claim their yield.
    /// It can be the same as `token()` or a different token (e.g., a stablecoin).
    /// @return assetToken The `IERC20` compliant token contract address used for payments.
    function denominationAsset() external view returns (IERC20 assetToken);

    /// @notice Returns the timestamp representing the end date and time of the entire yield schedule.
    /// @dev After this timestamp, no more yield will typically accrue or be distributed by this schedule.
    /// @return timestamp The Unix timestamp indicating when the yield schedule concludes.
    function endDate() external view returns (uint256 timestamp);

    /// @notice Returns the yield rate for the schedule.
    /// @dev The interpretation of this rate (e.g., annual percentage rate, per period rate) and its precision (e.g.,
    /// basis points)
    /// depends on the specific implementation of the schedule contract.
    /// For a fixed schedule, this rate is a key parameter in calculating yield per period.
    /// @return yieldRate The configured yield rate (e.g., in basis points, where 100 basis points = 1%).
    function rate() external view returns (uint256 yieldRate);

    /// @notice Returns the duration of each distribution interval or period in seconds.
    /// @dev For example, if yield is distributed daily, the interval would be `86400` seconds.
    /// This, along with `startDate` and `endDate`, defines the periodicity of the schedule.
    /// @return durationSeconds The length of each yield period in seconds.
    function interval() external view returns (uint256 durationSeconds);
}
