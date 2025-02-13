// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { FixedYield } from "./FixedYield.sol";
import { ERC20Yield } from "./extensions/ERC20Yield.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/// @title FixedYieldFactory - A factory contract for creating fixed yield schedules
/// @notice This contract allows the creation of new fixed yield schedules with deterministic addresses
/// using CREATE2. It provides functionality to create and manage yield schedules for tokens that
/// support the ERC20Yield extension, enabling periodic yield distributions based on token balances.
/// @dev Inherits from ERC2771Context for meta-transaction support. Uses CREATE2 for deterministic
/// deployment addresses and maintains a registry of all created schedules. Only authorized yield
/// managers can create schedules. Each schedule is automatically set on the corresponding token.
/// @custom:security-contact support@settlemint.com
contract FixedYieldFactory is ERC2771Context {
    /// @notice Custom errors for the FixedYieldFactory contract
    /// @dev These errors provide more gas-efficient and descriptive error handling
    error TokenNotYieldEnabled();
    error ScheduleSetupFailed();
    error NotAuthorized();
    error InvalidUnderlyingAsset();

    /// @notice Emitted when a new fixed yield schedule is created
    /// @param schedule The address of the newly created fixed yield schedule
    event FixedYieldCreated(address indexed schedule);

    /// @notice Array of all fixed yield schedules created by this factory
    /// @dev Stores references to all created schedules for tracking and enumeration
    FixedYield[] public allSchedules;

    /// @notice Deploys a new FixedYieldFactory contract
    /// @dev Sets up the factory with meta-transaction support
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    constructor(address forwarder) ERC2771Context(forwarder) { }

    /// @notice Returns the total number of fixed yield schedules created by this factory
    /// @dev Provides a way to enumerate all created schedules
    /// @return The total number of yield schedules created
    function allSchedulesLength() external view returns (uint256) {
        return allSchedules.length;
    }

    /// @notice Creates a new fixed yield schedule for a token
    /// @dev Uses CREATE2 for deterministic addresses and requires the caller to have yield management
    /// permissions on the token. Automatically sets the created schedule on the token. The schedule
    /// will distribute yield according to the specified rate and interval.
    /// @param token The ERC20Yield-compatible token to create the yield schedule for
    /// @param startTime The timestamp when yield distribution should start (must be in the future)
    /// @param endTime The timestamp when yield distribution should end (must be after startTime)
    /// @param rate The yield rate in basis points (1 basis point = 0.01%, e.g., 500 = 5%)
    /// @param interval The interval between yield distributions in seconds (must be > 0)
    /// @return The address of the newly created yield schedule
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
        token.setYieldSchedule(schedule);

        emit FixedYieldCreated(schedule);
        allSchedules.push(FixedYield(schedule));
        return schedule;
    }
}
