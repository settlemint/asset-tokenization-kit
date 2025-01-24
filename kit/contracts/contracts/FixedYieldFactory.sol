// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.24;

import { FixedYield } from "./FixedYield.sol";
import { ERC20Yield } from "./extensions/ERC20Yield.sol";

/// @title FixedYieldFactory - A factory contract for creating fixed yield schedules
/// @notice This contract allows the creation of new fixed yield schedules with deterministic addresses
/// @dev Uses CREATE2 for deterministic deployment addresses and maintains a list of all created schedules
/// @custom:security-contact support@settlemint.com
contract FixedYieldFactory {
    error InvalidToken();
    error InvalidStartDate();
    error InvalidEndDate();
    error InvalidRate();
    error InvalidInterval();
    error TokenNotYieldEnabled();
    error ScheduleSetupFailed();

    /// @notice Emitted when a new fixed yield schedule is created
    /// @param schedule The address of the newly created fixed yield schedule
    /// @param token The token the schedule is for
    /// @param owner The owner of the fixed yield schedule
    /// @param startDate The start date of the schedule
    /// @param endDate The end date of the schedule
    /// @param rate The yield rate in basis points
    /// @param interval The interval between distributions
    /// @param scheduleCount The total number of schedules created so far
    event FixedYieldCreated(
        address indexed schedule,
        address indexed token,
        address indexed owner,
        uint256 startDate,
        uint256 endDate,
        uint256 rate,
        uint256 interval,
        uint256 scheduleCount
    );

    /// @notice Array of all fixed yield schedules created by this factory
    FixedYield[] public allSchedules;

    /// @notice Returns the total number of fixed yield schedules created by this factory
    /// @return The length of the allSchedules array
    function allSchedulesLength() external view returns (uint256) {
        return allSchedules.length;
    }

    /// @notice Creates a new fixed yield schedule with the specified parameters
    /// @dev Uses CREATE2 for deterministic addresses and emits a FixedYieldCreated event
    /// @param token The token address this schedule is for
    /// @param startDate The timestamp when the schedule starts
    /// @param endDate The timestamp when the schedule ends
    /// @param rate The yield rate in basis points
    /// @param interval The interval between distributions in seconds
    /// @return schedule The address of the newly created fixed yield schedule
    function create(
        address token,
        uint256 startDate,
        uint256 endDate,
        uint256 rate,
        uint256 interval
    )
        external
        returns (address schedule)
    {
        if (token == address(0)) revert InvalidToken();
        if (startDate <= block.timestamp) revert InvalidStartDate();
        if (endDate <= startDate) revert InvalidEndDate();
        if (rate == 0) revert InvalidRate();
        if (interval == 0) revert InvalidInterval();

        // Verify the token implements ERC20Yield
        try ERC20Yield(token).yieldBasis(address(0)) returns (uint256) {
            // Token implements ERC20Yield
        } catch {
            revert TokenNotYieldEnabled();
        }

        bytes32 salt = keccak256(abi.encodePacked(token, msg.sender, startDate, endDate, rate, interval));

        FixedYield newSchedule = new FixedYield{ salt: salt }(token, msg.sender, startDate, endDate, rate, interval);
        schedule = address(newSchedule);
        allSchedules.push(newSchedule);

        // Set the schedule on the token
        try ERC20Yield(token).setYieldSchedule(schedule) {
            // Schedule set successfully
        } catch {
            revert ScheduleSetupFailed();
        }

        emit FixedYieldCreated(schedule, token, msg.sender, startDate, endDate, rate, interval, allSchedules.length);
    }
}
