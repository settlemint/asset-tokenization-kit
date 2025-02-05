// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test, Vm } from "forge-std/Test.sol";
import { FixedYieldFactory } from "../contracts/FixedYieldFactory.sol";
import { FixedYield } from "../contracts/FixedYield.sol";
import { ERC20Mock } from "./mocks/ERC20Mock.sol";
import { ERC20YieldMock } from "./mocks/ERC20YieldMock.sol";
import { Forwarder } from "../contracts/Forwarder.sol";

contract FixedYieldFactoryTest is Test {
    // Constants for test configuration
    uint256 private constant INITIAL_SUPPLY = 1_000_000;
    uint256 private constant YIELD_RATE = 500; // 5% yield rate in basis points
    uint256 private constant INTERVAL = 30 days;
    uint256 private constant YIELD_BASIS = 100;
    uint8 public constant DECIMALS = 2;
    uint256 public constant MATURITY_PERIOD = 365 days;

    // Test contracts
    FixedYieldFactory public factory;
    ERC20YieldMock public token;
    ERC20Mock public underlyingAsset;
    Forwarder public forwarder;

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

        // Deploy forwarder first
        forwarder = new Forwarder();
        // Then deploy factory with forwarder address
        factory = new FixedYieldFactory(address(forwarder));

        // Block user1 from managing yield
        token.blockYieldManagement(user1, true);
        vm.stopPrank();
    }

    function test_InitialState() public view {
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

        // Verify the event signature and address
        assertEq(lastEntry.topics[0], keccak256("FixedYieldCreated(address)"), "Event signature mismatch");
        assertEq(address(uint160(uint256(lastEntry.topics[1]))), scheduleAddr, "Schedule address mismatch");

        // Get the schedule and verify its parameters
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
        address scheduleAddr = factory.create(token, startDate, endDate, YIELD_RATE, INTERVAL);

        // Get the emitted events
        Vm.Log[] memory entries = vm.getRecordedLogs();

        // Find our event (it's the last one)
        Vm.Log memory lastEntry = entries[entries.length - 1];

        // Verify the event signature and address
        assertEq(lastEntry.topics[0], keccak256("FixedYieldCreated(address)"), "Event signature mismatch");
        assertEq(address(uint160(uint256(lastEntry.topics[1]))), scheduleAddr, "Schedule address mismatch");

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

    function test_DeterministicAddresses() public {
        // Create a yield token first
        ERC20YieldMock token1 =
            new ERC20YieldMock("Test Fixed Yield", "TFY", INITIAL_SUPPLY, address(underlyingAsset), YIELD_BASIS);

        uint256 startTime = block.timestamp + 1 days; // Start time must be in the future
        uint256 endTime = startTime + MATURITY_PERIOD;
        uint256 interval = 30 days; // Monthly distributions

        address schedule1 = factory.create(token1, startTime, endTime, YIELD_RATE, interval);

        // Create a new factory instance
        FixedYieldFactory newFactory = new FixedYieldFactory(address(forwarder));

        // Create another yield token with same parameters
        ERC20YieldMock token2 =
            new ERC20YieldMock("Test Fixed Yield", "TFY", INITIAL_SUPPLY, address(underlyingAsset), YIELD_BASIS);

        // Create a schedule with the same parameters
        address schedule2 = newFactory.create(token2, startTime, endTime, YIELD_RATE, interval);

        // The addresses should be different because the factory addresses are different
        assertNotEq(
            schedule1, schedule2, "Schedules should have different addresses due to different factory addresses"
        );
    }
}
