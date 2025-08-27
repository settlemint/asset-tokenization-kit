// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title InvestorCountComplianceModuleTest
 * @dev Comprehensive test suite for the Investor Count Compliance Module.
 *
 * This module enables enforcement of investor limits in various configurations:
 *
 * CONFIGURATION EXAMPLES:
 * - "Max 50 US, 30 EU": maxInvestors=0, countryCodes=[840,276], countryLimits=[50,30]
 * - "Max 100 total with 50 US, 30 EU": maxInvestors=100, countryCodes=[840,276], countryLimits=[50,30]
 * - "Max 100 total, no country limits": maxInvestors=100, countryCodes=[], countryLimits=[]
 * - "Global tracking across all tokens": maxInvestors=1000, global=true
 * - "Topic-filtered counting (KYC holders only)": topicFilter=[KYC]
 *
 * FEATURE COVERAGE:
 * ✓ Parameter validation (arrays must match, limits > 0)
 * ✓ Global investor caps (across single/multiple tokens)
 * ✓ Country-specific limits (per ISO country codes)
 * ✓ Combined global + country enforcement
 * ✓ Topic-based filtering (only count investors with specific claims)
 * ✓ Investor lifecycle tracking (add/remove/transfer/burn)
 * ✓ View functions for current counts
 * ✓ Edge cases (no identity = not counted)
 */
import { AbstractComplianceModuleTest } from "./AbstractComplianceModuleTest.t.sol";
import { InvestorCountComplianceModule } from "../../../contracts/smart/modules/InvestorCountComplianceModule.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";
import { TestConstants } from "../../Constants.sol";
import { ExpressionNode, ExpressionType } from "../../../contracts/smart/interface/structs/ExpressionNode.sol";
import { ATKTopics } from "../../../contracts/system/ATKTopics.sol";
import { SMARTComplianceModuleParamPair } from
    "../../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { MockSMARTToken } from "../../utils/mocks/MockSMARTToken.sol";

contract InvestorCountComplianceModuleTest is AbstractComplianceModuleTest {
    InvestorCountComplianceModule internal module;

    // Test constants
    uint256 constant MAX_INVESTORS_GLOBAL = 100;
    uint256 constant MAX_INVESTORS_US = 50;
    uint256 constant MAX_INVESTORS_BE = 30;
    uint256 constant MAX_INVESTORS_JP = 20;

    // Additional test users
    address internal user4;
    address internal user5;
    address internal user6;

    // Mock token for testing lifecycle hooks without real token operations
    MockSMARTToken internal mockToken;

    function setUp() public override {
        super.setUp();
        module = new InvestorCountComplianceModule(address(0));

        // Issue claims to users for testing
        claimUtils.issueAllClaims(user1); // US
        claimUtils.issueAllClaims(user2); // BE

        // Create additional users for testing
        user4 = makeAddr("user4");
        user5 = makeAddr("user5");
        user6 = makeAddr("user6");

        // Create identities for additional users using the same pattern as in setUp
        identityUtils.createClientIdentity(user4, TestConstants.COUNTRY_CODE_US);
        identityUtils.createClientIdentity(user5, TestConstants.COUNTRY_CODE_BE);
        identityUtils.createClientIdentity(user6, TestConstants.COUNTRY_CODE_JP);

        // Issue claims to additional users
        claimUtils.issueAllClaims(user4);
        claimUtils.issueAllClaims(user5);
        claimUtils.issueAllClaims(user6);

        // Create mock token for direct testing
        mockToken = new MockSMARTToken(
            "Mock Token",
            "MOCK",
            18,
            1000e18,
            address(0),
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            new SMARTComplianceModuleParamPair[](0),
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL),
            address(accessManager)
        );
    }

    // ==================================================================================
    // BASIC MODULE PROPERTIES
    // ==================================================================================
    // These tests verify the module's core functionality and interface compliance

    /// @dev Test: Module correctly reports its name and type identifier
    function test_InvestorCount_InitialState() public view {
        assertEq(module.name(), "Investor Count Compliance Module");
        assertEq(module.typeId(), keccak256("InvestorCountComplianceModule"));
    }

    /// @dev Test: Module properly implements ISMARTComplianceModule interface
    function test_InvestorCount_SupportsInterface() public view {
        assertTrue(module.supportsInterface(type(ISMARTComplianceModule).interfaceId));
    }

    // ==================================================================================
    // PARAMETER VALIDATION TESTS
    // ==================================================================================
    // These tests ensure configuration parameters are properly validated before deployment
    // All configurations must have either global limits or country-specific limits

    /// @dev Test: "Max 100 total, no country limits" - maxInvestors=100, countryCodes=[], countryLimits=[]
    /// Global limit only configuration should be accepted
    function test_InvestorCount_ValidateParameters_GlobalLimitOnly() public view {
        InvestorCountComplianceModule.InvestorCountConfig memory config = InvestorCountComplianceModule
            .InvestorCountConfig({
            maxInvestors: MAX_INVESTORS_GLOBAL,
            global: false,
            countryCodes: new uint16[](0),
            countryLimits: new uint256[](0),
            topicFilter: new ExpressionNode[](0)
        });

        bytes memory params = abi.encode(config);
        module.validateParameters(params);
    }

    /// @dev Test: "Max 50 US, 30 EU" - maxInvestors=0, countryCodes=[840,276], countryLimits=[50,30]
    /// Country-specific limits without global cap should be accepted
    function test_InvestorCount_ValidateParameters_CountryLimitsOnly() public view {
        uint16[] memory countryCodes = new uint16[](2);
        countryCodes[0] = TestConstants.COUNTRY_CODE_US;
        countryCodes[1] = TestConstants.COUNTRY_CODE_BE;

        uint256[] memory countryLimits = new uint256[](2);
        countryLimits[0] = MAX_INVESTORS_US;
        countryLimits[1] = MAX_INVESTORS_BE;

        InvestorCountComplianceModule.InvestorCountConfig memory config = InvestorCountComplianceModule
            .InvestorCountConfig({
            maxInvestors: 0, // No global limit
            global: false,
            countryCodes: countryCodes,
            countryLimits: countryLimits,
            topicFilter: new ExpressionNode[](0)
        });

        bytes memory params = abi.encode(config);
        module.validateParameters(params);
    }

    /// @dev Test: "Max 100 total with 50 US" - maxInvestors=100, countryCodes=[840], countryLimits=[50]
    /// Combined global and country limits should be accepted (most restrictive applies)
    function test_InvestorCount_ValidateParameters_BothGlobalAndCountryLimits() public view {
        uint16[] memory countryCodes = new uint16[](1);
        countryCodes[0] = TestConstants.COUNTRY_CODE_US;

        uint256[] memory countryLimits = new uint256[](1);
        countryLimits[0] = MAX_INVESTORS_US;

        InvestorCountComplianceModule.InvestorCountConfig memory config = InvestorCountComplianceModule
            .InvestorCountConfig({
            maxInvestors: MAX_INVESTORS_GLOBAL,
            global: false,
            countryCodes: countryCodes,
            countryLimits: countryLimits,
            topicFilter: new ExpressionNode[](0)
        });

        bytes memory params = abi.encode(config);
        module.validateParameters(params);
    }

    /// @dev Test: Configuration with no limits should be rejected
    /// Must specify either global limit (maxInvestors > 0) or country limits
    function test_InvestorCount_RevertWhen_NoLimitsSpecified() public {
        InvestorCountComplianceModule.InvestorCountConfig memory config = InvestorCountComplianceModule
            .InvestorCountConfig({
            maxInvestors: 0,
            global: false,
            countryCodes: new uint16[](0),
            countryLimits: new uint256[](0),
            topicFilter: new ExpressionNode[](0)
        });

        bytes memory params = abi.encode(config);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.InvalidParameters.selector,
                "Must specify either global limit or country-specific limits"
            )
        );
        module.validateParameters(params);
    }

    /// @dev Test: countryCodes and countryLimits arrays must have matching lengths
    function test_InvestorCount_RevertWhen_CountryArraysMismatch() public {
        uint16[] memory countryCodes = new uint16[](2);
        countryCodes[0] = TestConstants.COUNTRY_CODE_US;
        countryCodes[1] = TestConstants.COUNTRY_CODE_BE;

        uint256[] memory countryLimits = new uint256[](1); // Mismatch!
        countryLimits[0] = MAX_INVESTORS_US;

        InvestorCountComplianceModule.InvestorCountConfig memory config = InvestorCountComplianceModule
            .InvestorCountConfig({
            maxInvestors: 0,
            global: false,
            countryCodes: countryCodes,
            countryLimits: countryLimits,
            topicFilter: new ExpressionNode[](0)
        });

        bytes memory params = abi.encode(config);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.InvalidParameters.selector,
                "Country codes and limits arrays must have same length"
            )
        );
        module.validateParameters(params);
    }

    /// @dev Test: All country limits must be > 0 (zero means no restriction which is invalid)
    function test_InvestorCount_RevertWhen_CountryLimitIsZero() public {
        uint16[] memory countryCodes = new uint16[](1);
        countryCodes[0] = TestConstants.COUNTRY_CODE_US;

        uint256[] memory countryLimits = new uint256[](1);
        countryLimits[0] = 0; // Invalid!

        InvestorCountComplianceModule.InvestorCountConfig memory config = InvestorCountComplianceModule
            .InvestorCountConfig({
            maxInvestors: 0,
            global: false,
            countryCodes: countryCodes,
            countryLimits: countryLimits,
            topicFilter: new ExpressionNode[](0)
        });

        bytes memory params = abi.encode(config);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.InvalidParameters.selector, "Country limits must be greater than zero"
            )
        );
        module.validateParameters(params);
    }

    /// @dev Test: Duplicate country codes should be rejected to prevent ambiguous limits
    function test_InvestorCount_RevertWhen_DuplicateCountryCodes() public {
        uint16[] memory countryCodes = new uint16[](3);
        countryCodes[0] = TestConstants.COUNTRY_CODE_US;
        countryCodes[1] = TestConstants.COUNTRY_CODE_BE;
        countryCodes[2] = TestConstants.COUNTRY_CODE_US; // Duplicate!

        uint256[] memory countryLimits = new uint256[](3);
        countryLimits[0] = 50;
        countryLimits[1] = 30;
        countryLimits[2] = 25; // Would be ambiguous with first US entry

        InvestorCountComplianceModule.InvestorCountConfig memory config = InvestorCountComplianceModule
            .InvestorCountConfig({
            maxInvestors: 0,
            global: false,
            countryCodes: countryCodes,
            countryLimits: countryLimits,
            topicFilter: new ExpressionNode[](0)
        });

        bytes memory params = abi.encode(config);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.InvalidParameters.selector, "Duplicate country codes are not allowed"
            )
        );
        module.validateParameters(params);
    }

    // ==================================================================================
    // BASIC TRANSFER TESTS
    // ==================================================================================
    // These tests verify the core transfer validation logic with simple configurations

    /// @dev Test: First investor should always be allowed (no limits exceeded)
    function test_InvestorCount_CanTransfer_FirstInvestor() public {
        InvestorCountComplianceModule.InvestorCountConfig memory config = InvestorCountComplianceModule
            .InvestorCountConfig({
            maxInvestors: MAX_INVESTORS_GLOBAL,
            global: false,
            countryCodes: new uint16[](0),
            countryLimits: new uint256[](0),
            topicFilter: new ExpressionNode[](0)
        });

        bytes memory params = abi.encode(config);

        // First investor should be allowed
        vm.prank(address(smartToken));
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);
    }

    /// @dev Test: Existing investors can receive more tokens without increasing count
    function test_InvestorCount_CanTransfer_ExistingInvestor() public {
        InvestorCountComplianceModule.InvestorCountConfig memory config = InvestorCountComplianceModule
            .InvestorCountConfig({
            maxInvestors: 1, // Only 1 investor allowed
            global: false,
            countryCodes: new uint16[](0),
            countryLimits: new uint256[](0),
            topicFilter: new ExpressionNode[](0)
        });

        bytes memory params = abi.encode(config);

        // Setup: Give user1 some tokens first
        vm.startPrank(tokenIssuer);
        smartToken.mint(user1, 100);
        vm.stopPrank();

        // Track the investor
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 100, params);

        // Existing investor should be allowed to receive more
        vm.prank(address(smartToken));
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);
    }

    /// @dev Test: Global limit enforcement - reject when adding investor would exceed maxInvestors
    function test_InvestorCount_RevertWhen_ExceedsGlobalLimit() public {
        InvestorCountComplianceModule.InvestorCountConfig memory config = InvestorCountComplianceModule
            .InvestorCountConfig({
            maxInvestors: 1, // Only 1 investor allowed
            global: false,
            countryCodes: new uint16[](0),
            countryLimits: new uint256[](0),
            topicFilter: new ExpressionNode[](0)
        });

        bytes memory params = abi.encode(config);

        // Setup: Give user1 some tokens first
        vm.startPrank(tokenIssuer);
        smartToken.mint(user1, 100);
        vm.stopPrank();

        // Track the first investor
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 100, params);

        // Second investor should be rejected
        vm.prank(address(smartToken));
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector,
                "Adding investor would exceed maximum total investor limit"
            )
        );
        module.canTransfer(address(smartToken), tokenIssuer, user2, 100, params);
    }

    // ==================================================================================
    // COUNTRY-SPECIFIC LIMIT TESTS
    // ==================================================================================
    // These tests verify per-country investor limits using ISO country codes

    /// @dev Test: "Max 1 US, 2 EU" - Country-specific limits without global cap
    /// Should allow investors up to each country's limit independently
    function test_InvestorCount_CountryLimits_Basic() public {
        uint16[] memory countryCodes = new uint16[](2);
        countryCodes[0] = TestConstants.COUNTRY_CODE_US;
        countryCodes[1] = TestConstants.COUNTRY_CODE_BE;

        uint256[] memory countryLimits = new uint256[](2);
        countryLimits[0] = 1; // Only 1 US investor
        countryLimits[1] = 2; // Up to 2 BE investors

        InvestorCountComplianceModule.InvestorCountConfig memory config = InvestorCountComplianceModule
            .InvestorCountConfig({
            maxInvestors: 0, // No global limit
            global: false,
            countryCodes: countryCodes,
            countryLimits: countryLimits,
            topicFilter: new ExpressionNode[](0)
        });

        bytes memory params = abi.encode(config);

        // First US investor should be allowed
        vm.prank(address(smartToken));
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);

        // Track the US investor
        vm.startPrank(tokenIssuer);
        smartToken.mint(user1, 100);
        vm.stopPrank();
        vm.prank(address(smartToken));
        module.created(address(smartToken), user1, 100, params);

        // Second US investor should be rejected
        vm.prank(address(smartToken));
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector,
                "Adding investor would exceed country-specific investor limit"
            )
        );
        module.canTransfer(address(smartToken), tokenIssuer, user4, 100, params); // user4 is also US

        // First BE investor should be allowed
        vm.prank(address(smartToken));
        module.canTransfer(address(smartToken), tokenIssuer, user2, 100, params);
    }

    /// @dev Test: "Max 2 total with 10 US, 10 EU" - Global cap overrides country limits when lower
    /// Should reject 3rd investor due to global limit despite countries having capacity
    function test_InvestorCount_CountryLimits_WithGlobalCap() public {
        uint16[] memory countryCodes = new uint16[](2);
        countryCodes[0] = TestConstants.COUNTRY_CODE_US;
        countryCodes[1] = TestConstants.COUNTRY_CODE_BE;

        uint256[] memory countryLimits = new uint256[](2);
        countryLimits[0] = 10; // US can have up to 10
        countryLimits[1] = 10; // BE can have up to 10

        InvestorCountComplianceModule.InvestorCountConfig memory config = InvestorCountComplianceModule
            .InvestorCountConfig({
            maxInvestors: 2, // But global limit is only 2!
            global: false,
            countryCodes: countryCodes,
            countryLimits: countryLimits,
            topicFilter: new ExpressionNode[](0)
        });

        bytes memory params = abi.encode(config);

        // Add first two investors (one from each country)
        vm.startPrank(tokenIssuer);
        smartToken.mint(user1, 100); // US
        smartToken.mint(user2, 100); // BE
        vm.stopPrank();

        vm.startPrank(address(smartToken));
        module.created(address(smartToken), user1, 100, params);
        module.created(address(smartToken), user2, 100, params);
        vm.stopPrank();

        // Third investor should be rejected due to global limit
        vm.prank(address(smartToken));
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector,
                "Adding investor would exceed maximum total investor limit"
            )
        );
        module.canTransfer(address(smartToken), tokenIssuer, user4, 100, params);
    }

    // ==================================================================================
    // TOPIC FILTER TESTS
    // ==================================================================================
    // These tests verify that only investors with specific compliance claims are counted

    /// @dev Test: "Count only KYC-verified investors" - topicFilter=[KYC]
    /// Only investors with KYC claims should count toward limits
    function test_InvestorCount_TopicFilter_SingleTopic() public {
        // Create topic filter requiring KYC
        ExpressionNode[] memory topicFilter = new ExpressionNode[](1);
        topicFilter[0] =
            ExpressionNode({ nodeType: ExpressionType.TOPIC, value: systemUtils.getTopicId(ATKTopics.TOPIC_INVESTOR_KYC) });

        InvestorCountComplianceModule.InvestorCountConfig memory config = InvestorCountComplianceModule
            .InvestorCountConfig({
            maxInvestors: MAX_INVESTORS_GLOBAL,
            global: false,
            countryCodes: new uint16[](0),
            countryLimits: new uint256[](0),
            topicFilter: topicFilter
        });

        bytes memory params = abi.encode(config);

        // user1 has claims, should be allowed
        vm.prank(address(smartToken));
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);

        // user3 has no identity/claims, should be skipped (not counted)
        vm.prank(address(smartToken));
        module.canTransfer(address(smartToken), tokenIssuer, user3, 100, params);
    }

    /// @dev Test: "Count investors with (KYC AND AML) OR COLLATERAL"
    /// Complex boolean expressions in postfix notation for advanced filtering
    function test_InvestorCount_TopicFilter_ComplexExpression() public {
        // Create expression: (KYC AND AML) OR COLLATERAL
        ExpressionNode[] memory topicFilter = new ExpressionNode[](5);
        topicFilter[0] =
            ExpressionNode({ nodeType: ExpressionType.TOPIC, value: systemUtils.getTopicId(ATKTopics.TOPIC_INVESTOR_KYC) });
        topicFilter[1] =
            ExpressionNode({ nodeType: ExpressionType.TOPIC, value: systemUtils.getTopicId(ATKTopics.TOPIC_INVESTOR_AML) });
        topicFilter[2] = ExpressionNode({ nodeType: ExpressionType.AND, value: 0 });
        topicFilter[3] = ExpressionNode({
            nodeType: ExpressionType.TOPIC,
            value: systemUtils.getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL)
        });
        topicFilter[4] = ExpressionNode({ nodeType: ExpressionType.OR, value: 0 });

        InvestorCountComplianceModule.InvestorCountConfig memory config = InvestorCountComplianceModule
            .InvestorCountConfig({
            maxInvestors: MAX_INVESTORS_GLOBAL,
            global: false,
            countryCodes: new uint16[](0),
            countryLimits: new uint256[](0),
            topicFilter: topicFilter
        });

        bytes memory params = abi.encode(config);

        // user1 and user2 have all claims, should be allowed
        vm.prank(address(smartToken));
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);
        vm.prank(address(smartToken));
        module.canTransfer(address(smartToken), tokenIssuer, user2, 100, params);
    }

    // ==================================================================================
    // INVESTOR LIFECYCLE TESTS
    // ==================================================================================
    // These tests verify investor tracking through token operations (mint/burn/transfer)

    /// @dev Test: Investor count tracking through balance changes
    /// When balance goes to 0, investor should be removed and slot becomes available
    function test_InvestorCount_Lifecycle_AddRemoveInvestors() public {
        InvestorCountComplianceModule.InvestorCountConfig memory config = InvestorCountComplianceModule
            .InvestorCountConfig({
            maxInvestors: 2,
            global: false,
            countryCodes: new uint16[](0),
            countryLimits: new uint256[](0),
            topicFilter: new ExpressionNode[](0)
        });

        bytes memory params = abi.encode(config);

        // Set balances for lifecycle hooks to work
        mockToken.setBalance(user1, 100);

        // Track the first investor
        vm.prank(address(mockToken));
        module.created(address(mockToken), user1, 100, params);
        assertEq(module.getCurrentInvestorCount(address(mockToken), false), 1);
        assertTrue(module.isInvestor(address(mockToken), user1, false));

        // Add second investor
        mockToken.setBalance(user2, 100);
        vm.prank(address(mockToken));
        module.created(address(mockToken), user2, 100, params);
        assertEq(module.getCurrentInvestorCount(address(mockToken), false), 2);

        // user1 balance becomes 0 (simulating transfer)
        mockToken.setBalance(user1, 0);
        vm.prank(address(mockToken));
        module.transferred(address(mockToken), user1, user2, 100, params);

        // Check investor count decreased
        assertEq(module.getCurrentInvestorCount(address(mockToken), false), 1);
        assertFalse(module.isInvestor(address(mockToken), user1, false));
        assertTrue(module.isInvestor(address(mockToken), user2, false));

        // Now third investor can be added
        mockToken.setBalance(user4, 100);
        vm.prank(address(mockToken));
        module.created(address(mockToken), user4, 100, params);
        assertEq(module.getCurrentInvestorCount(address(mockToken), false), 2);
    }

    /// @dev Test: Token burning should remove investors when balance reaches zero
    function test_InvestorCount_Lifecycle_Burn() public {
        InvestorCountComplianceModule.InvestorCountConfig memory config = InvestorCountComplianceModule
            .InvestorCountConfig({
            maxInvestors: 1,
            global: false,
            countryCodes: new uint16[](0),
            countryLimits: new uint256[](0),
            topicFilter: new ExpressionNode[](0)
        });

        bytes memory params = abi.encode(config);

        // Set user1 balance and track as investor
        mockToken.setBalance(user1, 100);
        vm.prank(address(mockToken));
        module.created(address(mockToken), user1, 100, params);
        assertEq(module.getCurrentInvestorCount(address(mockToken), false), 1);

        // user1 balance becomes 0 (simulating burn or transfer)
        mockToken.setBalance(user1, 0);
        vm.prank(address(mockToken));
        module.destroyed(address(mockToken), user1, 100, params);
        assertEq(module.getCurrentInvestorCount(address(mockToken), false), 0);

        // Now another investor can be added
        mockToken.setBalance(user2, 100);
        vm.prank(address(mockToken));
        module.created(address(mockToken), user2, 100, params);
        assertEq(module.getCurrentInvestorCount(address(mockToken), false), 1);
    }

    // ==================================================================================
    // GLOBAL TRACKING TESTS
    // ==================================================================================
    // These tests verify issuer-wide investor limits across multiple tokens

    /// @dev Test: "Max 2 investors globally across all tokens" - global=true
    /// Should track unique investors across all tokens using this module instance
    function test_InvestorCount_GlobalTracking() public {
        InvestorCountComplianceModule.InvestorCountConfig memory config = InvestorCountComplianceModule
            .InvestorCountConfig({
            maxInvestors: 2, // Global limit across all tokens
            global: true,
            countryCodes: new uint16[](0),
            countryLimits: new uint256[](0),
            topicFilter: new ExpressionNode[](0)
        });

        bytes memory params = abi.encode(config);

        // Create a second mock token
        MockSMARTToken secondMockToken = new MockSMARTToken(
            "Second Mock Token",
            "MOCK2",
            18,
            1000e18,
            address(0),
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            new SMARTComplianceModuleParamPair[](0),
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL),
            address(accessManager)
        );

        // Track first investor on first token
        mockToken.setBalance(user1, 100);
        vm.prank(address(mockToken));
        module.created(address(mockToken), user1, 100, params);
        assertEq(module.getCurrentInvestorCount(address(0), true), 1);

        // Track second investor on second token
        secondMockToken.setBalance(user2, 100);
        vm.prank(address(secondMockToken));
        module.created(address(secondMockToken), user2, 100, params);
        assertEq(module.getCurrentInvestorCount(address(0), true), 2);

        // Third investor should fail due to global limit
        vm.prank(address(mockToken));
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector,
                "Adding investor would exceed maximum total investor limit"
            )
        );
        module.canTransfer(address(mockToken), tokenIssuer, user4, 100, params);

        vm.prank(address(secondMockToken));
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector,
                "Adding investor would exceed maximum total investor limit"
            )
        );
        module.canTransfer(address(secondMockToken), tokenIssuer, user4, 100, params);
    }

    // ==================================================================================
    // VIEW FUNCTION TESTS
    // ==================================================================================
    // These tests verify read-only functions for querying current investor counts

    /// @dev Test: View function to query investor counts by country code
    /// Should accurately report per-country investor counts
    function test_InvestorCount_GetCountryInvestorCount() public {
        uint16[] memory countryCodes = new uint16[](2);
        countryCodes[0] = TestConstants.COUNTRY_CODE_US;
        countryCodes[1] = TestConstants.COUNTRY_CODE_BE;

        uint256[] memory countryLimits = new uint256[](2);
        countryLimits[0] = 10;
        countryLimits[1] = 10;

        InvestorCountComplianceModule.InvestorCountConfig memory config = InvestorCountComplianceModule
            .InvestorCountConfig({
            maxInvestors: 0,
            global: false,
            countryCodes: countryCodes,
            countryLimits: countryLimits,
            topicFilter: new ExpressionNode[](0)
        });

        bytes memory params = abi.encode(config);

        // Set balances and track investors
        mockToken.setBalance(user1, 100);
        mockToken.setBalance(user2, 100);
        mockToken.setBalance(user4, 100);

        vm.startPrank(address(mockToken));
        module.created(address(mockToken), user1, 100, params); // US
        module.created(address(mockToken), user2, 100, params); // BE
        module.created(address(mockToken), user4, 100, params); // US
        vm.stopPrank();

        // Check country counts
        assertEq(module.getCountryInvestorCount(address(mockToken), TestConstants.COUNTRY_CODE_US, false), 2);
        assertEq(module.getCountryInvestorCount(address(mockToken), TestConstants.COUNTRY_CODE_BE, false), 1);
        assertEq(module.getCountryInvestorCount(address(mockToken), TestConstants.COUNTRY_CODE_JP, false), 0);
    }

    /// @dev Test: Investors without identity registry entries are not counted
    /// Addresses without KYC/identity should be ignored for compliance purposes
    function test_InvestorCount_NoIdentity_NotCounted() public {
        InvestorCountComplianceModule.InvestorCountConfig memory config = InvestorCountComplianceModule
            .InvestorCountConfig({
            maxInvestors: 1,
            global: false,
            countryCodes: new uint16[](0),
            countryLimits: new uint256[](0),
            topicFilter: new ExpressionNode[](0)
        });

        bytes memory params = abi.encode(config);

        // user3 has no identity - transfers should succeed but not count
        vm.prank(address(mockToken));
        module.canTransfer(address(mockToken), tokenIssuer, user3, 100, params);

        // Set balance and track user3 (no identity)
        mockToken.setBalance(user3, 100);
        vm.prank(address(mockToken));
        module.created(address(mockToken), user3, 100, params);

        // Investor count should still be 0 (user3 not counted due to no identity)
        assertEq(module.getCurrentInvestorCount(address(mockToken), false), 0);

        // Real investor should still be allowed
        vm.prank(address(mockToken));
        module.canTransfer(address(mockToken), tokenIssuer, user1, 100, params);

        // Set balance and track user1 (has identity)
        mockToken.setBalance(user1, 100);
        vm.prank(address(mockToken));
        module.created(address(mockToken), user1, 100, params);
        assertEq(module.getCurrentInvestorCount(address(mockToken), false), 1);
    }
}
