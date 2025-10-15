// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { AbstractATKAssetTest } from "../../assets/AbstractATKAssetTest.sol";
import { ATKXvPSettlementFactoryImplementation } from
    "../../../contracts/addons/xvp/ATKXvPSettlementFactoryImplementation.sol";
import { ATKXvPSettlementImplementation } from "../../../contracts/addons/xvp/ATKXvPSettlementImplementation.sol";
import { IATKXvPSettlementFactory } from "../../../contracts/addons/xvp/IATKXvPSettlementFactory.sol";
import { IATKXvPSettlement } from "../../../contracts/addons/xvp/IATKXvPSettlement.sol";
import { ERC20Mock } from "../../mocks/ERC20Mock.sol";
import { ATKPeopleRoles } from "../../../contracts/system/ATKPeopleRoles.sol";

/// @title XvP Settlement Test
/// @notice Comprehensive test suite for XvPSettlement contract
contract XvPSettlementTest is AbstractATKAssetTest {
    IATKXvPSettlementFactory public factory;
    ERC20Mock public tokenA;
    ERC20Mock public tokenB;

    address public admin;
    address public user1;
    address public user2;

    uint256 public constant AMOUNT_A = 1000 * 10 ** 18;
    uint256 public constant AMOUNT_B = 500 * 10 ** 18;
    uint64 internal constant EXTERNAL_CHAIN_ID = 8453;

    // Events from XvPSettlementFactory to verify
    event ATKXvPSettlementCreated(address indexed settlement, address indexed creator);

    // Events from XvPSettlement to verify
    event XvPSettlementApproved(address indexed sender);
    event XvPSettlementApprovalRevoked(address indexed sender);
    event XvPSettlementExecuted(address indexed sender);
    event XvPSettlementCancelled(address indexed sender);
    event XvPSettlementSecretRevealed(address indexed revealer, bytes secret);

    function setUp() public {
        admin = makeAddr("admin");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        vm.label(admin, "Admin");
        vm.label(user1, "User1");
        vm.label(user2, "User2");

        // Initialize ATK system
        setUpATK(admin);

        // Deploy tokens
        tokenA = new ERC20Mock("Token A", "TKNA", 18);
        tokenB = new ERC20Mock("Token B", "TKNB", 18);

        // Mint tokens to users
        tokenA.mint(user1, AMOUNT_A * 10);
        tokenB.mint(user2, AMOUNT_B * 10);

        // Set up the XvP Settlement Factory
        ATKXvPSettlementFactoryImplementation factoryImpl =
            new ATKXvPSettlementFactoryImplementation(address(forwarder));

        vm.startPrank(platformAdmin);

        // Encode initialization data for the factory
        bytes memory encodedInitializationData = abi.encodeWithSelector(
            ATKXvPSettlementFactoryImplementation.initialize.selector,
            address(systemUtils.systemAccessManager()),
            address(systemUtils.system())
        );

        // Create system addon for XvP settlement factory
        factory = IATKXvPSettlementFactory(
            systemUtils.systemAddonRegistry().registerSystemAddon(
                "xvp-settlement-factory", address(factoryImpl), encodedInitializationData
            )
        );

        // Grant DEPLOYER_ROLE to users who need to create settlements
        systemUtils.systemAccessManager().grantRole(ATKPeopleRoles.ADDON_MANAGER_ROLE, admin);
        systemUtils.systemAccessManager().grantRole(ATKPeopleRoles.ADDON_MANAGER_ROLE, user1);
        systemUtils.systemAccessManager().grantRole(ATKPeopleRoles.ADDON_MANAGER_ROLE, user2);

        vm.stopPrank();

        vm.label(address(tokenA), "TokenA");
        vm.label(address(tokenB), "TokenB");
        vm.label(address(factory), "XvPSettlementFactory");
    }

    // ========================================================================
    // Helper functions
    // ========================================================================

    /// @notice Grant DEPLOYER_ROLE to a user so they can create settlements
    function grantDeployerRole(address user) internal {
        vm.startPrank(platformAdmin);
        systemUtils.systemAccessManager().grantRole(ATKPeopleRoles.ADDON_MANAGER_ROLE, user);
        vm.stopPrank();
    }

    // ========================================================================
    // Tests for XvP Settlement with Flow structure and allowance checks
    // ========================================================================

    function test_SuccessfulSwapWithSingleFlow() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Grant deployer role to alice
        grantDeployerRole(alice);

        // Setup tokens
        ERC20Mock tokenC = new ERC20Mock("Token C", "TKNC", 18);
        tokenC.mint(alice, 1000 * 10 ** 18);

        // Test data
        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](1);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(tokenC),
            from: alice,
            to: bob,
            amount: 100 * 10 ** 18,
            externalChainId: 0
        });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Step 1: Create settlement
        vm.startPrank(alice);
        // Get the predicted address first
        address expectedAddr = factory.predictAddress("Settlement Name", flows, cutoffDate, autoExecute, bytes32(0));
        vm.expectEmit(true, true, false, false);
        emit ATKXvPSettlementCreated(expectedAddr, alice);
        address settlementAddr = factory.create("Settlement Name", flows, cutoffDate, autoExecute, bytes32(0));
        IATKXvPSettlement settlement = IATKXvPSettlement(settlementAddr);
        vm.stopPrank();

        assertFalse(settlement.hasExternalFlows(), "Pure local settlement should not flag external flows");
        assertEq(settlement.hashlock(), bytes32(0), "Hashlock should be empty for local settlements");
        assertFalse(settlement.secretRevealed(), "Secret should not be marked for local flows");

        // Step 2: Approve token and settlement
        vm.startPrank(alice);

        // First approve the ERC20 token
        tokenC.approve(settlementAddr, 100 * 10 ** 18);

        // Then approve the settlement
        vm.expectEmit(true, false, false, false);
        emit XvPSettlementApproved(alice);
        bool approved = settlement.approve();
        assertTrue(approved, "Settlement should be approved");

        vm.stopPrank();

        // Verify approval
        assertTrue(settlement.isFullyApproved(), "Settlement should be fully approved");

        // Step 3: Execute settlement
        vm.prank(bob); // Anyone can execute (in this case bob)
        vm.expectEmit(true, false, false, false);
        emit XvPSettlementExecuted(bob);
        bool executed = settlement.execute();
        assertTrue(executed, "Settlement execution should succeed");

        // Verify token transfer
        assertEq(tokenC.balanceOf(bob), 100 * 10 ** 18, "Bob should have received tokens");
        assertEq(tokenC.balanceOf(alice), 900 * 10 ** 18, "Alice should have sent tokens");
        assertFalse(settlement.secretRevealed(), "Secret status should remain false");
    }

    function test_SwapApprovalFailsWithInsufficientAllowance() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Grant deployer role to alice
        grantDeployerRole(alice);

        // Setup tokens
        ERC20Mock tokenD = new ERC20Mock("Token D", "TKND", 18);
        tokenD.mint(alice, 1000 * 10 ** 18);

        // Test data
        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](1);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(tokenD),
            from: alice,
            to: bob,
            amount: 100 * 10 ** 18,
            externalChainId: 0
        });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Step 1: Create settlement
        vm.startPrank(alice);
        address settlementAddr = factory.create("Settlement Name", flows, cutoffDate, autoExecute, bytes32(0));
        IATKXvPSettlement settlement = IATKXvPSettlement(settlementAddr);

        // Step 2: Try to approve the settlement WITHOUT approving token allowance first
        // This should revert with InsufficientAllowance
        vm.expectRevert(
            abi.encodeWithSelector(
                IATKXvPSettlement.InsufficientAllowance.selector,
                address(tokenD),
                alice,
                settlementAddr,
                100 * 10 ** 18,
                0
            )
        );
        settlement.approve();

        // Step 3: Approve insufficient allowance and try again
        tokenD.approve(settlementAddr, 50 * 10 ** 18); // Only half of required amount

        vm.expectRevert(
            abi.encodeWithSelector(
                IATKXvPSettlement.InsufficientAllowance.selector,
                address(tokenD),
                alice,
                settlementAddr,
                100 * 10 ** 18,
                50 * 10 ** 18
            )
        );
        settlement.approve();

        // Step 4: Approve the full amount and verify approval succeeds
        tokenD.approve(settlementAddr, 100 * 10 ** 18);
        bool approved = settlement.approve();
        assertTrue(approved, "Settlement approval should succeed with sufficient allowance");
        vm.stopPrank();
    }

    function test_MultiFlowSwap() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Grant deployer role to alice
        grantDeployerRole(alice);

        // Setup tokens
        ERC20Mock tokenX = new ERC20Mock("Token X", "TKNX", 18);
        ERC20Mock tokenY = new ERC20Mock("Token Y", "TKNY", 18);
        tokenX.mint(alice, 1000 * 10 ** 18);
        tokenY.mint(bob, 500 * 10 ** 18);

        // Test data - Bidirectional swap between Alice and Bob
        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](2);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(tokenX),
            from: alice,
            to: bob,
            amount: 200 * 10 ** 18,
            externalChainId: 0
        });
        flows[1] = IATKXvPSettlement.Flow({
            asset: address(tokenY),
            from: bob,
            to: alice,
            amount: 100 * 10 ** 18,
            externalChainId: 0
        });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Step 1: Create settlement (alice creates)
        vm.prank(alice);
        address settlementAddr = factory.create("Settlement Name", flows, cutoffDate, autoExecute, bytes32(0));
        IATKXvPSettlement settlement = IATKXvPSettlement(settlementAddr);

        // Step 2: Approve tokens and settlement
        // Alice approves
        vm.startPrank(alice);
        tokenX.approve(settlementAddr, 200 * 10 ** 18);
        settlement.approve();
        vm.stopPrank();

        // Bob approves
        vm.startPrank(bob);
        tokenY.approve(settlementAddr, 100 * 10 ** 18);
        settlement.approve();
        vm.stopPrank();

        // Verify fully approved
        assertTrue(settlement.isFullyApproved());

        // Step 3: Execute settlement
        vm.prank(alice); // Alice executes
        bool executed = settlement.execute();
        assertTrue(executed, "Settlement execution should succeed");

        // Verify token transfers
        assertEq(tokenX.balanceOf(bob), 200 * 10 ** 18, "Bob should have received tokenX");
        assertEq(tokenX.balanceOf(alice), 800 * 10 ** 18, "Alice should have sent tokenX");
        assertEq(tokenY.balanceOf(alice), 100 * 10 ** 18, "Alice should have received tokenY");
        assertEq(tokenY.balanceOf(bob), 400 * 10 ** 18, "Bob should have sent tokenY");
    }

    function test_ExecuteRequiresSecretForExternalFlows() public {
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");
        address relayer = makeAddr("relayer");

        grantDeployerRole(alice);

        ERC20Mock localToken = new ERC20Mock("Local Token", "LOC", 18);
        ERC20Mock externalToken = new ERC20Mock("External Token", "EXT", 6);
        localToken.mint(alice, 1000 * 10 ** 18);

        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](2);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(localToken),
            from: alice,
            to: bob,
            amount: 90 * 10 ** 18,
            externalChainId: 0
        });
        flows[1] = IATKXvPSettlement.Flow({
            asset: address(externalToken),
            from: bob,
            to: alice,
            amount: 100 * 10 ** 6,
            externalChainId: EXTERNAL_CHAIN_ID
        });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;
        bytes memory secret = bytes("shared-secret");
        bytes32 hashlock = keccak256(secret);

        vm.startPrank(alice);
        address settlementAddr = factory.create("Settlement Name", flows, cutoffDate, autoExecute, hashlock);
        IATKXvPSettlement settlement = IATKXvPSettlement(settlementAddr);
        vm.stopPrank();

        assertTrue(settlement.hasExternalFlows(), "Settlement should detect external flows");
        assertEq(settlement.hashlock(), hashlock, "Hashlock mismatch");
        assertFalse(settlement.secretRevealed(), "Secret must start unrevealed");

        vm.startPrank(alice);
        localToken.approve(settlementAddr, 90 * 10 ** 18);
        settlement.approve();
        vm.stopPrank();

        vm.prank(bob);
        vm.expectRevert(IATKXvPSettlement.SecretNotRevealed.selector);
        settlement.execute();

        vm.prank(relayer);
        vm.expectRevert(IATKXvPSettlement.InvalidSecret.selector);
        settlement.revealSecret(bytes("wrong-secret"));

        vm.prank(relayer);
        vm.expectEmit(true, false, false, true);
        emit XvPSettlementSecretRevealed(relayer, secret);
        settlement.revealSecret(secret);

        assertTrue(settlement.secretRevealed(), "Secret should be marked as revealed");

        vm.prank(bob);
        vm.expectEmit(true, false, false, false);
        emit XvPSettlementExecuted(bob);
        settlement.execute();

        assertTrue(settlement.executed(), "Settlement should now be executed");
        assertEq(localToken.balanceOf(bob), 90 * 10 ** 18, "Bob should receive local tokens");
        assertEq(localToken.balanceOf(alice), 910 * 10 ** 18, "Alice should send local tokens");
    }

    function test_AutoExecution() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Grant deployer role to alice
        grantDeployerRole(alice);

        // Setup tokens
        ERC20Mock tokenZ = new ERC20Mock("Token Z", "TKNZ", 18);
        tokenZ.mint(alice, 1000 * 10 ** 18);

        // Test data
        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](1);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(tokenZ),
            from: alice,
            to: bob,
            amount: 300 * 10 ** 18,
            externalChainId: 0
        });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = true;

        // Step 1: Create settlement with auto-execution
        vm.prank(alice);
        address settlementAddr = factory.create("Settlement Name", flows, cutoffDate, autoExecute, bytes32(0));
        IATKXvPSettlement settlement = IATKXvPSettlement(settlementAddr);

        // Step 2: Approve token and settlement (should trigger auto-execution)
        vm.startPrank(alice);
        tokenZ.approve(settlementAddr, 300 * 10 ** 18);
        settlement.approve();
        vm.stopPrank();

        // Verify token transfer occurred from auto-execution
        assertEq(tokenZ.balanceOf(bob), 300 * 10 ** 18, "Bob should have received tokens");
        assertEq(tokenZ.balanceOf(alice), 700 * 10 ** 18, "Alice should have sent tokens");
        assertTrue(settlement.executed(), "Settlement should be marked as executed");
    }

    function test_AutoExecuteWaitsForSecret() public {
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");
        address relayer = makeAddr("relayer");

        grantDeployerRole(alice);

        ERC20Mock localToken = new ERC20Mock("Local Token", "LOC", 18);
        ERC20Mock externalToken = new ERC20Mock("External Token", "EXT", 6);
        localToken.mint(alice, 1000 * 10 ** 18);

        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](2);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(localToken),
            from: alice,
            to: bob,
            amount: 120 * 10 ** 18,
            externalChainId: 0
        });
        flows[1] = IATKXvPSettlement.Flow({
            asset: address(externalToken),
            from: bob,
            to: alice,
            amount: 150 * 10 ** 6,
            externalChainId: EXTERNAL_CHAIN_ID
        });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = true;
        bytes memory secret = bytes("auto-exec-secret");
        bytes32 hashlock = keccak256(secret);

        vm.startPrank(alice);
        address settlementAddr = factory.create("Settlement Name", flows, cutoffDate, autoExecute, hashlock);
        IATKXvPSettlement settlement = IATKXvPSettlement(settlementAddr);
        vm.stopPrank();

        vm.startPrank(alice);
        localToken.approve(settlementAddr, 120 * 10 ** 18);
        settlement.approve();
        vm.stopPrank();

        assertTrue(settlement.isFullyApproved(), "Approvals should be complete");
        assertFalse(settlement.executed(), "Auto execute must wait for secret");

        vm.prank(relayer);
        vm.expectEmit(true, false, false, true);
        emit XvPSettlementSecretRevealed(relayer, secret);
        settlement.revealSecret(secret);

        assertTrue(settlement.secretRevealed(), "Secret should be stored");
        assertTrue(settlement.executed(), "Reveal should auto-execute when approvals ready");
        assertEq(localToken.balanceOf(bob), 120 * 10 ** 18, "Bob should receive tokens");
        assertEq(localToken.balanceOf(alice), 880 * 10 ** 18, "Alice should send tokens");
    }

    function test_AutoExecuteAfterSecretWhenApprovalsArrive() public {
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");
        address relayer = makeAddr("relayer");

        grantDeployerRole(alice);

        ERC20Mock localToken = new ERC20Mock("Local Token", "LOC", 18);
        ERC20Mock externalToken = new ERC20Mock("External Token", "EXT", 6);
        localToken.mint(alice, 1000 * 10 ** 18);

        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](2);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(localToken),
            from: alice,
            to: bob,
            amount: 70 * 10 ** 18,
            externalChainId: 0
        });
        flows[1] = IATKXvPSettlement.Flow({
            asset: address(externalToken),
            from: bob,
            to: alice,
            amount: 80 * 10 ** 6,
            externalChainId: EXTERNAL_CHAIN_ID
        });

        bytes memory secret = bytes("secret-before-approvals");
        bytes32 hashlock = keccak256(secret);

        vm.startPrank(alice);
        address settlementAddr = factory.create("Settlement Name", flows, block.timestamp + 1 days, true, hashlock);
        IATKXvPSettlement settlement = IATKXvPSettlement(settlementAddr);
        vm.stopPrank();

        vm.prank(relayer);
        settlement.revealSecret(secret);

        assertTrue(settlement.secretRevealed(), "Secret should be stored");
        assertFalse(settlement.executed(), "Execution waits for approvals");

        vm.startPrank(alice);
        localToken.approve(settlementAddr, 70 * 10 ** 18);
        settlement.approve();
        vm.stopPrank();

        assertTrue(settlement.executed(), "Execution should occur after final approval");
        assertEq(localToken.balanceOf(bob), 70 * 10 ** 18, "Bob should receive tokens");
    }

    function test_RevokeApproval() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Grant deployer role to alice
        grantDeployerRole(alice);

        // Setup tokens
        ERC20Mock tokenR = new ERC20Mock("Token R", "TKNR", 18);
        tokenR.mint(alice, 1000 * 10 ** 18);

        // Test data
        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](1);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(tokenR),
            from: alice,
            to: bob,
            amount: 150 * 10 ** 18,
            externalChainId: 0
        });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Step 1: Create settlement
        vm.prank(alice);
        address settlementAddr = factory.create("Settlement Name", flows, cutoffDate, autoExecute, bytes32(0));
        IATKXvPSettlement settlement = IATKXvPSettlement(settlementAddr);

        // Step 2: Approve token and settlement
        vm.startPrank(alice);
        tokenR.approve(settlementAddr, 150 * 10 ** 18);
        settlement.approve();

        // Verify approval
        assertTrue(settlement.isFullyApproved(), "Settlement should be fully approved");

        // Step 3: Revoke approval
        vm.expectEmit(true, false, false, false);
        emit XvPSettlementApprovalRevoked(alice);
        settlement.revokeApproval();
        vm.stopPrank();

        // Verify approval is revoked
        assertFalse(settlement.isFullyApproved(), "Settlement should not be fully approved");

        // Should not be able to execute
        vm.expectRevert(IATKXvPSettlement.XvPSettlementNotApproved.selector);
        settlement.execute();
    }

    function test_ExpireSettlement() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Grant deployer role to alice
        grantDeployerRole(alice);

        // Setup tokens
        ERC20Mock tokenE = new ERC20Mock("Token E", "TKNE", 18);
        tokenE.mint(alice, 1000 * 10 ** 18);

        // Test data
        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](1);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(tokenE),
            from: alice,
            to: bob,
            amount: 400 * 10 ** 18,
            externalChainId: 0
        });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Step 1: Create settlement
        vm.prank(alice);
        address settlementAddr = factory.create("Settlement Name", flows, cutoffDate, autoExecute, bytes32(0));
        IATKXvPSettlement settlement = IATKXvPSettlement(settlementAddr);

        // Step 2: Fast forward time past cutoff date
        vm.warp(block.timestamp + 2 days);

        // Step 3: Try to approve - should revert because expired
        vm.startPrank(alice);
        tokenE.approve(settlementAddr, 400 * 10 ** 18);
        vm.expectRevert(IATKXvPSettlement.XvPSettlementExpired.selector);
        settlement.approve();
        vm.stopPrank();

        // Step 4: Try to execute - should revert because expired
        vm.expectRevert(IATKXvPSettlement.XvPSettlementExpired.selector);
        settlement.execute();
    }

    function test_CancelSettlement() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Grant deployer role to alice
        grantDeployerRole(alice);

        // Setup tokens
        ERC20Mock tokenF = new ERC20Mock("Token F", "TKNF", 18);
        tokenF.mint(alice, 1000 * 10 ** 18);

        // Test data
        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](1);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(tokenF),
            from: alice,
            to: bob,
            amount: 250 * 10 ** 18,
            externalChainId: 0
        });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Step 1: Create settlement
        vm.prank(alice);
        address settlementAddr = factory.create("Settlement Name", flows, cutoffDate, autoExecute, bytes32(0));
        IATKXvPSettlement settlement = IATKXvPSettlement(settlementAddr);

        // Step 2: Cancel the settlement as a party involved
        vm.prank(alice);
        vm.expectEmit(true, false, false, false);
        emit XvPSettlementCancelled(alice);
        bool cancelled = settlement.cancel();
        assertTrue(cancelled, "Cancel should succeed");

        // Cannot approve or execute a cancelled settlement
        vm.startPrank(alice);
        tokenF.approve(settlementAddr, 250 * 10 ** 18);
        vm.expectRevert(IATKXvPSettlement.XvPSettlementAlreadyCancelled.selector);
        settlement.approve();
        vm.expectRevert(IATKXvPSettlement.XvPSettlementAlreadyCancelled.selector);
        settlement.execute();
        vm.stopPrank();
    }

    function test_OnlyInvolvedCanCancel() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");
        address charlie = makeAddr("charlie"); // Not involved

        // Grant deployer role to alice
        grantDeployerRole(alice);

        // Setup tokens
        ERC20Mock tokenG = new ERC20Mock("Token G", "TKNG", 18);
        tokenG.mint(alice, 1000 * 10 ** 18);

        // Test data
        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](1);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(tokenG),
            from: alice,
            to: bob,
            amount: 350 * 10 ** 18,
            externalChainId: 0
        });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Step 1: Create settlement (as Alice)
        vm.prank(alice);
        address settlementAddr = factory.create("Settlement Name", flows, cutoffDate, autoExecute, bytes32(0));
        IATKXvPSettlement settlement = IATKXvPSettlement(settlementAddr);

        // Step 2: Try to cancel as Charlie (not involved)
        vm.prank(charlie);
        vm.expectRevert(IATKXvPSettlement.SenderNotInvolvedInSettlement.selector);
        settlement.cancel();

        // Step 3: Cancel as Alice (involved) should succeed
        vm.prank(alice);
        bool cancelled = settlement.cancel();
        assertTrue(cancelled, "Cancel by involved party should succeed");
    }

    function test_InvalidParameters() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Grant deployer role to alice
        grantDeployerRole(alice);

        // Setup tokens
        ERC20Mock tokenJ = new ERC20Mock("Token J", "TKNJ", 18);
        tokenJ.mint(alice, 1000 * 10 ** 18);

        // Test with invalid cutoff date (in the past)
        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](1);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(tokenJ),
            from: alice,
            to: bob,
            amount: 100 * 10 ** 18,
            externalChainId: 0
        });

        vm.warp(10 hours); // Set block.timestamp to 10 hours
        uint256 pastCutoffDate = block.timestamp - 1 hours; // 9 hours (in the past)

        // Should revert with InvalidCutoffDate
        vm.prank(alice);
        vm.expectRevert(ATKXvPSettlementFactoryImplementation.InvalidCutoffDate.selector);
        factory.create("Settlement Name", flows, pastCutoffDate, false, bytes32(0));

        // Test with zero amount
        IATKXvPSettlement.Flow[] memory flowsZeroAmount = new IATKXvPSettlement.Flow[](1);
        flowsZeroAmount[0] = IATKXvPSettlement.Flow({
            asset: address(tokenJ),
            from: alice,
            to: bob,
            amount: 0, // Zero amount
            externalChainId: 0
        });

        // Should revert with ZeroAmount
        vm.prank(alice);
        vm.expectRevert(IATKXvPSettlement.ZeroAmount.selector);
        factory.create("Settlement Name", flowsZeroAmount, block.timestamp + 1 days, false, bytes32(0));

        // Test with zero address
        IATKXvPSettlement.Flow[] memory flowsZeroAddress = new IATKXvPSettlement.Flow[](1);
        flowsZeroAddress[0] = IATKXvPSettlement.Flow({
            asset: address(tokenJ),
            from: alice,
            to: address(0), // Zero address
            amount: 100 * 10 ** 18,
            externalChainId: 0
        });

        // Should revert with ZeroAddress
        vm.prank(alice);
        vm.expectRevert(IATKXvPSettlement.ZeroAddress.selector);
        factory.create("Settlement Name", flowsZeroAddress, block.timestamp + 1 days, false, bytes32(0));

        // Test with invalid token
        IATKXvPSettlement.Flow[] memory flowsInvalidToken = new IATKXvPSettlement.Flow[](1);
        flowsInvalidToken[0] = IATKXvPSettlement.Flow({
            asset: address(0), // Invalid token (zero address)
            from: alice,
            to: bob,
            amount: 100 * 10 ** 18,
            externalChainId: 0
        });

        // Should revert with InvalidToken
        vm.prank(alice);
        vm.expectRevert(IATKXvPSettlement.InvalidToken.selector);
        factory.create("Settlement Name", flowsInvalidToken, block.timestamp + 1 days, false, bytes32(0));
    }

    function test_HashlockRequiredWhenExternalFlowsPresent() public {
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        grantDeployerRole(alice);

        ERC20Mock localToken = new ERC20Mock("Local Token", "LOC", 18);
        ERC20Mock externalToken = new ERC20Mock("External Token", "EXT", 6);
        localToken.mint(alice, 1000 * 10 ** 18);

        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](2);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(localToken),
            from: alice,
            to: bob,
            amount: 50 * 10 ** 18,
            externalChainId: 0
        });
        flows[1] = IATKXvPSettlement.Flow({
            asset: address(externalToken),
            from: bob,
            to: alice,
            amount: 60 * 10 ** 6,
            externalChainId: EXTERNAL_CHAIN_ID
        });

        vm.startPrank(alice);
        vm.expectRevert(IATKXvPSettlement.HashlockRequired.selector);
        factory.create("Settlement Name", flows, block.timestamp + 1 days, false, bytes32(0));
        vm.stopPrank();
    }

    function test_InvalidExternalChainIdReverts() public {
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        grantDeployerRole(alice);

        ERC20Mock externalToken = new ERC20Mock("External Token", "EXT", 6);

        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](1);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(externalToken),
            from: bob,
            to: alice,
            amount: 60 * 10 ** 6,
            externalChainId: uint64(block.chainid)
        });

        vm.startPrank(alice);
        bytes32 hashlock = bytes32(uint256(1));
        vm.expectRevert(
            abi.encodeWithSelector(IATKXvPSettlement.InvalidExternalChainId.selector, uint64(block.chainid))
        );
        factory.create("Settlement Name", flows, block.timestamp + 1 days, false, hashlock);
        vm.stopPrank();
    }

    function test_RevealSecretNotRequiredForLocalSettlement() public {
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");
        address relayer = makeAddr("relayer");

        grantDeployerRole(alice);

        ERC20Mock token = new ERC20Mock("Local Token", "LOC", 18);
        token.mint(alice, 1000 * 10 ** 18);

        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](1);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(token),
            from: alice,
            to: bob,
            amount: 100 * 10 ** 18,
            externalChainId: 0
        });

        vm.startPrank(alice);
        address settlementAddr = factory.create("Settlement Name", flows, block.timestamp + 1 days, false, bytes32(0));
        IATKXvPSettlement settlement = IATKXvPSettlement(settlementAddr);
        vm.stopPrank();

        vm.prank(relayer);
        vm.expectRevert(IATKXvPSettlement.HashlockRevealNotRequired.selector);
        settlement.revealSecret(bytes("unused"));
    }

    function test_RevealSecretCannotBeCalledTwice() public {
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        grantDeployerRole(alice);

        ERC20Mock localToken = new ERC20Mock("Local Token", "LOC", 18);
        ERC20Mock externalToken = new ERC20Mock("External Token", "EXT", 6);
        localToken.mint(alice, 1000 * 10 ** 18);

        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](2);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(localToken),
            from: alice,
            to: bob,
            amount: 60 * 10 ** 18,
            externalChainId: 0
        });
        flows[1] = IATKXvPSettlement.Flow({
            asset: address(externalToken),
            from: bob,
            to: alice,
            amount: 70 * 10 ** 6,
            externalChainId: EXTERNAL_CHAIN_ID
        });

        bytes memory secret = bytes("double-reveal");
        bytes32 hashlock = keccak256(secret);

        vm.startPrank(alice);
        address settlementAddr = factory.create("Settlement Name", flows, block.timestamp + 1 days, false, hashlock);
        IATKXvPSettlement settlement = IATKXvPSettlement(settlementAddr);
        vm.stopPrank();

        vm.prank(bob);
        settlement.revealSecret(secret);

        vm.prank(bob);
        vm.expectRevert(IATKXvPSettlement.SecretAlreadyRevealed.selector);
        settlement.revealSecret(secret);
    }

    function test_ExternalFlowSenderDoesNotNeedAllowance() public {
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");
        address relayer = makeAddr("relayer");

        grantDeployerRole(alice);

        ERC20Mock localToken = new ERC20Mock("Local Token", "LOC", 18);
        ERC20Mock externalToken = new ERC20Mock("External Token", "EXT", 6);
        localToken.mint(alice, 1000 * 10 ** 18);

        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](2);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(localToken),
            from: alice,
            to: bob,
            amount: 80 * 10 ** 18,
            externalChainId: 0
        });
        flows[1] = IATKXvPSettlement.Flow({
            asset: address(externalToken),
            from: bob,
            to: alice,
            amount: 90 * 10 ** 6,
            externalChainId: EXTERNAL_CHAIN_ID
        });

        bytes memory secret = bytes("allowance-free");
        bytes32 hashlock = keccak256(secret);

        vm.startPrank(alice);
        address settlementAddr = factory.create("Settlement Name", flows, block.timestamp + 1 days, true, hashlock);
        IATKXvPSettlement settlement = IATKXvPSettlement(settlementAddr);
        vm.stopPrank();

        vm.prank(bob);
        bool bobApproved = settlement.approve();
        assertTrue(bobApproved, "External sender should approve without local allowance");
        assertTrue(settlement.approvals(bob), "Approval flag should be stored");
        assertFalse(settlement.isFullyApproved(), "Local approvals still pending");

        vm.startPrank(alice);
        localToken.approve(settlementAddr, 80 * 10 ** 18);
        settlement.approve();
        vm.stopPrank();

        vm.prank(relayer);
        settlement.revealSecret(secret);

        assertTrue(settlement.executed(), "Settlement should execute after local approval and secret");
        assertEq(localToken.balanceOf(bob), 80 * 10 ** 18, "Bob should receive local tokens");
    }

    function test_MultiFlowSwapPartialApproval() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Grant deployer role to alice
        grantDeployerRole(alice);

        // Setup tokens
        ERC20Mock tokenP = new ERC20Mock("Token P", "TKNP", 18);
        ERC20Mock tokenQ = new ERC20Mock("Token Q", "TKNQ", 18);
        tokenP.mint(alice, 1000 * 10 ** 18);
        tokenQ.mint(bob, 500 * 10 ** 18);

        // Test data - Bidirectional swap between Alice and Bob
        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](2);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(tokenP),
            from: alice,
            to: bob,
            amount: 200 * 10 ** 18,
            externalChainId: 0
        });
        flows[1] = IATKXvPSettlement.Flow({
            asset: address(tokenQ),
            from: bob,
            to: alice,
            amount: 100 * 10 ** 18,
            externalChainId: 0
        });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Step 1: Create settlement (alice creates)
        vm.prank(alice);
        address settlementAddr = factory.create("Settlement Name", flows, cutoffDate, autoExecute, bytes32(0));
        IATKXvPSettlement settlement = IATKXvPSettlement(settlementAddr);

        // Step 2: Alice approves token and settlement
        vm.startPrank(alice);
        tokenP.approve(settlementAddr, 200 * 10 ** 18);
        settlement.approve();
        vm.stopPrank();

        // Step 3: Bob does not approve

        // Verify Alice's approval but settlement not fully approved
        assertFalse(settlement.isFullyApproved(), "Settlement should not be fully approved");

        // Step 4: Try to execute settlement - should fail because not fully approved
        vm.expectRevert(IATKXvPSettlement.XvPSettlementNotApproved.selector);
        vm.prank(alice);
        settlement.execute();

        // Verify no tokens were transferred
        assertEq(tokenP.balanceOf(alice), 1000 * 10 ** 18, "Alice should still have all her tokens");
        assertEq(tokenP.balanceOf(bob), 0, "Bob should not have received any tokens");
        assertEq(tokenQ.balanceOf(bob), 500 * 10 ** 18, "Bob should still have all his tokens");
        assertEq(tokenQ.balanceOf(alice), 0, "Alice should not have received any tokens");
    }

    function test_FactoryPredictAddress() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Grant deployer role to alice
        grantDeployerRole(alice);

        // Setup tokens
        ERC20Mock tokenM = new ERC20Mock("Token M", "TKNM", 18);
        tokenM.mint(alice, 1000 * 10 ** 18);

        // Test data
        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](1);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(tokenM),
            from: alice,
            to: bob,
            amount: 150 * 10 ** 18,
            externalChainId: 0
        });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Predict settlement address (from alice's context to match create call)
        vm.prank(alice);
        address predictedAddr = factory.predictAddress("Settlement Name", flows, cutoffDate, autoExecute, bytes32(0));

        // Create settlement and verify address matches prediction
        vm.prank(alice);
        address actualAddr = factory.create("Settlement Name", flows, cutoffDate, autoExecute, bytes32(0));

        assertEq(actualAddr, predictedAddr, "Actual address should match predicted address");
    }

    function test_FactoryCannotDeploySameSettlementTwice() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Grant deployer role to alice
        grantDeployerRole(alice);

        // Setup tokens
        ERC20Mock tokenN = new ERC20Mock("Token N", "TKNN", 18);
        tokenN.mint(alice, 1000 * 10 ** 18);

        // Test data
        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](1);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(tokenN),
            from: alice,
            to: bob,
            amount: 150 * 10 ** 18,
            externalChainId: 0
        });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Create settlement
        vm.prank(alice);
        factory.create("Settlement Name", flows, cutoffDate, autoExecute, bytes32(0));

        // Try to create the same settlement again
        vm.prank(alice);
        vm.expectRevert();
        factory.create("Settlement Name", flows, cutoffDate, autoExecute, bytes32(0));
    }

    function test_DirectXvPSettlementDeployment() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Setup tokens
        ERC20Mock tokenO = new ERC20Mock("Token O", "TKNO", 18);
        tokenO.mint(alice, 1000 * 10 ** 18);

        // Test data
        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](1);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(tokenO),
            from: alice,
            to: bob,
            amount: 150 * 10 ** 18,
            externalChainId: 0
        });

        // Deploy a fresh XvPSettlement implementation for direct testing
        vm.prank(admin);
        ATKXvPSettlementImplementation directSettlementImpl = new ATKXvPSettlementImplementation(address(forwarder));

        // For a simple test, let's just verify that we can deploy the implementation
        // The full proxy pattern is tested through the factory

        // Verify the implementation was deployed (by checking if it has code)
        assertTrue(address(directSettlementImpl).code.length > 0, "Implementation should have been deployed");
    }

    function test_SettlementNameIsStoredCorrectly() public {
        // Setup actors
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        // Grant deployer role to alice
        grantDeployerRole(alice);

        // Setup tokens
        ERC20Mock tokenS = new ERC20Mock("Token S", "TKNS", 18);
        tokenS.mint(alice, 1000 * 10 ** 18);

        // Test data with specific settlement name
        string memory expectedName = "Test Settlement for Name Verification";
        IATKXvPSettlement.Flow[] memory flows = new IATKXvPSettlement.Flow[](1);
        flows[0] = IATKXvPSettlement.Flow({
            asset: address(tokenS),
            from: alice,
            to: bob,
            amount: 100 * 10 ** 18,
            externalChainId: 0
        });

        uint256 cutoffDate = block.timestamp + 1 days;
        bool autoExecute = false;

        // Create settlement with specific name
        vm.prank(alice);
        address settlementAddr = factory.create(expectedName, flows, cutoffDate, autoExecute, bytes32(0));
        IATKXvPSettlement settlement = IATKXvPSettlement(settlementAddr);

        // Verify the name is stored correctly
        string memory actualName = settlement.name();
        assertEq(actualName, expectedName, "Settlement name should be stored correctly");
    }
}
