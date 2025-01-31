// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test, Vm } from "forge-std/Test.sol";
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
        uint256[] periods,
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

        // Start recording events
        vm.recordLogs();

        // Create schedule
        address scheduleAddr = factory.create(token, startDate, endDate, YIELD_RATE, INTERVAL);

        // Get the emitted events
        Vm.Log[] memory entries = vm.getRecordedLogs();

        // Find our event (it's the last one)
        Vm.Log memory lastEntry = entries[entries.length - 1];

        // Verify the indexed parameters (topics)
        assertEq(lastEntry.topics[1], bytes32(uint256(uint160(scheduleAddr))), "Schedule address mismatch");
        assertEq(lastEntry.topics[2], bytes32(uint256(uint160(address(token)))), "Token address mismatch");
        assertEq(lastEntry.topics[3], bytes32(uint256(uint160(address(underlyingAsset)))), "Underlying asset mismatch");

        // Decode the non-indexed parameters
        (
            address eventOwner,
            uint256 eventStartDate,
            uint256 eventEndDate,
            uint256 eventRate,
            uint256 eventInterval,
            uint256[] memory eventPeriods,
            uint256 eventScheduleCount
        ) = abi.decode(lastEntry.data, (address, uint256, uint256, uint256, uint256, uint256[], uint256));

        // Verify non-indexed parameters
        assertEq(eventOwner, owner, "Owner mismatch");
        assertEq(eventStartDate, startDate, "Start date mismatch");
        assertEq(eventEndDate, endDate, "End date mismatch");
        assertEq(eventRate, YIELD_RATE, "Rate mismatch");
        assertEq(eventInterval, INTERVAL, "Interval mismatch");
        assertEq(eventScheduleCount, 1, "Schedule count mismatch");

        // Get the schedule and verify its parameters
        FixedYield schedule = FixedYield(scheduleAddr);
        uint256[] memory actualPeriods = schedule.allPeriods();

        // Verify periods match
        assertEq(eventPeriods.length, actualPeriods.length, "Periods length mismatch");
        for (uint256 i = 0; i < actualPeriods.length; i++) {
            assertEq(eventPeriods[i], actualPeriods[i], string.concat("Period mismatch at index ", vm.toString(i)));
        }

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

    function test_RevertUnauthorized() public {
        vm.startPrank(user1);
        vm.expectRevert(FixedYieldFactory.NotAuthorized.selector);
        factory.create(token, startDate, endDate, YIELD_RATE, INTERVAL);
        vm.stopPrank();
    }

    function test_EventEmission() public {
        vm.startPrank(owner);

        // Start recording events
        vm.recordLogs();

        // Create schedule
        factory.create(token, startDate, endDate, YIELD_RATE, INTERVAL);

        // Get the emitted events
        Vm.Log[] memory entries = vm.getRecordedLogs();

        // Find our event (it's the last one)
        Vm.Log memory lastEntry = entries[entries.length - 1];

        // Verify the indexed parameters (topics)
        assertEq(
            lastEntry.topics[0],
            keccak256(
                "FixedYieldCreated(address,address,address,address,uint256,uint256,uint256,uint256,uint256[],uint256)"
            ),
            "Event signature mismatch"
        );
        assertEq(lastEntry.topics[2], bytes32(uint256(uint160(address(token)))), "Token address mismatch");
        assertEq(lastEntry.topics[3], bytes32(uint256(uint160(address(underlyingAsset)))), "Underlying asset mismatch");

        // Decode the non-indexed parameters
        (
            address eventOwner,
            uint256 eventStartDate,
            uint256 eventEndDate,
            uint256 eventRate,
            uint256 eventInterval,
            uint256[] memory eventPeriods,
            uint256 eventScheduleCount
        ) = abi.decode(lastEntry.data, (address, uint256, uint256, uint256, uint256, uint256[], uint256));

        // Verify non-indexed parameters
        assertEq(eventOwner, owner, "Owner mismatch");
        assertEq(eventStartDate, startDate, "Start date mismatch");
        assertEq(eventEndDate, endDate, "End date mismatch");
        assertEq(eventRate, YIELD_RATE, "Rate mismatch");
        assertEq(eventInterval, INTERVAL, "Interval mismatch");
        assertEq(eventScheduleCount, 1, "Schedule count mismatch");

        vm.stopPrank();
    }

    /// @notice Helper function to compute the deterministic address of a schedule
    /// @dev This mimics the CREATE2 address computation used in the factory
    function computeCreateAddress(
        ERC20YieldMock tokenContract,
        uint256 startTime,
        uint256 endTime,
        uint256 rate,
        uint256 interval
    )
        internal
        view
        returns (address)
    {
        bytes32 salt = keccak256(abi.encodePacked(address(tokenContract), startTime, endTime, rate, interval));
        bytes32 hash =
            keccak256(abi.encodePacked(bytes1(0xff), address(factory), salt, keccak256(type(FixedYield).creationCode)));
        return address(uint160(uint256(hash)));
    }
}
