// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { Bond } from "../contracts/Bond.sol";

contract BondTest is Test {
    Bond public bond;
    address public owner;
    address public user1;
    address public user2;
    uint256 public constant INITIAL_SUPPLY = 1000e18;
    uint256 public maturityDate;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Paused(address account);
    event Unpaused(address account);
    event BondMatured(uint256 timestamp);

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        maturityDate = block.timestamp + 365 days;

        vm.startPrank(owner);
        bond = new Bond("Test Bond", "TBOND", owner, maturityDate);
        bond.mint(owner, INITIAL_SUPPLY);
        vm.stopPrank();
    }

    // Basic ERC20 functionality tests
    function test_InitialState() public view {
        assertEq(bond.name(), "Test Bond");
        assertEq(bond.symbol(), "TBOND");
        assertEq(bond.decimals(), 18);
        assertEq(bond.totalSupply(), INITIAL_SUPPLY);
        assertEq(bond.balanceOf(owner), INITIAL_SUPPLY);
        assertEq(bond.maturityDate(), maturityDate);
        assertFalse(bond.isMatured());
    }

    function test_Transfer() public {
        uint256 amount = 100e18;
        vm.prank(owner);
        bond.transfer(user1, amount);

        assertEq(bond.balanceOf(user1), amount);
        assertEq(bond.balanceOf(owner), INITIAL_SUPPLY - amount);
    }

    function test_TransferFrom() public {
        uint256 amount = 100e18;
        vm.startPrank(owner);
        bond.approve(user1, amount);
        vm.stopPrank();

        vm.prank(user1);
        bond.transferFrom(owner, user2, amount);

        assertEq(bond.balanceOf(user2), amount);
        assertEq(bond.balanceOf(owner), INITIAL_SUPPLY - amount);
    }

    // Ownable functionality tests
    function test_OnlyOwnerCanMint() public {
        vm.prank(owner);
        bond.mint(user1, 100e18);
        assertEq(bond.balanceOf(user1), 100e18);

        vm.prank(user1);
        vm.expectRevert();
        bond.mint(user1, 100e18);
    }

    function test_OwnershipTransfer() public {
        vm.prank(owner);
        bond.transferOwnership(user1);
        assertEq(bond.owner(), user1);
    }

    // Pausable functionality tests
    function test_PauseUnpause() public {
        vm.startPrank(owner);
        bond.pause();
        assertTrue(bond.paused());

        vm.expectRevert();
        bond.transfer(user1, 100e18);

        bond.unpause();
        assertFalse(bond.paused());

        bond.transfer(user1, 100e18);
        assertEq(bond.balanceOf(user1), 100e18);
        vm.stopPrank();
    }

    function test_OnlyOwnerCanPause() public {
        vm.prank(user1);
        vm.expectRevert();
        bond.pause();

        vm.prank(owner);
        bond.pause();
        assertTrue(bond.paused());
    }

    // Burnable functionality tests
    function test_Burn() public {
        uint256 burnAmount = 100e18;
        vm.prank(owner);
        bond.burn(burnAmount);

        assertEq(bond.totalSupply(), INITIAL_SUPPLY - burnAmount);
        assertEq(bond.balanceOf(owner), INITIAL_SUPPLY - burnAmount);
    }

    function test_BurnFrom() public {
        uint256 burnAmount = 100e18;
        vm.prank(owner);
        bond.approve(user1, burnAmount);

        vm.prank(user1);
        bond.burnFrom(owner, burnAmount);

        assertEq(bond.totalSupply(), INITIAL_SUPPLY - burnAmount);
        assertEq(bond.balanceOf(owner), INITIAL_SUPPLY - burnAmount);
    }

    // Blocklist functionality tests
    function test_Blocklist() public {
        vm.startPrank(owner);
        bond.blockUser(user1);
        assertTrue(bond.blocked(user1));

        vm.expectRevert();
        bond.transfer(user1, 100e18);

        bond.unblockUser(user1);
        assertFalse(bond.blocked(user1));

        bond.transfer(user1, 100e18);
        assertEq(bond.balanceOf(user1), 100e18);
        vm.stopPrank();
    }

    // ERC20Custodian tests
    function test_CustodianFunctionality() public {
        bond.mint(user1, 100);

        // Freeze all tokens
        bond.freeze(user1, 100);
        assertEq(bond.frozen(user1), 100);

        // Try to transfer the frozen amount
        vm.expectRevert();
        vm.prank(user1);
        bond.transfer(user2, 100);

        // Unfreeze and verify
        bond.unfreeze(user1, 100);
        assertEq(bond.frozen(user1), 0);

        // Now transfer should work
        vm.prank(user1);
        bond.transfer(user2, 100);
        assertEq(bond.balanceOf(user2), 100);
    }

    // Maturity functionality tests
    function test_Mature() public {
        vm.warp(maturityDate + 1);

        vm.prank(owner);
        bond.mature();
        assertTrue(bond.isMatured());

        vm.expectRevert();
        vm.prank(owner);
        bond.transfer(user1, 100e18);
    }

    function test_CannotMatureBeforeMaturityDate() public {
        vm.prank(owner);
        vm.expectRevert();
        bond.mature();
    }

    function test_CannotMatureTwice() public {
        vm.warp(maturityDate + 1);

        vm.startPrank(owner);
        bond.mature();
        vm.expectRevert();
        bond.mature();
        vm.stopPrank();
    }

    // Permit functionality tests
    function test_Permit() public {
        uint256 privateKey = 0xA11CE;
        address signer = vm.addr(privateKey);

        vm.prank(owner);
        bond.mint(signer, 1000e18);

        uint256 deadline = block.timestamp + 1 days;
        uint256 nonce = bond.nonces(signer);

        bytes32 DOMAIN_SEPARATOR = bond.DOMAIN_SEPARATOR();
        bytes32 permitTypehash =
            keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

        bytes32 structHash = keccak256(abi.encode(permitTypehash, signer, user1, 1000e18, nonce, deadline));

        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, digest);

        bond.permit(signer, user1, 1000e18, deadline, v, r, s);
        assertEq(bond.allowance(signer, user1), 1000e18);
    }

    // Fuzz tests
    function testFuzz_Transfer(uint256 amount) public {
        vm.assume(amount <= INITIAL_SUPPLY);

        vm.prank(owner);
        bond.transfer(user1, amount);

        assertEq(bond.balanceOf(user1), amount);
        assertEq(bond.balanceOf(owner), INITIAL_SUPPLY - amount);
    }

    function testFuzz_Approve(uint256 amount) public {
        vm.prank(owner);
        bond.approve(user1, amount);
        assertEq(bond.allowance(owner, user1), amount);
    }
}
