// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";

import { ISMARTFixedYieldSchedule } from "../ISMARTFixedYieldSchedule.sol";
import { ISMARTYield } from "../../../ISMARTYield.sol";

/// @title SMART Fixed Yield Schedule Contract
/// @author SettleMint
/// @notice This contract implements a fixed yield schedule for an associated SMART token (which must implement
/// `ISMARTYield`).
/// It allows token holders to accrue yield at a predetermined fixed `rate` over specified `interval`s between a
/// `startDate` and `endDate`.
/// Yield is paid out in an `denominationAsset` (which can be the token itself or another ERC20 token).
/// @dev This contract manages the entire lifecycle of a fixed yield distribution:
/// - **Configuration**: `startDate`, `endDate`, `rate`, `interval`, and the `token` it serves.
/// - **Period Management**: Calculates and uses period end timestamps for yield accrual.
/// - **Yield Calculation**: Leverages `balanceOfAt` and `yieldBasisPerUnit` from the `ISMARTYield` token to determine
/// yield per period for each holder.
/// - **Claiming**: Token holders can call `claimYield()` to receive their accrued yield.
/// - **Funding**: The contract can be topped up with the `denominationAsset` via `topUpDenominationAsset()` to ensure
/// payouts can be made.
/// - **Administration**: Includes `AccessControl` for owner-restricted functions like `withdrawDenominationAsset` and
/// `pause()`/`unpause()`.
/// - **Meta-transactions**: Inherits `ERC2771Context` to support gasless transactions if a trusted forwarder is
/// configured.
/// - **Security**: Uses `ReentrancyGuard` to protect against reentrancy attacks on state-changing functions like
/// `claimYield`.
/// It implements the `ISMARTFixedYieldSchedule` interface.
/// @custom:security-contact support@settlemint.com Ensure to review security practices for deploying and managing this
/// contract.
abstract contract SMARTFixedYieldScheduleLogic is ISMARTFixedYieldSchedule {
    using SafeERC20 for IERC20;

    /// --- Abstract Functions ---
    /// @notice Returns the address of the message sender
    /// @return The address of the message sender
    function _msgSender() internal view virtual returns (address);

    /// --- State Variables ---

    // aderyn-fp-next-line(large-numeric-literal)
    /// @notice The denominator used for rate calculations (10,000 basis points = 100%)
    /// @dev `10_000` represents 100% (since rate is in basis points). For example, a `_rate` of 500 means 500 / 10,000
    /// = 0.05 or 5%.
    uint256 public constant RATE_BASIS_POINTS = 10_000;

    /// @notice The SMART token contract (implementing `ISMARTYield`) for which this schedule distributes yield.
    /// @dev This is immutable, meaning it's set in the constructor and cannot be changed later.
    /// The schedule contract will call functions on this token (e.g., `balanceOfAt`, `yieldBasisPerUnit`).
    ISMARTYield private _token;

    /// @notice The ERC20 token used for making yield payments.
    /// @dev This is also immutable and is determined by calling `_token.yieldToken()` in the constructor.
    /// This is the token that will be transferred to holders when they claim yield.
    IERC20 private _denominationAsset;

    /// @notice The Unix timestamp (seconds since epoch) when the yield schedule starts.
    /// @dev Immutable. Yield calculations and distributions begin from this point.
    uint256 private _startDate;

    /// @notice The Unix timestamp when the yield schedule ends.
    /// @dev Immutable. No yield will accrue or be distributed by this schedule after this time.
    uint256 private _endDate;

    /// @notice The yield rate in basis points (1 basis point = 0.01%).
    /// @dev Immutable. For example, a rate of 500 means 5% yield per `_interval` based on `_token.yieldBasisPerUnit()`.
    uint256 private _rate;

    /// @notice The duration of each yield distribution interval in seconds (e.g., 86400 for daily).
    /// @dev Immutable. This defines the frequency of yield periods.
    uint256 private _interval;

    /// @notice An array storing the Unix timestamps for the end of each yield distribution period.
    /// @dev This is calculated and cached in the constructor or initializer to save gas on repeated period lookups.
    /// `_periodEndTimestamps[0]` is the end of period 1, `_periodEndTimestamps[i]` is end of period `i+1`.
    uint256[] private _periodEndTimestamps;

    /// @notice Maps a token holder's address to the last period number (1-indexed) for which they have successfully
    /// claimed yield.
    /// @dev If a holder has address `A` and `_lastClaimedPeriod[A]` is `X`, they have claimed up to and including
    /// period `X`.
    /// Defaults to 0 if no claims have been made.
    mapping(address holder => uint256 lastClaimedPeriod) private _lastClaimedPeriod;

    /// @notice The total cumulative amount of `_denominationAsset` that has been successfully claimed by all token
    /// holders.
    /// @dev This helps in tracking the overall distribution progress and can be used with `totalUnclaimedYield`.
    uint256 private _totalClaimed;

    /// @notice Cached decimals of the yield token to avoid repeated external calls.
    /// @dev Set once during initialization to optimize gas usage in yield calculations.
    uint8 private _tokenDecimals;

    /// @notice Internal function to initialize all mutable state and configuration
    /// @dev Internal function to initialize all mutable state and configuration.
    /// @param tokenAddress_ Address of the `ISMARTYield` token.
    /// @param startDate_ Start date of the yield schedule.
    /// @param endDate_ End date of the yield schedule.
    /// @param rate_ Yield rate in basis points.
    /// @param interval_ Duration of each yield interval.
    function __SMARTFixedYieldSchedule_init_unchained(
        address tokenAddress_,
        uint256 startDate_,
        uint256 endDate_,
        uint256 rate_,
        uint256 interval_
    )
        internal
        virtual
    {
        // Input validations for configuration parameters
        if (tokenAddress_ == address(0)) revert InvalidToken();
        // For new schedules, start date must generally be in the future.
        // If this logic is used for re-initializing/modifying an existing schedule, this check might need adjustment.
        if ((startDate_ < block.timestamp || startDate_ == block.timestamp) && (_startDate == 0)) {
            // Only check if not already set (e.g. during a modification)
            revert InvalidStartDate();
        }
        if (endDate_ < startDate_ || endDate_ == startDate_) revert InvalidEndDate();
        if (rate_ == 0) revert InvalidRate();
        if (interval_ == 0) revert InvalidInterval();

        // Set configuration state variables
        _token = ISMARTYield(tokenAddress_);
        _denominationAsset = _token.yieldToken(); // Derive denomination asset
        if (address(_denominationAsset) == address(0)) revert InvalidDenominationAsset();

        _startDate = startDate_;
        _endDate = endDate_;
        _rate = rate_;
        _interval = interval_;
        _tokenDecimals = IERC20Metadata(tokenAddress_).decimals();

        // Calculate and cache all period end timestamps.
        // use ceil division to avoid an extra period when aligned
        uint256 totalPeriods = Math.ceilDiv(_endDate - _startDate, _interval);

        _periodEndTimestamps = new uint256[](totalPeriods);
        for (uint256 i = 0; i < totalPeriods; ++i) {
            uint256 timestamp = _startDate + ((i + 1) * _interval);
            if (timestamp > _endDate) {
                timestamp = _endDate;
            }
            _periodEndTimestamps[i] = timestamp;
        }

        emit FixedYieldScheduleSet(startDate_, endDate_, rate_, interval_, _periodEndTimestamps, _denominationAsset);
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function allPeriods() public view override returns (uint256[] memory) {
        return _periodEndTimestamps;
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    /// @dev Periods are 1-indexed. Accessing `_periodEndTimestamps` requires 0-indexed access (`period - 1`).
    function periodEnd(uint256 period) public view override returns (uint256) {
        // Validate that the requested period number is within the valid range.
        if (period == 0 || period > _periodEndTimestamps.length) revert InvalidPeriod();
        return _periodEndTimestamps[period - 1]; // Adjust to 0-based index for array access.
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function currentPeriod() public view override returns (uint256) {
        if (block.timestamp < _startDate) return 0; // Schedule hasn't started.
        if (block.timestamp > _endDate || block.timestamp == _endDate) return _periodEndTimestamps.length; // Schedule
            // has ended, return total number
            // of periods.
        // Calculate current period number (1-indexed).
        return ((block.timestamp - _startDate) / _interval) + 1;
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function lastCompletedPeriod() public view override returns (uint256) {
        if (block.timestamp < _startDate || block.timestamp == _startDate) return 0; // Schedule hasn't started or is
            // exactly at start time, no periods
            // completed.

        // If current time is at or after the schedule's end date, all periods are completed.
        if (block.timestamp > _endDate || block.timestamp == _endDate) {
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
        if (block.timestamp > _endDate || block.timestamp == _endDate) {
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

        // Iterate through each completed period to calculate the yield that should have been generated in that period.
        uint256 globalBasis = _token.yieldBasisPerUnit(address(0));
        for (uint256 period = 1; period < lastPeriod || period == lastPeriod; ++period) {
            uint256 periodEndTimestamp = _periodEndTimestamps[period - 1]; // Get end time of the current iterated
                // period.
            // Fetch the total supply of the token as it was at the end of this specific period.
            // This is crucial for accuracy if the total supply changes over time.
            uint256 historicalTotalSupply = _token.totalSupplyAt(periodEndTimestamp);
            if (historicalTotalSupply > 0) {
                totalYieldAccrued += _calculateYieldFromAmount(historicalTotalSupply, globalBasis);
            }
        }

        // The total unclaimed yield is the total accrued minus what has already been claimed by all users.
        // Ensure no underflow if `_totalClaimed` were to somehow exceed `totalYieldAccrued` (should not happen in
        // normal operation).
        if (totalYieldAccrued < _totalClaimed || totalYieldAccrued == _totalClaimed) {
            return 0;
        }
        return totalYieldAccrued - _totalClaimed;
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    /// @dev This calculation uses the current total supply. For a more precise estimate if supply changes rapidly,
    /// one might need a more complex projection. Assumes a generic basis from `_token.yieldBasisPerUnit(address(0))`.
    function estimateTotalYieldPerPeriod() public view override returns (uint256) {
        if (block.timestamp > _endDate || block.timestamp == _endDate) return 0; // Schedule ended, no current period.

        // Get the current total supply of the associated token.
        uint256 totalSupply = IERC20(address(_token)).totalSupply();

        // Calculate yield for one full period based on current supply and rate.
        uint256 globalBasis = _token.yieldBasisPerUnit(address(0));
        return _calculateYieldFromAmount(totalSupply, globalBasis);
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    /// @dev Calculates yield for completed, unclaimed periods using historical balances (`balanceOfAt`).
    /// For the current, ongoing period, it calculates a pro-rata share based on the holder's current balance and time
    /// elapsed in the period.
    function calculateAccruedYield(address holder) public view override returns (uint256) {
        uint256 currentPeriod_ = currentPeriod(); // Determine the current period number.
        if (currentPeriod_ < 1 && block.timestamp < _startDate) revert ScheduleNotActive(); // If
            // before start date and
            // not even in period 0 (edge case for exactly startDate)

        // Determine the first period for which yield needs to be calculated (last claimed + 1).
        uint256 fromPeriod = _lastClaimedPeriod[holder] + 1;
        // Get the latest fully completed period.
        uint256 lastCompleted = lastCompletedPeriod();

        uint256 completePeriodAmount = 0;
        // Calculate yield for all fully completed periods that haven't been claimed by this holder.
        if (fromPeriod < lastCompleted || fromPeriod == lastCompleted) {
            // Check if there are any completed periods to sum up.
            uint256 holderBasis = _token.yieldBasisPerUnit(holder);
            for (uint256 period = fromPeriod; period < lastCompleted || period == lastCompleted; ++period) {
                // Fetch the holder's balance as it was at the end of that specific period.
                uint256 balance = _token.balanceOfAt(holder, _periodEndTimestamps[period - 1]);
                if (balance > 0) {
                    completePeriodAmount += _calculateYieldFromAmount(balance, holderBasis);
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

                // Pro-rata yield for the current period: (Balance * TimeInPeriod) / (TotalIntervalTime)
                uint256 holderBasis = _token.yieldBasisPerUnit(holder);
                // Use mulDiv for precise calculation of pro-rated token amount
                uint256 proRatedTokenAmount = Math.mulDiv(tokenBalance, timeInPeriod, _interval);
                currentPeriodAmount = _calculateYieldFromAmount(proRatedTokenAmount, holderBasis);
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

    /// @notice Internal implementation of yield claiming logic
    /// @dev Implementation of `claimYield` from `ISMARTFixedYieldSchedule`.
    function _claimYield() internal {
        uint256 lastPeriod = lastCompletedPeriod(); // Last period fully completed.
        if (lastPeriod < 1) revert NoYieldAvailable(); // No completed periods.

        address sender = _msgSender(); // Cache sender.
        uint256 fromPeriod = _lastClaimedPeriod[sender] + 1; // First period to claim for this user.
        if (fromPeriod > lastPeriod) revert NoYieldAvailable(); // All completed periods
            // already claimed.

        uint256 totalAmountToClaim = 0;

        // Array to store yield amounts for each period being claimed. Useful for event emission.
        uint256[] memory periodAmounts = new uint256[](lastPeriod - fromPeriod + 1);
        uint256[] memory periodYields = new uint256[](lastPeriod - fromPeriod + 1);

        // Calculate yield for each unclaimed, completed period.
        uint256 senderBasis = _token.yieldBasisPerUnit(sender);
        uint256 globalBasis = _token.yieldBasisPerUnit(address(0));
        for (uint256 period = fromPeriod; period < lastPeriod || period == lastPeriod; ++period) {
            // Fetch holder's balance at the end of the specific period.
            // aderyn-fp-next-line(reentrancy-state-change)
            uint256 balance = _token.balanceOfAt(sender, _periodEndTimestamps[period - 1]);
            if (balance > 0) {
                uint256 periodYield = _calculateYieldFromAmount(balance, senderBasis);
                totalAmountToClaim += periodYield;
                periodAmounts[period - fromPeriod] = periodYield; // Store amount for this specific period.
            }
            // Fetch the total supply of the token as it was at the end of this specific period.
            // This is crucial for accuracy if the total supply changes over time.
            uint256 historicalTotalSupply = _token.totalSupplyAt(_periodEndTimestamps[period - 1]);
            if (historicalTotalSupply > 0) {
                uint256 totalPeriodYield = _calculateYieldFromAmount(historicalTotalSupply, globalBasis);
                periodYields[period - fromPeriod] = totalPeriodYield; // Store amount for this specific period.
            }
            // If balance is 0 for a period, its corresponding entry in periodAmounts remains 0.
        }

        if (totalAmountToClaim == 0) revert NoYieldAvailable(); // No yield accrued in the
            // claimable periods.
        // State updates *before* external call (transfer).
        _lastClaimedPeriod[sender] = lastPeriod; // Update the last period claimed by the user.
        _totalClaimed += totalAmountToClaim; // Increment total yield claimed in the contract.

        // Perform the transfer of the denomination asset to the claimant.
        _denominationAsset.safeTransfer(sender, totalAmountToClaim);

        // Calculate the required yield for a period for the event.
        uint256 totalYieldPerPeriod = estimateTotalYieldPerPeriod();

        emit YieldClaimed(
            sender, totalAmountToClaim, fromPeriod, lastPeriod, periodAmounts, periodYields, totalYieldPerPeriod
        );
    }

    /// @notice Implementation of `topUpDenominationAsset` from `ISMARTFixedYieldSchedule`
    /// @dev Internal function to handle topping up the denomination asset
    /// @param amount The amount of denomination asset to deposit
    function _topUpDenominationAsset(uint256 amount) internal {
        // Transfer `_denominationAsset` from the caller to this contract.
        _denominationAsset.safeTransferFrom(_msgSender(), address(this), amount);

        emit DenominationAssetTopUp(_msgSender(), amount);
    }

    /// @notice Implementation of `withdrawDenominationAsset` from `ISMARTFixedYieldSchedule`
    /// @dev Internal function to handle withdrawing denomination asset
    /// @param to The address to send the denomination asset to
    /// @param denominationAssetAmount The amount of denomination asset to withdraw
    function _withdrawDenominationAsset(address to, uint256 denominationAssetAmount) internal {
        if (to == address(0)) revert InvalidDenominationAsset(); // Cannot withdraw to zero
            // address.
        if (denominationAssetAmount == 0) revert InvalidAmount(); // Cannot withdraw zero amount.

        uint256 denominationAssetBalance = _denominationAsset.balanceOf(address(this));
        if (denominationAssetAmount > denominationAssetBalance) {
            revert InsufficientDenominationAssetBalance(denominationAssetBalance, denominationAssetAmount);
        } // Not enough funds in contract.

        _denominationAsset.safeTransfer(to, denominationAssetAmount);

        emit DenominationAssetWithdrawn(to, denominationAssetAmount);
    }

    /// @notice Implementation of `withdrawAllDenominationAsset` from `ISMARTFixedYieldSchedule`
    /// @dev Internal function to handle withdrawing all denomination asset
    /// @param to The address to send all denomination asset to
    function _withdrawAllDenominationAsset(address to) internal {
        if (to == address(0)) revert InvalidDenominationAsset(); // Cannot withdraw to zero
            // address.

        uint256 balance = _denominationAsset.balanceOf(address(this));
        if (balance == 0) revert NoDenominationAssetBalance(); // No funds to withdraw.

        _denominationAsset.safeTransfer(to, balance);

        emit DenominationAssetWithdrawn(to, balance);
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function token() external view override returns (ISMARTYield) {
        return _token;
    }

    /// @inheritdoc ISMARTFixedYieldSchedule
    function denominationAsset() external view override returns (IERC20) {
        return _denominationAsset;
    }

    /// @notice Converts token yield amount to denomination asset amount
    /// @param tokenAmount The amount in token units to convert
    /// @param basis The yield basis per unit for calculation
    /// @return The equivalent amount in denomination asset units
    function _calculateYieldFromAmount(uint256 tokenAmount, uint256 basis) private view returns (uint256) {
        uint256 tokenDecimals = _tokenDecimals;

        // Step 1: Convert token amount to denomination asset notional value
        // tokenAmount is in token base units, basis is denom base units per 1 whole token
        uint256 notionalInDenom = Math.mulDiv(
            tokenAmount, // token base units
            basis, // denom base units per 1 whole token
            10 ** uint256(tokenDecimals) // convert token base units to whole tokens
        );

        // Step 2: Calculate the yield amount based on the notional value
        uint256 yieldAmountInDenominationAsset = Math.mulDiv(
            notionalInDenom, // denom base units
            _rate,
            RATE_BASIS_POINTS
        );

        return yieldAmountInDenominationAsset;
    }

    /// @notice Returns the Unix timestamp (seconds since epoch) when the yield schedule starts.
    /// @dev This is an immutable value set in the constructor. It defines the beginning of the yield accrual period.
    /// This function fulfills the `startDate()` requirement from the `ISMARTFixedYieldSchedule` interface (which itself
    /// inherits it from `ISMARTYieldSchedule`).
    /// @return The Unix timestamp when the yield schedule starts.
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

    /// @notice Checks if this contract supports a given interface
    /// @dev Implementation of IERC165 interface detection
    /// @param interfaceId The interface identifier to check
    /// @return True if the interface is supported, false otherwise
    function supportsInterface(bytes4 interfaceId) public view virtual override(IERC165) returns (bool) {
        return interfaceId == type(ISMARTFixedYieldSchedule).interfaceId;
    }
}
