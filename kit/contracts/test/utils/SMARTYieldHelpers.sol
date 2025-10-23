// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ISMARTYield } from "../../contracts/smart/extensions/yield/ISMARTYield.sol";
import {
    ISMARTFixedYieldSchedule
} from "../../contracts/smart/extensions/yield/schedules/fixed/ISMARTFixedYieldSchedule.sol";
import { IATKFixedYieldScheduleFactory } from "../../contracts/addons/yield/IATKFixedYieldScheduleFactory.sol";
import { TestConstants } from "../Constants.sol";

/// @title Helper utilities for SMART Yield tests
/// @notice Provides common helper functions and utilities for testing yield functionality
abstract contract SMARTYieldHelpers is Test {
    uint256 internal constant DEFAULT_YIELD_BASIS = 1; // 1:1 basis - each token earns yield on itself
    uint256 internal constant YIELD_RATE = 500; // 5% in basis points
    uint256 internal constant PERIOD_INTERVAL = 30 days;
    uint256 internal constant SCHEDULE_DURATION = 365 days;

    /// @notice Advances both time and block number to ensure alignment
    /// @dev This is necessary because yield schedules use timestamps as block numbers
    /// @param newTimestamp The timestamp to advance to
    function _advanceTimeAndBlock(uint256 newTimestamp) internal {
        vm.warp(newTimestamp);
        // Set block number to match timestamp for yield schedule compatibility
        vm.roll(newTimestamp);
    }

    /// @notice Ensures block number is aligned with timestamp
    /// @dev Call this before any operation that may use historical balances
    function _ensureBlockAlignment() internal {
        if (block.number < block.timestamp) {
            vm.roll(block.timestamp);
        }
    }

    /// @notice Creates a yield schedule with default parameters
    /// @param yieldScheduleFactory The factory to use for creating the schedule
    /// @param token The token to attach the schedule to
    /// @param tokenIssuer The address that will create the schedule
    /// @return The address of the created yield schedule
    function _createYieldSchedule(
        IATKFixedYieldScheduleFactory yieldScheduleFactory,
        ISMARTYield token,
        address tokenIssuer
    )
        internal
        returns (address)
    {
        return _createYieldSchedule(yieldScheduleFactory, token, tokenIssuer, block.timestamp + 1 days);
    }

    /// @notice Creates a yield schedule with custom start date
    /// @param yieldScheduleFactory The factory to use for creating the schedule
    /// @param token The token to attach the schedule to
    /// @param tokenIssuer The address that will create the schedule
    /// @param startDate The start date for the yield schedule
    /// @return The address of the created yield schedule
    function _createYieldSchedule(
        IATKFixedYieldScheduleFactory yieldScheduleFactory,
        ISMARTYield token,
        address tokenIssuer,
        uint256 startDate
    )
        internal
        returns (address)
    {
        uint256 endDate = startDate + SCHEDULE_DURATION;

        vm.prank(tokenIssuer);
        address yieldSchedule = yieldScheduleFactory.create(
            token, startDate, endDate, YIELD_RATE, PERIOD_INTERVAL, TestConstants.COUNTRY_CODE_US
        );

        vm.startPrank(tokenIssuer);
        vm.stopPrank();

        return yieldSchedule;
    }

    /// @notice Funds a yield schedule with payment tokens
    /// @param scheduleAddress The address of the schedule to fund
    /// @param yieldPaymentToken The token to use for funding
    /// @param funder The address that will fund the schedule
    /// @param amount The amount to fund
    function _fundYieldSchedule(
        address scheduleAddress,
        address yieldPaymentToken,
        address funder,
        uint256 amount
    )
        internal
    {
        // Mint yield tokens to funder
        MockERC20(yieldPaymentToken).mint(funder, amount);

        // Approve and fund the schedule
        vm.startPrank(funder);
        IERC20(yieldPaymentToken).approve(scheduleAddress, amount);
        ISMARTFixedYieldSchedule(scheduleAddress).topUpDenominationAsset(amount);
        vm.stopPrank();
    }
}

// Simple Mock ERC20 for testing yield payments
contract MockERC20 is IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;
    string public name;
    string public symbol;
    uint8 private _decimals;

    constructor(string memory _name, string memory _symbol, uint8 _decimals_) {
        name = _name;
        symbol = _symbol;
        _decimals = _decimals_;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) external override returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");

        _transfer(from, to, amount);
        _approve(from, msg.sender, currentAllowance - amount);

        return true;
    }

    function mint(address to, uint256 amount) external {
        _totalSupply += amount;
        _balances[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(_balances[from] >= amount, "ERC20: transfer amount exceeds balance");

        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
}
