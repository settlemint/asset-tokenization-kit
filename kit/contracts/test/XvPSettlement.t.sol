// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { XvPSettlement } from "../contracts/XvPSettlement.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Forwarder } from "../contracts/Forwarder.sol";
import { ERC20Mock } from "./mocks/ERC20Mock.sol";

contract XvPSettlementTest is Test {
    XvPSettlement public xvpSettlement;
    Forwarder public forwarder;
    ERC20Mock public tokenA;
    ERC20Mock public tokenB;

    address public admin;
    address public user1;
    address public user2;

    uint256 public constant AMOUNT_A = 1000 * 10 ** 18;
    uint256 public constant AMOUNT_B = 500 * 10 ** 18;

    // Events from XvPSettlement to verify
    event XvPSettlementCreated(uint256 indexed id, address indexed creator, uint256 cutoffDate);

    event XvPSettlementApproved(uint256 indexed id, address indexed party);

    event XvPSettlementApprovalRevoked(uint256 indexed id, address indexed party);

    event XvPSettlementExecuted(uint256 indexed id, address indexed executor);

    event XvPSettlementCancelled(uint256 indexed id, address indexed executor);

    function setUp() public {
        admin = makeAddr("admin");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Deploy tokens
        tokenA = new ERC20Mock("Token A", "TKNA", 18);
        tokenB = new ERC20Mock("Token B", "TKNB", 18);

        // Mint tokens to users
        tokenA.mint(user1, AMOUNT_A * 10);
        tokenB.mint(user2, AMOUNT_B * 10);

        // Deploy forwarder
        forwarder = new Forwarder();

        // Deploy XvPSettlement
        vm.prank(admin);
        xvpSettlement = new XvPSettlement(address(forwarder));
    }

    function test_InitialState() public view {
        assertTrue(xvpSettlement.hasRole(xvpSettlement.DEFAULT_ADMIN_ROLE(), admin));
        assertFalse(xvpSettlement.paused());
    }

    // ========================================================================
    // Tests for XvP Settlement with Flow structure and allowance checks
    // ========================================================================

    function test_SuccessfulSwapWithSingleFlow() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Setup tokens
        ERC20Mock tokenC = new ERC20Mock("Token C", "TKNC", 18);
        tokenC.mint(alice, 1000 * 10 ** 18);

        // Test data
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](1);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenC), from: alice, to: bob, amount: 100 * 10 ** 18 });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Step 1: Create settlement
        vm.startPrank(alice);
        uint256 settlementId = xvpSettlement.create(flows, cutoffDate, autoExecute);
        vm.stopPrank();

        // Step 2: Approve token and settlement
        vm.startPrank(alice);

        // First approve the ERC20 token
        tokenC.approve(address(xvpSettlement), 100 * 10 ** 18);

        // Then approve the settlement
        bool approved = xvpSettlement.approve(settlementId);
        assertTrue(approved, "Settlement should be approved");

        vm.stopPrank();

        // Verify approval
        assertTrue(xvpSettlement.isFullyApproved(settlementId), "Settlement should be fully approved");

        // Step 3: Execute settlement
        vm.prank(bob); // Anyone can execute (in this case bob)
        bool executed = xvpSettlement.execute(settlementId);
        assertTrue(executed, "Settlement execution should succeed");

        // Verify token transfer
        assertEq(tokenC.balanceOf(bob), 100 * 10 ** 18, "Bob should have received tokens");
        assertEq(tokenC.balanceOf(alice), 900 * 10 ** 18, "Alice should have sent tokens");
    }

    function test_SwapApprovalFailsWithInsufficientAllowance() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Setup tokens
        ERC20Mock tokenD = new ERC20Mock("Token D", "TKND", 18);
        tokenD.mint(alice, 1000 * 10 ** 18);

        // Test data
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](1);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenD), from: alice, to: bob, amount: 100 * 10 ** 18 });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Step 1: Create settlement
        vm.startPrank(alice);
        uint256 settlementId = xvpSettlement.create(flows, cutoffDate, autoExecute);

        // Step 2: Try to approve the settlement WITHOUT approving token allowance first
        // This should revert with InsufficientAllowance
        vm.expectRevert(
            abi.encodeWithSelector(
                XvPSettlement.InsufficientAllowance.selector,
                address(tokenD),
                alice,
                address(xvpSettlement),
                100 * 10 ** 18,
                0
            )
        );
        xvpSettlement.approve(settlementId);

        // Step 3: Approve insufficient allowance and try again
        tokenD.approve(address(xvpSettlement), 50 * 10 ** 18); // Only half of required amount

        vm.expectRevert(
            abi.encodeWithSelector(
                XvPSettlement.InsufficientAllowance.selector,
                address(tokenD),
                alice,
                address(xvpSettlement),
                100 * 10 ** 18,
                50 * 10 ** 18
            )
        );
        xvpSettlement.approve(settlementId);

        // Step 4: Approve the full amount and verify approval succeeds
        tokenD.approve(address(xvpSettlement), 100 * 10 ** 18);
        bool approved = xvpSettlement.approve(settlementId);
        assertTrue(approved, "Settlement approval should succeed with sufficient allowance");
        vm.stopPrank();
    }

    function test_MultiFlowSwap() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Setup tokens
        ERC20Mock tokenX = new ERC20Mock("Token X", "TKNX", 18);
        ERC20Mock tokenY = new ERC20Mock("Token Y", "TKNY", 18);
        tokenX.mint(alice, 1000 * 10 ** 18);
        tokenY.mint(bob, 500 * 10 ** 18);

        // Test data - Bidirectional swap between Alice and Bob
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](2);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenX), from: alice, to: bob, amount: 200 * 10 ** 18 });
        flows[1] = XvPSettlement.Flow({ asset: address(tokenY), from: bob, to: alice, amount: 100 * 10 ** 18 });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Step 1: Create settlement (alice creates)
        vm.prank(alice);
        uint256 settlementId = xvpSettlement.create(flows, cutoffDate, autoExecute);

        // Step 2: Approve tokens and settlement
        // Alice approves
        vm.startPrank(alice);
        tokenX.approve(address(xvpSettlement), 200 * 10 ** 18);
        xvpSettlement.approve(settlementId);
        vm.stopPrank();

        // Bob approves
        vm.startPrank(bob);
        tokenY.approve(address(xvpSettlement), 100 * 10 ** 18);
        xvpSettlement.approve(settlementId);
        vm.stopPrank();

        // Verify fully approved
        assertTrue(xvpSettlement.isFullyApproved(settlementId));

        // Step 3: Execute settlement
        vm.prank(alice); // Alice executes
        bool executed = xvpSettlement.execute(settlementId);
        assertTrue(executed, "Settlement execution should succeed");

        // Verify token transfers
        assertEq(tokenX.balanceOf(bob), 200 * 10 ** 18, "Bob should have received tokenX");
        assertEq(tokenX.balanceOf(alice), 800 * 10 ** 18, "Alice should have sent tokenX");
        assertEq(tokenY.balanceOf(alice), 100 * 10 ** 18, "Alice should have received tokenY");
        assertEq(tokenY.balanceOf(bob), 400 * 10 ** 18, "Bob should have sent tokenY");
    }

    function test_AutoExecution() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Setup tokens
        ERC20Mock tokenZ = new ERC20Mock("Token Z", "TKNZ", 18);
        tokenZ.mint(alice, 1000 * 10 ** 18);

        // Test data
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](1);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenZ), from: alice, to: bob, amount: 300 * 10 ** 18 });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = true;

        // Step 1: Create settlement with auto-execution
        vm.prank(alice);
        uint256 settlementId = xvpSettlement.create(flows, cutoffDate, autoExecute);

        // Step 2: Approve token and settlement (should trigger auto-execution)
        vm.startPrank(alice);
        tokenZ.approve(address(xvpSettlement), 300 * 10 ** 18);
        xvpSettlement.approve(settlementId);
        vm.stopPrank();

        // Verify token transfer occurred from auto-execution
        assertEq(tokenZ.balanceOf(bob), 300 * 10 ** 18, "Bob should have received tokens");
        assertEq(tokenZ.balanceOf(alice), 700 * 10 ** 18, "Alice should have sent tokens");
    }

    function test_RevokeApproval() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Setup tokens
        ERC20Mock tokenR = new ERC20Mock("Token R", "TKNR", 18);
        tokenR.mint(alice, 1000 * 10 ** 18);

        // Test data
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](1);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenR), from: alice, to: bob, amount: 150 * 10 ** 18 });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Step 1: Create settlement
        vm.prank(alice);
        uint256 settlementId = xvpSettlement.create(flows, cutoffDate, autoExecute);

        // Step 2: Approve token and settlement
        vm.startPrank(alice);
        tokenR.approve(address(xvpSettlement), 150 * 10 ** 18);
        xvpSettlement.approve(settlementId);

        // Verify approval
        assertTrue(xvpSettlement.isFullyApproved(settlementId), "Settlement should be fully approved");

        // Step 3: Revoke approval
        vm.expectEmit(true, true, false, false);
        emit XvPSettlementApprovalRevoked(settlementId, alice);
        xvpSettlement.revokeApproval(settlementId);
        vm.stopPrank();

        // Verify approval is revoked
        assertFalse(xvpSettlement.isFullyApproved(settlementId), "Settlement should not be fully approved");

        // Should not be able to execute
        vm.expectRevert(XvPSettlement.XvPSettlementNotApproved.selector);
        xvpSettlement.execute(settlementId);
    }

    function test_ExpireSettlement() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Setup tokens
        ERC20Mock tokenE = new ERC20Mock("Token E", "TKNE", 18);
        tokenE.mint(alice, 1000 * 10 ** 18);

        // Test data
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](1);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenE), from: alice, to: bob, amount: 400 * 10 ** 18 });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Step 1: Create settlement
        vm.prank(alice);
        uint256 settlementId = xvpSettlement.create(flows, cutoffDate, autoExecute);

        // Step 2: Fast forward time past cutoff date
        vm.warp(block.timestamp + 2 days);

        // Step 3: Try to approve - should revert because expired
        vm.startPrank(alice);
        tokenE.approve(address(xvpSettlement), 400 * 10 ** 18);
        vm.expectRevert(XvPSettlement.XvPSettlementExpired.selector);
        xvpSettlement.approve(settlementId);
        vm.stopPrank();

        // Step 4: Try to execute - should revert because expired
        vm.expectRevert(XvPSettlement.XvPSettlementExpired.selector);
        xvpSettlement.execute(settlementId);
    }

    function test_CancelSettlement() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Setup tokens
        ERC20Mock tokenF = new ERC20Mock("Token F", "TKNF", 18);
        tokenF.mint(alice, 1000 * 10 ** 18);

        // Test data
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](1);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenF), from: alice, to: bob, amount: 250 * 10 ** 18 });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Step 1: Create settlement
        vm.prank(alice);
        uint256 settlementId = xvpSettlement.create(flows, cutoffDate, autoExecute);

        // Step 2: Cancel the settlement as a party involved
        vm.prank(alice);
        vm.expectEmit(true, true, false, false);
        emit XvPSettlementCancelled(settlementId, alice);
        bool cancelled = xvpSettlement.cancel(settlementId);
        assertTrue(cancelled, "Cancel should succeed");

        // Cannot approve or execute a cancelled settlement
        vm.startPrank(alice);
        tokenF.approve(address(xvpSettlement), 250 * 10 ** 18);
        vm.expectRevert(XvPSettlement.XvPSettlementAlreadyCancelled.selector);
        xvpSettlement.approve(settlementId);
        vm.expectRevert(XvPSettlement.XvPSettlementAlreadyCancelled.selector);
        xvpSettlement.execute(settlementId);
        vm.stopPrank();
    }

    function test_OnlyInvolvedCanCancel() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");
        address charlie = makeAddr("charlie"); // Not involved

        // Setup tokens
        ERC20Mock tokenG = new ERC20Mock("Token G", "TKNG", 18);
        tokenG.mint(alice, 1000 * 10 ** 18);

        // Test data
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](1);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenG), from: alice, to: bob, amount: 350 * 10 ** 18 });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Step 1: Create settlement (as Alice)
        vm.prank(alice);
        uint256 settlementId = xvpSettlement.create(flows, cutoffDate, autoExecute);

        // Step 2: Try to cancel as Charlie (not involved)
        vm.prank(charlie);
        vm.expectRevert(XvPSettlement.SenderNotInvolvedInSettlement.selector);
        xvpSettlement.cancel(settlementId);

        // Step 3: Cancel as Alice (involved) should succeed
        vm.prank(alice);
        bool cancelled = xvpSettlement.cancel(settlementId);
        assertTrue(cancelled, "Cancel by involved party should succeed");
    }

    function test_PausePreventsFunctionCalls() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Setup tokens
        ERC20Mock tokenI = new ERC20Mock("Token I", "TKNI", 18);
        tokenI.mint(alice, 1000 * 10 ** 18);

        // Test data
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](1);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenI), from: alice, to: bob, amount: 100 * 10 ** 18 });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Step 1: Pause the contract as admin
        vm.prank(admin);
        xvpSettlement.pause();
        assertTrue(xvpSettlement.paused(), "Contract should be paused");

        // Step 2: Try to create settlement while paused
        vm.prank(alice);
        // Use expectRevert with bytes4 selector instead of string
        vm.expectRevert(
            abi.encodeWithSelector(0xd93c0665) // EnforcedPause() selector
        );
        xvpSettlement.create(flows, cutoffDate, autoExecute);

        // Step 3: Unpause the contract
        vm.prank(admin);
        xvpSettlement.unpause();
        assertFalse(xvpSettlement.paused(), "Contract should be unpaused");

        // Step 4: Create settlement should work when unpaused
        vm.prank(alice);
        uint256 settlementId = xvpSettlement.create(flows, cutoffDate, autoExecute);
        // In XvPSettlement, we can verify the settlement exists by checking
        // that approve doesn't revert with XvPSettlementNotFound
        vm.startPrank(alice);
        tokenI.approve(address(xvpSettlement), 100 * 10 ** 18);
        xvpSettlement.approve(settlementId);
        vm.stopPrank();
    }

    function test_InvalidParameters() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Setup tokens
        ERC20Mock tokenJ = new ERC20Mock("Token J", "TKNJ", 18);
        tokenJ.mint(alice, 1000 * 10 ** 18);

        // Test with invalid cutoff date (in the past)
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](1);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenJ), from: alice, to: bob, amount: 100 * 10 ** 18 });

        vm.warp(10 hours); // Set block.timestamp to 10 hours
        uint256 pastCutoffDate = block.timestamp - 1 hours; // 9 hours (in the past)

        // Should revert with InvalidCutoffDate
        vm.prank(alice);
        vm.expectRevert(XvPSettlement.InvalidCutoffDate.selector);
        xvpSettlement.create(flows, pastCutoffDate, false);

        // Test with zero amount
        XvPSettlement.Flow[] memory flowsZeroAmount = new XvPSettlement.Flow[](1);
        flowsZeroAmount[0] = XvPSettlement.Flow({
            asset: address(tokenJ),
            from: alice,
            to: bob,
            amount: 0 // Zero amount
         });

        // Should revert with ZeroAmount
        vm.prank(alice);
        vm.expectRevert(XvPSettlement.ZeroAmount.selector);
        xvpSettlement.create(flowsZeroAmount, block.timestamp + 1 days, false);

        // Test with zero address
        XvPSettlement.Flow[] memory flowsZeroAddress = new XvPSettlement.Flow[](1);
        flowsZeroAddress[0] = XvPSettlement.Flow({
            asset: address(tokenJ),
            from: alice,
            to: address(0), // Zero address
            amount: 100 * 10 ** 18
        });

        // Should revert with ZeroAddress
        vm.prank(alice);
        vm.expectRevert(XvPSettlement.ZeroAddress.selector);
        xvpSettlement.create(flowsZeroAddress, block.timestamp + 1 days, false);

        // Test with invalid token
        XvPSettlement.Flow[] memory flowsInvalidToken = new XvPSettlement.Flow[](1);
        flowsInvalidToken[0] = XvPSettlement.Flow({
            asset: address(0), // Invalid token (zero address)
            from: alice,
            to: bob,
            amount: 100 * 10 ** 18
        });

        // Should revert with InvalidToken
        vm.prank(alice);
        vm.expectRevert(XvPSettlement.InvalidToken.selector);
        xvpSettlement.create(flowsInvalidToken, block.timestamp + 1 days, false);
    }

    function test_MultiFlowSwapPartialApproval() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Setup tokens
        ERC20Mock tokenP = new ERC20Mock("Token P", "TKNP", 18);
        ERC20Mock tokenQ = new ERC20Mock("Token Q", "TKNQ", 18);
        tokenP.mint(alice, 1000 * 10 ** 18);
        tokenQ.mint(bob, 500 * 10 ** 18);

        // Test data - Bidirectional swap between Alice and Bob
        XvPSettlement.Flow[] memory flows = new XvPSettlement.Flow[](2);
        flows[0] = XvPSettlement.Flow({ asset: address(tokenP), from: alice, to: bob, amount: 200 * 10 ** 18 });
        flows[1] = XvPSettlement.Flow({ asset: address(tokenQ), from: bob, to: alice, amount: 100 * 10 ** 18 });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Step 1: Create settlement (alice creates)
        vm.prank(alice);
        uint256 settlementId = xvpSettlement.create(flows, cutoffDate, autoExecute);

        // Step 2: Alice approves token and settlement
        vm.startPrank(alice);
        tokenP.approve(address(xvpSettlement), 200 * 10 ** 18);
        xvpSettlement.approve(settlementId);
        vm.stopPrank();

        // Step 3: Bob does not approve

        // Verify Alice's approval but settlement not fully approved
        assertFalse(xvpSettlement.isFullyApproved(settlementId), "Settlement should not be fully approved");

        // Step 4: Try to execute settlement - should fail because not fully approved
        vm.expectRevert(XvPSettlement.XvPSettlementNotApproved.selector);
        vm.prank(alice);
        xvpSettlement.execute(settlementId);

        // Verify no tokens were transferred
        assertEq(tokenP.balanceOf(alice), 1000 * 10 ** 18, "Alice should still have all her tokens");
        assertEq(tokenP.balanceOf(bob), 0, "Bob should not have received any tokens");
        assertEq(tokenQ.balanceOf(bob), 500 * 10 ** 18, "Bob should still have all his tokens");
        assertEq(tokenQ.balanceOf(alice), 0, "Alice should not have received any tokens");
    }
}
