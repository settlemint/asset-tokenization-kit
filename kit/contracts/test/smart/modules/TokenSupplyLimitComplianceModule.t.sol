// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { AbstractComplianceModuleTest } from "./AbstractComplianceModuleTest.t.sol";
import { TokenSupplyLimitComplianceModule } from "../../../contracts/smart/modules/TokenSupplyLimitComplianceModule.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";
import { ATKTopics } from "../../../contracts/system/ATKTopics.sol";
import { SMARTToken } from "../examples/SMARTToken.sol";
import { ISMARTBurnable } from "../../../contracts/smart/extensions/burnable/ISMARTBurnable.sol";
import { SMARTComplianceModuleParamPair } from
    "../../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";

contract TokenSupplyLimitComplianceModuleTest is AbstractComplianceModuleTest {
    TokenSupplyLimitComplianceModule internal module;

    // Test constants
    uint256 constant LIFETIME_MAX_SUPPLY = 1000000e18; // 1M tokens
    uint256 constant PERIOD_MAX_SUPPLY = 100000e18; // 100K tokens for periodic limits
    uint256 constant PERIOD_LENGTH = 30; // 30 days

    function setUp() public override {
        super.setUp();
        module = new TokenSupplyLimitComplianceModule(address(0));

        // Issue claims to users for testing (smartToken claims are handled in parent setUp)
        claimUtils.issueAllClaims(user1);
        claimUtils.issueAllClaims(user2);
    }

    // --- Basic Module Properties ---

    function test_TokenSupplyLimit_InitialState() public view {
        assertEq(module.name(), "Token Supply Limit Compliance Module");
        assertEq(module.typeId(), keccak256("TokenSupplyLimitComplianceModule"));
    }

    function test_TokenSupplyLimit_SupportsInterface() public view {
        assertTrue(module.supportsInterface(type(ISMARTComplianceModule).interfaceId));
    }

    // --- Parameter Validation Tests ---

    function test_TokenSupplyLimit_ValidateParameters_LifetimeConfig() public view {
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: LIFETIME_MAX_SUPPLY,
            periodLength: 0, // Lifetime
            rolling: false,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);
        module.validateParameters(params);
    }

    function test_TokenSupplyLimit_ValidateParameters_FixedPeriodConfig() public view {
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: PERIOD_MAX_SUPPLY,
            periodLength: PERIOD_LENGTH,
            rolling: false,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);
        module.validateParameters(params);
    }

    function test_TokenSupplyLimit_ValidateParameters_RollingWindowConfig() public view {
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: PERIOD_MAX_SUPPLY,
            periodLength: PERIOD_LENGTH,
            rolling: true,
            useBasePrice: false,

            global: false
        });

        bytes memory params = abi.encode(config);
        module.validateParameters(params);
    }

    function test_TokenSupplyLimit_ValidateParameters_BasePriceConfig() public view {
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: LIFETIME_MAX_SUPPLY,
            periodLength: 0,
            rolling: false,
            useBasePrice: true,
            global: false
        });

        bytes memory params = abi.encode(config);
        module.validateParameters(params);
    }

    function test_TokenSupplyLimit_RevertWhen_MaxSupplyZero() public {
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 0, // Invalid
            periodLength: 0,
            rolling: false,
            useBasePrice: false,
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
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: LIFETIME_MAX_SUPPLY,
            periodLength: 0, // Invalid for rolling
            rolling: true,
            useBasePrice: false,
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
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: PERIOD_MAX_SUPPLY,
            periodLength: 1000, // Long period allowed for fixed periods
            rolling: false,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);
        module.validateParameters(params); // Should not revert
    }

    function test_TokenSupplyLimit_RevertWhen_RollingPeriodTooLong() public {
        // Rolling windows are limited to 730 days (2 years) for gas efficiency
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: PERIOD_MAX_SUPPLY,
            periodLength: 731, // Too long for rolling windows
            rolling: true,
            useBasePrice: false,
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
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: PERIOD_MAX_SUPPLY,
            periodLength: 730, // Exactly at limit
            rolling: true,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);
        module.validateParameters(params); // Should not revert
    }

    function test_TokenSupplyLimit_RevertWhen_InvalidParameters() public {
        bytes memory invalidParams = abi.encode("invalid");
        vm.expectRevert();
        module.validateParameters(invalidParams);
    }

    // --- Lifetime Cap Tests ---

    function test_TokenSupplyLimit_LifetimeCap_AllowMintUnderLimit() public view {
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: LIFETIME_MAX_SUPPLY,
            periodLength: 0, // Lifetime
            rolling: false,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);
        // Should not revert for mint under limit
        module.canTransfer(address(smartToken), address(0), user1, 500000e18, params);
    }

    function test_TokenSupplyLimit_LifetimeCap_RevertWhen_ExceedsLimit() public {
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: LIFETIME_MAX_SUPPLY,
            periodLength: 0, // Lifetime
            rolling: false,
            useBasePrice: false,
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
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: LIFETIME_MAX_SUPPLY,
            periodLength: 0, // Lifetime
            rolling: false,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);

        // First mint should work
        module.canTransfer(address(smartToken), address(0), user1, 400000e18, params);
        vm.prank(address(smartToken));
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
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: LIFETIME_MAX_SUPPLY,
            periodLength: 0,
            rolling: false,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);
        // Regular transfer (not mint) should not be restricted
        module.canTransfer(address(smartToken), user1, user2, type(uint256).max, params);
    }

    // --- Fixed Period Tests ---

    function test_TokenSupplyLimit_FixedPeriod_AllowMintInNewPeriod() public {
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: PERIOD_MAX_SUPPLY,
            periodLength: PERIOD_LENGTH,
            rolling: false,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);

        // First mint in period
        module.canTransfer(address(smartToken), address(0), user1, PERIOD_MAX_SUPPLY, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, PERIOD_MAX_SUPPLY, params);

        // Move time forward to next period
        vm.warp(block.timestamp + PERIOD_LENGTH * 1 days + 1);

        // Should allow minting again in new period
        module.canTransfer(address(smartToken), address(0), user1, PERIOD_MAX_SUPPLY, params);
    }

    function test_TokenSupplyLimit_FixedPeriod_RevertWhen_ExceedsLimitInPeriod() public {
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: PERIOD_MAX_SUPPLY,
            periodLength: PERIOD_LENGTH,
            rolling: false,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);

        // First mint near limit
        module.canTransfer(address(smartToken), address(0), user1, PERIOD_MAX_SUPPLY - 1000e18, params);
        vm.prank(address(smartToken));
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
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 200e18, // 200 tokens limit for rolling window
            periodLength: 3, // 3-day rolling window
            rolling: true,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);
        // Use clean day boundaries to avoid timestamp calculation issues
        uint256 day1 = 1000 * 86400; // Day 1000 at midnight
        uint256 day2 = 1001 * 86400; // Day 1001 at midnight

        // Day 1: Mint 100 tokens
        vm.warp(day1);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 100e18, params);

        // Day 2: Mint 100 tokens (total in 3-day window: 200, at limit)
        vm.warp(day2);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        vm.prank(address(smartToken));
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
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 200e18, // 200 tokens limit
            periodLength: 3, // 3-day rolling window
            rolling: true,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);
        uint256 sameDay = 1000 * 86400; // Day 1000 at midnight

        // First mint: 100 tokens
        vm.warp(sameDay);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 100e18, params);

        // Second mint on SAME day: 100 tokens (should accumulate to 200 total)
        vm.warp(sameDay + 12 hours); // Still same day
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        vm.prank(address(smartToken));
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
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 250e18, // 250 tokens limit
            periodLength: 3, // 3-day rolling window
            rolling: true,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);
        uint256 day1 = 1000 * 86400;
        uint256 day2 = 1001 * 86400;
        uint256 day3 = 1002 * 86400;

        // Day 1: Mint 100 tokens
        vm.warp(day1);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 100e18, params);

        // Day 2: Mint 100 tokens (total in window: 200)
        vm.warp(day2);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 100e18, params);

        // Day 3: Mint 50 tokens (total in window: 250, at limit)
        vm.warp(day3);
        module.canTransfer(address(smartToken), address(0), user1, 50e18, params);
        vm.prank(address(smartToken));
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
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 150e18, // 150 tokens
            periodLength: 2, // 2-day rolling window
            rolling: true,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);
        uint256 dailyAmount = 100e18;
        uint256 startTime = block.timestamp + 365 days; // Avoid underflow in loop

        // Day 1: Mint 100 tokens
        vm.warp(startTime);
        module.canTransfer(address(smartToken), address(0), user1, dailyAmount, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, dailyAmount, params);

        // Day 2: Mint 50 tokens (total in 2-day window: 150, at limit)
        vm.warp(startTime + 1 days);
        module.canTransfer(address(smartToken), address(0), user1, 50e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 50e18, params);

        // Day 3: Window slides, day 1 falls out, so we can mint 100 again
        // (rolling window now includes day 2: 50 + day 3: 100 = 150, at limit)
        vm.warp(startTime + 2 days);
        module.canTransfer(address(smartToken), address(0), user1, dailyAmount, params);
    }

    function test_TokenSupplyLimit_MaxRollingWindow_730Days() public {
        // Test that maximum rolling window (730 days) works efficiently
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 1000e18,
            periodLength: 730, // 2 years - maximum allowed for rolling windows
            rolling: true,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);
        uint256 startTime = block.timestamp + 365 days; // Avoid underflow

        // Day 1: Should work efficiently
        vm.warp(startTime);
        module.canTransfer(address(smartToken), address(0), user1, 500e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 500e18, params);

        // Day 365: Add more within the window
        vm.warp(startTime + 364 days);
        module.canTransfer(address(smartToken), address(0), user1, 499e18, params);
        vm.prank(address(smartToken));
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
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 500e18, // 500 tokens global limit
            periodLength: 0, // Lifetime
            rolling: false,
            useBasePrice: false,
            global: true
        });

        bytes memory params = abi.encode(config);

        // Mint 200 tokens from token1
        module.canTransfer(address(smartToken), address(0), user1, 200e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 200e18, params);

        // Create a second token address for testing (real SMARTToken instance)
        vm.startPrank(tokenIssuer);
        address token2 = address(new SMARTToken(
            "Test Token 2",
            "TEST2",
            18,
            1000e18, // cap
            address(0), // onchainID_
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            new SMARTComplianceModuleParamPair[](0),
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_COLLATERAL),
            address(accessManager)
        ));
        vm.stopPrank();

        // Mint 200 tokens from token2 (global total: 400)
        module.canTransfer(token2, address(0), user1, 200e18, params);
        vm.prank(token2);
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
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 300e18, // 300 tokens global limit
            periodLength: 3, // 3-day rolling window
            rolling: true,
            useBasePrice: false,
            global: true
        });

        bytes memory params = abi.encode(config);
        uint256 sameDay = 1000 * 86400;
        vm.startPrank(tokenIssuer);
        address token2 = address(new SMARTToken(
            "Test Token 2",
            "TEST2",
            18,
            1000e18,
            address(0),
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            new SMARTComplianceModuleParamPair[](0),
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_COLLATERAL),
            address(accessManager)
        ));
        vm.stopPrank();

        // Same day: mint 100 from token1
        vm.warp(sameDay);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 100e18, params);

        // Same day: mint 100 from token2 (global total: 200)
        vm.warp(sameDay + 6 hours);
        module.canTransfer(token2, address(0), user1, 100e18, params);
        vm.prank(token2);
        module.created(token2, user1, 100e18, params);

        // Same day: mint 100 more from token1 (global total: 300)
        vm.warp(sameDay + 12 hours);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 100e18, params);

        // Try to mint 1 more - should fail (300 + 1 > 300)
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        module.canTransfer(token2, address(0), user1, 1, params);
    }

    function test_TokenSupplyLimit_Global_RollingWindow_AcrossDays() public {
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 400e18, // 400 tokens global limit
            periodLength: 3, // 3-day rolling window
            rolling: true,
            useBasePrice: false,
            global: true
        });

        bytes memory params = abi.encode(config);
        uint256 day1 = 1000 * 86400;
        uint256 day2 = 1001 * 86400;
        uint256 day3 = 1002 * 86400;
        vm.startPrank(tokenIssuer);
        address token2 = address(new SMARTToken(
            "Test Token 2",
            "TEST2",
            18,
            1000e18,
            address(0),
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            new SMARTComplianceModuleParamPair[](0),
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_COLLATERAL),
            address(accessManager)
        ));
        vm.stopPrank();

        // Day 1: mint 100 from token1
        vm.warp(day1);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 100e18, params);

        // Day 2: mint 150 from token2 (global window total: 250)
        vm.warp(day2);
        module.canTransfer(token2, address(0), user1, 150e18, params);
        vm.prank(token2);
        module.created(token2, user1, 150e18, params);

        // Day 3: mint 150 from token1 (global window total: 400, at limit)
        vm.warp(day3);
        module.canTransfer(address(smartToken), address(0), user1, 150e18, params);
        vm.prank(address(smartToken));
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
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 200e18, // 200 tokens global limit
            periodLength: 2, // 2-day rolling window
            rolling: true,
            useBasePrice: false,
            global: true
        });

        bytes memory params = abi.encode(config);
        uint256 day1 = 1000 * 86400;
        uint256 day2 = 1001 * 86400;
        uint256 day3 = 1002 * 86400;
        vm.startPrank(tokenIssuer);
        address token2 = address(new SMARTToken(
            "Test Token 2",
            "TEST2",
            18,
            1000e18,
            address(0),
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            new SMARTComplianceModuleParamPair[](0),
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_COLLATERAL),
            address(accessManager)
        ));
        vm.stopPrank();

        // Day 1: mint 100 from token1
        vm.warp(day1);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 100e18, params);

        // Day 2: mint 100 from token2 (global window: 200, at limit)
        vm.warp(day2);
        module.canTransfer(token2, address(0), user1, 100e18, params);
        vm.prank(token2);
        module.created(token2, user1, 100e18, params);

        // Day 3: window slides - day 1 falls out, only day 2 and 3 in window
        // Current window has 100 from day 2, so we can mint 100 more
        vm.warp(day3);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        vm.prank(address(smartToken));
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
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 300e18, // 300 tokens global limit per period
            periodLength: 30, // 30-day fixed periods
            rolling: false,
            useBasePrice: false,
            global: true
        });

        bytes memory params = abi.encode(config);
        uint256 startTime = 1000 * 86400;
        vm.startPrank(tokenIssuer);
        address token2 = address(new SMARTToken(
            "Test Token 2",
            "TEST2",
            18,
            1000e18, // cap
            address(0), // onchainID_
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            new SMARTComplianceModuleParamPair[](0),
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_COLLATERAL),
            address(accessManager)
        ));
        vm.stopPrank();

        // Period 1: mint 150 from token1
        vm.warp(startTime);
        module.canTransfer(address(smartToken), address(0), user1, 150e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 150e18, params);

        // Period 1: mint 149 from token2 (total: 299, under limit)
        module.canTransfer(token2, address(0), user1, 149e18, params);
        vm.prank(token2);
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

    // --- Burn Tracking Tests ---

    function test_TokenSupplyLimit_Burn_LifetimeCap() public {
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 500e18, // 500 tokens lifetime limit
            periodLength: 0, // Lifetime
            rolling: false,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);

        // Mint 400 tokens
        module.canTransfer(address(smartToken), address(0), user1, 400e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 400e18, params);

        // Try to mint 150 more - should fail (400 + 150 > 500)
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        module.canTransfer(address(smartToken), address(0), user1, 150e18, params);

        // Burn 100 tokens (reduces tracked supply to 300)
        vm.prank(address(smartToken));
        module.destroyed(address(smartToken), user1, 100e18, params);

        // Now should be able to mint 200 more (300 + 200 = 500)
        module.canTransfer(address(smartToken), address(0), user1, 200e18, params);

        // But 201 should still fail
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        module.canTransfer(address(smartToken), address(0), user1, 201e18, params);
    }

    function test_TokenSupplyLimit_Burn_RollingWindow_SameDay() public {
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 200e18, // 200 tokens limit
            periodLength: 3, // 3-day rolling window
            rolling: true,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);
        uint256 sameDay = 1000 * 86400;

        // Mint 150 tokens
        vm.warp(sameDay);
        module.canTransfer(address(smartToken), address(0), user1, 150e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 150e18, params);

        // Try to mint 100 more - should fail (150 + 100 > 200)
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);

        // Burn 50 tokens on same day (reduces daily supply to 100)
        vm.warp(sameDay + 6 hours);
        vm.prank(address(smartToken));
        module.destroyed(address(smartToken), user1, 50e18, params);

        // Now should be able to mint 100 more (100 + 100 = 200)
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
    }

    function test_TokenSupplyLimit_Burn_RollingWindow_AcrossDays() public {
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 300e18, // 300 tokens limit
            periodLength: 3, // 3-day rolling window
            rolling: true,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);
        uint256 day1 = 1000 * 86400;
        uint256 day2 = 1001 * 86400;

        // Day 1: Mint 150 tokens
        vm.warp(day1);
        module.canTransfer(address(smartToken), address(0), user1, 150e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 150e18, params);

        // Day 2: Mint 150 tokens (total: 300, at limit)
        vm.warp(day2);
        module.canTransfer(address(smartToken), address(0), user1, 150e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 150e18, params);

        // Day 2: Try to mint 1 more - should fail
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        module.canTransfer(address(smartToken), address(0), user1, 1, params);

        // Day 2: Burn 50 tokens (reduces day 2 supply to 100, total window: 250)
        vm.prank(address(smartToken));
        module.destroyed(address(smartToken), user1, 50e18, params);

        // Now should be able to mint 50 more (250 + 50 = 300)
        module.canTransfer(address(smartToken), address(0), user1, 50e18, params);
    }

    function test_TokenSupplyLimit_Burn_FixedPeriod() public {
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 400e18, // 400 tokens per period
            periodLength: 30, // 30-day periods
            rolling: false,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);
        uint256 startTime = 1000 * 86400;

        // Mint 350 tokens in period 1
        vm.warp(startTime);
        module.canTransfer(address(smartToken), address(0), user1, 350e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 350e18, params);

        // Try to mint 100 more - should fail (350 + 100 > 400)
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);

        // Burn 75 tokens (reduces period supply to 275)
        vm.prank(address(smartToken));
        module.destroyed(address(smartToken), user1, 75e18, params);

        // Now should be able to mint 125 more (275 + 125 = 400)
        module.canTransfer(address(smartToken), address(0), user1, 125e18, params);
    }

    function test_TokenSupplyLimit_Burn_Global_CrossToken() public {
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 300e18, // 300 tokens global limit
            periodLength: 0, // Lifetime
            rolling: false,
            useBasePrice: false,
            global: true
        });

        bytes memory params = abi.encode(config);

        vm.startPrank(tokenIssuer);
        address token2 = address(new SMARTToken(
            "Test Token 2",
            "TEST2",
            18,
            1000e18,
            address(0),
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            new SMARTComplianceModuleParamPair[](0),
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_COLLATERAL),
            address(accessManager)
        ));
        vm.stopPrank();

        // Mint 150 from token1
        module.canTransfer(address(smartToken), address(0), user1, 150e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 150e18, params);

        // Mint 150 from token2 (global total: 300, at limit)
        module.canTransfer(token2, address(0), user1, 150e18, params);
        vm.prank(token2);
        module.created(token2, user1, 150e18, params);

        // Try to mint 1 more from either token - should fail
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        module.canTransfer(address(smartToken), address(0), user1, 1, params);

        // Burn 50 from token1 (reduces global supply to 250)
        vm.prank(address(smartToken));
        module.destroyed(address(smartToken), user1, 50e18, params);

        // Now should be able to mint 50 from either token
        module.canTransfer(token2, address(0), user1, 50e18, params);
    }

    function test_TokenSupplyLimit_Burn_EdgeCase_BurnMoreThanSupply() public {
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 500e18,
            periodLength: 0, // Lifetime
            rolling: false,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);

        // Mint 100 tokens
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 100e18, params);

        // Burn 200 tokens (more than minted) - should set supply to 0
        vm.prank(address(smartToken));
        module.destroyed(address(smartToken), user1, 200e18, params);

        // Should be able to mint full limit now
        module.canTransfer(address(smartToken), address(0), user1, 500e18, params);
    }

    function test_TokenSupplyLimit_Burn_EdgeCase_BurnWithoutMint() public {
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 500e18,
            periodLength: 3, // Rolling window
            rolling: true,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);
        uint256 today = 1000 * 86400;

        // Burn tokens without any prior mints (should be no-op)
        vm.warp(today);
        vm.prank(address(smartToken));
        module.destroyed(address(smartToken), user1, 100e18, params);

        // Should still be able to mint full limit
        module.canTransfer(address(smartToken), address(0), user1, 500e18, params);
    }

    function test_TokenSupplyLimit_Burn_MintBurnMintCycle() public {
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 200e18,
            periodLength: 2, // 2-day rolling window
            rolling: true,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);
        uint256 day1 = 1000 * 86400;
        uint256 day2 = 1001 * 86400;
        uint256 day3 = 1002 * 86400;

        // Day 1: Mint 100
        vm.warp(day1);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 100e18, params);

        // Day 2: Mint 100 (total: 200, at limit)
        vm.warp(day2);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 100e18, params);

        // Day 2: Burn 50 (day 2 supply: 50, window total: 150)
        vm.prank(address(smartToken));
        module.destroyed(address(smartToken), user1, 50e18, params);

        // Day 2: Should be able to mint 50 more (150 + 50 = 200)
        module.canTransfer(address(smartToken), address(0), user1, 50e18, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 50e18, params);

        // Day 3: Window slides, day 1 falls out
        // Current window: day 2 (100) + day 3 (0) = 100
        vm.warp(day3);
        module.canTransfer(address(smartToken), address(0), user1, 100e18, params);
    }

    function test_TokenSupplyLimit_Integration_BurnAndMintWithRealToken() public {
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 600e18, // 600 tokens - under the token cap of 1000e18
            periodLength: 0, // Lifetime
            rolling: false,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);

        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), params);

        // Mint to near limit
        smartToken.mint(user1, 500e18);
        assertEq(smartToken.balanceOf(user1), 500e18);

        // Try to mint more - should fail
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        smartToken.mint(user1, 150e18);

        // Burn some tokens
        ISMARTBurnable(address(smartToken)).burn(user1, 100e18);
        assertEq(smartToken.balanceOf(user1), 400e18);

        // Now should be able to mint again
        smartToken.mint(user1, 200e18);
        assertEq(smartToken.balanceOf(user1), 600e18);

        // But still at compliance limit
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token supply would exceed configured limit"
            )
        );
        smartToken.mint(user1, 1);

        vm.stopPrank();
    }

    // --- Integration Tests ---

    function test_TokenSupplyLimit_Integration_TokenMintingWithModule() public {
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 800e18, // 800 tokens - under the token cap of 1000e18
            periodLength: 0, // Lifetime
            rolling: false,
            useBasePrice: false,
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
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 900e18, // 900 tokens - under the token cap of 1000e18
            periodLength: 0,
            rolling: false,
            useBasePrice: false,
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
        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: LIFETIME_MAX_SUPPLY,
            periodLength: 0,
            rolling: false,
            useBasePrice: false,
            global: false
        });

        bytes memory params = abi.encode(config);

        // These functions should not revert
        vm.prank(address(smartToken));
        module.transferred(address(smartToken), tokenIssuer, user1, 100, params);
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 100, params);
        vm.prank(address(smartToken));
        module.destroyed(address(smartToken), user1, 100, params);
    }

     // --- Base Price Conversion Tests ---
    function test_TokenSupplyLimit_BasePrice_ConvertsTokenAmounts() public {
        // First, add a base price claim to the token's identity
        claimUtils.issueBasePriceClaim(address(smartToken), tokenIssuer, 2e18, "EUR", 18);

        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 8000000e18, // 8M EUR limit
            periodLength: 0,
            rolling: false,
            useBasePrice: true,
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
        // Create token
        vm.startPrank(tokenIssuer);
        address tokenWithoutIdentity = address(new SMARTToken(
            "Test Token",
            "TEST",
            18,
            1000e18, // cap
            address(0), // onchainID_
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            new SMARTComplianceModuleParamPair[](0),
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_COLLATERAL),
            address(accessManager)
        ));
        vm.stopPrank();

        TokenSupplyLimitComplianceModule.SupplyLimitConfig memory config = TokenSupplyLimitComplianceModule
            .SupplyLimitConfig({
            maxSupply: 8000000e18,
            periodLength: 0,
            rolling: false,
            useBasePrice: true,
            global: false
        });

        bytes memory params = abi.encode(config);

        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Token has no identity")
        );
        module.canTransfer(tokenWithoutIdentity, address(0), user1, 1000e18, params);
    }

}