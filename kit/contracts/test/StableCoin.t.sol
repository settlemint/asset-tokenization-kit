// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test, console2 } from "forge-std/Test.sol";
import { StableCoin } from "../contracts/StableCoin.sol";

contract StableCoinTest is Test {
    StableCoin public stableCoin;
    address public owner;
    address public user1;
    address public user2;
    address public spender;
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10 ** 18;
    uint48 public constant COLLATERAL_LIVENESS = 7 days;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        spender = makeAddr("spender");

        stableCoin = new StableCoin("StableCoin", "STBL", owner, COLLATERAL_LIVENESS);

        // Set initial collateral to allow minting
        stableCoin.updateCollateral(INITIAL_SUPPLY);
    }

    // Basic ERC20 functionality tests
    function test_InitialState() public view {
        assertEq(stableCoin.name(), "StableCoin");
        assertEq(stableCoin.symbol(), "STBL");
        assertEq(stableCoin.decimals(), 18);
        assertEq(stableCoin.totalSupply(), 0);
        assertEq(stableCoin.owner(), owner);
    }

    function test_Mint() public {
        stableCoin.mint(user1, INITIAL_SUPPLY);
        assertEq(stableCoin.balanceOf(user1), INITIAL_SUPPLY);
        assertEq(stableCoin.totalSupply(), INITIAL_SUPPLY);
    }

    function testFail_MintNonOwner() public {
        vm.prank(user1);
        stableCoin.mint(user1, INITIAL_SUPPLY);
    }

    // ERC20Burnable tests
    function test_Burn() public {
        stableCoin.mint(user1, INITIAL_SUPPLY);

        vm.prank(user1);
        stableCoin.burn(100);

        assertEq(stableCoin.balanceOf(user1), INITIAL_SUPPLY - 100);
    }

    function test_BurnFrom() public {
        stableCoin.mint(user1, INITIAL_SUPPLY);

        vm.prank(user1);
        stableCoin.approve(spender, 100);

        vm.prank(spender);
        stableCoin.burnFrom(user1, 100);

        assertEq(stableCoin.balanceOf(user1), INITIAL_SUPPLY - 100);
    }

    // ERC20Pausable tests
    function test_PauseUnpause() public {
        stableCoin.mint(user1, INITIAL_SUPPLY);

        stableCoin.pause();
        assertTrue(stableCoin.paused());

        vm.expectRevert();
        vm.prank(user1);
        stableCoin.transfer(user2, 100);

        stableCoin.unpause();
        assertFalse(stableCoin.paused());

        vm.prank(user1);
        stableCoin.transfer(user2, 100);
        assertEq(stableCoin.balanceOf(user2), 100);
    }

    // ERC20Blocklist tests
    function test_Blocklist() public {
        stableCoin.mint(user1, INITIAL_SUPPLY);

        stableCoin.blockUser(user1);
        assertTrue(stableCoin.blocked(user1));

        vm.expectRevert();
        vm.prank(user1);
        stableCoin.transfer(user2, 100);

        stableCoin.unblockUser(user1);
        assertFalse(stableCoin.blocked(user1));

        vm.prank(user1);
        stableCoin.transfer(user2, 100);
        assertEq(stableCoin.balanceOf(user2), 100);
    }

    // ERC20Collateral tests
    function test_CollateralManagement() public {
        uint256 collateralAmount = 1_000_000;
        stableCoin.updateCollateral(collateralAmount);

        (uint256 amount, uint48 timestamp) = stableCoin.collateral();
        assertEq(amount, collateralAmount);
        assertEq(timestamp, block.timestamp);

        assertEq(stableCoin.collateral(), collateralAmount);
    }

    function testFail_UpdateCollateralNonOwner() public {
        vm.prank(user1);
        stableCoin.updateCollateral(1_000_000);
    }

    // ERC20Custodian tests
    function test_CustodianFunctionality() public {
        stableCoin.mint(user1, 100);

        // Freeze all tokens
        stableCoin.freeze(user1, 100);
        assertEq(stableCoin.frozen(user1), 100);

        // Try to transfer the frozen amount
        vm.expectRevert();
        vm.prank(user1);
        stableCoin.transfer(user2, 100);

        // Unfreeze and verify
        stableCoin.unfreeze(user1, 100);
        assertEq(stableCoin.frozen(user1), 0);

        // Now transfer should work
        vm.prank(user1);
        stableCoin.transfer(user2, 100);
        assertEq(stableCoin.balanceOf(user2), 100);
    }

    // ERC20Permit tests
    function test_Permit() public {
        uint256 privateKey = 0xA11CE;
        address signer = vm.addr(privateKey);

        stableCoin.mint(signer, INITIAL_SUPPLY);

        uint256 deadline = block.timestamp + 1 hours;
        uint256 nonce = stableCoin.nonces(signer);

        bytes32 DOMAIN_SEPARATOR = stableCoin.DOMAIN_SEPARATOR();

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            privateKey,
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    DOMAIN_SEPARATOR,
                    keccak256(
                        abi.encode(
                            keccak256(
                                "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
                            ),
                            signer,
                            spender,
                            100,
                            nonce,
                            deadline
                        )
                    )
                )
            )
        );

        stableCoin.permit(signer, spender, 100, deadline, v, r, s);
        assertEq(stableCoin.allowance(signer, spender), 100);
    }

    // Transfer and approval tests
    function test_TransferAndApproval() public {
        stableCoin.mint(user1, INITIAL_SUPPLY);

        vm.prank(user1);
        stableCoin.approve(spender, 100);
        assertEq(stableCoin.allowance(user1, spender), 100);

        vm.prank(spender);
        stableCoin.transferFrom(user1, user2, 50);
        assertEq(stableCoin.balanceOf(user2), 50);
        assertEq(stableCoin.allowance(user1, spender), 50);
    }

    receive() external payable { }
}
