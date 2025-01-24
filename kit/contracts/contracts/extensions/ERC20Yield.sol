// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.24;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";

/// @title ERC20Yield - Extension for ERC20 tokens to support yield functionality
/// @notice This abstract contract provides the base functionality for ERC20 tokens to work with fixed yield schedules
/// @dev Inherit this contract to add yield support to your ERC20 token
/// @custom:security-contact support@settlemint.com
abstract contract ERC20Yield is Context {
    /// @notice Custom errors for the ERC20Yield contract
    error InvalidYieldSchedule();
    error YieldScheduleAlreadySet();

    /// @notice The yield schedule contract for this token
    address public yieldSchedule;

    /// @notice Event emitted when a yield schedule is set
    event YieldScheduleSet(address indexed schedule);

    /// @notice Returns the basis for yield calculation
    /// @dev Override this function to specify how yield should be calculated (e.g., face value for bonds, balance for
    /// other tokens)
    /// @param holder The address to get the yield basis for
    /// @return The basis amount for yield calculations
    function yieldBasis(address holder) public view virtual returns (uint256);

    /// @notice Sets the yield schedule for this token
    /// @dev Can be overridden by implementing contract to add access control
    /// @param schedule The address of the yield schedule contract
    function setYield(address schedule) public virtual {
        if (schedule == address(0)) revert InvalidYieldSchedule();
        if (yieldSchedule != address(0)) revert YieldScheduleAlreadySet();

        yieldSchedule = schedule;
        emit YieldScheduleSet(schedule);
    }
}
