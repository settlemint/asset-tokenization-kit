// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test, console, Vm } from "forge-std/Test.sol";
import { AirdropFactory } from "../../contracts/v1/AirdropFactory.sol";
import { StandardAirdrop } from "../../contracts/v1/StandardAirdrop.sol";
import { VestingAirdrop } from "../../contracts/v1/VestingAirdrop.sol";
import { LinearVestingStrategy } from "../../contracts/v1/airdrop/strategies/LinearVestingStrategy.sol";
import { AirdropBase } from "../../contracts/v1/airdrop/AirdropBase.sol"; // Import needed for error selector
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol"; // Import Ownable for the error selector

// Mock ERC20 token for testing
contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MOCK") {
        _mint(msg.sender, 1_000_000 * 10 ** 18);
    }
}

contract AirdropFactoryTest is Test {
    AirdropFactory public factory;
    MockERC20 public token;
    address public owner = address(0x1);
    address public deployer = address(0x2);
    address public trustedForwarder;

    // Test parameters
    bytes32 public merkleRoot = keccak256("test merkle root");
    uint256 public startTime;
    uint256 public endTime;
    uint256 public vestingDuration = 365 days;
    uint256 public cliffDuration = 90 days;
    uint256 public claimPeriodEnd;

    // Event signatures for testing
    bytes32 constant STANDARD_AIRDROP_DEPLOYED_EVENT_SIG = keccak256("StandardAirdropDeployed(address,address,address)");
    bytes32 constant VESTING_AIRDROP_DEPLOYED_EVENT_SIG =
        keccak256("VestingAirdropDeployed(address,address,address,address)");

    function setUp() public {
        vm.startPrank(deployer);

        // Deploy token
        token = new MockERC20();

        // Set up trusted forwarder address
        trustedForwarder = makeAddr("trustedForwarder");

        // Deploy factory with trusted forwarder
        factory = new AirdropFactory(trustedForwarder);

        // Set up time parameters
        startTime = block.timestamp;
        endTime = block.timestamp + 30 days;
        claimPeriodEnd = block.timestamp + 30 days;

        vm.stopPrank();
    }

    // Test deploying a standard airdrop
    function testDeployStandardAirdrop() public {
        vm.startPrank(deployer);

        // Start recording logs for event testing
        vm.recordLogs();

        // Deploy the standard airdrop (remove trustedForwarder argument)
        address airdropAddress = factory.deployStandardAirdrop(address(token), merkleRoot, owner, startTime, endTime);

        // Get the recorded logs
        Vm.Log[] memory logs = vm.getRecordedLogs();

        // Find the StandardAirdropDeployed event
        bool foundEvent = false;
        for (uint256 i = 0; i < logs.length; i++) {
            // Check if this is our event
            if (logs[i].topics[0] == STANDARD_AIRDROP_DEPLOYED_EVENT_SIG) {
                foundEvent = true;

                // Parse the indexed parameters from the topics
                address emittedAirdropAddress = address(uint160(uint256(logs[i].topics[1])));
                address emittedTokenAddress = address(uint160(uint256(logs[i].topics[2])));
                address emittedOwner = address(uint160(uint256(logs[i].topics[3])));

                // Verify the event parameters
                assertEq(emittedAirdropAddress, airdropAddress, "Event airdrop address mismatch");
                assertEq(emittedTokenAddress, address(token), "Event token address mismatch");
                assertEq(emittedOwner, owner, "Event owner mismatch");

                break;
            }
        }

        assertTrue(foundEvent, "StandardAirdropDeployed event not emitted");

        // Verify the airdrop was deployed correctly
        assertTrue(airdropAddress != address(0), "Airdrop address should not be zero");

        // Check the deployed contract has the expected parameters
        StandardAirdrop airdrop = StandardAirdrop(airdropAddress);
        assertEq(address(airdrop.token()), address(token), "Token address mismatch");
        assertEq(airdrop.merkleRoot(), merkleRoot, "Merkle root mismatch");
        assertEq(airdrop.owner(), owner, "Owner mismatch");
        assertEq(airdrop.startTime(), startTime, "Start time mismatch");
        assertEq(airdrop.endTime(), endTime, "End time mismatch");

        vm.stopPrank();
    }

    // Test deploying a linear vesting airdrop
    function testDeployLinearVestingAirdrop() public {
        vm.startPrank(deployer);

        // Start recording logs for event testing
        vm.recordLogs();

        // Deploy the linear vesting airdrop (remove trustedForwarder argument)
        (address airdropAddress, address strategyAddress) = factory.deployLinearVestingAirdrop(
            address(token), merkleRoot, owner, vestingDuration, cliffDuration, claimPeriodEnd
        );

        // Get the recorded logs
        Vm.Log[] memory logs = vm.getRecordedLogs();

        // Find the VestingAirdropDeployed event
        bool foundEvent = false;
        for (uint256 i = 0; i < logs.length; i++) {
            // Check if this is our event
            if (logs[i].topics[0] == VESTING_AIRDROP_DEPLOYED_EVENT_SIG) {
                foundEvent = true;

                // Parse the indexed parameters from the topics
                address emittedAirdropAddress = address(uint160(uint256(logs[i].topics[1])));
                address emittedTokenAddress = address(uint160(uint256(logs[i].topics[2])));
                address emittedOwner = address(uint160(uint256(logs[i].topics[3])));

                // Parse the non-indexed parameter from the data
                address emittedStrategyAddress = abi.decode(logs[i].data, (address));

                // Verify the event parameters
                assertEq(emittedAirdropAddress, airdropAddress, "Event airdrop address mismatch");
                assertEq(emittedTokenAddress, address(token), "Event token address mismatch");
                assertEq(emittedOwner, owner, "Event owner mismatch");
                assertEq(emittedStrategyAddress, strategyAddress, "Event strategy address mismatch");

                break;
            }
        }

        assertTrue(foundEvent, "VestingAirdropDeployed event not emitted");

        // Verify the airdrop and strategy were deployed correctly
        assertTrue(airdropAddress != address(0), "Airdrop address should not be zero");
        assertTrue(strategyAddress != address(0), "Strategy address should not be zero");

        // Check the deployed airdrop has the expected parameters
        VestingAirdrop airdrop = VestingAirdrop(airdropAddress);
        assertEq(address(airdrop.token()), address(token), "Token address mismatch");
        assertEq(airdrop.merkleRoot(), merkleRoot, "Merkle root mismatch");
        assertEq(airdrop.owner(), owner, "Owner mismatch");
        assertEq(airdrop.claimPeriodEnd(), claimPeriodEnd, "Claim period end mismatch");
        assertEq(address(airdrop.claimStrategy()), strategyAddress, "Strategy address mismatch");

        // Check the deployed strategy has the expected parameters
        LinearVestingStrategy strategy = LinearVestingStrategy(strategyAddress);
        assertEq(strategy.vestingDuration(), vestingDuration, "Vesting duration mismatch");
        assertEq(strategy.cliffDuration(), cliffDuration, "Cliff duration mismatch");
        assertEq(strategy.owner(), owner, "Strategy owner mismatch");

        vm.stopPrank();
    }

    // Test deploying a standard airdrop with invalid time parameters
    function testDeployStandardAirdropWithInvalidTimeParameters() public {
        vm.startPrank(deployer);

        vm.expectRevert("End time must be after start time");
        // Remove trustedForwarder argument
        factory.deployStandardAirdrop(address(token), merkleRoot, owner, endTime, startTime);

        vm.stopPrank();
    }

    // Test deploying a linear vesting airdrop with invalid claim period
    function testDeployLinearVestingAirdropWithInvalidClaimPeriod() public {
        vm.startPrank(deployer);

        vm.expectRevert("Claim period must be in the future");
        // Remove trustedForwarder argument
        factory.deployLinearVestingAirdrop(
            address(token), merkleRoot, owner, vestingDuration, cliffDuration, block.timestamp
        );

        vm.stopPrank();
    }

    // Test deploying linear vesting with invalid vesting parameters
    function testDeployLinearVestingWithInvalidParams() public {
        vm.startPrank(deployer);

        vm.expectRevert("Cliff cannot exceed duration");
        // Remove trustedForwarder argument
        factory.deployLinearVestingAirdrop(address(token), merkleRoot, owner, 100, 200, claimPeriodEnd);

        vm.stopPrank();
    }

    // Test deploying standard airdrop with zero token address
    function testDeployStandardAirdropZeroToken() public {
        vm.startPrank(deployer);
        vm.expectRevert(AirdropBase.ZeroAddress.selector);
        // Remove trustedForwarder argument
        factory.deployStandardAirdrop(address(0), merkleRoot, owner, startTime, endTime);
        vm.stopPrank();
    }

    // Test deploying vesting airdrop with zero token address
    function testDeployVestingAirdropZeroToken() public {
        vm.startPrank(deployer);
        vm.expectRevert(AirdropBase.ZeroAddress.selector);
        // Remove trustedForwarder argument
        factory.deployLinearVestingAirdrop(
            address(0), merkleRoot, owner, vestingDuration, cliffDuration, claimPeriodEnd
        );
        vm.stopPrank();
    }

    // Test deploying vesting airdrop with zero owner address (should revert due to Ownable constraint)
    function testDeployVestingAirdropZeroOwner() public {
        vm.startPrank(deployer);

        // Expect revert from Ownable constructor when deploying the strategy,
        // including the zero address argument.
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableInvalidOwner.selector, address(0)));
        // Remove trustedForwarder argument
        factory.deployLinearVestingAirdrop(
            address(token),
            merkleRoot,
            address(0), // Zero owner - should cause Ownable revert
            vestingDuration,
            cliffDuration,
            claimPeriodEnd
        );

        vm.stopPrank();
    }

    // Test deploying vesting airdrop with zero strategy (should fail in VestingAirdrop constructor)
    // NOTE: This scenario is currently impossible because the factory deploys the strategy.
    // This test would be relevant if the strategy was passed in externally.

    // Test deploying multiple airdrops
    function testDeployMultipleAirdrops() public {
        vm.startPrank(deployer);

        // Deploy first (standard) - remove trustedForwarder argument
        address standardAirdrop = factory.deployStandardAirdrop(address(token), merkleRoot, owner, startTime, endTime);
        // Deploy second (vesting) - remove trustedForwarder argument
        (address vestingAirdrop, address vestingStrategy) = factory.deployLinearVestingAirdrop(
            address(token), keccak256("root2"), owner, vestingDuration + 1, cliffDuration + 1, claimPeriodEnd + 1
        );

        assertTrue(standardAirdrop != address(0), "Standard airdrop address should not be zero");
        assertTrue(vestingAirdrop != address(0), "Vesting airdrop address should not be zero");
        assertTrue(vestingStrategy != address(0), "Vesting strategy address should not be zero");
        assertNotEq(standardAirdrop, vestingAirdrop, "Airdrop addresses should differ");

        vm.stopPrank();
    }
}
