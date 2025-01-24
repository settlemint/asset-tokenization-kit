// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC20Yield } from "./extensions/ERC20Yield.sol";

/// @title FixedYield - A contract for managing token yield distributions
/// @notice This contract implements fixed yield schedule functionality for ERC20 tokens
/// @dev Uses AccessControl for permissions and works with ERC20Yield tokens
/// @custom:security-contact support@settlemint.com
contract FixedYield is AccessControl {
    /// @notice Custom errors for the FixedYield contract
    error InvalidToken();
    error InvalidStartDate();
    error InvalidEndDate();
    error InvalidRate();
    error InvalidInterval();
    error NoYieldAvailable();
    error YieldDistributionFailed();
    error ScheduleNotActive();
    error ScheduleExpired();
    error TokenNotYieldEnabled();
    error InsufficientUnderlyingBalance();
    error InvalidUnderlyingAsset();
    error PeriodAlreadyClaimed();
    error InvalidAmount();

    bytes32 public constant YIELD_MANAGER_ROLE = keccak256("YIELD_MANAGER_ROLE");

    /// @notice The token this schedule is for
    ERC20Yield private immutable _token;

    /// @notice The underlying asset used for yield payments
    IERC20 private immutable _underlyingAsset;

    /// @notice The start date of the yield schedule
    uint256 private immutable _startDate;

    /// @notice The end date of the yield schedule
    uint256 private immutable _endDate;

    /// @notice The yield rate in basis points
    /// @dev 1 basis point = 0.01%
    ///      100 basis points = 1%
    ///      1000 basis points = 10%
    ///      10000 basis points = 100%
    uint256 private immutable _rate;

    /// @notice The interval between distributions in seconds
    uint256 private immutable _interval;

    /// @notice Mapping of holder address to last claimed period
    mapping(address => uint256) private _lastClaimedPeriod;

    /// @notice Event emitted when a yield payment is distributed
    /// @param token The token address this yield is for
    /// @param holder The address receiving the yield
    /// @param amount The amount of yield distributed
    /// @param period The period number that was claimed
    event YieldDistributed(address indexed token, address indexed holder, uint256 amount, uint256 period);

    /// @notice Event emitted when underlying assets are topped up
    event UnderlyingAssetTopUp(address indexed from, uint256 amount);

    /// @notice Event emitted when underlying assets are withdrawn by admin
    event UnderlyingAssetWithdrawn(address indexed to, uint256 amount);

    /// @notice Deploys a new FixedYield contract
    /// @param tokenAddress The address of the token this schedule is for
    /// @param initialOwner The address that will receive admin rights
    /// @param startDate_ The timestamp when the schedule starts
    /// @param endDate_ The timestamp when the schedule ends
    /// @param rate_ The yield rate in basis points (1 basis point = 0.01%, e.g., 500 = 5%)
    /// @param interval_ The interval between distributions in seconds
    constructor(
        address tokenAddress,
        address initialOwner,
        uint256 startDate_,
        uint256 endDate_,
        uint256 rate_,
        uint256 interval_
    ) {
        if (tokenAddress == address(0)) revert InvalidToken();
        if (startDate_ <= block.timestamp) revert InvalidStartDate();
        if (endDate_ <= startDate_) revert InvalidEndDate();
        if (rate_ == 0) revert InvalidRate();
        if (interval_ == 0) revert InvalidInterval();

        _token = ERC20Yield(tokenAddress);
        _underlyingAsset = _token.yieldToken();
        if (address(_underlyingAsset) == address(0)) revert InvalidUnderlyingAsset();

        _startDate = startDate_;
        _endDate = endDate_;
        _rate = rate_;
        _interval = interval_;

        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(YIELD_MANAGER_ROLE, initialOwner);
    }

    /// @notice Returns the current ongoing period number
    /// @return The current period number (0 if schedule hasn't started)
    function currentPeriod() public view returns (uint256) {
        if (block.timestamp < _startDate) return 0;
        return ((block.timestamp - _startDate) / _interval) + 1;
    }

    /// @notice Returns the last completed period number that can be claimed
    /// @return The last completed period number (0 if no periods completed)
    function lastCompletedPeriod() public view returns (uint256) {
        if (block.timestamp <= _startDate) return 0;

        // Calculate how many complete intervals have passed
        uint256 elapsedTime = block.timestamp - _startDate;
        uint256 completeIntervals = elapsedTime / _interval;

        // If we're exactly at an interval boundary, we need to subtract 1
        // because the current period is just starting
        if (elapsedTime % _interval == 0) {
            return completeIntervals;
        }

        return completeIntervals;
    }

    /// @notice Returns time until next period starts in seconds
    /// @return Time remaining in current period
    function timeUntilNextPeriod() public view returns (uint256) {
        if (block.timestamp < _startDate) {
            return _startDate - block.timestamp;
        }

        uint256 elapsedTime = block.timestamp - _startDate;
        uint256 currentPeriodElapsed = elapsedTime % _interval;
        return _interval - currentPeriodElapsed;
    }

    /// @notice Returns the last claimed period for a holder
    /// @param holder The address to check
    /// @return The last period number claimed by the holder
    function lastClaimedPeriod(address holder) public view returns (uint256) {
        return _lastClaimedPeriod[holder];
    }

    /// @notice Returns the last claimed period for the caller
    /// @return The last period number claimed by the caller
    function lastClaimedPeriod() public view returns (uint256) {
        return lastClaimedPeriod(msg.sender);
    }

    /// @notice Calculates the total unclaimed yield for a holder across completed periods
    /// @param holder The address to calculate yield for
    /// @return totalAmount The total amount of yield available
    /// @return fromPeriod The first period included in calculation
    /// @return toPeriod The last period included in calculation
    function calculateUnclaimedYield(address holder)
        public
        view
        returns (uint256 totalAmount, uint256 fromPeriod, uint256 toPeriod)
    {
        toPeriod = lastCompletedPeriod();
        if (toPeriod == 0) revert ScheduleNotActive();
        if (block.timestamp > _endDate) revert ScheduleExpired();

        fromPeriod = _lastClaimedPeriod[holder] + 1;
        if (fromPeriod > toPeriod) revert NoYieldAvailable();

        uint256 basis = _token.yieldBasis(holder);
        if (basis == 0) revert NoYieldAvailable();

        // Calculate yield for all unclaimed completed periods
        uint256 periodCount = toPeriod - fromPeriod + 1;
        totalAmount = (basis * _rate * periodCount) / 10_000;
    }

    /// @notice Calculates the total accrued yield including pro-rated current period
    /// @param holder The address to calculate yield for
    /// @return completePeriodAmount The amount of yield from complete unclaimed periods
    /// @return currentPeriodAmount The pro-rated amount from the current period
    /// @return progressPercentage The percentage of the current period that has elapsed (0-100)
    /// @return fromPeriod The first period included in calculation
    /// @return currentPeriod_ The current ongoing period number
    function calculateAccruedYield(address holder)
        public
        view
        returns (
            uint256 completePeriodAmount,
            uint256 currentPeriodAmount,
            uint256 progressPercentage,
            uint256 fromPeriod,
            uint256 currentPeriod_
        )
    {
        currentPeriod_ = currentPeriod();
        if (currentPeriod_ == 0) revert ScheduleNotActive();
        if (block.timestamp > _endDate) revert ScheduleExpired();

        uint256 basis = _token.yieldBasis(holder);
        if (basis == 0) revert NoYieldAvailable();

        fromPeriod = _lastClaimedPeriod[holder] + 1;
        uint256 lastCompleted = lastCompletedPeriod();

        // Calculate yield for complete unclaimed periods
        if (fromPeriod <= lastCompleted) {
            uint256 completePeriods = lastCompleted - fromPeriod + 1;
            completePeriodAmount = (basis * _rate * completePeriods) / 10_000;
        }

        // Calculate pro-rated yield for current period
        uint256 periodStart = _startDate + ((currentPeriod_ - 1) * _interval);
        uint256 timeInPeriod = block.timestamp - periodStart;
        progressPercentage = (timeInPeriod * 100) / _interval;
        currentPeriodAmount = (basis * _rate * timeInPeriod) / (_interval * 10_000);
    }

    /// @notice Claims all available yield for the caller
    function claimYield() external {
        (uint256 amount, uint256 fromPeriod, uint256 toPeriod) = calculateUnclaimedYield(msg.sender);

        // Check if we have enough underlying assets
        if (_underlyingAsset.balanceOf(address(this)) < amount) {
            revert InsufficientUnderlyingBalance();
        }

        // Update the last claimed period before transfer to prevent reentrancy
        _lastClaimedPeriod[msg.sender] = toPeriod;

        // Transfer the yield in underlying asset to the holder
        bool success = _underlyingAsset.transfer(msg.sender, amount);
        if (!success) revert YieldDistributionFailed();

        emit YieldDistributed(address(_token), msg.sender, amount, toPeriod);
    }

    /// @notice Allows topping up the contract with underlying assets for yield payments
    /// @param amount The amount of underlying assets to add
    function topUpUnderlyingAsset(uint256 amount) external {
        bool success = _underlyingAsset.transferFrom(msg.sender, address(this), amount);
        if (!success) revert InsufficientUnderlyingBalance();

        emit UnderlyingAssetTopUp(msg.sender, amount);
    }

    /// @notice Withdraws underlying assets
    /// @dev Only callable by admin
    /// @param to The address to send the underlying assets to
    /// @param amount The amount of underlying assets to withdraw
    function withdrawUnderlyingAsset(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (to == address(0)) revert InvalidUnderlyingAsset();
        if (amount == 0) revert InvalidAmount();

        uint256 balance = _underlyingAsset.balanceOf(address(this));
        if (amount > balance) revert InsufficientUnderlyingBalance();

        bool success = _underlyingAsset.transfer(to, amount);
        if (!success) revert InsufficientUnderlyingBalance();

        emit UnderlyingAssetWithdrawn(to, amount);
    }

    /// @notice Withdraws all underlying assets
    /// @dev Only callable by admin
    /// @param to The address to send the underlying assets to
    function withdrawAllUnderlyingAsset(address to) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (to == address(0)) revert InvalidUnderlyingAsset();

        uint256 balance = _underlyingAsset.balanceOf(address(this));
        if (balance == 0) revert InsufficientUnderlyingBalance();

        bool success = _underlyingAsset.transfer(to, balance);
        if (!success) revert InsufficientUnderlyingBalance();

        emit UnderlyingAssetWithdrawn(to, balance);
    }

    /// @notice Returns the token this schedule is for
    /// @return The ERC20 token address
    function token() external view returns (ERC20Yield) {
        return _token;
    }

    /// @notice Returns the underlying asset used for yield payments
    /// @return The underlying asset token address
    function underlyingAsset() external view returns (IERC20) {
        return _underlyingAsset;
    }

    /// @notice Returns the start date of the yield schedule
    /// @return The timestamp when the schedule starts
    function startDate() external view returns (uint256) {
        return _startDate;
    }

    /// @notice Returns the end date of the yield schedule
    /// @return The timestamp when the schedule ends
    function endDate() external view returns (uint256) {
        return _endDate;
    }

    /// @notice Returns the yield rate
    /// @return The yield rate in basis points (1 basis point = 0.01%)
    function rate() external view returns (uint256) {
        return _rate;
    }

    /// @notice Returns the distribution interval
    /// @return The interval between distributions in seconds
    function interval() external view returns (uint256) {
        return _interval;
    }
}
