// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { AbstractComplianceModuleTest } from "./AbstractComplianceModuleTest.t.sol";
import { SMARTTokenSupplyLimitComplianceModule } from "../../../contracts/smart/modules/TokenSupplyLimitComplianceModule.sol";
import { TestConstants } from "../../Constants.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";
import { ATKTopics } from "../../../contracts/system/ATKTopics.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

contract TokenSupplyLimitComplianceModuleTest is AbstractComplianceModuleTest {
    SMARTTokenSupplyLimitComplianceModule internal module;

    // Test constants
    uint256 constant LIFETIME_MAX_SUPPLY = 1000000e18; // 1M tokens
    uint256 constant PERIOD_MAX_SUPPLY = 100000e18; // 100K tokens for periodic limits
    uint256 constant PERIOD_LENGTH = 30; // 30 days

    function setUp() public override {
        super.setUp();
        module = new SMARTTokenSupplyLimitComplianceModule(address(0));

        // Issue claims to users for testing (smartToken claims are handled in parent setUp)
        claimUtils.issueAllClaims(user1);
        claimUtils.issueAllClaims(user2);
    }

    // --- Basic Module Properties ---

    function test_TokenSupplyLimit_InitialState() public view {
        assertEq(module.name(), "Token Supply Limit Compliance Module");
        assertEq(module.typeId(), keccak256("SMARTTokenSupplyLimitComplianceModule"));
    }

    function test_TokenSupplyLimit_SupportsInterface() public view {
        assertTrue(module.supportsInterface(type(ISMARTComplianceModule).interfaceId));
    }

    // --- Parameter Validation Tests ---

    function test_TokenSupplyLimit_ValidateParameters_LifetimeConfig() public view {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: LIFETIME_MAX_SUPPLY,
            periodLength: 0, // Lifetime
            rolling: false,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);
        module.validateParameters(params);
    }

    function test_TokenSupplyLimit_ValidateParameters_FixedPeriodConfig() public view {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: PERIOD_MAX_SUPPLY,
            periodLength: PERIOD_LENGTH,
            rolling: false,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);
        module.validateParameters(params);
    }

    function test_TokenSupplyLimit_ValidateParameters_RollingWindowConfig() public view {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: PERIOD_MAX_SUPPLY,
            periodLength: PERIOD_LENGTH,
            rolling: true,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);
        module.validateParameters(params);
    }

    function test_TokenSupplyLimit_ValidateParameters_BasePriceConfig() public view {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: LIFETIME_MAX_SUPPLY,
            periodLength: 0,
            rolling: false,
            useBasePrice: true,
            basePriceTopicId: claimUtils.getTopicId(ATKTopics.TOPIC_BASE_PRICE),
            global: false
        });

        bytes memory params = abi.encode(config);
        module.validateParameters(params);
    }

    function test_TokenSupplyLimit_RevertWhen_MaxSupplyZero() public {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 0, // Invalid
            periodLength: 0,
            rolling: false,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.InvalidParameters.selector, "Maximum supply must be greater than zero"
            )
        );
        module.validateParameters(params);
    }

    function test_TokenSupplyLimit_RevertWhen_RollingWithoutPeriod() public {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: LIFETIME_MAX_SUPPLY,
            periodLength: 0, // Invalid for rolling
            rolling: true,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.InvalidParameters.selector, "Rolling window requires periodLength > 0"
            )
        );
        module.validateParameters(params);
    }

    function test_TokenSupplyLimit_ValidateParameters_LongPeriod() public view {
        // Long periods should be allowed for fixed periods (no gas limit issues)
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: PERIOD_MAX_SUPPLY,
            periodLength: 1000, // Long period allowed for fixed periods
            rolling: false,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);
        module.validateParameters(params); // Should not revert
    }

    function test_TokenSupplyLimit_RevertWhen_RollingPeriodTooLong() public {
        // Rolling windows are limited to 730 days (2 years) for gas efficiency
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: PERIOD_MAX_SUPPLY,
            periodLength: 731, // Too long for rolling windows
            rolling: true,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.InvalidParameters.selector,
                "Rolling window cannot exceed 730 days (2 years) to prevent gas limit issues"
            )
        );
        module.validateParameters(params);
    }

    function test_TokenSupplyLimit_ValidateParameters_MaxRollingPeriod() public view {
        // 730 days should be allowed for rolling windows
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: PERIOD_MAX_SUPPLY,
            periodLength: 730, // Exactly at limit
            rolling: true,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);
        module.validateParameters(params); // Should not revert
    }

    function test_TokenSupplyLimit_RevertWhen_BasePriceWithoutTopicId() public {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: LIFETIME_MAX_SUPPLY,
            periodLength: 0,
            rolling: false,
            useBasePrice: true,
            basePriceTopicId: 0, // Invalid when useBasePrice is true
            global: false
        });

        bytes memory params = abi.encode(config);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.InvalidParameters.selector, "Base price topic ID required when useBasePrice is true"
            )
        );
        module.validateParameters(params);
    }

    function test_TokenSupplyLimit_RevertWhen_InvalidParameters() public {
        bytes memory invalidParams = abi.encode("invalid");
        vm.expectRevert();
        module.validateParameters(invalidParams);
    }

    // --- Lifetime Cap Tests ---

    function test_TokenSupplyLimit_LifetimeCap_AllowMintUnderLimit() public view {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: LIFETIME_MAX_SUPPLY,
            periodLength: 0, // Lifetime
            rolling: false,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);
        // Should not revert for mint under limit
        module.canTransfer(address(smartToken), address(0), user1, 500000e18, params);
    }

    function test_TokenSupplyLimit_LifetimeCap_RevertWhen_ExceedsLimit() public {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: LIFETIME_MAX_SUPPLY,
            periodLength: 0, // Lifetime
            rolling: false,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        module.canTransfer(address(smartToken), address(0), user1, LIFETIME_MAX_SUPPLY + 1, params);
    }

    function test_TokenSupplyLimit_LifetimeCap_TracksMintedTokens() public {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: LIFETIME_MAX_SUPPLY,
            periodLength: 0, // Lifetime
            rolling: false,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);

        // First mint should work
        module.canTransfer(address(smartToken), address(0), user1, 400000e18, params);
        module.created(address(smartToken), user1, 400000e18, params);

        // Second mint that would exceed limit should fail
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        module.canTransfer(address(smartToken), address(0), user1, 700000e18, params);

        // But smaller mint should work
        module.canTransfer(address(smartToken), address(0), user1, 500000e18, params);
    }

    function test_TokenSupplyLimit_AllowsRegularTransfers() public view {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: LIFETIME_MAX_SUPPLY,
            periodLength: 0,
            rolling: false,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);
        // Regular transfer (not mint) should not be restricted
        module.canTransfer(address(smartToken), user1, user2, type(uint256).max, params);
    }

    // --- Fixed Period Tests ---

    function test_TokenSupplyLimit_FixedPeriod_AllowMintInNewPeriod() public {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: PERIOD_MAX_SUPPLY,
            periodLength: PERIOD_LENGTH,
            rolling: false,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);

        // First mint in period
        module.canTransfer(address(smartToken), address(0), user1, PERIOD_MAX_SUPPLY, params);
        module.created(address(smartToken), user1, PERIOD_MAX_SUPPLY, params);

        // Move time forward to next period
        vm.warp(block.timestamp + PERIOD_LENGTH * 1 days + 1);

        // Should allow minting again in new period
        module.canTransfer(address(smartToken), address(0), user1, PERIOD_MAX_SUPPLY, params);
    }

    function test_TokenSupplyLimit_FixedPeriod_RevertWhen_ExceedsLimitInPeriod() public {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: PERIOD_MAX_SUPPLY,
            periodLength: PERIOD_LENGTH,
            rolling: false,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);

        // First mint near limit
        module.canTransfer(address(smartToken), address(0), user1, PERIOD_MAX_SUPPLY - 1000e18, params);
        module.created(address(smartToken), user1, PERIOD_MAX_SUPPLY - 1000e18, params);

        // Second mint that would exceed period limit should fail
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        module.canTransfer(address(smartToken), address(0), user1, 2000e18, params);
    }

    // --- Rolling Window Tests ---

    function test_TokenSupplyLimit_RollingWindow_BasicTracking() public {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 200e18, // 200 tokens limit for rolling window
            periodLength: 3, // 3-day rolling window
            rolling: true,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);
        // Use clean day boundaries to avoid timestamp calculation issues
        uint256 day1 = 1000 * 86400; // Day 1000 at midnight
        uint256 day2 = 1001 * 86400; // Day 1001 at midnight

        // Day 1: Mint 100 tokens
        vm.warp(day1);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        module.created(address(smartToken), user1, 100e18, params);

        // Day 2: Mint 100 tokens (total in 3-day window: 200, at limit)
        vm.warp(day2);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        module.created(address(smartToken), user1, 100e18, params);

        // Day 2: Try to mint 1 more, should fail (rolling window includes day 1 + day 2)
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        module.canTransfer(address(smartToken), address(0), user1, 1, params);
    }

    function test_TokenSupplyLimit_RollingWindow_SameDayAccumulation() public {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 200e18, // 200 tokens limit
            periodLength: 3, // 3-day rolling window
            rolling: true,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);
        uint256 sameDay = 1000 * 86400; // Day 1000 at midnight

        // First mint: 100 tokens
        vm.warp(sameDay);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        module.created(address(smartToken), user1, 100e18, params);

        // Second mint on SAME day: 100 tokens (should accumulate to 200 total)
        vm.warp(sameDay + 12 hours); // Still same day
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        module.created(address(smartToken), user1, 100e18, params);

        // Try to mint 1 more token on same day - should fail
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        module.canTransfer(address(smartToken), address(0), user1, 1, params);
    }

    function test_TokenSupplyLimit_RollingWindow_ExceedsLimitAcrossDays() public {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 250e18, // 250 tokens limit
            periodLength: 3, // 3-day rolling window
            rolling: true,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);
        uint256 day1 = 1000 * 86400;
        uint256 day2 = 1001 * 86400;
        uint256 day3 = 1002 * 86400;

        // Day 1: Mint 100 tokens
        vm.warp(day1);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        module.created(address(smartToken), user1, 100e18, params);

        // Day 2: Mint 100 tokens (total in window: 200)
        vm.warp(day2);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        module.created(address(smartToken), user1, 100e18, params);

        // Day 3: Mint 50 tokens (total in window: 250, at limit)
        vm.warp(day3);
        module.canTransfer(address(smartToken), address(0), user1, 50e18, params);
        module.created(address(smartToken), user1, 50e18, params);

        // Day 3: Try to mint 1 more - should fail (would make total 251 > 250)
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        module.canTransfer(address(smartToken), address(0), user1, 1e18, params);
    }

    function test_TokenSupplyLimit_RollingWindow_AllowsMintAfterWindowSlides() public {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 150e18, // 150 tokens
            periodLength: 2, // 2-day rolling window
            rolling: true,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);
        uint256 dailyAmount = 100e18;
        uint256 startTime = block.timestamp + 365 days; // Avoid underflow in loop

        // Day 1: Mint 100 tokens
        vm.warp(startTime);
        module.canTransfer(address(smartToken), address(0), user1, dailyAmount, params);
        module.created(address(smartToken), user1, dailyAmount, params);

        // Day 2: Mint 50 tokens (total in 2-day window: 150, at limit)
        vm.warp(startTime + 1 days);
        module.canTransfer(address(smartToken), address(0), user1, 50e18, params);
        module.created(address(smartToken), user1, 50e18, params);

        // Day 3: Window slides, day 1 falls out, so we can mint 100 again
        // (rolling window now includes day 2: 50 + day 3: 100 = 150, at limit)
        vm.warp(startTime + 2 days);
        module.canTransfer(address(smartToken), address(0), user1, dailyAmount, params);
    }

    function test_TokenSupplyLimit_MaxRollingWindow_730Days() public {
        // Test that maximum rolling window (730 days) works efficiently
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 1000e18,
            periodLength: 730, // 2 years - maximum allowed for rolling windows
            rolling: true,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);
        uint256 startTime = block.timestamp + 365 days; // Avoid underflow

        // Day 1: Should work efficiently
        vm.warp(startTime);
        module.canTransfer(address(smartToken), address(0), user1, 500e18, params);
        module.created(address(smartToken), user1, 500e18, params);

        // Day 365: Add more within the window
        vm.warp(startTime + 364 days);
        module.canTransfer(address(smartToken), address(0), user1, 499e18, params);
        module.created(address(smartToken), user1, 499e18, params);

        // Should be at limit now within 730-day window (999 total)
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        module.canTransfer(address(smartToken), address(0), user1, 2e18, params);

        // But should allow exactly 1 more to reach limit
        module.canTransfer(address(smartToken), address(0), user1, 1e18, params);
    }



    // --- Global Tracking Tests ---

    function test_TokenSupplyLimit_Global_LifetimeCap() public {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 500e18, // 500 tokens global limit
            periodLength: 0, // Lifetime
            rolling: false,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: true
        });

        bytes memory params = abi.encode(config);

        // Mint 200 tokens from token1
        module.canTransfer(address(smartToken), address(0), user1, 200e18, params);
        module.created(address(smartToken), user1, 200e18, params);

        // Create a second token address for testing
        address token2 = address(0x9999);

        // Mint 200 tokens from token2 (global total: 400)
        module.canTransfer(token2, address(0), user1, 200e18, params);
        module.created(token2, user1, 200e18, params);

        // Try to mint 150 more from token1 - should fail (400 + 150 > 500)
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        module.canTransfer(address(smartToken), address(0), user1, 150e18, params);

        // But 100 more should work (400 + 100 = 500)
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
    }

    function test_TokenSupplyLimit_Global_RollingWindow_SameDayAccumulation() public {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 300e18, // 300 tokens global limit
            periodLength: 3, // 3-day rolling window
            rolling: true,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: true
        });

        bytes memory params = abi.encode(config);
        uint256 sameDay = 1000 * 86400;
        address token2 = address(0x9999);

        // Same day: mint 100 from token1
        vm.warp(sameDay);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        module.created(address(smartToken), user1, 100e18, params);

        // Same day: mint 100 from token2 (global total: 200)
        vm.warp(sameDay + 6 hours);
        module.canTransfer(token2, address(0), user1, 100e18, params);
        module.created(token2, user1, 100e18, params);

        // Same day: mint 100 more from token1 (global total: 300)
        vm.warp(sameDay + 12 hours);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        module.created(address(smartToken), user1, 100e18, params);

        // Try to mint 1 more - should fail (300 + 1 > 300)
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        module.canTransfer(address(smartToken), address(0), user1, 1, params);
    }

    function test_TokenSupplyLimit_Global_RollingWindow_AcrossDays() public {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 400e18, // 400 tokens global limit
            periodLength: 3, // 3-day rolling window
            rolling: true,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: true
        });

        bytes memory params = abi.encode(config);
        uint256 day1 = 1000 * 86400;
        uint256 day2 = 1001 * 86400;
        uint256 day3 = 1002 * 86400;
        address token2 = address(0x9999);

        // Day 1: mint 100 from token1
        vm.warp(day1);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        module.created(address(smartToken), user1, 100e18, params);

        // Day 2: mint 150 from token2 (global window total: 250)
        vm.warp(day2);
        module.canTransfer(token2, address(0), user1, 150e18, params);
        module.created(token2, user1, 150e18, params);

        // Day 3: mint 150 from token1 (global window total: 400, at limit)
        vm.warp(day3);
        module.canTransfer(address(smartToken), address(0), user1, 150e18, params);
        module.created(address(smartToken), user1, 150e18, params);

        // Day 3: try to mint 1 more from either token - should fail
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        module.canTransfer(token2, address(0), user1, 1e18, params);
    }

    function test_TokenSupplyLimit_Global_RollingWindow_WindowSlides() public {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 200e18, // 200 tokens global limit
            periodLength: 2, // 2-day rolling window
            rolling: true,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: true
        });

        bytes memory params = abi.encode(config);
        uint256 day1 = 1000 * 86400;
        uint256 day2 = 1001 * 86400;
        uint256 day3 = 1002 * 86400;
        address token2 = address(0x9999);

        // Day 1: mint 100 from token1
        vm.warp(day1);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        module.created(address(smartToken), user1, 100e18, params);

        // Day 2: mint 100 from token2 (global window: 200, at limit)
        vm.warp(day2);
        module.canTransfer(token2, address(0), user1, 100e18, params);
        module.created(token2, user1, 100e18, params);

        // Day 3: window slides - day 1 falls out, only day 2 and 3 in window
        // Current window has 100 from day 2, so we can mint 100 more
        vm.warp(day3);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        module.created(address(smartToken), user1, 100e18, params);

        // Now at limit again (day 2: 100 + day 3: 100 = 200)
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        module.canTransfer(token2, address(0), user1, 1, params);
    }

    function test_TokenSupplyLimit_Global_FixedPeriod() public {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 300e18, // 300 tokens global limit per period
            periodLength: 30, // 30-day fixed periods
            rolling: false,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: true
        });

        bytes memory params = abi.encode(config);
        uint256 startTime = 1000 * 86400;
        address token2 = address(0x9999);

        // Period 1: mint 150 from token1
        vm.warp(startTime);
        module.canTransfer(address(smartToken), address(0), user1, 150e18, params);
        module.created(address(smartToken), user1, 150e18, params);

        // Period 1: mint 149 from token2 (total: 299, under limit)
        module.canTransfer(token2, address(0), user1, 149e18, params);
        module.created(token2, user1, 149e18, params);

        // Period 1: try to mint 2 more - should fail (299 + 2 > 300)
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        module.canTransfer(address(smartToken), address(0), user1, 2e18, params);

        // Move to period 2 (after 30 days)
        vm.warp(startTime + 31 days);

        // Period 2: should allow minting again (fresh period)
        module.canTransfer(address(smartToken), address(0), user1, 300e18, params);
    }

    // --- Integration Tests ---

    function test_TokenSupplyLimit_Integration_TokenMintingWithModule() public {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 800e18, // 800 tokens - under the token cap of 1000e18
            periodLength: 0, // Lifetime
            rolling: false,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);

        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), params);

        // Should succeed - under limit
        smartToken.mint(user1, 400e18);
        assertEq(smartToken.balanceOf(user1), 400e18);

        // Should succeed - still under limit
        smartToken.mint(user1, 300e18);
        assertEq(smartToken.balanceOf(user1), 700e18);

        // Should fail - would exceed compliance limit
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        smartToken.mint(user1, 200e18);

        vm.stopPrank();
    }

    function test_TokenSupplyLimit_Integration_RegularTransfersUnaffected() public {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 900e18, // 900 tokens - under the token cap of 1000e18
            periodLength: 0,
            rolling: false,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);

        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), params);
        smartToken.mint(tokenIssuer, 600e18);

        // Regular transfers should work regardless of amounts
        assertTrue(smartToken.transfer(user1, 300e18));
        assertTrue(smartToken.transfer(user2, 300e18));
        vm.stopPrank();

        // User-to-user transfers should also work
        vm.prank(user1);
        assertTrue(smartToken.transfer(user2, 150e18));

        assertEq(smartToken.balanceOf(user1), 150e18);
        assertEq(smartToken.balanceOf(user2), 450e18);
    }

    // --- Lifecycle Function Tests ---

    function test_TokenSupplyLimit_Lifecycle_Functions() public {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: LIFETIME_MAX_SUPPLY,
            periodLength: 0,
            rolling: false,
            useBasePrice: false,
            basePriceTopicId: 0,
            global: false
        });

        bytes memory params = abi.encode(config);

        // These functions should not revert
        module.transferred(address(smartToken), tokenIssuer, user1, 100, params);
        module.destroyed(address(smartToken), user1, 100, params);
    }

     // --- Base Price Conversion Tests ---
    function test_TokenSupplyLimit_BasePrice_ConvertsTokenAmounts() public {
        // First, add a base price claim to the token's identity
        claimUtils.issueBasePriceClaim(address(smartToken), tokenIssuer, 2e18, "EUR", 18);

        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 8000000e18, // 8M EUR limit
            periodLength: 0,
            rolling: false,
            useBasePrice: true,
            basePriceTopicId: claimUtils.getTopicId(ATKTopics.TOPIC_BASE_PRICE),
            global: false
        });

        bytes memory params = abi.encode(config);

        // Should allow minting 4M tokens (= 8M EUR)
        module.canTransfer(address(smartToken), address(0), user1, 4000000e18, params);

        // Should reject minting 4M + 1 tokens (= 8M + 2 EUR)
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        module.canTransfer(address(smartToken), address(0), user1, 4000001e18, params);
    }

    function test_TokenSupplyLimit_BasePrice_RevertWhen_NoIdentity() public {
        // Create a config that uses base price for a token with no identity
        address tokenWithoutIdentity = makeAddr("tokenWithoutIdentity");

        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 8000000e18,
            periodLength: 0,
            rolling: false,
            useBasePrice: true,
            basePriceTopicId: claimUtils.getTopicId(ATKTopics.TOPIC_BASE_PRICE),
            global: false
        });

        bytes memory params = abi.encode(config);

        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token has no identity")
        );
        module.canTransfer(tokenWithoutIdentity, address(0), user1, 1000e18, params);
    }

    function test_TokenSupplyLimit_BasePrice_RevertWhen_NoPriceClaim() public {
        SMARTTokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = SMARTTokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 8000000e18,
            periodLength: 0,
            rolling: false,
            useBasePrice: true,
            basePriceTopicId: 999, // Non-existent topic
            global: false
        });

        bytes memory params = abi.encode(config);

        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token has no base price claim")
        );
        module.canTransfer(address(smartToken), address(0), user1, 1000e18, params);
    }

}