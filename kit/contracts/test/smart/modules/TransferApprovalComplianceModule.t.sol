// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title TransferApprovalComplianceModuleTest
 * @dev Comprehensive test suite for the Transfer Approval Compliance Module.
 *
 * This module enables identity-bound pre-approval requirements for token transfers:
 *
 * CONFIGURATION EXAMPLES:
 * - "All transfers need approval from issuer": approvalAuthorities=[issuerIdentity], oneTimeUse=true
 * - "QII investors exempt": allowExemptions=true, exemptionExpression=[TOPIC_QII]
 * - "7-day expiry": approvalExpiry=7 days, oneTimeUse=false
 * - "Japan FSA compliance": approvalAuthorities=[issuer,broker], oneTimeUse=true, allowExemptions=true
 *
 * FEATURE COVERAGE:
 * ✓ Parameter validation (authorities required, expiry limits)
 * ✓ Identity-bound approval functionality
 * ✓ One-time use and expiry mechanisms
 * ✓ Exemption logic for QII/professional investors
 * ✓ Approval authority verification
 * ✓ View functions for approval status
 * ✓ Edge cases (no identity = blocked, burns/mints allowed)
 */
import { AbstractComplianceModuleTest } from "./AbstractComplianceModuleTest.t.sol";
import {
    TransferApprovalComplianceModule
} from "../../../contracts/smart/modules/TransferApprovalComplianceModule.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";
import { TestConstants } from "../../Constants.sol";
import { ExpressionNode, ExpressionType } from "../../../contracts/smart/interface/structs/ExpressionNode.sol";
import { ATKTopics } from "../../../contracts/system/ATKTopics.sol";
import {
    SMARTComplianceModuleParamPair
} from "../../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { MockSMARTToken } from "../../utils/mocks/MockSMARTToken.sol";

contract TransferApprovalComplianceModuleTest is AbstractComplianceModuleTest {
    TransferApprovalComplianceModule internal module;

    // Test constants
    address internal approverIdentity1;
    address internal approverIdentity2;
    address internal nonApproverIdentity;
    address internal approver1Wallet;
    address internal approver2Wallet;
    address internal nonApproverWallet;
    uint256 internal transferAmount = 1000e18;

    // Additional test users
    address internal user4;
    address internal user5;

    // Custom topic ID for testing QII exemptions
    uint256 internal qiiTopicId;

    // Mock token for testing lifecycle hooks without real token operations
    MockSMARTToken internal mockToken;

    // Events to test
    event TransferApproved(
        address indexed token,
        address indexed fromIdentity,
        address indexed toIdentity,
        uint256 value,
        address approverIdentity,
        uint256 expiry
    );

    event TransferApprovalConsumed(
        address indexed token,
        address indexed fromIdentity,
        address indexed toIdentity,
        uint256 value,
        address approverIdentity
    );

    event TransferApprovalRevoked(
        address indexed token,
        address indexed fromIdentity,
        address indexed toIdentity,
        uint256 value,
        address approverIdentity
    );

    function setUp() public override {
        super.setUp();
        module = new TransferApprovalComplianceModule(address(0));

        // Issue claims to users for testing
        claimUtils.issueAllClaims(user1); // US
        claimUtils.issueAllClaims(user2); // BE

        // Create additional users for testing
        user4 = makeAddr("user4");
        user5 = makeAddr("user5");

        // Create identities for additional users
        identityUtils.createClientIdentity(user4, TestConstants.COUNTRY_CODE_US);
        identityUtils.createClientIdentity(user5, TestConstants.COUNTRY_CODE_BE);

        // Issue claims to additional users
        claimUtils.issueAllClaims(user4);
        claimUtils.issueAllClaims(user5);

        // Create QII topic scheme and register with claim issuer
        vm.startPrank(platformAdmin);
        systemUtils.topicSchemeRegistry().registerTopicScheme("TOPIC_QII", "string claim");
        qiiTopicId = systemUtils.getTopicId("TOPIC_QII");
        vm.stopPrank();

        // Add issuer with all necessary topics (existing + custom)
        vm.startPrank(platformAdmin);
        uint256[] memory allTopics = new uint256[](5);
        allTopics[0] = systemUtils.getTopicId(ATKTopics.TOPIC_INVESTOR_KYC);
        allTopics[1] = systemUtils.getTopicId(ATKTopics.TOPIC_INVESTOR_AML);
        allTopics[2] = systemUtils.getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL);
        allTopics[3] = systemUtils.getTopicId(ATKTopics.TOPIC_ASSET_BASE_PRICE);
        allTopics[4] = qiiTopicId; // Add our custom topic

        identityUtils.updateIssuerClaimTopics(claimIssuer, allTopics);
        vm.stopPrank();

        // Create approver wallet addresses - these will be used to call approveTransfer
        approver1Wallet = makeAddr("approver1Wallet");
        approver2Wallet = makeAddr("approver2Wallet");
        nonApproverWallet = makeAddr("nonApproverWallet");

        // Create identities for approver wallets
        identityUtils.createClientIdentity(approver1Wallet, TestConstants.COUNTRY_CODE_US);
        identityUtils.createClientIdentity(approver2Wallet, TestConstants.COUNTRY_CODE_BE);
        identityUtils.createClientIdentity(nonApproverWallet, TestConstants.COUNTRY_CODE_JP);

        // Issue basic claims to approver wallets
        claimUtils.issueAllClaims(approver1Wallet);
        claimUtils.issueAllClaims(approver2Wallet);
        claimUtils.issueAllClaims(nonApproverWallet);

        // Get the identity contract addresses (these are the approval authorities)
        approverIdentity1 = address(systemUtils.identityRegistry().identity(approver1Wallet));
        approverIdentity2 = address(systemUtils.identityRegistry().identity(approver2Wallet));
        nonApproverIdentity = address(systemUtils.identityRegistry().identity(nonApproverWallet));

        // Issue special QII claim to user4 for exemption testing
        claimUtils.issueCustomClaim(user4, qiiTopicId, "Qualified Institutional Investor");

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

    /// @dev Test: Module correctly reports its name and type identifier
    function test_TransferApproval_InitialState() public view {
        assertEq(module.name(), "Transfer Approval Compliance Module");
        assertEq(module.typeId(), keccak256("TransferApprovalComplianceModule"));
        assertTrue(module.supportsInterface(type(ISMARTComplianceModule).interfaceId));
    }

    // ==================================================================================
    // PARAMETER VALIDATION TESTS
    // ==================================================================================

    /// @dev Test: Valid configuration with approval authorities
    function test_TransferApproval_ValidateParameters_ValidConfig() public view {
        TransferApprovalComplianceModule.Config memory config = TransferApprovalComplianceModule.Config({
            approvalAuthorities: _createApprovalAuthorities(approverIdentity1, approverIdentity2),
            allowExemptions: true,
            exemptionExpression: _createQIIExemptionExpression(),
            approvalExpiry: 7 days,
            oneTimeUse: true
        });

        bytes memory params = abi.encode(config);

        // Should not revert for valid parameters
        module.validateParameters(params);
    }

    /// @dev Test: Invalid configuration - no approval authorities
    function test_TransferApproval_ValidateParameters_NoAuthorities() public {
        TransferApprovalComplianceModule.Config memory config = TransferApprovalComplianceModule.Config({
            approvalAuthorities: new address[](0),
            allowExemptions: false,
            exemptionExpression: new ExpressionNode[](0),
            approvalExpiry: 1 days,
            oneTimeUse: true
        });

        bytes memory params = abi.encode(config);

        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.InvalidParameters.selector, "Must specify at least one approval authority"
            )
        );
        module.validateParameters(params);
    }

    /// @dev Test: Invalid configuration - zero address in approval authorities
    function test_TransferApproval_ValidateParameters_ZeroAddressAuthority() public {
        address[] memory authorities = new address[](2);
        authorities[0] = approverIdentity1;
        authorities[1] = address(0); // Invalid zero address

        TransferApprovalComplianceModule.Config memory config = TransferApprovalComplianceModule.Config({
            approvalAuthorities: authorities,
            allowExemptions: false,
            exemptionExpression: new ExpressionNode[](0),
            approvalExpiry: 1 days,
            oneTimeUse: true
        });

        bytes memory params = abi.encode(config);

        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.InvalidParameters.selector, "Approval authorities cannot be zero address"
            )
        );
        module.validateParameters(params);
    }

    /// @dev Test: Invalid configuration - zero expiry
    function test_TransferApproval_ValidateParameters_ZeroExpiry() public {
        TransferApprovalComplianceModule.Config memory config = TransferApprovalComplianceModule.Config({
            approvalAuthorities: _createApprovalAuthorities(approverIdentity1),
            allowExemptions: false,
            exemptionExpression: new ExpressionNode[](0),
            approvalExpiry: 0, // Invalid zero expiry
            oneTimeUse: true
        });

        bytes memory params = abi.encode(config);

        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.InvalidParameters.selector, "Approval expiry must be greater than zero"
            )
        );
        module.validateParameters(params);
    }

    /// @dev Test: Invalid configuration - expiry too long
    function test_TransferApproval_ValidateParameters_ExpiryTooLong() public {
        TransferApprovalComplianceModule.Config memory config = TransferApprovalComplianceModule.Config({
            approvalAuthorities: _createApprovalAuthorities(approverIdentity1),
            allowExemptions: false,
            exemptionExpression: new ExpressionNode[](0),
            approvalExpiry: 366 days, // Invalid - too long
            oneTimeUse: true
        });

        bytes memory params = abi.encode(config);

        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.InvalidParameters.selector, "Approval expiry cannot exceed 365 days"
            )
        );
        module.validateParameters(params);
    }

    // ==================================================================================
    // CORE FUNCTIONALITY TESTS
    // ==================================================================================

    /// @dev Test: Identity-bound pre-approval workflow
    function test_TransferApproval_IdentityBoundApprovalWorkflow() public {
        // Get identity addresses for users
        address user1Identity = address(systemUtils.identityRegistry().identity(user1));
        address user2Identity = address(systemUtils.identityRegistry().identity(user2));

        TransferApprovalComplianceModule.Config memory config = TransferApprovalComplianceModule.Config({
            approvalAuthorities: _createApprovalAuthorities(approverIdentity1),
            allowExemptions: false,
            exemptionExpression: new ExpressionNode[](0),
            approvalExpiry: 1 days,
            oneTimeUse: true
        });

        bytes memory params = abi.encode(config);

        // 1. Initially, transfer should be blocked (no approval)
        vm.expectRevert(TransferApprovalComplianceModule.ApprovalRequired.selector);
        module.canTransfer(address(mockToken), user1, user2, transferAmount, params);

        // 2. Approver pre-approves the transfer (identity-to-identity)
        // Note: We need to mock the token's compliance modules list for _getModuleParameters
        _mockTokenComplianceModules(config);

        vm.prank(approver1Wallet);
        vm.expectEmit(true, true, true, true);
        emit TransferApproved(
            address(mockToken),
            user1Identity,
            user2Identity,
            transferAmount,
            approverIdentity1,
            block.timestamp + 1 days
        );
        module.approveTransfer(address(mockToken), user1Identity, user2Identity, transferAmount);

        // 3. Check that approval is recorded
        TransferApprovalComplianceModule.ApprovalRecord memory record =
            module.getApproval(address(mockToken), user1Identity, user2Identity, transferAmount);
        assertTrue(record.expiry > 0);
        assertFalse(record.used);
        assertEq(record.approverIdentity, approverIdentity1);

        // 4. Now the transfer should be allowed
        module.canTransfer(address(mockToken), user1, user2, transferAmount, params);

        // 5. Different transfer parameters should still be blocked
        vm.expectRevert(TransferApprovalComplianceModule.ApprovalRequired.selector);
        module.canTransfer(address(mockToken), user1, user2, transferAmount + 1, params); // Different amount

        vm.expectRevert(TransferApprovalComplianceModule.ApprovalRequired.selector);
        module.canTransfer(address(mockToken), user1, user4, transferAmount, params); // Different recipient
    }

    /// @dev Test: One-time use approval consumption
    function test_TransferApproval_OneTimeUseConsumption() public {
        address user1Identity = address(systemUtils.identityRegistry().identity(user1));
        address user2Identity = address(systemUtils.identityRegistry().identity(user2));

        TransferApprovalComplianceModule.Config memory config = TransferApprovalComplianceModule.Config({
            approvalAuthorities: _createApprovalAuthorities(approverIdentity1),
            allowExemptions: false,
            exemptionExpression: new ExpressionNode[](0),
            approvalExpiry: 1 days,
            oneTimeUse: true
        });

        bytes memory params = abi.encode(config);
        _mockTokenComplianceModules(config);

        // Pre-approve the transfer
        vm.prank(approver1Wallet);
        module.approveTransfer(address(mockToken), user1Identity, user2Identity, transferAmount);

        // Transfer should be allowed initially
        module.canTransfer(address(mockToken), user1, user2, transferAmount, params);

        // Simulate the transfer completion by calling transferred hook from the token
        vm.expectEmit(true, true, true, true);
        emit TransferApprovalConsumed(
            address(mockToken), user1Identity, user2Identity, transferAmount, approverIdentity1
        );
        vm.prank(address(mockToken));
        module.transferred(address(mockToken), user1, user2, transferAmount, params);

        // Check that approval is now marked as used
        TransferApprovalComplianceModule.ApprovalRecord memory record =
            module.getApproval(address(mockToken), user1Identity, user2Identity, transferAmount);
        assertTrue(record.used);

        // Second transfer attempt should now fail
        vm.expectRevert(TransferApprovalComplianceModule.ApprovalAlreadyUsed.selector);
        module.canTransfer(address(mockToken), user1, user2, transferAmount, params);
    }

    /// @dev Test: QII exemption logic
    function test_TransferApproval_QIIExemption() public {
        TransferApprovalComplianceModule.Config memory config = TransferApprovalComplianceModule.Config({
            approvalAuthorities: _createApprovalAuthorities(approverIdentity1),
            allowExemptions: true,
            exemptionExpression: _createQIIExemptionExpression(),
            approvalExpiry: 1 days,
            oneTimeUse: true
        });

        bytes memory params = abi.encode(config);

        // Transfer to QII investor (user4) should be allowed without approval
        module.canTransfer(address(mockToken), user1, user4, transferAmount, params);

        // Transfer to non-QII investor (user2) should still require approval
        vm.expectRevert(TransferApprovalComplianceModule.ApprovalRequired.selector);
        module.canTransfer(address(mockToken), user1, user2, transferAmount, params);
    }

    /// @dev Test: Approval expiry
    function test_TransferApproval_ApprovalExpiry() public {
        address user1Identity = address(systemUtils.identityRegistry().identity(user1));
        address user2Identity = address(systemUtils.identityRegistry().identity(user2));

        TransferApprovalComplianceModule.Config memory config = TransferApprovalComplianceModule.Config({
            approvalAuthorities: _createApprovalAuthorities(approverIdentity1),
            allowExemptions: false,
            exemptionExpression: new ExpressionNode[](0),
            approvalExpiry: 1 hours,
            oneTimeUse: false
        });

        bytes memory params = abi.encode(config);
        _mockTokenComplianceModules(config);

        // Pre-approve the transfer
        vm.prank(approver1Wallet);
        module.approveTransfer(address(mockToken), user1Identity, user2Identity, transferAmount);

        // Transfer should be allowed initially
        module.canTransfer(address(mockToken), user1, user2, transferAmount, params);

        // Fast forward past expiry
        vm.warp(block.timestamp + 1 hours + 1);

        // Transfer should now be blocked due to expiry
        vm.expectRevert(TransferApprovalComplianceModule.ApprovalExpired.selector);
        module.canTransfer(address(mockToken), user1, user2, transferAmount, params);
    }

    /// @dev Test: Burns and mints are always allowed
    function test_TransferApproval_BurnsAndMintsAllowed() public view {
        TransferApprovalComplianceModule.Config memory config = TransferApprovalComplianceModule.Config({
            approvalAuthorities: _createApprovalAuthorities(approverIdentity1),
            allowExemptions: false,
            exemptionExpression: new ExpressionNode[](0),
            approvalExpiry: 1 days,
            oneTimeUse: true
        });

        bytes memory params = abi.encode(config);

        // Burns (to == address(0)) should be allowed
        module.canTransfer(address(mockToken), user1, address(0), transferAmount, params);

        // Mints (from == address(0)) should be allowed
        module.canTransfer(address(mockToken), address(0), user1, transferAmount, params);
    }

    /// @dev Test: Transfers without identities are blocked
    function test_TransferApproval_NoIdentitiesBlocked() public {
        TransferApprovalComplianceModule.Config memory config = TransferApprovalComplianceModule.Config({
            approvalAuthorities: _createApprovalAuthorities(approverIdentity1),
            allowExemptions: false,
            exemptionExpression: new ExpressionNode[](0),
            approvalExpiry: 1 days,
            oneTimeUse: true
        });

        bytes memory params = abi.encode(config);

        // Transfer from user without identity should be blocked
        vm.expectRevert(TransferApprovalComplianceModule.IdentitiesRequired.selector);
        module.canTransfer(address(mockToken), user3, user1, transferAmount, params);

        // Transfer to user without identity should be blocked
        vm.expectRevert(TransferApprovalComplianceModule.IdentitiesRequired.selector);
        module.canTransfer(address(mockToken), user1, user3, transferAmount, params);
    }

    // ==================================================================================
    // HELPER FUNCTIONS
    // ==================================================================================

    /// @dev Helper function to create an array of approval authority addresses
    function _createApprovalAuthorities(address addr1) internal pure returns (address[] memory) {
        address[] memory authorities = new address[](1);
        authorities[0] = addr1;
        return authorities;
    }

    /// @dev Helper function to create an array of approval authority addresses
    function _createApprovalAuthorities(address addr1, address addr2) internal pure returns (address[] memory) {
        address[] memory authorities = new address[](2);
        authorities[0] = addr1;
        authorities[1] = addr2;
        return authorities;
    }

    /// @dev Helper function to create QII exemption expression
    function _createQIIExemptionExpression() internal view returns (ExpressionNode[] memory) {
        ExpressionNode[] memory expression = new ExpressionNode[](1);
        expression[0] = ExpressionNode({
            nodeType: ExpressionType.TOPIC,
            value: qiiTopicId // Use the topic ID created in setUp
        });
        return expression;
    }

    /// @dev Helper function to mock token's compliance modules list
    /// This is needed because the contract tries to fetch parameters via _getModuleParameters
    function _mockTokenComplianceModules(TransferApprovalComplianceModule.Config memory config) internal {
        SMARTComplianceModuleParamPair[] memory modules = new SMARTComplianceModuleParamPair[](1);
        modules[0] = SMARTComplianceModuleParamPair({ module: address(module), params: abi.encode(config) });

        // Mock the complianceModules() call
        vm.mockCall(address(mockToken), abi.encodeWithSignature("complianceModules()"), abi.encode(modules));
    }

    /// @dev Test: Approval revocation by authorized approver
    function test_TransferApproval_RevokeApproval() public {
        address user1Identity = address(systemUtils.identityRegistry().identity(user1));
        address user2Identity = address(systemUtils.identityRegistry().identity(user2));

        TransferApprovalComplianceModule.Config memory config = TransferApprovalComplianceModule.Config({
            approvalAuthorities: _createApprovalAuthorities(approverIdentity1),
            allowExemptions: false,
            exemptionExpression: new ExpressionNode[](0),
            approvalExpiry: 1 days,
            oneTimeUse: false
        });

        bytes memory params = abi.encode(config);
        _mockTokenComplianceModules(config);

        // 1. Pre-approve the transfer
        vm.prank(approver1Wallet);
        module.approveTransfer(address(mockToken), user1Identity, user2Identity, transferAmount);

        // 2. Verify approval exists
        TransferApprovalComplianceModule.ApprovalRecord memory record =
            module.getApproval(address(mockToken), user1Identity, user2Identity, transferAmount);
        assertTrue(record.expiry > 0);
        assertFalse(record.used);

        // 3. Transfer should be allowed
        module.canTransfer(address(mockToken), user1, user2, transferAmount, params);

        // 4. Revoke the approval
        vm.prank(approver1Wallet);
        vm.expectEmit(true, true, true, true);
        emit TransferApprovalRevoked(
            address(mockToken), user1Identity, user2Identity, transferAmount, approverIdentity1
        );
        module.revokeApproval(address(mockToken), user1Identity, user2Identity, transferAmount);

        // 5. Verify approval is cleared
        record = module.getApproval(address(mockToken), user1Identity, user2Identity, transferAmount);
        assertEq(record.expiry, 0);
        assertFalse(record.used);
        assertEq(record.approverIdentity, address(0));

        // 6. Transfer should now be blocked
        vm.expectRevert(TransferApprovalComplianceModule.ApprovalRequired.selector);
        module.canTransfer(address(mockToken), user1, user2, transferAmount, params);
    }

    /// @dev Test: Revocation by wrong approver should fail
    function test_TransferApproval_RevokeApproval_WrongApprover() public {
        address user1Identity = address(systemUtils.identityRegistry().identity(user1));
        address user2Identity = address(systemUtils.identityRegistry().identity(user2));

        // Config with two approval authorities
        address[] memory authorities = new address[](2);
        authorities[0] = approverIdentity1;
        authorities[1] = approverIdentity2;

        TransferApprovalComplianceModule.Config memory config = TransferApprovalComplianceModule.Config({
            approvalAuthorities: authorities,
            allowExemptions: false,
            exemptionExpression: new ExpressionNode[](0),
            approvalExpiry: 1 days,
            oneTimeUse: false
        });

        _mockTokenComplianceModules(config);

        // 1. Pre-approve the transfer with approver1
        vm.prank(approver1Wallet);
        module.approveTransfer(address(mockToken), user1Identity, user2Identity, transferAmount);

        // 2. Try to revoke with approver2 (different approver than who granted it)
        vm.prank(approver2Wallet);
        vm.expectRevert(TransferApprovalComplianceModule.NoApprovalToRevoke.selector);
        module.revokeApproval(address(mockToken), user1Identity, user2Identity, transferAmount);
    }

    /// @dev Test: Revoking non-existent approval should fail
    function test_TransferApproval_RevokeApproval_NoApproval() public {
        address user1Identity = address(systemUtils.identityRegistry().identity(user1));
        address user2Identity = address(systemUtils.identityRegistry().identity(user2));

        TransferApprovalComplianceModule.Config memory config = TransferApprovalComplianceModule.Config({
            approvalAuthorities: _createApprovalAuthorities(approverIdentity1),
            allowExemptions: false,
            exemptionExpression: new ExpressionNode[](0),
            approvalExpiry: 1 days,
            oneTimeUse: false
        });

        _mockTokenComplianceModules(config);

        // Try to revoke non-existent approval
        vm.prank(approver1Wallet);
        vm.expectRevert(TransferApprovalComplianceModule.NoApprovalToRevoke.selector);
        module.revokeApproval(address(mockToken), user1Identity, user2Identity, transferAmount);
    }

    /// @dev Test: Approver without identity cannot revoke
    function test_TransferApproval_RevokeApproval_ApproverNoIdentity() public {
        address user1Identity = address(systemUtils.identityRegistry().identity(user1));
        address user2Identity = address(systemUtils.identityRegistry().identity(user2));
        address unauthorizedWallet = vm.addr(9999); // Not in identity registry

        TransferApprovalComplianceModule.Config memory config = TransferApprovalComplianceModule.Config({
            approvalAuthorities: _createApprovalAuthorities(approverIdentity1),
            allowExemptions: false,
            exemptionExpression: new ExpressionNode[](0),
            approvalExpiry: 1 days,
            oneTimeUse: false
        });

        _mockTokenComplianceModules(config);

        // 1. Pre-approve the transfer
        vm.prank(approver1Wallet);
        module.approveTransfer(address(mockToken), user1Identity, user2Identity, transferAmount);

        // 2. Try to revoke with wallet that has no identity
        vm.prank(unauthorizedWallet);
        vm.expectRevert(TransferApprovalComplianceModule.CallerMustHaveIdentity.selector);
        module.revokeApproval(address(mockToken), user1Identity, user2Identity, transferAmount);
    }
}
