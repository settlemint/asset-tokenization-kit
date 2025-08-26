// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import { AbstractComplianceModuleTest } from "./AbstractComplianceModuleTest.t.sol";
import { TimeLockComplianceModule } from "../../../contracts/smart/modules/TimeLockComplianceModule.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";
import { ExpressionNode, ExpressionType } from "../../../contracts/smart/interface/structs/ExpressionNode.sol";
import { ATKTopics } from "../../../contracts/system/ATKTopics.sol";
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";

contract TimeLockComplianceModuleTest is AbstractComplianceModuleTest {
    TimeLockComplianceModule internal module;

    // Test constants
    uint256 constant TEST_VALUE = 1000;
    uint256 constant ONE_DAY = 86400;
    uint256 constant ONE_MONTH = 30 * ONE_DAY;
    uint256 constant SIX_MONTHS = 6 * ONE_MONTH;
    uint256 constant ONE_YEAR = 365 * ONE_DAY;
    uint256 constant TEN_YEARS = 10 * ONE_YEAR;

    // Default test parameters
    TimeLockComplianceModule.TimeLockParams defaultParams;
    bytes defaultParamsEncoded;

    // Custom topic ID for testing exemptions
    uint256 secondarySaleTopicId;

    // Helper function to create empty expression
    function _emptyExpression() internal pure returns (ExpressionNode[] memory) {
        return new ExpressionNode[](0);
    }

    // Helper function to create secondary sale approval expression
    function _secondarySaleApprovalExpression() internal view returns (ExpressionNode[] memory) {
        ExpressionNode[] memory expression = new ExpressionNode[](1);
        expression[0] = ExpressionNode({
            nodeType: ExpressionType.TOPIC,
            value: secondarySaleTopicId // Use dynamic topic ID
        });
        return expression;
    }

    function setUp() public override {
        super.setUp();
        module = new TimeLockComplianceModule(address(0));

        // Issue KYC/AML claims to test users
        claimUtils.issueAllClaims(user1);
        claimUtils.issueAllClaims(user2);

        // Register custom topic for secondary sale approval testing
        vm.startPrank(platformAdmin);
        systemUtils.topicSchemeRegistry().registerTopicScheme("secondarySaleApproval", "string claim");
        secondarySaleTopicId = systemUtils.getTopicId("secondarySaleApproval");
        vm.stopPrank();

        // Add the claim issuer as a trusted issuer if not already added, then update topics
        vm.startPrank(platformAdmin);
        // Add issuer with all necessary topics (existing + custom)
        uint256[] memory allTopics = new uint256[](5);
        allTopics[0] = systemUtils.getTopicId(ATKTopics.TOPIC_KYC);
        allTopics[1] = systemUtils.getTopicId(ATKTopics.TOPIC_AML);
        allTopics[2] = systemUtils.getTopicId(ATKTopics.TOPIC_COLLATERAL);
        allTopics[3] = systemUtils.getTopicId(ATKTopics.TOPIC_BASE_PRICE);
        allTopics[4] = secondarySaleTopicId; // Add our custom topic

        identityUtils.updateIssuerClaimTopics(claimIssuer, allTopics);
        vm.stopPrank();

        // Default 6-month lock period without exemptions
        defaultParams = TimeLockComplianceModule.TimeLockParams({
            holdPeriod: SIX_MONTHS,
            allowExemptions: false,
            exemptionExpression: _emptyExpression()
        });
        defaultParamsEncoded = abi.encode(defaultParams);
    }

    // ============ Basic Module Properties ============

    function test_TimeLock_InitialState() public view {
        assertEq(module.name(), "TimeLockComplianceModule");
        assertEq(module.typeId(), keccak256("TimeLockComplianceModule"));
        assertEq(module.TYPE_ID(), keccak256("TimeLockComplianceModule"));
    }

    function test_TimeLock_SupportsInterface() public view {
        assertTrue(module.supportsInterface(type(IERC165).interfaceId));
        assertTrue(module.supportsInterface(type(ISMARTComplianceModule).interfaceId));
    }

    // ============ Parameter Validation ============

    function test_TimeLock_ValidateParameters_ValidConfig() public view {
        // 6-month lock without exemptions
        TimeLockComplianceModule.TimeLockParams memory params = TimeLockComplianceModule.TimeLockParams({
            holdPeriod: SIX_MONTHS,
            allowExemptions: false,
            exemptionExpression: _emptyExpression()
        });
        module.validateParameters(abi.encode(params));

        // 1-year lock with exemptions
        params = TimeLockComplianceModule.TimeLockParams({
            holdPeriod: ONE_YEAR,
            allowExemptions: true,
            exemptionExpression: _secondarySaleApprovalExpression()
        });
        module.validateParameters(abi.encode(params));

        // Minimum 1-second lock
        params = TimeLockComplianceModule.TimeLockParams({
            holdPeriod: 1,
            allowExemptions: false,
            exemptionExpression: _emptyExpression()
        });
        module.validateParameters(abi.encode(params));

        // Maximum 10-year lock
        params = TimeLockComplianceModule.TimeLockParams({
            holdPeriod: TEN_YEARS,
            allowExemptions: true,
            exemptionExpression: _secondarySaleApprovalExpression()
        });
        module.validateParameters(abi.encode(params));
    }

    function test_TimeLock_RevertWhen_EmptyParameters() public {
        bytes memory emptyParams = "";

        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.InvalidParameters.selector,
                "Parameters cannot be empty"
            )
        );
        module.validateParameters(emptyParams);
    }

    function test_TimeLock_RevertWhen_ZeroHoldPeriod() public {
        TimeLockComplianceModule.TimeLockParams memory params = TimeLockComplianceModule.TimeLockParams({
            holdPeriod: 0,
            allowExemptions: false,
            exemptionExpression: _emptyExpression()
        });

        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.InvalidParameters.selector,
                "Hold period must be greater than zero"
            )
        );
        module.validateParameters(abi.encode(params));
    }

    function test_TimeLock_RevertWhen_HoldPeriodTooLong() public {
        TimeLockComplianceModule.TimeLockParams memory params = TimeLockComplianceModule.TimeLockParams({
            holdPeriod: TEN_YEARS + 1,
            allowExemptions: false,
            exemptionExpression: _emptyExpression()
        });

        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.InvalidParameters.selector,
                "Hold period too long (max 10 years)"
            )
        );
        module.validateParameters(abi.encode(params));
    }

    // ============ Core Functionality - canTransfer ============

    function test_TimeLock_CanTransfer_AllowsMinting() public view {
        // Minting (from zero address) should always be allowed
        module.canTransfer(address(smartToken), address(0), user1, TEST_VALUE, defaultParamsEncoded);
    }

    function test_TimeLock_RevertWhen_NoTokensHeld() public {
        // Try to transfer without any tokens held
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector,
                "Insufficient unlocked tokens available"
            )
        );
        module.canTransfer(address(smartToken), user1, user2, TEST_VALUE, defaultParamsEncoded);
    }

    function test_TimeLock_RevertWhen_InLockPeriod() public {
        // Create initial batch for user1
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, TEST_VALUE, defaultParamsEncoded);

        // Try to transfer immediately (should fail)
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector,
                "Insufficient unlocked tokens available"
            )
        );
        module.canTransfer(address(smartToken), user1, user2, TEST_VALUE, defaultParamsEncoded);

        // Try to transfer after 3 months (still locked)
        vm.warp(block.timestamp + 3 * ONE_MONTH);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector,
                "Insufficient unlocked tokens available"
            )
        );
        module.canTransfer(address(smartToken), user1, user2, TEST_VALUE, defaultParamsEncoded);
    }

    function test_TimeLock_CanTransfer_AfterLockPeriod() public {
        // Create initial batch for user1
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, TEST_VALUE, defaultParamsEncoded);

        // Advance time past lock period
        vm.warp(block.timestamp + SIX_MONTHS + 1);

        // Transfer should now be allowed
        module.canTransfer(address(smartToken), user1, user2, TEST_VALUE, defaultParamsEncoded);
    }

    function test_TimeLock_CanTransfer_PartialAmount() public {
        // Create initial batch for user1
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, TEST_VALUE, defaultParamsEncoded);

        // Advance time past lock period
        vm.warp(block.timestamp + SIX_MONTHS + 1);

        // Partial transfer should be allowed
        module.canTransfer(address(smartToken), user1, user2, TEST_VALUE / 2, defaultParamsEncoded);
    }

    // ============ FIFO Logic Tests ============

    function test_TimeLock_FIFO_MultipleBatches() public {
        uint256 startTime = 1000000;
        vm.warp(startTime);

        // Create first batch (1000 tokens)
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 1000, defaultParamsEncoded);

        // Advance 3 months and create second batch (500 tokens)
        vm.warp(startTime + 3 * ONE_MONTH);
        vm.prank(address(smartToken));
        module.transferred(address(smartToken), address(0), user1, 500, defaultParamsEncoded);

        // Advance 3 more months (first batch should be unlocked at 6 months)
        vm.warp(startTime + 6 * ONE_MONTH + 1);

        // Should be able to transfer 1000 tokens (first batch only)
        module.canTransfer(address(smartToken), user1, user2, 1000, defaultParamsEncoded);

        // Should fail for 1001 tokens (second batch still locked)
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector,
                "Insufficient unlocked tokens available"
            )
        );
        module.canTransfer(address(smartToken), user1, user2, 1001, defaultParamsEncoded);

        // Advance to when both batches are unlocked
        vm.warp(startTime + 9 * ONE_MONTH + 1);

        // Now should be able to transfer all 1500 tokens
        module.canTransfer(address(smartToken), user1, user2, 1500, defaultParamsEncoded);
    }

    // ============ Lifecycle Functions ============

    function test_TimeLock_Created_RecordsBatch() public {
        uint256 timestampBefore = block.timestamp;

        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, TEST_VALUE, defaultParamsEncoded);

        // Check batch was recorded
        TimeLockComplianceModule.TokenBatch[] memory batches = module.getTokenBatches(address(smartToken), user1);
        assertEq(batches.length, 1);
        assertEq(batches[0].amount, TEST_VALUE);
        assertEq(batches[0].acquisitionTime, timestampBefore);
    }

    function test_TimeLock_Transferred_RecordsBatch() public {
        // First give user1 some tokens (simulate minting)
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, TEST_VALUE, defaultParamsEncoded);

        // Advance time so tokens are unlocked
        vm.warp(block.timestamp + SIX_MONTHS + 1);

        uint256 timestampBefore = block.timestamp;

        // Now transfer from user1 to user2
        vm.prank(address(smartToken));
        module.transferred(address(smartToken), user1, user2, TEST_VALUE, defaultParamsEncoded);

        // Check batch was recorded for recipient
        TimeLockComplianceModule.TokenBatch[] memory batches = module.getTokenBatches(address(smartToken), user2);
        assertEq(batches.length, 1);
        assertEq(batches[0].amount, TEST_VALUE);
        assertEq(batches[0].acquisitionTime, timestampBefore);

        // Check user1's tokens were removed
        batches = module.getTokenBatches(address(smartToken), user1);
        assertEq(batches.length, 0);
    }

    function test_TimeLock_Transferred_FromMint() public {
        uint256 timestampBefore = block.timestamp;

        // Transfer from address(0) simulates minting
        vm.prank(address(smartToken));
        module.transferred(address(smartToken), address(0), user2, TEST_VALUE, defaultParamsEncoded);

        // Check batch was recorded for recipient
        TimeLockComplianceModule.TokenBatch[] memory batches = module.getTokenBatches(address(smartToken), user2);
        assertEq(batches.length, 1);
        assertEq(batches[0].amount, TEST_VALUE);
        assertEq(batches[0].acquisitionTime, timestampBefore);
    }

    function test_TimeLock_Transferred_IgnoresBurns() public {
        vm.prank(address(smartToken));
        module.transferred(address(smartToken), user1, address(0), TEST_VALUE, defaultParamsEncoded);

        // Should not record batch for burn (to zero address)
        TimeLockComplianceModule.TokenBatch[] memory batches = module.getTokenBatches(address(smartToken), address(0));
        assertEq(batches.length, 0);
    }

    function test_TimeLock_RevertWhen_UnauthorizedHookCaller() public {
        // Try to call hooks from unauthorized address
        vm.expectRevert();
        module.created(address(smartToken), user1, TEST_VALUE, defaultParamsEncoded);

        vm.expectRevert();
        module.transferred(address(smartToken), user1, user2, TEST_VALUE, defaultParamsEncoded);
    }

    // ============ Utility Functions ============

    function test_TimeLock_GetTokenBatches() public {
        // Create multiple batches
        vm.startPrank(address(smartToken));

        module.created(address(smartToken), user1, 1000, defaultParamsEncoded);
        vm.warp(block.timestamp + 100);
        module.transferred(address(smartToken), address(0), user1, 500, defaultParamsEncoded);

        vm.stopPrank();

        TimeLockComplianceModule.TokenBatch[] memory batches = module.getTokenBatches(address(smartToken), user1);
        assertEq(batches.length, 2);
        assertEq(batches[0].amount, 1000);
        assertEq(batches[1].amount, 500);
    }

    function test_TimeLock_GetTotalBalance() public {
        // Create multiple batches
        vm.startPrank(address(smartToken));

        module.created(address(smartToken), user1, 1000, defaultParamsEncoded);
        module.transferred(address(smartToken), address(0), user1, 500, defaultParamsEncoded);

        vm.stopPrank();

        uint256 totalBalance = module.getTotalBalance(address(smartToken), user1);
        assertEq(totalBalance, 1500);
    }

    function test_TimeLock_GetAvailableBalance() public {
        uint256 startTime = 1000000;
        vm.warp(startTime);

        // Create batches
        vm.startPrank(address(smartToken));
        module.created(address(smartToken), user1, 1000, defaultParamsEncoded);

        vm.warp(startTime + 3 * ONE_MONTH);
        module.transferred(address(smartToken), address(0), user1, 500, defaultParamsEncoded);
        vm.stopPrank();

        // At 6 months + 1, only first batch should be available
        vm.warp(startTime + SIX_MONTHS + 1);
        uint256 available = module.getAvailableBalance(address(smartToken), user1, defaultParamsEncoded);
        assertEq(available, 1000);

        // At 9 months + 1, both batches should be available
        vm.warp(startTime + 9 * ONE_MONTH + 1);
        available = module.getAvailableBalance(address(smartToken), user1, defaultParamsEncoded);
        assertEq(available, 1500);
    }

    function test_TimeLock_GetRemainingLockTime() public {
        uint256 startTime = 1000000;
        vm.warp(startTime);

        // Create batch
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, TEST_VALUE, defaultParamsEncoded);

        // Initially should have full lock period remaining
        uint256 remaining = module.getRemainingLockTime(address(smartToken), user1, defaultParamsEncoded);
        assertEq(remaining, SIX_MONTHS);

        // After 2 months, should have 4 months remaining
        vm.warp(startTime + 2 * ONE_MONTH);
        remaining = module.getRemainingLockTime(address(smartToken), user1, defaultParamsEncoded);
        assertEq(remaining, 4 * ONE_MONTH);

        // After lock period, should be 0
        vm.warp(startTime + SIX_MONTHS + 1);
        remaining = module.getRemainingLockTime(address(smartToken), user1, defaultParamsEncoded);
        assertEq(remaining, 0);
    }

    function test_TimeLock_GetRemainingLockTime_NoTokens() public view {
        // Should return max uint256 if no tokens held
        uint256 remaining = module.getRemainingLockTime(address(smartToken), user1, defaultParamsEncoded);
        assertEq(remaining, type(uint256).max);
    }

    // ============ Integration Tests ============

    function test_TimeLock_Integration_FullWorkflow() public {
        // Add module to token
        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), defaultParamsEncoded);

        // Mint tokens to user1 (creates first batch)
        smartToken.mint(user1, TEST_VALUE);

        // Try to transfer immediately (should fail)
        vm.stopPrank();
        vm.prank(user1);
        vm.expectRevert();
        smartToken.transfer(user2, TEST_VALUE / 2);

        // Advance time past lock period
        vm.warp(block.timestamp + SIX_MONTHS + 1);

        // Transfer should now succeed
        vm.prank(user1);
        assertTrue(smartToken.transfer(user2, TEST_VALUE / 2));

        // Verify user2 has new batch
        TimeLockComplianceModule.TokenBatch[] memory batches = module.getTokenBatches(address(smartToken), user2);
        assertEq(batches.length, 1);
        assertEq(batches[0].amount, TEST_VALUE / 2);
    }

    function test_TimeLock_Integration_FIFO_RealTransfer() public {
        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), defaultParamsEncoded);

        uint256 startTime = 1000000;
        vm.warp(startTime);

        // Mint first batch (1000 tokens)
        smartToken.mint(user1, 1000);

        // Advance time and mint second batch (500 tokens)
        vm.warp(startTime + 3 * ONE_MONTH);
        smartToken.mint(user1, 500);

        vm.stopPrank();

        // At 6 months + 1, only first batch unlocked
        vm.warp(startTime + SIX_MONTHS + 1);

        vm.prank(user1);
        assertTrue(smartToken.transfer(user2, 800)); // Should use from first batch

        // Verify user1 has remaining first batch + locked second batch
        assertEq(module.getTotalBalance(address(smartToken), user1), 700);
        assertEq(module.getAvailableBalance(address(smartToken), user1, defaultParamsEncoded), 200);
    }

    // ============ Edge Cases ============

    function test_TimeLock_EdgeCase_ExactLockExpiry() public {
        uint256 startTime = 1000000;
        vm.warp(startTime);

        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, TEST_VALUE, defaultParamsEncoded);

        // At exact expiry time should fail
        vm.warp(startTime + SIX_MONTHS);
        vm.expectRevert();
        module.canTransfer(address(smartToken), user1, user2, TEST_VALUE, defaultParamsEncoded);

        // One second after expiry should succeed
        vm.warp(startTime + SIX_MONTHS + 1);
        module.canTransfer(address(smartToken), user1, user2, TEST_VALUE, defaultParamsEncoded);
    }

    function test_TimeLock_EdgeCase_EmptyBatches() public view {
        // No batches should return empty arrays and zero values
        TimeLockComplianceModule.TokenBatch[] memory batches = module.getTokenBatches(address(smartToken), user1);
        assertEq(batches.length, 0);
        assertEq(module.getTotalBalance(address(smartToken), user1), 0);
        assertEq(module.getAvailableBalance(address(smartToken), user1, defaultParamsEncoded), 0);
    }

    // ============ Exemption Tests ============

    function test_TimeLock_WithExemptions() public {
        // Create time-lock params with secondary sale approval exemption
        TimeLockComplianceModule.TimeLockParams memory paramsWithExemption = TimeLockComplianceModule.TimeLockParams({
            holdPeriod: ONE_YEAR,
            allowExemptions: true,
            exemptionExpression: _secondarySaleApprovalExpression()
        });
        bytes memory paramsEncoded = abi.encode(paramsWithExemption);

        // Create initial batch for user1
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, TEST_VALUE, paramsEncoded);

        // Without exemption, transfer should fail immediately
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector,
                "Insufficient unlocked tokens available"
            )
        );
        module.canTransfer(address(smartToken), user1, user2, TEST_VALUE, paramsEncoded);

        // Issue secondary sale approval claim to user1
        claimUtils.issueCustomClaim(user1, secondarySaleTopicId, "Secondary Sale Approved by Issuer");

        // Now canTransfer should be allowed even during lock period (exemption applies)
        module.canTransfer(address(smartToken), user1, user2, TEST_VALUE, paramsEncoded);

        // Test user2 starting with tokens via minting
        vm.prank(address(smartToken));
        module.created(address(smartToken), user2, TEST_VALUE, paramsEncoded);

        // user2 without exemption cannot transfer
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector,
                "Insufficient unlocked tokens available"
            )
        );
        module.canTransfer(address(smartToken), user2, user1, TEST_VALUE, paramsEncoded);

        // Issue exemption to user2
        claimUtils.issueCustomClaim(user2, secondarySaleTopicId, "Secondary Sale Approved by Issuer");

        // Now user2 can also transfer (canTransfer passes)
        module.canTransfer(address(smartToken), user2, user1, TEST_VALUE, paramsEncoded);

        // Test available balance for users with exemptions
        uint256 user1Available = module.getAvailableBalance(address(smartToken), user1, paramsEncoded);
        uint256 user2Available = module.getAvailableBalance(address(smartToken), user2, paramsEncoded);
        
        // With exemptions, all tokens should be available
        assertEq(user1Available, TEST_VALUE);
        assertEq(user2Available, TEST_VALUE);
    }
}