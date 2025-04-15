// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { DvPSwap } from "../contracts/DvPSwap.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Forwarder } from "../contracts/Forwarder.sol";

// Mock ERC20 token for testing
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

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
    
    uint256 public constant AMOUNT_A = 1000 * 10**18;
    uint256 public constant AMOUNT_B = 500 * 10**18;
    bytes32 public constant SECRET = bytes32("secret");
    bytes32 public constant HASHLOCK = 0x2d72f5f997513c11c7657a03e4001a564fc66d087e3bad7a04f4dedc718a6d99; // keccak256(abi.encodePacked(SECRET))
    
    event SwapCreated(
        bytes32 indexed swapId,
        address indexed sender,
        address indexed receiver,
        address tokenToSend,
        address tokenToReceive,
        uint256 amountToSend,
        uint256 amountToReceive,
        uint256 timelock,
        bytes32 hashlock
    );
    
    event SwapStatusChanged(bytes32 indexed swapId, DvPSwap.SwapStatus status);
    event SwapClaimed(bytes32 indexed swapId, address indexed receiver, bytes32 secret);
    event SwapRefunded(bytes32 indexed swapId, address indexed sender);
    
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
        dvpSwap.createSwap(
            user2,
            address(tokenA),
            address(tokenB),
            AMOUNT_A,
            AMOUNT_B,
            block.timestamp + 1 days,
            HASHLOCK
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
        bytes32 expectedSwapId = calculateSwapId(
            user1, 
            user2, 
            address(tokenA), 
            address(tokenB), 
            AMOUNT_A, 
            AMOUNT_B, 
            timelock, 
            HASHLOCK
        );
        
        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        
        vm.expectEmit(true, true, true, true);
        emit SwapCreated(
            expectedSwapId,
            user1,
            user2,
            address(tokenA),
            address(tokenB),
            AMOUNT_A,
            AMOUNT_B,
            timelock,
            HASHLOCK
        );
        
        vm.expectEmit(true, true, false, true);
        emit SwapStatusChanged(expectedSwapId, DvPSwap.SwapStatus.OPEN);
        
        bytes32 swapId = dvpSwap.createSwap(
            user2,
            address(tokenA),
            address(tokenB),
            AMOUNT_A,
            AMOUNT_B,
            timelock,
            HASHLOCK
        );
        vm.stopPrank();
        
        assertEq(swapId, expectedSwapId);
        assertTrue(dvpSwap.swapExists(swapId));
        
        // Check token transfer
        assertEq(tokenA.balanceOf(address(dvpSwap)), AMOUNT_A);
        assertEq(tokenA.balanceOf(user1), AMOUNT_A * 10 - AMOUNT_A);
        
        // Check swap details
        DvPSwap.Swap memory swap = dvpSwap.getSwap(swapId);
        assertEq(swap.creator, user1);
        assertEq(swap.sender, user1);
        assertEq(swap.receiver, user2);
        assertEq(swap.tokenToSend, address(tokenA));
        assertEq(swap.tokenToReceive, address(tokenB));
        assertEq(swap.amountToSend, AMOUNT_A);
        assertEq(swap.amountToReceive, AMOUNT_B);
        assertEq(swap.timelock, timelock);
        assertEq(swap.hashlock, HASHLOCK);
        assertEq(uint(swap.status), uint(DvPSwap.SwapStatus.OPEN));
    }
    
    function test_ClaimSwap() public {
        // Create swap
        uint256 timelock = block.timestamp + 1 days;
        
        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        bytes32 swapId = dvpSwap.createSwap(
            user2,
            address(tokenA),
            address(tokenB),
            AMOUNT_A,
            AMOUNT_B,
            timelock,
            HASHLOCK
        );
        vm.stopPrank();
        
        // Claim swap
        vm.startPrank(user2);
        tokenB.approve(address(dvpSwap), AMOUNT_B);
        
        vm.expectEmit(true, true, true, true);
        emit SwapClaimed(swapId, user2, SECRET);
        
        vm.expectEmit(true, true, false, true);
        emit SwapStatusChanged(swapId, DvPSwap.SwapStatus.CLAIMED);
        
        bool claimed = dvpSwap.claimSwap(swapId, SECRET);
        vm.stopPrank();
        
        assertTrue(claimed);
        
        // Check token transfers
        assertEq(tokenA.balanceOf(user2), AMOUNT_A);
        assertEq(tokenB.balanceOf(user1), AMOUNT_B);
        
        // Check swap status
        DvPSwap.Swap memory swap = dvpSwap.getSwap(swapId);
        assertEq(uint(swap.status), uint(DvPSwap.SwapStatus.CLAIMED));
    }
    
    function test_RefundSwap() public {
        // Create swap with short timelock
        uint256 timelock = block.timestamp + 100;
        
        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        bytes32 swapId = dvpSwap.createSwap(
            user2,
            address(tokenA),
            address(tokenB),
            AMOUNT_A,
            AMOUNT_B,
            timelock,
            HASHLOCK
        );
        vm.stopPrank();
        
        // Advance time past timelock
        vm.warp(timelock + 1);
        
        // Refund swap
        vm.startPrank(user1);
        
        vm.expectEmit(true, true, false, true);
        emit SwapRefunded(swapId, user1);
        
        vm.expectEmit(true, true, false, true);
        emit SwapStatusChanged(swapId, DvPSwap.SwapStatus.REFUNDED);
        
        bool refunded = dvpSwap.refundSwap(swapId);
        vm.stopPrank();
        
        assertTrue(refunded);
        
        // Check token transfers
        assertEq(tokenA.balanceOf(user1), AMOUNT_A * 10);
        
        // Check swap status
        DvPSwap.Swap memory swap = dvpSwap.getSwap(swapId);
        assertEq(uint(swap.status), uint(DvPSwap.SwapStatus.REFUNDED));
    }
    
    function test_ExpireSwap() public {
        // Create swap
        uint256 timelock = block.timestamp + 1 days;
        
        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        bytes32 swapId = dvpSwap.createSwap(
            user2,
            address(tokenA),
            address(tokenB),
            AMOUNT_A,
            AMOUNT_B,
            timelock,
            HASHLOCK
        );
        vm.stopPrank();
        
        // Advance time past max duration
        vm.warp(block.timestamp + dvpSwap.DEFAULT_MAX_DURATION() + 1);
        
        // Expire swap
        vm.startPrank(user2); // Anyone can expire a swap
        
        vm.expectEmit(true, true, false, true);
        emit SwapStatusChanged(swapId, DvPSwap.SwapStatus.EXPIRED);
        
        bool expired = dvpSwap.expireSwap(swapId);
        vm.stopPrank();
        
        assertTrue(expired);
        
        // Check token transfers back to sender
        assertEq(tokenA.balanceOf(user1), AMOUNT_A * 10);
        
        // Check swap status
        DvPSwap.Swap memory swap = dvpSwap.getSwap(swapId);
        assertEq(uint(swap.status), uint(DvPSwap.SwapStatus.EXPIRED));
    }
    
    // Validation tests
    
    function test_RevertOnZeroAddress() public {
        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        
        // Zero receiver
        vm.expectRevert(abi.encodeWithSignature("ZeroAddress()"));
        dvpSwap.createSwap(
            address(0),
            address(tokenA),
            address(tokenB),
            AMOUNT_A,
            AMOUNT_B,
            block.timestamp + 1 days,
            HASHLOCK
        );
        
        // Zero tokenToSend
        vm.expectRevert(abi.encodeWithSignature("ZeroAddress()"));
        dvpSwap.createSwap(
            user2,
            address(0),
            address(tokenB),
            AMOUNT_A,
            AMOUNT_B,
            block.timestamp + 1 days,
            HASHLOCK
        );
        
        // Zero tokenToReceive
        vm.expectRevert(abi.encodeWithSignature("ZeroAddress()"));
        dvpSwap.createSwap(
            user2,
            address(tokenA),
            address(0),
            AMOUNT_A,
            AMOUNT_B,
            block.timestamp + 1 days,
            HASHLOCK
        );
        
        vm.stopPrank();
    }
    
    function test_RevertOnZeroAmount() public {
        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        
        // Zero amountToSend
        vm.expectRevert(abi.encodeWithSignature("ZeroAmount()"));
        dvpSwap.createSwap(
            user2,
            address(tokenA),
            address(tokenB),
            0,
            AMOUNT_B,
            block.timestamp + 1 days,
            HASHLOCK
        );
        
        // Zero amountToReceive
        vm.expectRevert(abi.encodeWithSignature("ZeroAmount()"));
        dvpSwap.createSwap(
            user2,
            address(tokenA),
            address(tokenB),
            AMOUNT_A,
            0,
            block.timestamp + 1 days,
            HASHLOCK
        );
        
        vm.stopPrank();
    }
    
    function test_RevertOnInvalidTimelock() public {
        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        
        vm.expectRevert(abi.encodeWithSignature("InvalidTimelock()"));
        dvpSwap.createSwap(
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
    
    // Fuzzing tests
    
    function testFuzz_CreateSwapWithVaryingAmounts(uint256 amountToSend, uint256 amountToReceive) public {
        // Bound inputs to reasonable values
        vm.assume(amountToSend > 0 && amountToSend <= AMOUNT_A);
        vm.assume(amountToReceive > 0 && amountToReceive <= AMOUNT_B);
        
        uint256 timelock = block.timestamp + 1 days;
        
        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), amountToSend);
        
        bytes32 swapId = dvpSwap.createSwap(
            user2,
            address(tokenA),
            address(tokenB),
            amountToSend,
            amountToReceive,
            timelock,
            HASHLOCK
        );
        vm.stopPrank();
        
        assertTrue(dvpSwap.swapExists(swapId));
        
        DvPSwap.Swap memory swap = dvpSwap.getSwap(swapId);
        assertEq(swap.amountToSend, amountToSend);
        assertEq(swap.amountToReceive, amountToReceive);
    }
    
    function testFuzz_CreateAndClaimWithVaryingTimelock(uint256 timelockDuration) public {
        // Bound inputs to reasonable values (between 1 minute and 30 days)
        vm.assume(timelockDuration >= 1 minutes && timelockDuration <= 30 days);
        
        uint256 timelock = block.timestamp + timelockDuration;
        
        vm.startPrank(user1);
        tokenA.approve(address(dvpSwap), AMOUNT_A);
        
        bytes32 swapId = dvpSwap.createSwap(
            user2,
            address(tokenA),
            address(tokenB),
            AMOUNT_A,
            AMOUNT_B,
            timelock,
            HASHLOCK
        );
        vm.stopPrank();
        
        // Claim swap
        vm.startPrank(user2);
        tokenB.approve(address(dvpSwap), AMOUNT_B);
        bool claimed = dvpSwap.claimSwap(swapId, SECRET);
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
    ) internal pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                sender,
                receiver,
                tokenToSend,
                tokenToReceive,
                amountToSend,
                amountToReceive,
                timelock,
                hashlock
            )
        );
    }
} 