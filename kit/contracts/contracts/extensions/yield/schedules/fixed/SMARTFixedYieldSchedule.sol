// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ISMARTFixedYieldSchedule } from "./ISMARTFixedYieldSchedule.sol";
import { ISMARTYield } from "../../ISMARTYield.sol";

/// @title SMART Fixed Yield Schedule Contract
/// @notice This contract implements a fixed yield schedule for an associated SMART token (which must implement
/// `ISMARTYield`).
/// It allows token holders to accrue yield at a predetermined fixed `rate` over specified `interval`s between a
/// `startDate` and `endDate`.
/// Yield is paid out in an `underlyingAsset` (which can be the token itself or another ERC20 token).
/// @dev This contract manages the entire lifecycle of a fixed yield distribution:
/// - **Configuration**: `startDate`, `endDate`, `rate`, `interval`, and the `token` it serves.
/// - **Period Management**: Calculates and uses period end timestamps for yield accrual.
/// - **Yield Calculation**: Leverages `balanceOfAt` and `yieldBasisPerUnit` from the `ISMARTYield` token to determine
/// yield per period for each holder.
/// - **Claiming**: Token holders can call `claimYield()` to receive their accrued yield.
/// - **Funding**: The contract can be topped up with the `underlyingAsset` via `topUpUnderlyingAsset()` to ensure
/// payouts can be made.
/// - **Administration**: Includes `AccessControl` for owner-restricted functions like `withdrawUnderlyingAsset` and
/// `pause()`/`unpause()`.
/// - **Meta-transactions**: Inherits `ERC2771Context` to support gasless transactions if a trusted forwarder is
/// configured.
/// - **Security**: Uses `ReentrancyGuard` to protect against reentrancy attacks on state-changing functions like
/// `claimYield`.
/// It implements the `ISMARTFixedYieldSchedule` interface.
/// @custom:security-contact support@settlemint.com Ensure to review security practices for deploying and managing this
/// contract.
contract SMARTFixedYieldSchedule is
    AccessControl, // For managing roles, e.g., who can pause or withdraw funds.
    Pausable, // To allow pausing critical functions in emergencies.
    ERC2771Context, // For meta-transaction support (gasless transactions via a forwarder).
    ISMARTFixedYieldSchedule, // The interface this contract implements.
    ReentrancyGuard // To prevent reentrancy attacks.
{
    using SafeERC20 for IERC20;

    /// @notice The denominator used for rate calculations. `10_000` represents 100% (since rate is in basis points).
    /// @dev For example, a `_rate` of 500 means 500 / 10,000 = 0.05 or 5%.
    // aderyn-fp-next-line(large-numeric-literal)
    uint256 public constant RATE_BASIS_POINTS = 10_000;

    /// @notice The SMART token contract (implementing `ISMARTYield`) for which this schedule distributes yield.
    /// @dev This is immutable, meaning it's set in the constructor and cannot be changed later.
    /// The schedule contract will call functions on this token (e.g., `balanceOfAt`, `yieldBasisPerUnit`).
    ISMARTYield private immutable _token;

    /// @notice The ERC20 token used for making yield payments.
    /// @dev This is also immutable and is determined by calling `_token.yieldToken()` in the constructor.
    /// This is the token that will be transferred to holders when they claim yield.
    IERC20 private immutable _underlyingAsset;

    /// @notice The Unix timestamp (seconds since epoch) when the yield schedule starts.
    /// @dev Immutable. Yield calculations and distributions begin from this point.
    uint256 private immutable _startDate;

    /// @notice The Unix timestamp when the yield schedule ends.
    /// @dev Immutable. No yield will accrue or be distributed by this schedule after this time.
    uint256 private immutable _endDate;

    /// @notice The yield rate in basis points (1 basis point = 0.01%).
    /// @dev Immutable. For example, a rate of 500 means 5% yield per `_interval` based on `_token.yieldBasisPerUnit()`.
    uint256 private immutable _rate;

    /// @notice The duration of each yield distribution interval in seconds (e.g., 86400 for daily).
    /// @dev Immutable. This defines the frequency of yield periods.
    uint256 private immutable _interval;

    /// @notice An array storing the Unix timestamps for the end of each yield distribution period.
    /// @dev This is calculated and cached in the constructor to save gas on repeated period lookups.
    /// `_periodEndTimestamps[0]` is the end of period 1, `_periodEndTimestamps[i]` is end of period `i+1`.
    uint256[] private _periodEndTimestamps;

    /// @notice Maps a token holder's address to the last period number (1-indexed) for which they have successfully
    /// claimed yield.
    /// @dev If a holder has address `A` and `_lastClaimedPeriod[A]` is `X`, they have claimed up to and including
    /// period `X`.
    /// Defaults to 0 if no claims have been made.
    mapping(address holder => uint256 lastClaimedPeriod) private _lastClaimedPeriod;

    /// @notice The total cumulative amount of `_underlyingAsset` that has been successfully claimed by all token
    /// holders.
    /// @dev This helps in tracking the overall distribution progress and can be used with `totalUnclaimedYield`.
    uint256 private _totalClaimed;

    /// @notice Constructor to deploy a new `SMARTFixedYieldSchedule` contract.
    /// @dev Initializes all immutable parameters of the yield schedule and sets up administrative roles.
    /// It calculates and caches all period end timestamps for gas efficiency.
    /// Emits `YieldSet` event.
    /// @param tokenAddress The address of the `ISMARTYield`-compliant token this schedule is for.
    /// @param initialOwner The address that will be granted `DEFAULT_ADMIN_ROLE`, giving control over pausable
    /// functions and withdrawals.
    /// @param startDate_ The Unix timestamp for when the yield schedule should start. Must be in the future.
    /// @param endDate_ The Unix timestamp for when the yield schedule should end. Must be after `startDate_`.
    /// @param rate_ The yield rate in basis points (e.g., 500 for 5%). Must be greater than 0.
    /// @param interval_ The duration of each yield distribution interval in seconds. Must be greater than 0.
    /// @param forwarder The address of the trusted forwarder for ERC2771 meta-transactions. Can be `address(0)` if not
    /// used.
    constructor(
        address tokenAddress,
        address initialOwner,
        uint256 startDate_,
        uint256 endDate_,
        uint256 rate_,
        uint256 interval_,
        address forwarder
    )
        ERC2771Context(forwarder)
    {
        // Initialize ERC2771Context with the trusted forwarder address.
        // Input validations
        if (tokenAddress == address(0)) revert ISMARTFixedYieldSchedule.InvalidToken();
        if (startDate_ <= block.timestamp) revert ISMARTFixedYieldSchedule.InvalidStartDate(); // Start date must be in
            // the future.
        if (endDate_ <= startDate_) revert ISMARTFixedYieldSchedule.InvalidEndDate(); // End date must be after start
            // date.
        if (rate_ == 0) revert ISMARTFixedYieldSchedule.InvalidRate(); // Rate must be positive.
        if (interval_ == 0) revert ISMARTFixedYieldSchedule.InvalidInterval(); // Interval must be positive.

        _token = ISMARTYield(tokenAddress); // Store the associated SMART token contract.
        // aderyn-fp-next-line(reentrancy-state-change)
        _underlyingAsset = _token.yieldToken(); // Determine the payment token from the SMART token.
        if (address(_underlyingAsset) == address(0)) revert ISMARTFixedYieldSchedule.InvalidUnderlyingAsset(); // Payment
            // token cannot be zero
            // address.

        // Set immutable state variables.
        _startDate = startDate_;
        _endDate = endDate_;
        _rate = rate_;
        _interval = interval_;

        // Calculate and cache all period end timestamps.
        // This improves gas efficiency for functions that need to determine period boundaries.
        uint256 totalPeriods = ((endDate_ - startDate_) / interval_) + 1; // Calculate total number of periods.
        _periodEndTimestamps = new uint256[](totalPeriods); // Allocate memory for the array.
        for (uint256 i = 0; i < totalPeriods; ++i) {
            uint256 timestamp = startDate_ + ((i + 1) * interval_); // Calculate end of current period `i+1`.
            // If the calculated timestamp exceeds the schedule's `_endDate`,
            // cap it at `_endDate` to ensure the last period doesn't overshoot.
            if (timestamp > endDate_) {
                timestamp = endDate_;
            }
            _periodEndTimestamps[i] = timestamp; // Store the period end timestamp.
        }

        // Grant the `DEFAULT_ADMIN_ROLE` to the `initialOwner`.
        // This role typically controls pausing, unpausing, and withdrawing funds.
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);

        // Calculate the for the next period for the event.
        uint256 yieldForNextPeriod = totalYieldForNextPeriod();

        emit FixedYieldScheduleSet(
            startDate_, endDate_, rate_, interval_, _periodEndTimestamps, _underlyingAsset, yieldForNextPeriod
        );
    }

    /// @dev Overridden from `Context` and `ERC2771Context` to correctly identify the transaction sender,
    /// accounting for meta-transactions if a trusted forwarder is used.
    /// @return The actual sender of the transaction (`msg.sender` or the relayed sender).
    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return super._msgSender();
    }

    /// @dev Overridden from `Context` and `ERC2771Context` to correctly retrieve the transaction data,
    /// accounting for meta-transactions.
    /// @return The actual transaction data (`msg.data` or the relayed data).
    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return super._msgData();
    }

    /// @dev Overridden from `ERC2771Context` to define the length of the suffix appended to `msg.data` for relayed
    /// calls.
    /// @return The length of the context suffix (typically 20 bytes for the sender's address).
    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return super._contextSuffixLength();
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function allPeriods() public view override returns (uint256[] memory) {
        return _periodEndTimestamps;
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    /// @dev Periods are 1-indexed. Accessing `_periodEndTimestamps` requires 0-indexed access (`period - 1`).
    function periodEnd(uint256 period) public view override returns (uint256) {
        // Validate that the requested period number is within the valid range.
        if (period == 0 || period > _periodEndTimestamps.length) revert ISMARTFixedYieldSchedule.InvalidPeriod();
        return _periodEndTimestamps[period - 1]; // Adjust to 0-based index for array access.
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function currentPeriod() public view override returns (uint256) {
        if (block.timestamp < _startDate) return 0; // Schedule hasn't started.
        if (block.timestamp >= _endDate) return _periodEndTimestamps.length; // Schedule has ended, return total number
            // of periods.
        // Calculate current period number (1-indexed).
        return ((block.timestamp - _startDate) / _interval) + 1;
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function lastCompletedPeriod() public view override returns (uint256) {
        if (block.timestamp <= _startDate) return 0; // Schedule hasn't started or is exactly at start time, no periods
            // completed.

        // If current time is at or after the schedule's end date, all periods are completed.
        if (block.timestamp >= _endDate) {
            return _periodEndTimestamps.length;
        }

        // Calculate how many full intervals have passed since the start date.
        uint256 elapsedTime = block.timestamp - _startDate;
        uint256 completeIntervals = elapsedTime / _interval;

        // The number of completed periods cannot exceed the total number of periods in the schedule.
        // This check is mostly redundant if block.timestamp < _endDate check is done above, but kept for safety.
        return completeIntervals < _periodEndTimestamps.length ? completeIntervals : _periodEndTimestamps.length;
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function timeUntilNextPeriod() public view override returns (uint256) {
        // If the schedule hasn't started yet, return time until the start date.
        if (block.timestamp < _startDate) {
            return _startDate - block.timestamp;
        }

        // If the schedule has already ended, there's no next period.
        if (block.timestamp >= _endDate) {
            return 0;
        }

        // Calculate elapsed time since the schedule started.
        // block.timestamp is not used for randomness here but for time calculation
        uint256 elapsedTime = block.timestamp - _startDate;
        // Calculate how much time has passed within the current interval.
        // slither-disable-next-line weak-prng
        uint256 currentPeriodElapsed = elapsedTime % _interval;
        // Time until next period is the total interval duration minus the elapsed time in the current interval.
        return _interval - currentPeriodElapsed;
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function lastClaimedPeriod(address holder) public view override returns (uint256) {
        return _lastClaimedPeriod[holder];
    }

    /// @notice Returns the last claimed period for the message sender (`_msgSender()`).
    /// @dev Convenience function so callers don't have to pass their own address.
    /// @return The last period number (1-indexed) claimed by the caller.
    function lastClaimedPeriod() public view returns (uint256) {
        return lastClaimedPeriod(_msgSender());
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    /// @dev This calculation can be gas-intensive as it iterates through all completed periods and queries historical
    /// total supply for each.
    /// It assumes `_token.yieldBasisPerUnit(address(0))` provides a generic or representative basis if it varies by
    /// holder.
    function totalUnclaimedYield() public view override returns (uint256) {
        uint256 lastPeriod = lastCompletedPeriod(); // Get the latest fully completed period.
        if (lastPeriod < 1) return 0; // No periods completed, so no unclaimed yield.

        uint256 totalYieldAccrued = 0;
        // For calculating total system-wide unclaimed yield, a generic basis is typically used.
        // Here, address(0) is passed, assuming the token implements a default or global basis, or this is a convention.
        uint256 basis = _token.yieldBasisPerUnit(address(0));

        // Iterate through each completed period to calculate the yield that should have been generated in that period.
        for (uint256 period = 1; period <= lastPeriod; ++period) {
            uint256 periodEndTimestamp = _periodEndTimestamps[period - 1]; // Get end time of the current iterated
                // period.
            // Fetch the total supply of the token as it was at the end of this specific period.
            // This is crucial for accuracy if the total supply changes over time.
            uint256 historicalTotalSupply = _token.totalSupplyAt(periodEndTimestamp);
            if (historicalTotalSupply > 0) {
                // Calculate yield for this period: (Supply * Basis per Token * Rate) / Denominator
                totalYieldAccrued += (historicalTotalSupply * basis * _rate) / RATE_BASIS_POINTS;
            }
        }

        // The total unclaimed yield is the total accrued minus what has already been claimed by all users.
        // Ensure no underflow if `_totalClaimed` were to somehow exceed `totalYieldAccrued` (should not happen in
        // normal operation).
        if (totalYieldAccrued <= _totalClaimed) {
            return 0;
        }
        return totalYieldAccrued - _totalClaimed;
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    /// @dev This calculation uses the current total supply. For a more precise estimate if supply changes rapidly,
    /// one might need a more complex projection. Assumes a generic basis from `_token.yieldBasisPerUnit(address(0))`.
    function totalYieldForNextPeriod() public view override returns (uint256) {
        if (block.timestamp >= _endDate) return 0; // Schedule ended, no next period.

        // Get the current total supply of the associated token.
        uint256 totalSupply = IERC20(address(_token)).totalSupply();
        // Get the yield basis per unit (using address(0) for a general/global basis).
        uint256 basis = _token.yieldBasisPerUnit(address(0));

        // Calculate yield for one full period based on current supply and rate.
        return (totalSupply * basis * _rate) / RATE_BASIS_POINTS;
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    /// @dev Calculates yield for completed, unclaimed periods using historical balances (`balanceOfAt`).
    /// For the current, ongoing period, it calculates a pro-rata share based on the holder's current balance and time
    /// elapsed in the period.
    function calculateAccruedYield(address holder) public view override returns (uint256) {
        uint256 currentPeriod_ = currentPeriod(); // Determine the current period number.
        if (currentPeriod_ < 1 && block.timestamp < _startDate) revert ISMARTFixedYieldSchedule.ScheduleNotActive(); // If
            // before start date and
            // not even in period 0 (edge case for exactly startDate)

        // Get the holder-specific yield basis.
        uint256 basis = _token.yieldBasisPerUnit(holder);
        // Determine the first period for which yield needs to be calculated (last claimed + 1).
        uint256 fromPeriod = _lastClaimedPeriod[holder] + 1;
        // Get the latest fully completed period.
        uint256 lastCompleted = lastCompletedPeriod();

        uint256 completePeriodAmount = 0;
        // Calculate yield for all fully completed periods that haven't been claimed by this holder.
        if (fromPeriod <= lastCompleted) {
            // Check if there are any completed periods to sum up.
            for (uint256 period = fromPeriod; period <= lastCompleted; ++period) {
                // Fetch the holder's balance as it was at the end of that specific period.
                uint256 balance = _token.balanceOfAt(holder, _periodEndTimestamps[period - 1]);
                if (balance > 0) {
                    completePeriodAmount += (balance * basis * _rate) / RATE_BASIS_POINTS;
                }
            }
        }

        uint256 currentPeriodAmount = 0;
        // If the schedule is currently active and there's an ongoing period that isn't yet completed.
        if (currentPeriod_ > 0 && block.timestamp < _endDate) {
            // Get the holder's current token balance for pro-rata calculation.
            uint256 tokenBalance = IERC20(address(_token)).balanceOf(holder);
            if (tokenBalance > 0) {
                // Determine the start time of the current, ongoing period.
                uint256 periodStart;
                if (currentPeriod_ == 1) {
                    periodStart = _startDate;
                } else {
                    // Start of current period is end of previous period. (Note: _periodEndTimestamps is 0-indexed for
                    // period-1)
                    periodStart = _periodEndTimestamps[currentPeriod_ - 2]; // -2 because currentPeriod_ is 1-indexed
                }
                // Time elapsed within the current, ongoing period.
                uint256 timeInPeriod = block.timestamp - periodStart;

                // Pro-rata yield for the current period: (Balance * Basis * Rate * TimeInPeriod) / (TotalIntervalTime *
                // Denominator)
                currentPeriodAmount = (tokenBalance * basis * _rate * timeInPeriod) / (_interval * RATE_BASIS_POINTS);
            }
        }
        return completePeriodAmount + currentPeriodAmount;
    }

    /// @notice Calculates the total accrued yield for the message sender (`_msgSender()`), including any pro-rata share
    /// for the current period.
    /// @dev Convenience function so callers don't have to pass their own address.
    /// @return The total accrued yield amount for the caller.
    function calculateAccruedYield() external view returns (uint256) {
        return calculateAccruedYield(_msgSender());
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    /// @dev Uses `nonReentrant` modifier to prevent reentrancy attacks.
    /// Claims yield only for fully completed periods. Pro-rata for current period is not claimable here (typically
    /// claimed after period completion or via `calculateAccruedYield` for view).
    function claimYield() external override nonReentrant whenNotPaused {
        uint256 lastPeriod = lastCompletedPeriod(); // Last period fully completed.
        if (lastPeriod < 1) revert ISMARTFixedYieldSchedule.NoYieldAvailable(); // No completed periods.

        address sender = _msgSender(); // Cache sender.
        uint256 fromPeriod = _lastClaimedPeriod[sender] + 1; // First period to claim for this user.
        if (fromPeriod > lastPeriod) revert ISMARTFixedYieldSchedule.NoYieldAvailable(); // All completed periods
            // already claimed.

        // aderyn-fp-next-line(reentrancy-state-change)
        uint256 basis = _token.yieldBasisPerUnit(sender); // Holder-specific basis.
        uint256 totalAmountToClaim = 0;

        // Array to store yield amounts for each period being claimed. Useful for event emission.
        uint256[] memory periodAmounts = new uint256[](lastPeriod - fromPeriod + 1);

        // Calculate yield for each unclaimed, completed period.
        for (uint256 period = fromPeriod; period <= lastPeriod; ++period) {
            // Fetch holder's balance at the end of the specific period.
            // aderyn-fp-next-line(reentrancy-state-change)
            uint256 balance = _token.balanceOfAt(sender, _periodEndTimestamps[period - 1]);
            if (balance > 0) {
                uint256 periodYield = (balance * basis * _rate) / RATE_BASIS_POINTS;
                totalAmountToClaim += periodYield;
                periodAmounts[period - fromPeriod] = periodYield; // Store amount for this specific period.
            }
            // If balance is 0 for a period, its corresponding entry in periodAmounts remains 0.
        }

        if (totalAmountToClaim <= 0) revert ISMARTFixedYieldSchedule.NoYieldAvailable(); // No yield accrued in the
            // claimable periods.

        // State updates *before* external call (transfer).
        _lastClaimedPeriod[sender] = lastPeriod; // Update the last period claimed by the user.
        _totalClaimed += totalAmountToClaim; // Increment total yield claimed in the contract.

        // Perform the transfer of the underlying asset to the claimant.
        _underlyingAsset.safeTransfer(sender, totalAmountToClaim);

        // Calculate the remaining total unclaimed yield in the contract for the event.
        uint256 remainingUnclaimed = totalUnclaimedYield();

        // Calculate the for the next period for the event.
        uint256 yieldForNextPeriod = totalYieldForNextPeriod();

        emit YieldClaimed(
            sender, totalAmountToClaim, fromPeriod, lastPeriod, periodAmounts, remainingUnclaimed, yieldForNextPeriod
        );
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    /// @dev The caller (`_msgSender()`) must have pre-approved this contract to spend at least `amount` of their
    /// `_underlyingAsset` tokens.
    function topUpUnderlyingAsset(uint256 amount) external override nonReentrant whenNotPaused {
        // Transfer `_underlyingAsset` from the caller to this contract.
        _underlyingAsset.safeTransferFrom(_msgSender(), address(this), amount);

        emit UnderlyingAssetTopUp(_msgSender(), amount);
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    /// @dev Requires `DEFAULT_ADMIN_ROLE` for the caller.
    function withdrawUnderlyingAsset(
        address to,
        uint256 amount
    )
        external
        override
        nonReentrant
        onlyRole(DEFAULT_ADMIN_ROLE)
        whenNotPaused
    {
        if (to == address(0)) revert ISMARTFixedYieldSchedule.InvalidUnderlyingAsset(); // Cannot withdraw to zero
            // address.
        if (amount == 0) revert ISMARTFixedYieldSchedule.InvalidAmount(); // Cannot withdraw zero amount.

        uint256 balance = _underlyingAsset.balanceOf(address(this));
        if (amount > balance) revert ISMARTFixedYieldSchedule.InsufficientUnderlyingBalance(); // Not enough funds in
            // contract.

        _underlyingAsset.safeTransfer(to, amount);

        emit UnderlyingAssetWithdrawn(to, amount);
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    /// @dev Requires `DEFAULT_ADMIN_ROLE` for the caller.
    function withdrawAllUnderlyingAsset(address to)
        external
        override
        nonReentrant
        onlyRole(DEFAULT_ADMIN_ROLE)
        whenNotPaused
    {
        if (to == address(0)) revert ISMARTFixedYieldSchedule.InvalidUnderlyingAsset(); // Cannot withdraw to zero
            // address.

        uint256 balance = _underlyingAsset.balanceOf(address(this));
        if (balance <= 0) revert ISMARTFixedYieldSchedule.InsufficientUnderlyingBalance(); // No funds to withdraw.

        _underlyingAsset.safeTransfer(to, balance);

        emit UnderlyingAssetWithdrawn(to, balance);
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function token() external view override returns (ISMARTYield) {
        return _token;
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function underlyingAsset() external view override returns (IERC20) {
        return _underlyingAsset;
    }

    /// @notice Returns the Unix timestamp (seconds since epoch) when the yield schedule starts.
    /// @dev This is an immutable value set in the constructor. It defines the beginning of the yield accrual period.
    /// This function fulfills the `startDate()` requirement from the `ISMARTFixedYieldSchedule` interface (which itself
    /// inherits it from `ISMARTYieldSchedule`).
    function startDate() external view override returns (uint256) {
        return _startDate;
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function endDate() external view override returns (uint256) {
        return _endDate;
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function rate() external view override returns (uint256) {
        return _rate;
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function interval() external view override returns (uint256) {
        return _interval;
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    /// @dev Requires `DEFAULT_ADMIN_ROLE` for the caller.
    function pause() external override onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause(); // Internal OpenZeppelin Pausable function.
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    /// @dev Requires `DEFAULT_ADMIN_ROLE` for the caller.
    function unpause() external override onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause(); // Internal OpenZeppelin Pausable function.
    }
}
