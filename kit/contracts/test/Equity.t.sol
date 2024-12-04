// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { Equity } from "../contracts/Equity.sol";

contract EquityTest is Test {
    Equity public equity;
    address public owner;
    address public user1;
    address public user2;
    address public spender;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Paused(address account);
    event Unpaused(address account);
    event UserBlocked(address indexed account);
    event UserUnblocked(address indexed account);
    event CustodianOperation(address indexed custodian, address indexed from, address indexed to, uint256 amount);

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        spender = makeAddr("spender");

        equity = new Equity("Test Equity Token", "TEST", "Common", "Series A", owner);

        // Fund test accounts
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(spender, 100 ether);
    }

    // Basic Token Functionality Tests
    function test_InitialState() public view {
        assertEq(equity.name(), "Test Equity Token");
        assertEq(equity.symbol(), "TEST");
        assertEq(equity.equityClass(), "Common");
        assertEq(equity.equityCategory(), "Series A");
        assertEq(equity.owner(), owner);
        assertEq(equity.totalSupply(), 0);
    }

    function test_Mint() public {
        uint256 amount = 1000e18;
        equity.mint(user1, amount);
        assertEq(equity.balanceOf(user1), amount);
        assertEq(equity.totalSupply(), amount);
    }

    function testFail_MintNonOwner() public {
        vm.prank(user1);
        equity.mint(user1, 1000e18);
    }

    // ERC20 Standard Tests
    function test_Transfer() public {
        uint256 amount = 1000e18;
        equity.mint(user1, amount);

        vm.prank(user1);
        equity.transfer(user2, 500e18);

        assertEq(equity.balanceOf(user1), 500e18);
        assertEq(equity.balanceOf(user2), 500e18);
    }

    function test_Approve() public {
        vm.prank(user1);
        equity.approve(spender, 1000e18);
        assertEq(equity.allowance(user1, spender), 1000e18);
    }

    function test_TransferFrom() public {
        uint256 amount = 1000e18;
        equity.mint(user1, amount);

        vm.prank(user1);
        equity.approve(spender, amount);

        vm.prank(spender);
        equity.transferFrom(user1, user2, 500e18);

        assertEq(equity.balanceOf(user1), 500e18);
        assertEq(equity.balanceOf(user2), 500e18);
    }

    // Burnable Tests
    function test_Burn() public {
        uint256 amount = 1000e18;
        equity.mint(user1, amount);

        vm.prank(user1);
        equity.burn(500e18);

        assertEq(equity.balanceOf(user1), 500e18);
        assertEq(equity.totalSupply(), 500e18);
    }

    // Pausable Tests
    function test_PauseUnpause() public {
        equity.pause();
        assertTrue(equity.paused());

        equity.unpause();
        assertFalse(equity.paused());
    }

    function testFail_TransferWhenPaused() public {
        uint256 amount = 1000e18;
        equity.mint(user1, amount);
        equity.pause();

        vm.prank(user1);
        equity.transfer(user2, 500e18);
    }

    // Blocklist Tests
    function test_Blocklist() public {
        uint256 amount = 1000e18;
        equity.mint(user1, amount);

        // Test blocking
        equity.blockUser(user1);
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("ERC20Blocked(address)", user1));
        equity.transfer(user2, 500e18);

        // Test unblocking
        equity.unblockUser(user1);
        vm.prank(user1);
        equity.transfer(user2, 500e18);
        assertEq(equity.balanceOf(user2), 500e18);
    }

    function testFail_BlockedTransfer() public {
        uint256 amount = 1000e18;
        equity.mint(user1, amount);
        equity.blockUser(user1);

        vm.prank(user1);
        equity.transfer(user2, 500e18);
    }

    // ERC20Custodian tests
    function test_CustodianFunctionality() public {
        equity.mint(user1, 100);

        // Freeze all tokens
        equity.freeze(user1, 100);
        assertEq(equity.frozen(user1), 100);

        // Try to transfer the frozen amount
        vm.expectRevert();
        vm.prank(user1);
        equity.transfer(user2, 100);

        // Unfreeze and verify
        equity.unfreeze(user1, 100);
        assertEq(equity.frozen(user1), 0);

        // Now transfer should work
        vm.prank(user1);
        equity.transfer(user2, 100);
        assertEq(equity.balanceOf(user2), 100);
    }

    // Voting Tests
    function test_DelegateVoting() public {
        uint256 amount = 1000e18;
        equity.mint(user1, amount);

        vm.prank(user1);
        equity.delegate(user2);

        assertEq(equity.delegates(user1), user2);
        assertEq(equity.getVotes(user2), amount);
    }

    function test_VotingPowerTransfer() public {
        uint256 amount = 1000e18;
        equity.mint(user1, amount);

        vm.prank(user1);
        equity.delegate(user1);
        assertEq(equity.getVotes(user1), amount);

        vm.prank(user1);
        equity.transfer(user2, 500e18);
        assertEq(equity.getVotes(user1), 500e18);
    }

    // Permit Tests
    function test_Permit() public {
        uint256 privateKey = 0xA11CE;
        address signer = vm.addr(privateKey);
        equity.mint(signer, 1000e18);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            privateKey,
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    equity.DOMAIN_SEPARATOR(),
                    keccak256(
                        abi.encode(
                            keccak256(
                                "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
                            ),
                            signer,
                            spender,
                            1000e18,
                            0,
                            block.timestamp + 1 hours
                        )
                    )
                )
            )
        );

        equity.permit(signer, spender, 1000e18, block.timestamp + 1 hours, v, r, s);

        assertEq(equity.allowance(signer, spender), 1000e18);
    }

    // Clock Mode Tests
    function test_ClockMode() public view {
        assertEq(equity.CLOCK_MODE(), "mode=timestamp");
        assertEq(equity.clock(), uint48(block.timestamp));
    }

    // Events Tests
    function test_TransferEvent() public {
        uint256 amount = 1000e18;
        equity.mint(user1, amount);

        vm.expectEmit(true, true, false, true);
        emit Transfer(user1, user2, 500e18);

        vm.prank(user1);
        equity.transfer(user2, 500e18);
    }

    function test_ApprovalEvent() public {
        vm.expectEmit(true, true, false, true);
        emit Approval(user1, spender, 1000e18);

        vm.prank(user1);
        equity.approve(spender, 1000e18);
    }

    function test_PauseEvent() public {
        vm.expectEmit(true, false, false, true);
        emit Paused(owner);

        equity.pause();
    }

    function test_BlocklistEvent() public {
        vm.expectEmit(true, false, false, true);
        emit UserBlocked(user1);

        equity.blockUser(user1);
    }

    function test_UnblockEvent() public {
        equity.blockUser(user1);

        vm.expectEmit(true, false, false, true);
        emit UserUnblocked(user1);

        equity.unblockUser(user1);
    }
}
