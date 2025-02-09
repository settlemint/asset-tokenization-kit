// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { FixedYield } from "./FixedYield.sol";
import { ERC20Yield } from "./extensions/ERC20Yield.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/// @title FixedYieldFactory - A factory contract for creating fixed yield schedules
/// @notice This contract allows the creation of new fixed yield schedules with deterministic addresses
/// @dev Uses CREATE2 for deterministic deployment addresses and maintains a list of all created schedules
/// @custom:security-contact support@settlemint.com
contract FixedYieldFactory is ERC2771Context {
    error TokenNotYieldEnabled();
    error ScheduleSetupFailed();
    error NotAuthorized();
    error InvalidUnderlyingAsset();

    /// @notice Emitted when a new fixed yield schedule is created
    /// @param schedule The address of the newly created fixed yield schedule
    event FixedYieldCreated(address indexed schedule);

    /// @notice Array of all fixed yield schedules created by this factory
    FixedYield[] public allSchedules;

    constructor(address forwarder) ERC2771Context(forwarder) { }

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
        if (!token.canManageYield(_msgSender())) revert NotAuthorized();

        bytes32 salt = keccak256(abi.encodePacked(address(token), startTime, endTime, rate, interval));
        address schedule = address(
            new FixedYield{ salt: salt }(
                address(token), _msgSender(), startTime, endTime, rate, interval, trustedForwarder()
            )
        );

        // Set the yield schedule on the token
        // is it the responsibility of the factory to set the yield schedule?
        token.setYieldSchedule(schedule);

        emit FixedYieldCreated(schedule);
        allSchedules.push(FixedYield(schedule));
        return schedule;
    }
}
