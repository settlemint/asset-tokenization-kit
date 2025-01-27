// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { FixedYieldFactory } from "../contracts/FixedYieldFactory.sol";
import { FixedYield } from "../contracts/FixedYield.sol";
import { ERC20Mock } from "./mocks/ERC20Mock.sol";
import { ERC20YieldMock } from "./mocks/ERC20YieldMock.sol";

contract FixedYieldFactoryTest is Test {
    // Event we're testing against
    event FixedYieldCreated(
        address indexed schedule,
        address indexed token,
        address indexed underlyingAsset,
        address owner,
        uint256 startDate,
        uint256 endDate,
        uint256 rate,
        uint256 interval,
        uint256 scheduleCount
    );

    // Constants for test configuration
    uint256 private constant INITIAL_SUPPLY = 1_000_000;
    uint256 private constant YIELD_RATE = 500; // 5% yield rate in basis points
    uint256 private constant INTERVAL = 30 days;
    uint256 private constant YIELD_BASIS = 100;
    uint8 public constant DECIMALS = 2;

    // Test contracts
    FixedYieldFactory public factory;
    ERC20YieldMock public token;
    ERC20Mock public underlyingAsset;

    // Test accounts
    address public owner = makeAddr("owner");
    address public user1 = makeAddr("user1");

    // Timestamps
    uint256 public startDate;
    uint256 public endDate;

    function setUp() public {
        // Setup initial state
        vm.warp(1 days); // Start at a non-zero timestamp
        startDate = block.timestamp + 1 days;
        endDate = startDate + 365 days;

        // Deploy mock underlying asset
        underlyingAsset = new ERC20Mock("Underlying Token", "ULT", DECIMALS);
        underlyingAsset.mint(owner, INITIAL_SUPPLY);

        // Deploy token with yield capability
        vm.startPrank(owner);
        token = new ERC20YieldMock("My Token", "MYT", INITIAL_SUPPLY, address(underlyingAsset), YIELD_BASIS);

        // Deploy factory
        factory = new FixedYieldFactory();

        // Block user1 from managing yield
        token.blockYieldManagement(user1, true);
        vm.stopPrank();
    }

    function test_InitialState() public {
        assertEq(factory.allSchedulesLength(), 0, "Initial schedule count should be 0");
    }

    function test_CreateSchedule() public {
        vm.startPrank(owner);

        // Create schedule
        address scheduleAddr = factory.create(token, startDate, endDate, YIELD_RATE, INTERVAL);

        // Verify schedule was created
        assertEq(factory.allSchedulesLength(), 1, "Schedule count should be 1");
        assertEq(address(factory.allSchedules(0)), scheduleAddr, "Schedule address mismatch");

        // Verify schedule was set on token
        assertEq(address(token.yieldSchedule()), scheduleAddr, "Schedule not set on token");

        // Verify schedule parameters
        FixedYield schedule = FixedYield(scheduleAddr);
        assertEq(address(schedule.token()), address(token), "Token address mismatch");
        assertEq(schedule.startDate(), startDate, "Start date mismatch");
        assertEq(schedule.endDate(), endDate, "End date mismatch");
        assertEq(schedule.rate(), YIELD_RATE, "Rate mismatch");
        assertEq(schedule.interval(), INTERVAL, "Interval mismatch");

        vm.stopPrank();
    }

    function test_CreateMultipleSchedules() public {
        vm.startPrank(owner);

        // Create first schedule
        address schedule1 = factory.create(token, startDate, endDate, YIELD_RATE, INTERVAL);
        assertEq(factory.allSchedulesLength(), 1, "Schedule count should be 1");

        // Deploy another token
        ERC20YieldMock token2 =
            new ERC20YieldMock("Second Token", "TKN2", INITIAL_SUPPLY, address(underlyingAsset), YIELD_BASIS);

        // Create second schedule
        address schedule2 = factory.create(token2, startDate, endDate, YIELD_RATE, INTERVAL);
        assertEq(factory.allSchedulesLength(), 2, "Schedule count should be 2");

        // Verify both schedules are different
        assertTrue(schedule1 != schedule2, "Schedules should have different addresses");
        assertEq(address(factory.allSchedules(0)), schedule1, "First schedule address mismatch");
        assertEq(address(factory.allSchedules(1)), schedule2, "Second schedule address mismatch");

        vm.stopPrank();
    }

    function test_EventEmission() public {
        vm.startPrank(owner);

        // Expect the FixedYieldCreated event
        vm.expectEmit(true, true, true, true);
        emit FixedYieldCreated(
            computeCreateAddress(address(token), startDate, endDate, YIELD_RATE, INTERVAL),
            address(token),
            address(underlyingAsset),
            owner,
            startDate,
            endDate,
            YIELD_RATE,
            INTERVAL,
            1
        );

        // Create schedule
        factory.create(token, startDate, endDate, YIELD_RATE, INTERVAL);

        vm.stopPrank();
    }

    function test_RevertInvalidToken() public {
        vm.startPrank(owner);
        vm.expectRevert(FixedYieldFactory.InvalidToken.selector);
        factory.create(ERC20YieldMock(address(0)), startDate, endDate, YIELD_RATE, INTERVAL);
        vm.stopPrank();
    }

    function test_RevertUnauthorized() public {
        vm.startPrank(user1);
        vm.expectRevert(FixedYieldFactory.NotAuthorized.selector);
        factory.create(token, startDate, endDate, YIELD_RATE, INTERVAL);
        vm.stopPrank();
    }

    function test_RevertInvalidStartDate() public {
        vm.startPrank(owner);
        vm.expectRevert(FixedYieldFactory.InvalidStartDate.selector);
        factory.create(token, block.timestamp, endDate, YIELD_RATE, INTERVAL);
        vm.stopPrank();
    }

    function test_RevertInvalidEndDate() public {
        vm.startPrank(owner);
        vm.expectRevert(FixedYieldFactory.InvalidEndDate.selector);
        factory.create(token, startDate, startDate, YIELD_RATE, INTERVAL);
        vm.stopPrank();
    }

    function test_RevertInvalidRate() public {
        vm.startPrank(owner);
        vm.expectRevert(FixedYieldFactory.InvalidRate.selector);
        factory.create(token, startDate, endDate, 0, INTERVAL);
        vm.stopPrank();
    }

    function test_RevertInvalidInterval() public {
        vm.startPrank(owner);
        vm.expectRevert(FixedYieldFactory.InvalidInterval.selector);
        factory.create(token, startDate, endDate, YIELD_RATE, 0);
        vm.stopPrank();
    }

    /// @notice Helper function to compute the deterministic address of a schedule
    /// @dev This mimics the CREATE2 address computation used in the factory
    function computeCreateAddress(
        address token_,
        uint256 startTime_,
        uint256 endTime_,
        uint256 rate_,
        uint256 interval_
    )
        internal
        view
        returns (address)
    {
        bytes32 salt = keccak256(abi.encodePacked(token_, startTime_, endTime_, rate_, interval_));
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(factory),
                salt,
                keccak256(
                    abi.encodePacked(
                        type(FixedYield).creationCode, abi.encode(token_, owner, startTime_, endTime_, rate_, interval_)
                    )
                )
            )
        );
        return address(uint160(uint256(hash)));
    }
}
