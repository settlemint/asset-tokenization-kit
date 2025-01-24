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

    bytes32 public constant YIELD_MANAGER_ROLE = keccak256("YIELD_MANAGER_ROLE");

    /// @notice The token this schedule is for
    IERC20 private immutable _token;

    /// @notice The start date of the yield schedule
    uint256 private immutable _startDate;

    /// @notice The end date of the yield schedule
    uint256 private immutable _endDate;

    /// @notice The yield rate in basis points
    uint256 private immutable _rate;

    /// @notice The interval between distributions in seconds
    uint256 private immutable _interval;

    /// @notice Mapping of holder address to their last distribution timestamp
    mapping(address => uint256) private _lastDistributions;

    /// @notice Event emitted when a yield payment is distributed
    /// @param token The token address this yield is for
    /// @param holder The address receiving the yield
    /// @param amount The amount of yield distributed
    /// @param timestamp The timestamp of the distribution
    event YieldDistributed(address indexed token, address indexed holder, uint256 amount, uint256 timestamp);

    /// @notice Deploys a new FixedYield contract
    /// @param tokenAddress The address of the token this schedule is for
    /// @param initialOwner The address that will receive admin rights
    /// @param startDate_ The timestamp when the schedule starts
    /// @param endDate_ The timestamp when the schedule ends
    /// @param rate_ The yield rate in basis points
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

        _token = IERC20(tokenAddress);
        _startDate = startDate_;
        _endDate = endDate_;
        _rate = rate_;
        _interval = interval_;

        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(YIELD_MANAGER_ROLE, initialOwner);
    }

    /// @notice Returns the token this schedule is for
    /// @return The ERC20 token address
    function token() external view returns (IERC20) {
        return _token;
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

    /// @notice Returns the yield rate in basis points
    /// @return The yield rate
    function rate() external view returns (uint256) {
        return _rate;
    }

    /// @notice Returns the interval between distributions
    /// @return The distribution interval
    function interval() external view returns (uint256) {
        return _interval;
    }

    /// @notice Returns the last distribution timestamp for a holder
    /// @param holder The address to check
    /// @return The timestamp of the last distribution
    function lastDistribution(address holder) external view returns (uint256) {
        return _lastDistributions[holder];
    }

    /// @notice Checks if yield can be distributed for a holder
    /// @param holder The address to check
    /// @return Whether yield can be distributed
    function canDistributeYield(address holder) public view returns (bool) {
        if (block.timestamp < _startDate) return false;
        if (block.timestamp > _endDate) return false;

        uint256 lastDist = _lastDistributions[holder];
        if (lastDist == 0) {
            lastDist = _startDate;
        }

        return block.timestamp >= lastDist + _interval;
    }

    /// @notice Calculates the yield for a specific holder
    /// @param holder The address to calculate yield for
    /// @return The amount of yield accrued
    function calculateYield(address holder) public view returns (uint256) {
        if (!canDistributeYield(holder)) return 0;

        // Get the yield basis from the token
        uint256 basis;
        try ERC20Yield(address(_token)).yieldBasis(holder) returns (uint256 _basis) {
            basis = _basis;
        } catch {
            revert TokenNotYieldEnabled();
        }

        // Calculate periods since last distribution
        uint256 lastDist = _lastDistributions[holder];
        if (lastDist == 0) {
            lastDist = _startDate;
        }

        uint256 periods = (block.timestamp - lastDist) / _interval;

        // Calculate yield: basis * rate * periods / 10000 (basis points)
        return (basis * _rate * periods) / 10_000;
    }

    /// @notice Distributes yield to a specific holder
    /// @param holder The address to distribute yield to
    /// @return The amount of yield distributed
    function distributeYield(address holder) external onlyRole(YIELD_MANAGER_ROLE) returns (uint256) {
        if (block.timestamp < _startDate) revert ScheduleNotActive();
        if (block.timestamp > _endDate) revert ScheduleExpired();

        uint256 amount = calculateYield(holder);
        if (amount == 0) revert NoYieldAvailable();

        // Update the last distribution before transfer to prevent reentrancy
        _lastDistributions[holder] = block.timestamp;

        // Transfer the yield to the holder
        bool success = _token.transfer(holder, amount);
        if (!success) revert YieldDistributionFailed();

        emit YieldDistributed(address(_token), holder, amount, block.timestamp);
        return amount;
    }
}
