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
    uint8 public constant DECIMALS = 8;
    string public constant VALID_ISIN = "US0378331005";

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Paused(address account);
    event Unpaused(address account);
    event UserBlocked(address indexed account);
    event UserUnblocked(address indexed account);
    event CustodianOperation(address indexed custodian, address indexed from, address indexed to, uint256 amount);

    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        spender = makeAddr("spender");

        vm.prank(owner);
        equity = new Equity("Test Equity Token", "TEST", DECIMALS, owner, VALID_ISIN, "Common", "Series A");

        // Fund test accounts
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(spender, 100 ether);
    }

    // Basic Token Functionality Tests
    function test_InitialState() public view {
        assertEq(equity.name(), "Test Equity Token");
        assertEq(equity.symbol(), "TEST");
        assertEq(equity.decimals(), DECIMALS);
        assertEq(equity.equityClass(), "Common");
        assertEq(equity.equityCategory(), "Series A");
        assertEq(equity.isin(), VALID_ISIN);
        assertTrue(equity.hasRole(equity.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(equity.hasRole(equity.SUPPLY_MANAGEMENT_ROLE(), owner));
        assertTrue(equity.hasRole(equity.USER_MANAGEMENT_ROLE(), owner));
        assertEq(equity.totalSupply(), 0);
    }

    function test_DifferentDecimals() public {
        uint8[] memory decimalValues = new uint8[](4);
        decimalValues[0] = 0; // Test zero decimals
        decimalValues[1] = 6;
        decimalValues[2] = 8;
        decimalValues[3] = 18; // Test max decimals

        for (uint256 i = 0; i < decimalValues.length; i++) {
            vm.prank(owner);
            Equity newEquity =
                new Equity("Test Equity Token", "TEST", decimalValues[i], owner, VALID_ISIN, "Common", "Series A");
            assertEq(newEquity.decimals(), decimalValues[i]);
        }
    }

    function test_RevertOnInvalidDecimals() public {
        vm.startPrank(owner);
        vm.expectRevert(abi.encodeWithSelector(Equity.InvalidDecimals.selector, 19));
        new Equity("Test Equity Token", "TEST", 19, owner, VALID_ISIN, "Common", "Series A");
        vm.stopPrank();
    }

    function test_RevertOnInvalidISIN() public {
        vm.startPrank(owner);

        // Test with empty ISIN
        vm.expectRevert(Equity.InvalidISIN.selector);
        new Equity("Test Equity Token", "TEST", DECIMALS, owner, "", "Common", "Series A");

        // Test with ISIN that's too short
        vm.expectRevert(Equity.InvalidISIN.selector);
        new Equity("Test Equity Token", "TEST", DECIMALS, owner, "US03783310", "Common", "Series A");

        // Test with ISIN that's too long
        vm.expectRevert(Equity.InvalidISIN.selector);
        new Equity("Test Equity Token", "TEST", DECIMALS, owner, "US0378331005XX", "Common", "Series A");

        vm.stopPrank();
    }

    function test_OnlySupplyManagementCanMint() public {
        uint256 amount = 1000e18;

        // Have owner (who has SUPPLY_MANAGEMENT_ROLE) do the minting
        vm.prank(owner);
        equity.mint(user1, amount);

        assertEq(equity.balanceOf(user1), amount);
        assertEq(equity.totalSupply(), amount);

        // Test that non-authorized user can't mint
        vm.prank(user1);
        vm.expectRevert();
        equity.mint(user1, amount);
    }

    function test_RoleManagement() public {
        vm.startPrank(owner);
        equity.grantRole(equity.SUPPLY_MANAGEMENT_ROLE(), user1);
        assertTrue(equity.hasRole(equity.SUPPLY_MANAGEMENT_ROLE(), user1));

        equity.revokeRole(equity.SUPPLY_MANAGEMENT_ROLE(), user1);
        assertFalse(equity.hasRole(equity.SUPPLY_MANAGEMENT_ROLE(), user1));
        vm.stopPrank();
    }

    // ERC20 Standard Tests
    function test_Transfer() public {
        uint256 amount = 1000e18;

        // Have owner do the minting since they have SUPPLY_MANAGEMENT_ROLE
        vm.prank(owner);
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
        vm.prank(owner);
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
        vm.prank(owner);
        equity.mint(user1, amount);

        vm.prank(user1);
        equity.burn(500e18);

        assertEq(equity.balanceOf(user1), 500e18);
        assertEq(equity.totalSupply(), 500e18);
    }

    // Pausable Tests
    function test_OnlyAdminCanPause() public {
        bytes32 role = equity.DEFAULT_ADMIN_ROLE();

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("AccessControlUnauthorizedAccount(address,bytes32)", user1, role));
        equity.pause();

        vm.prank(owner);
        equity.pause();
        assertTrue(equity.paused());
    }

    function testFail_TransferWhenPaused() public {
        uint256 amount = 1000e18;
        vm.prank(owner);
        equity.mint(user1, amount);
        equity.pause();

        vm.prank(user1);
        equity.transfer(user2, 500e18);
    }

    // Blocklist Tests
    function test_OnlyUserManagementCanBlock() public {
        uint256 amount = 1000e18;
        vm.prank(owner);
        equity.mint(user1, amount);

        // Test that non-authorized user can't block
        vm.startPrank(user2); // Start pranking as user2
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user2, equity.USER_MANAGEMENT_ROLE()
            )
        );
        equity.blockUser(user1);
        vm.stopPrank(); // Stop pranking as user2

        // Test successful blocking by owner
        vm.prank(owner);
        equity.blockUser(user1);
        assertTrue(equity.blocked(user1));

        // Test that blocked user can't transfer
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("ERC20Blocked(address)", user1));
        equity.transfer(user2, 500e18);

        // Test unblocking and subsequent transfer
        vm.prank(owner);
        equity.unblockUser(user1);
        vm.prank(user1);
        equity.transfer(user2, 500e18);
        assertEq(equity.balanceOf(user2), 500e18);
    }

    function testFail_BlockedTransfer() public {
        uint256 amount = 1000e18;
        vm.prank(owner);
        equity.mint(user1, amount);
        equity.blockUser(user1);

        vm.prank(user1);
        equity.transfer(user2, 500e18);
    }

    // ERC20Custodian tests
    function test_OnlyUserManagementCanFreeze() public {
        vm.prank(owner);
        equity.mint(user1, 100);

        vm.startPrank(user2); // Start pranking as user2
        vm.expectRevert(abi.encodeWithSignature("ERC20NotCustodian()"));
        equity.freeze(user1, 100);
        vm.stopPrank(); // Stop pranking as user2

        vm.prank(owner);
        equity.freeze(user1, 100);
        assertEq(equity.frozen(user1), 100);

        vm.expectRevert();
        vm.prank(user1);
        equity.transfer(user2, 100);

        vm.prank(owner);
        equity.unfreeze(user1, 100);
        assertEq(equity.frozen(user1), 0);

        vm.prank(user1);
        equity.transfer(user2, 100);
        assertEq(equity.balanceOf(user2), 100);
    }

    // Voting Tests
    function test_DelegateVoting() public {
        uint256 amount = 1000e18;
        vm.prank(owner);
        equity.mint(user1, amount);

        vm.prank(user1);
        equity.delegate(user2);

        assertEq(equity.delegates(user1), user2);
        assertEq(equity.getVotes(user2), amount);
    }

    function test_VotingPowerTransfer() public {
        uint256 amount = 1000e18;
        vm.prank(owner);
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
        vm.prank(owner);
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
        vm.prank(owner);
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

        vm.prank(owner);
        equity.pause();
    }

    function test_BlocklistEvent() public {
        vm.expectEmit(true, false, false, true);
        emit UserBlocked(user1);

        vm.prank(owner);
        equity.blockUser(user1);
    }

    function test_UnblockEvent() public {
        vm.prank(owner);
        equity.blockUser(user1);

        vm.expectEmit(true, false, false, true);
        emit UserUnblocked(user1);

        vm.prank(owner);
        equity.unblockUser(user1);
    }
}
