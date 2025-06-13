// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { ATKVestingAirdropProxy } from "../../../contracts/system/airdrop/vesting-airdrop/ATKVestingAirdropProxy.sol";
import { ATKVestingAirdropImplementation } from
    "../../../contracts/system/airdrop/vesting-airdrop/ATKVestingAirdropImplementation.sol";
import { ATKLinearVestingStrategy } from
    "../../../contracts/system/airdrop/vesting-airdrop/ATKLinearVestingStrategy.sol";
import { MockedERC20Token } from "../../utils/mocks/MockedERC20Token.sol";
import { ATKForwarder } from "../../../contracts/vendor/ATKForwarder.sol";
import { VestingAirdropImplementationNotSet } from
    "../../../contracts/system/airdrop/vesting-airdrop/ATKVestingAirdropErrors.sol";

/// @title ATK Vesting Airdrop Proxy Test
/// @notice Test suite for ATKVestingAirdropProxy contract
contract ATKVestingAirdropProxyTest is Test {
    ATKVestingAirdropProxy public airdropProxy;
    ATKVestingAirdropImplementation public airdropImplementation;
    ATKLinearVestingStrategy public vestingStrategy;
    MockedERC20Token public token;
    ATKForwarder public forwarder;

    address public owner;
    address public user1;

    bytes32 public merkleRoot = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    uint256 public constant TOTAL_SUPPLY = 1000 ether;
    uint256 public constant VESTING_DURATION = 365 days;
    uint256 public constant CLIFF_DURATION = 30 days;
    uint256 public initializationDeadline;

    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");

        vm.label(owner, "Owner");
        vm.label(user1, "User1");

        // Deploy contracts
        token = new MockedERC20Token("Test Token", "TEST", 18);
        forwarder = new ATKForwarder();
        vestingStrategy = new ATKLinearVestingStrategy(VESTING_DURATION, CLIFF_DURATION);
        airdropImplementation = new ATKVestingAirdropImplementation(address(forwarder));

        initializationDeadline = block.timestamp + 30 days;

        vm.label(address(token), "Token");
        vm.label(address(vestingStrategy), "VestingStrategy");
        vm.label(address(airdropImplementation), "AirdropImplementation");
    }

    function testProxyDeploymentWithValidImplementation() public {
        // Deploy proxy with valid implementation
        vm.prank(owner);
        airdropProxy = new ATKVestingAirdropProxy(
            address(airdropImplementation),
            address(token),
            merkleRoot,
            owner,
            address(vestingStrategy),
            initializationDeadline
        );

        // Verify the proxy was deployed successfully
        assertNotEq(address(airdropProxy), address(0));

        // Verify the proxy delegates to the implementation
        // We can test this by calling a view function that should be delegated
        assertEq(address(ATKVestingAirdropImplementation(address(airdropProxy)).token()), address(token));
        assertEq(ATKVestingAirdropImplementation(address(airdropProxy)).merkleRoot(), merkleRoot);
        assertEq(ATKVestingAirdropImplementation(address(airdropProxy)).claimPeriodEnd(), initializationDeadline);
        assertEq(
            address(ATKVestingAirdropImplementation(address(airdropProxy)).vestingStrategy()), address(vestingStrategy)
        );
        assertEq(ATKVestingAirdropImplementation(address(airdropProxy)).owner(), owner);
    }

    function testProxyDeploymentWithZeroImplementation() public {
        // Should revert when implementation address is zero
        vm.expectRevert(VestingAirdropImplementationNotSet.selector);

        vm.prank(owner);
        new ATKVestingAirdropProxy(
            address(0), address(token), merkleRoot, owner, address(vestingStrategy), initializationDeadline
        );
    }

    function testProxyRejectsEtherTransfers() public {
        // Deploy a valid proxy first
        vm.prank(owner);
        airdropProxy = new ATKVestingAirdropProxy(
            address(airdropImplementation),
            address(token),
            merkleRoot,
            owner,
            address(vestingStrategy),
            initializationDeadline
        );

        // Try to send ether to the proxy and expect it to revert
        vm.expectRevert();
        vm.deal(user1, 1 ether);
        vm.prank(user1);
        (bool success,) = address(airdropProxy).call{ value: 1 ether }("");
        assertFalse(success);
    }

    function testProxyDelegatesCallsToImplementation() public {
        // Deploy proxy
        vm.prank(owner);
        airdropProxy = new ATKVestingAirdropProxy(
            address(airdropImplementation),
            address(token),
            merkleRoot,
            owner,
            address(vestingStrategy),
            initializationDeadline
        );

        // Mint tokens to the proxy for testing
        token.mint(address(airdropProxy), TOTAL_SUPPLY);

        // Test that we can call functions on the implementation through the proxy
        uint256 index = 123;
        bool isInitialized = ATKVestingAirdropImplementation(address(airdropProxy)).isVestingInitialized(index);
        assertFalse(isInitialized); // Should be false initially

        uint256 timestamp = ATKVestingAirdropImplementation(address(airdropProxy)).getInitializationTimestamp(index);
        assertEq(timestamp, 0); // Should be 0 initially
    }
}
