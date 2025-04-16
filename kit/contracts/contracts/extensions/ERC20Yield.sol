// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { ERC20HistoricalBalances } from "./ERC20HistoricalBalances.sol";

/// @title ERC20Yield - Extension for ERC20 tokens to support yield functionality
/// @notice This abstract contract provides the base functionality for ERC20 tokens to work with fixed yield schedules
/// @dev Inherit this contract to add yield support to your ERC20 token
/// @custom:security-contact support@settlemint.com
abstract contract ERC20Yield is Context, ERC20HistoricalBalances {
    /// @notice Custom errors for the ERC20Yield contract
    error InvalidYieldSchedule();
    error YieldScheduleAlreadySet();
    error NotAuthorized();

    /// @notice The yield schedule contract for this token
    address public yieldSchedule;

    /// @notice Event emitted when a yield schedule is set
    event YieldScheduleSet(address indexed schedule);

    /// @notice Sets the yield schedule for this token
    /// @dev Override this function to add additional access control if needed
    /// @param schedule The address of the yield schedule contract
    function setYieldSchedule(address schedule) public virtual {
        if (schedule == address(0)) revert InvalidYieldSchedule();
        if (yieldSchedule != address(0)) revert YieldScheduleAlreadySet();

        yieldSchedule = schedule;
        emit YieldScheduleSet(schedule);
    }

    /// @notice Returns the basis amount used to calculate yield per token unit
    /// @dev Override this function to define the yield calculation basis. For example, face value for bonds or token
    /// value for shares
    /// @param holder The address to get the yield basis for, allowing for holder-specific basis amounts
    /// @return The basis amount per token unit used in yield calculations
    function yieldBasisPerUnit(address holder) public view virtual returns (uint256);

    /// @notice Returns the token used for yield payments
    /// @dev Override this function to specify which token is used for yield payments
    /// @return The token used for yield payments
    function yieldToken() public view virtual returns (IERC20);

    /// @notice Checks if an address can manage yield on this token
    /// @dev Override this function to implement permission checks
    /// @param manager The address to check
    /// @return True if the address can manage yield
    function canManageYield(address manager) public view virtual returns (bool);
}
