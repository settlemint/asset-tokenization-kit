// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { FixedYield } from "./FixedYield.sol";
import { ERC20Yield } from "./extensions/ERC20Yield.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
    error NotAuthorized();
    error InvalidUnderlyingAsset();

    /// @notice Emitted when a new fixed yield schedule is created
    /// @param schedule The address of the newly created fixed yield schedule
    /// @param token The token the schedule is for
    /// @param underlyingAsset The token used for yield payments
    /// @param owner The owner of the fixed yield schedule
    /// @param startDate The start date of the schedule
    /// @param endDate The end date of the schedule
    /// @param rate The yield rate in basis points
    /// @param interval The interval between distributions
    /// @param periods Array of timestamps when each period ends
    /// @param scheduleCount The total number of schedules created so far
    event FixedYieldCreated(
        address indexed schedule,
        address indexed token,
        address indexed underlyingAsset,
        address owner,
        uint256 startDate,
        uint256 endDate,
        uint256 rate,
        uint256 interval,
        uint256[] periods,
        uint256 scheduleCount
    );

    /// @notice Array of all fixed yield schedules created by this factory
    FixedYield[] public allSchedules;

    /// @notice Returns the total number of fixed yield schedules created by this factory
    /// @return The length of the allSchedules array
    function allSchedulesLength() external view returns (uint256) {
        return allSchedules.length;
    }

    /// @notice Creates a new fixed yield schedule for a token
    /// @param token The token to create the yield schedule for
    /// @param startTime The start time of the yield schedule
    /// @param endTime The end time of the yield schedule
    /// @param rate The yield rate in basis points (1 basis point = 0.01%, e.g., 500 = 5%)
    /// @param interval The interval between distributions in seconds
    /// @return The address of the created yield schedule
    function create(
        ERC20Yield token,
        uint256 startTime,
        uint256 endTime,
        uint256 rate,
        uint256 interval
    )
        external
        returns (address)
    {
        if (address(token) == address(0)) revert InvalidToken();
        if (!token.canManageYield(msg.sender)) revert NotAuthorized();
        if (startTime <= block.timestamp) revert InvalidStartDate();
        if (endTime <= startTime) revert InvalidEndDate();
        if (rate == 0) revert InvalidRate();
        if (interval == 0) revert InvalidInterval();

        bytes32 salt = keccak256(abi.encodePacked(address(token), startTime, endTime, rate, interval));
        address schedule =
            address(new FixedYield{ salt: salt }(address(token), msg.sender, startTime, endTime, rate, interval));

        // Get the underlying asset for the event
        IERC20 underlyingAsset = token.yieldToken();

        // Set the yield schedule on the token
        // is it the responsibility of the factory to set the yield schedule?
        token.setYieldSchedule(schedule);

        // Get period end timestamps from the newly created schedule
        uint256[] memory allPeriods = FixedYield(schedule).allPeriods();

        emit FixedYieldCreated(
            schedule,
            address(token),
            address(underlyingAsset),
            msg.sender,
            startTime,
            endTime,
            rate,
            interval,
            allPeriods,
            allSchedules.length + 1
        );
        allSchedules.push(FixedYield(schedule));
        return schedule;
    }
}
