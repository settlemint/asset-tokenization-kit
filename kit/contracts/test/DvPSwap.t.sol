// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { DvPSwap } from "../contracts/DvPSwap.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Forwarder } from "../contracts/Forwarder.sol";
// import { ForwarderModule } from "./forwarder";

// Mock ERC20 token for testing
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) { }

    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }
}

contract DvPSwapTest is Test {
    DvPSwap public dvpSwap;
    Forwarder public forwarder;
    MockERC20 public tokenA;
    MockERC20 public tokenB;

    address public admin;
    address public user1;
    address public user2;

    uint256 public constant AMOUNT_A = 1000 * 10 ** 18;
    uint256 public constant AMOUNT_B = 500 * 10 ** 18;
    bytes32 public constant SECRET = bytes32("secret");
    bytes32 public constant HASHLOCK = 0x2d72f5f997513c11c7657a03e4001a564fc66d087e3bad7a04f4dedc718a6d99; // keccak256(abi.encodePacked(SECRET))

    // Create unique hashlocks for each test to avoid conflicts
    bytes32 public constant SECRET_2 = bytes32("secret2");
    bytes32 public constant HASHLOCK_2 = 0x5929877be8dc847d47ac9f7ef8d634fbcd7eec5be85b3f70119e3a14247aede0; // keccak256(abi.encodePacked(SECRET_2))

    bytes32 public constant SECRET_3 = bytes32("secret3");
    bytes32 public constant HASHLOCK_3 = 0x2ac649e7b98dc847d47ac9f7ef8d634fbcd7eec5be85b3f70119e3a14247aede; // keccak256(abi.encodePacked(SECRET_3))

    bytes32 public constant SECRET_4 = bytes32("secret4");
    bytes32 public constant HASHLOCK_4 = 0x3bc649e7b98dc847d47ac9f7ef8d634fbcd7eec5be85b3f70119e3a14247aede; // keccak256(abi.encodePacked(SECRET_4))

    bytes32 public constant SECRET_5 = bytes32("secret5");
    bytes32 public constant HASHLOCK_5 = 0x4dc649e7b98dc847d47ac9f7ef8d634fbcd7eec5be85b3f70119e3a14247aede; // keccak256(abi.encodePacked(SECRET_5))

    event DvPSwapCreated(
        bytes32 indexed dvpSwapId,
        address indexed sender,
        address indexed receiver,
        address tokenToSend,
        address tokenToReceive,
        uint256 amountToSend,
        uint256 amountToReceive,
        uint256 timelock,
        bytes32 hashlock
    );

    event DvPSwapStatusChanged(bytes32 indexed dvpSwapId, DvPSwap.DvPSwapStatus status);
    event DvPSwapClaimed(bytes32 indexed dvpSwapId, address indexed receiver, bytes32 secret);
    event DvPSwapRefunded(bytes32 indexed dvpSwapId, address indexed sender);
    event TokensLocked(bytes32 indexed dvpSwapId, address tokenAddress, uint256 amount, uint256 timestamp);

    function setUp() public {
        admin = makeAddr("admin");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Deploy tokens
        tokenA = new MockERC20("Token A", "TKNA");
        tokenB = new MockERC20("Token B", "TKNB");

        // Mint tokens to users
        tokenA.mint(user1, AMOUNT_A * 10);
        tokenB.mint(user2, AMOUNT_B * 10);

        // Deploy forwarder
        forwarder = new Forwarder();

        // Deploy DvPSwap
        vm.prank(admin);
        dvpSwap = new DvPSwap(address(forwarder));
    }

    // Basic functionality tests

    function test_InitialState() public view {
        assertTrue(dvpSwap.hasRole(dvpSwap.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(dvpSwap.hasRole(dvpSwap.PAUSER_ROLE(), admin));
        assertFalse(dvpSwap.paused());
    }

    function test_PauseUnpause() public {
        // Try to pause from non-pauser account
        vm.startPrank(user1);
        vm.expectRevert();
        dvpSwap.pause();
        vm.stopPrank();

        // Pause as admin
        vm.startPrank(admin);
        dvpSwap.pause();
        vm.stopPrank();

        assertTrue(dvpSwap.paused());

        // Try to create swap while paused
        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);

        vm.expectRevert();
        dvpSwap.createDvPSwap(
            user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, block.timestamp + 1 days, HASHLOCK
        );
        vm.stopPrank();

        // Unpause
        vm.startPrank(admin);
        dvpSwap.unpause();
        vm.stopPrank();

        assertFalse(dvpSwap.paused());
    }

    // Swap lifecycle tests

    function test_CreateSwap() public {
        uint256 timelock = block.timestamp + 1 days;
        bytes32 expectedSwapId =
            calculateSwapId(user1, user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, timelock, HASHLOCK);

        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);

        vm.expectEmit(true, true, true, true);
        emit TokensLocked(expectedSwapId, address(tokenA), AMOUNT_A, block.timestamp);

        vm.expectEmit(true, true, true, true);
        emit DvPSwapCreated(
            expectedSwapId, user1, user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, timelock, HASHLOCK
        );

        vm.expectEmit(true, true, false, true);
        emit DvPSwapStatusChanged(expectedSwapId, DvPSwap.DvPSwapStatus.OPEN);

        bytes32 swapId =
            dvpSwap.createDvPSwap(user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, timelock, HASHLOCK);
        vm.stopPrank();

        assertEq(swapId, expectedSwapId);
        assertTrue(dvpSwap.dvpSwapExists(swapId));

        // Check token transfer
        assertEq(tokenA.balanceOf(address(dvpSwap)), AMOUNT_A);
        assertEq(tokenA.balanceOf(user1), AMOUNT_A * 10 - AMOUNT_A);

        // Check swap details
        DvPSwap.DvPSwap memory swap = dvpSwap.getDvPSwap(swapId);
        assertEq(swap.creator, user1);
        assertEq(swap.sender, user1);
        assertEq(swap.receiver, user2);
        assertEq(swap.tokenToSend, address(tokenA));
        assertEq(swap.tokenToReceive, address(tokenB));
        assertEq(swap.amountToSend, AMOUNT_A);
        assertEq(swap.amountToReceive, AMOUNT_B);
        assertEq(swap.timelock, timelock);
        assertEq(swap.hashlock, HASHLOCK);
        assertEq(uint256(swap.status), uint256(DvPSwap.DvPSwapStatus.OPEN));
    }

    function test_ClaimSwap() public {
        // Create swap
        uint256 timelock = block.timestamp + 1 days;

        // Generate the hashlock from the secret
        bytes32 secret = bytes32("testClaimSecret");
        bytes32 hashlock = keccak256(abi.encodePacked(secret));

        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        bytes32 swapId =
            dvpSwap.createDvPSwap(user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, timelock, hashlock);
        vm.stopPrank();

        // Claim swap
        vm.startPrank(user2);
        tokenB.approve(address(dvpSwap), AMOUNT_B);

        vm.expectEmit(true, true, true, true);
        emit DvPSwapClaimed(swapId, user2, secret);

        vm.expectEmit(true, true, false, true);
        emit DvPSwapStatusChanged(swapId, DvPSwap.DvPSwapStatus.CLAIMED);

        bool claimed = dvpSwap.claimDvPSwap(swapId, secret);
        vm.stopPrank();

        assertTrue(claimed);

        // Check token transfers
        assertEq(tokenA.balanceOf(user2), AMOUNT_A);
        assertEq(tokenB.balanceOf(user1), AMOUNT_B);

        // Check swap status
        DvPSwap.DvPSwap memory swap = dvpSwap.getDvPSwap(swapId);
        assertEq(uint256(swap.status), uint256(DvPSwap.DvPSwapStatus.CLAIMED));
    }

    function test_RefundSwap() public {
        // Create swap with short timelock
        uint256 timelock = block.timestamp + 100;

        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        bytes32 swapId =
            dvpSwap.createDvPSwap(user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, timelock, HASHLOCK_3);
        vm.stopPrank();

        // Advance time past timelock
        vm.warp(timelock + 1);

        // Refund swap
        vm.startPrank(user1);

        vm.expectEmit(true, true, false, true);
        emit DvPSwapRefunded(swapId, user1);

        vm.expectEmit(true, true, false, true);
        emit DvPSwapStatusChanged(swapId, DvPSwap.DvPSwapStatus.REFUNDED);

        bool refunded = dvpSwap.refundDvPSwap(swapId);
        vm.stopPrank();

        assertTrue(refunded);

        // Check token transfers
        assertEq(tokenA.balanceOf(user1), AMOUNT_A * 10);

        // Check swap status
        DvPSwap.DvPSwap memory swap = dvpSwap.getDvPSwap(swapId);
        assertEq(uint256(swap.status), uint256(DvPSwap.DvPSwapStatus.REFUNDED));
    }

    function test_ExpireSwap() public {
        // Create swap
        uint256 timelock = block.timestamp + 1 days;

        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        bytes32 swapId =
            dvpSwap.createDvPSwap(user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, timelock, HASHLOCK_4);
        vm.stopPrank();

        // Advance time past max duration
        vm.warp(block.timestamp + dvpSwap.DEFAULT_MAX_DURATION() + 1);

        // Expire swap
        vm.startPrank(user2); // Anyone can expire a swap

        vm.expectEmit(true, true, false, true);
        emit DvPSwapStatusChanged(swapId, DvPSwap.DvPSwapStatus.EXPIRED);

        bool expired = dvpSwap.expireDvPSwap(swapId);
        vm.stopPrank();

        assertTrue(expired);

        // Check token transfers back to sender
        assertEq(tokenA.balanceOf(user1), AMOUNT_A * 10);

        // Check swap status
        DvPSwap.DvPSwap memory swap = dvpSwap.getDvPSwap(swapId);
        assertEq(uint256(swap.status), uint256(DvPSwap.DvPSwapStatus.EXPIRED));
    }

    // Tests for new functionality

    function test_RequestApproval() public {
        // Create swap with unique hashlock
        uint256 timelock = block.timestamp + 1 days;
        bytes32 uniqueSecret = keccak256(abi.encodePacked("uniqueRequestApproval"));
        bytes32 uniqueHashlock = keccak256(abi.encodePacked(uniqueSecret));

        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        bytes32 swapId =
            dvpSwap.createDvPSwap(user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, timelock, uniqueHashlock);

        // Request approval
        vm.expectEmit(true, true, false, true);
        emit DvPSwapStatusChanged(swapId, DvPSwap.DvPSwapStatus.AWAITING_APPROVAL);

        bool requested = dvpSwap.requestDvPSwapApproval(swapId);
        vm.stopPrank();

        assertTrue(requested);

        // Check swap status
        DvPSwap.DvPSwap memory swap = dvpSwap.getDvPSwap(swapId);
        assertEq(uint256(swap.status), uint256(DvPSwap.DvPSwapStatus.AWAITING_APPROVAL));

        // Create another swap to test the InvalidDvPSwapStatus case
        bytes32 uniqueSecret2 = keccak256(abi.encodePacked("uniqueRequestApproval2"));
        bytes32 uniqueHashlock2 = keccak256(abi.encodePacked(uniqueSecret2));

        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        bytes32 swapId2 = dvpSwap.createDvPSwap(
            user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, timelock, uniqueHashlock2
        );

        // Request approval
        dvpSwap.requestDvPSwapApproval(swapId2);

        // Try to request approval again, should fail with InvalidDvPSwapStatus
        vm.expectRevert(abi.encodeWithSignature("InvalidDvPSwapStatus()"));
        dvpSwap.requestDvPSwapApproval(swapId2);
        vm.stopPrank();

        // Create a new swap for testing authorization
        bytes32 uniqueSecret3 = keccak256(abi.encodePacked("uniqueRequestApprovalAuth"));
        bytes32 uniqueHashlock3 = keccak256(abi.encodePacked(uniqueSecret3));

        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        bytes32 swapId3 = dvpSwap.createDvPSwap(
            user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, timelock, uniqueHashlock3
        );
        vm.stopPrank();

        // Verify only sender can request approval (receiver should get NotAuthorized)
        vm.startPrank(user2);
        vm.expectRevert(abi.encodeWithSignature("NotAuthorized()"));
        dvpSwap.requestDvPSwapApproval(swapId3);
        vm.stopPrank();
    }

    function test_NotifySecretReady() public {
        // Create swap with unique hashlock
        uint256 timelock = block.timestamp + 1 days;
        bytes32 uniqueSecret = keccak256(abi.encodePacked("uniqueNotifySecretReady"));
        bytes32 uniqueHashlock = keccak256(abi.encodePacked(uniqueSecret));

        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        bytes32 swapId =
            dvpSwap.createDvPSwap(user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, timelock, uniqueHashlock);

        // Notify secret is ready directly from OPEN state
        vm.expectEmit(true, true, false, true);
        emit DvPSwapStatusChanged(swapId, DvPSwap.DvPSwapStatus.AWAITING_CLAIM_SECRET);

        bool notified = dvpSwap.notifyDvPSwapSecretReady(swapId);
        vm.stopPrank();

        assertTrue(notified);

        // Check swap status
        DvPSwap.DvPSwap memory swap = dvpSwap.getDvPSwap(swapId);
        assertEq(uint256(swap.status), uint256(DvPSwap.DvPSwapStatus.AWAITING_CLAIM_SECRET));

        // Create another swap to test notifyDvPSwapSecretReady from AWAITING_APPROVAL state
        bytes32 uniqueSecret2 = keccak256(abi.encodePacked("uniqueNotifySecretReadyFromApproval"));
        bytes32 uniqueHashlock2 = keccak256(abi.encodePacked(uniqueSecret2));

        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        bytes32 swapId2 = dvpSwap.createDvPSwap(
            user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, timelock, uniqueHashlock2
        );

        // Request approval first
        dvpSwap.requestDvPSwapApproval(swapId2);

        // Then notify secret is ready
        vm.expectEmit(true, true, false, true);
        emit DvPSwapStatusChanged(swapId2, DvPSwap.DvPSwapStatus.AWAITING_CLAIM_SECRET);
        bool notified2 = dvpSwap.notifyDvPSwapSecretReady(swapId2);
        vm.stopPrank();

        assertTrue(notified2);

        // Create another swap to test the InvalidDvPSwapStatus case
        bytes32 uniqueSecret3 = keccak256(abi.encodePacked("uniqueNotifySecretReady3"));
        bytes32 uniqueHashlock3 = keccak256(abi.encodePacked(uniqueSecret3));

        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        bytes32 swapId3 = dvpSwap.createDvPSwap(
            user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, timelock, uniqueHashlock3
        );

        // Notify secret is ready
        dvpSwap.notifyDvPSwapSecretReady(swapId3);

        // Try to notify secret ready again, should fail with InvalidDvPSwapStatus
        vm.expectRevert(abi.encodeWithSignature("InvalidDvPSwapStatus()"));
        dvpSwap.notifyDvPSwapSecretReady(swapId3);
        vm.stopPrank();

        // Create a new swap to test authorization
        bytes32 uniqueSecret4 = keccak256(abi.encodePacked("uniqueNotifySecretReadyAuth"));
        bytes32 uniqueHashlock4 = keccak256(abi.encodePacked(uniqueSecret4));

        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        bytes32 swapId4 = dvpSwap.createDvPSwap(
            user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, timelock, uniqueHashlock4
        );
        vm.stopPrank();

        // Verify only sender can notify secret ready (receiver should get NotAuthorized)
        vm.startPrank(user2);
        vm.expectRevert(abi.encodeWithSignature("NotAuthorized()"));
        dvpSwap.notifyDvPSwapSecretReady(swapId4);
        vm.stopPrank();
    }

    function test_MarkSwapFailed() public {
        // Create swap with unique hashlock
        uint256 timelock = block.timestamp + 1 days;
        bytes32 uniqueSecret = keccak256(abi.encodePacked("uniqueMarkSwapFailed"));
        bytes32 uniqueHashlock = keccak256(abi.encodePacked(uniqueSecret));

        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        bytes32 swapId =
            dvpSwap.createDvPSwap(user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, timelock, uniqueHashlock);

        // Mark as failed
        vm.expectEmit(true, true, false, true);
        emit DvPSwapStatusChanged(swapId, DvPSwap.DvPSwapStatus.FAILED);

        bool failed = dvpSwap.markDvPSwapFailed(swapId, "Transaction failed");
        vm.stopPrank();

        assertTrue(failed);

        // Check swap status
        DvPSwap.DvPSwap memory swap = dvpSwap.getDvPSwap(swapId);
        assertEq(uint256(swap.status), uint256(DvPSwap.DvPSwapStatus.FAILED));

        // Check tokens returned to sender
        assertEq(tokenA.balanceOf(user1), AMOUNT_A * 10);
    }

    function test_MarkSwapInvalid() public {
        // Create swap with unique hashlock
        uint256 timelock = block.timestamp + 1 days;
        bytes32 uniqueSecret = keccak256(abi.encodePacked("uniqueMarkSwapInvalid"));
        bytes32 uniqueHashlock = keccak256(abi.encodePacked(uniqueSecret));

        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        bytes32 swapId =
            dvpSwap.createDvPSwap(user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, timelock, uniqueHashlock);
        vm.stopPrank();

        // Receiver can also mark as invalid
        vm.startPrank(user2);
        vm.expectEmit(true, true, false, true);
        emit DvPSwapStatusChanged(swapId, DvPSwap.DvPSwapStatus.INVALID);

        bool invalid = dvpSwap.markDvPSwapInvalid(swapId, "Invalid parameters");
        vm.stopPrank();

        assertTrue(invalid);

        // Check swap status
        DvPSwap.DvPSwap memory swap = dvpSwap.getDvPSwap(swapId);
        assertEq(uint256(swap.status), uint256(DvPSwap.DvPSwapStatus.INVALID));

        // Check tokens returned to sender
        assertEq(tokenA.balanceOf(user1), AMOUNT_A * 10);
    }

    function test_ClaimAfterStatusTransitions() public {
        // Create swap for AWAITING_APPROVAL test with unique hashlock
        uint256 timelock = block.timestamp + 1 days;
        bytes32 uniqueSecret = keccak256(abi.encodePacked("uniqueClaimFromApproval"));
        bytes32 uniqueHashlock = keccak256(abi.encodePacked(uniqueSecret));

        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        bytes32 swapId =
            dvpSwap.createDvPSwap(user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, timelock, uniqueHashlock);

        // Change status to AWAITING_APPROVAL
        dvpSwap.requestDvPSwapApproval(swapId);
        vm.stopPrank();

        // Claim from AWAITING_APPROVAL state
        vm.startPrank(user2);
        tokenB.approve(address(dvpSwap), AMOUNT_B);
        bool claimed = dvpSwap.claimDvPSwap(swapId, uniqueSecret);
        vm.stopPrank();

        assertTrue(claimed);

        // Create another swap for AWAITING_CLAIM_SECRET test with different hashlock
        bytes32 uniqueSecret2 = keccak256(abi.encodePacked("uniqueClaimFromSecret"));
        bytes32 uniqueHashlock2 = keccak256(abi.encodePacked(uniqueSecret2));

        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        bytes32 swapId2 = dvpSwap.createDvPSwap(
            user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, timelock, uniqueHashlock2
        );

        // Change status to AWAITING_CLAIM_SECRET
        dvpSwap.notifyDvPSwapSecretReady(swapId2);
        vm.stopPrank();

        // Claim from AWAITING_CLAIM_SECRET state
        vm.startPrank(user2);
        tokenB.approve(address(dvpSwap), AMOUNT_B);
        bool claimed2 = dvpSwap.claimDvPSwap(swapId2, uniqueSecret2);
        vm.stopPrank();

        assertTrue(claimed2);
    }

    // Validation tests

    function test_RevertOnZeroAddress() public {
        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);

        // Zero receiver
        vm.expectRevert(abi.encodeWithSignature("ZeroAddress()"));
        dvpSwap.createDvPSwap(
            address(0), address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, block.timestamp + 1 days, HASHLOCK
        );

        // Zero tokenToSend
        vm.expectRevert(abi.encodeWithSignature("ZeroAddress()"));
        dvpSwap.createDvPSwap(
            user2, address(0), address(tokenB), AMOUNT_A, AMOUNT_B, block.timestamp + 1 days, HASHLOCK
        );

        // Zero tokenToReceive
        vm.expectRevert(abi.encodeWithSignature("ZeroAddress()"));
        dvpSwap.createDvPSwap(
            user2, address(tokenA), address(0), AMOUNT_A, AMOUNT_B, block.timestamp + 1 days, HASHLOCK
        );

        vm.stopPrank();
    }

    function test_RevertOnZeroAmount() public {
        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);

        // Zero amountToSend
        vm.expectRevert(abi.encodeWithSignature("ZeroAmount()"));
        dvpSwap.createDvPSwap(user2, address(tokenA), address(tokenB), 0, AMOUNT_B, block.timestamp + 1 days, HASHLOCK);

        // Zero amountToReceive
        vm.expectRevert(abi.encodeWithSignature("ZeroAmount()"));
        dvpSwap.createDvPSwap(user2, address(tokenA), address(tokenB), AMOUNT_A, 0, block.timestamp + 1 days, HASHLOCK);

        vm.stopPrank();
    }

    function test_RevertOnInvalidTimelock() public {
        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);

        vm.expectRevert(abi.encodeWithSignature("InvalidTimelock()"));
        dvpSwap.createDvPSwap(
            user2,
            address(tokenA),
            address(tokenB),
            AMOUNT_A,
            AMOUNT_B,
            block.timestamp, // Same as current time
            HASHLOCK
        );

        vm.stopPrank();
    }

    function test_InvalidStatusTransitions() public {
        // Create swap with unique hashlock
        uint256 timelock = block.timestamp + 1 days;
        bytes32 uniqueSecret = keccak256(abi.encodePacked("uniqueInvalidTransition1"));
        bytes32 uniqueHashlock = keccak256(abi.encodePacked(uniqueSecret));

        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        bytes32 swapId =
            dvpSwap.createDvPSwap(user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, timelock, uniqueHashlock);

        // Mark as failed
        dvpSwap.markDvPSwapFailed(swapId, "Failed");
        vm.stopPrank();

        // Try to request approval on a failed swap
        vm.startPrank(user1);
        vm.expectRevert(abi.encodeWithSignature("InvalidDvPSwapStatus()"));
        dvpSwap.requestDvPSwapApproval(swapId);
        vm.stopPrank();

        // Create another swap with different hashlock
        bytes32 uniqueSecret2 = keccak256(abi.encodePacked("uniqueInvalidTransition2"));
        bytes32 uniqueHashlock2 = keccak256(abi.encodePacked(uniqueSecret2));

        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        bytes32 swapId2 = dvpSwap.createDvPSwap(
            user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, timelock, uniqueHashlock2
        );

        // Mark as invalid
        dvpSwap.markDvPSwapInvalid(swapId2, "Invalid");
        vm.stopPrank();

        // Try to notify secret ready on an invalid swap
        vm.startPrank(user1);
        vm.expectRevert(abi.encodeWithSignature("InvalidDvPSwapStatus()"));
        dvpSwap.notifyDvPSwapSecretReady(swapId2);
        vm.stopPrank();
    }

    // Fuzzing tests

    function testFuzz_CreateSwapWithVaryingAmounts(uint256 amountToSend, uint256 amountToReceive) public {
        // Bound inputs to reasonable values
        vm.assume(amountToSend > 0 && amountToSend <= AMOUNT_A);
        vm.assume(amountToReceive > 0 && amountToReceive <= AMOUNT_B);

        uint256 timelock = block.timestamp + 1 days;

        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), amountToSend);

        bytes32 swapId = dvpSwap.createDvPSwap(
            user2,
            address(tokenA),
            address(tokenB),
            amountToSend,
            amountToReceive,
            timelock,
            keccak256(abi.encodePacked(amountToSend, amountToReceive)) // Unique hashlock for fuzzing test
        );
        vm.stopPrank();

        assertTrue(dvpSwap.dvpSwapExists(swapId));

        DvPSwap.DvPSwap memory swap = dvpSwap.getDvPSwap(swapId);
        assertEq(swap.amountToSend, amountToSend);
        assertEq(swap.amountToReceive, amountToReceive);
    }

    function testFuzz_CreateAndClaimWithVaryingTimelock(uint256 timelockDuration) public {
        // Bound inputs to reasonable values (between 1 minute and 30 days)
        vm.assume(timelockDuration >= 1 minutes && timelockDuration <= 30 days);

        uint256 timelock = block.timestamp + timelockDuration;
        bytes32 uniqueSecret = keccak256(abi.encodePacked("fuzz", timelockDuration));
        bytes32 uniqueHashlock = keccak256(abi.encodePacked(uniqueSecret));

        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);

        bytes32 swapId =
            dvpSwap.createDvPSwap(user2, address(tokenA), address(tokenB), AMOUNT_A, AMOUNT_B, timelock, uniqueHashlock);
        vm.stopPrank();

        // Claim swap
        vm.startPrank(user2);
        tokenB.approve(address(dvpSwap), AMOUNT_B);
        bool claimed = dvpSwap.claimDvPSwap(swapId, uniqueSecret);
        vm.stopPrank();

        assertTrue(claimed);
    }

    // Helper functions

    function calculateSwapId(
        address sender,
        address receiver,
        address tokenToSend,
        address tokenToReceive,
        uint256 amountToSend,
        uint256 amountToReceive,
        uint256 timelock,
        bytes32 hashlock
    )
        internal
        pure
        returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(
                sender, receiver, tokenToSend, tokenToReceive, amountToSend, amountToReceive, timelock, hashlock
            )
        );
    }
}
