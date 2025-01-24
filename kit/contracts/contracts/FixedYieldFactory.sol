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
    error NotAuthorized();

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

    /// @notice Creates a new fixed yield schedule for a token
    /// @param token The token to create the yield schedule for
    /// @param startTime The start time of the yield schedule
    /// @param endTime The end time of the yield schedule
    /// @param rate The yield rate in basis points (1/10000)
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

        // Verify the token implements ERC20Yield by trying to call yieldBasis
        try token.yieldBasis(address(0)) returns (uint256) {
            // Token implements ERC20Yield
        } catch {
            revert TokenNotYieldEnabled();
        }

        if (!token.canManageYield(msg.sender)) revert NotAuthorized();
        if (startTime <= block.timestamp) revert InvalidStartDate();
        if (endTime <= startTime) revert InvalidEndDate();
        if (rate == 0) revert InvalidRate();
        if (interval == 0) revert InvalidInterval();

        bytes32 salt = keccak256(abi.encodePacked(address(token), startTime, endTime, rate, interval));
        address schedule =
            address(new FixedYield{ salt: salt }(address(token), msg.sender, startTime, endTime, rate, interval));

        emit FixedYieldCreated(
            schedule, address(token), msg.sender, startTime, endTime, rate, interval, allSchedules.length + 1
        );
        allSchedules.push(FixedYield(schedule));
        return schedule;
    }
}
