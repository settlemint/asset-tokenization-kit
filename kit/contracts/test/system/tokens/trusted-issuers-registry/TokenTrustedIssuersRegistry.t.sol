// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import {
    TokenTrustedIssuersRegistry
} from "../../../../contracts/system/tokens/trusted-issuers-registry/TokenTrustedIssuersRegistry.sol";
import { ISMARTTrustedIssuersRegistry } from "../../../../contracts/smart/interface/ISMARTTrustedIssuersRegistry.sol";
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {
    IATKTokenTrustedIssuersRegistry
} from "../../../../contracts/system/tokens/trusted-issuers-registry/IATKTokenTrustedIssuersRegistry.sol";
import {
    IATKTrustedIssuersRegistry
} from "../../../../contracts/system/trusted-issuers-registry/IATKTrustedIssuersRegistry.sol";
import { ATKAssetRoles } from "../../../../contracts/assets/ATKAssetRoles.sol";
import { IClaimAuthorizer } from "../../../../contracts/onchainid/extensions/IClaimAuthorizer.sol";

// Mock claim issuer for testing
contract MockClaimIssuer {
    function isClaimValid(address, uint256, bytes calldata, bytes calldata) external pure returns (bool) {
        return true;
    }
}

// Mock token contract for testing
contract MockToken {
    mapping(bytes32 => mapping(address => bool)) private _roles;
    address private _onchainID;

    constructor(address onchainID_) {
        _onchainID = onchainID_;
    }

    function hasRole(bytes32 role, address account) external view returns (bool) {
        return _roles[role][account];
    }

    function grantRole(bytes32 role, address account) external {
        _roles[role][account] = true;
    }

    function onchainID() external view returns (address) {
        return _onchainID;
    }
}

contract TokenTrustedIssuersRegistryTest is Test {
    TokenTrustedIssuersRegistry public registry;
    MockToken public token;

    // Test addresses
    address public governance = makeAddr("governance");
    address public user1 = makeAddr("user1");
    address public forwarder = makeAddr("forwarder");
    address public onchainID = makeAddr("onchainID");
    address public wrongOnchainID = makeAddr("wrongOnchainID");

    // Mock issuers
    MockClaimIssuer public issuer1;
    MockClaimIssuer public issuer2;
    MockClaimIssuer public issuer3;

    // Claim topics
    uint256 constant KYC_TOPIC = 1;
    uint256 constant AML_TOPIC = 2;
    uint256 constant ACCREDITATION_TOPIC = 3;

    function setUp() public {
        // Deploy mock issuers
        issuer1 = new MockClaimIssuer();
        issuer2 = new MockClaimIssuer();
        issuer3 = new MockClaimIssuer();

        // Deploy mock token
        token = new MockToken(onchainID);
        token.grantRole(ATKAssetRoles.GOVERNANCE_ROLE, governance);

        // Deploy registry
        registry = new TokenTrustedIssuersRegistry(forwarder, address(token));
    }

    function test_ConstructorSuccess() public view {
        // Verify token is set correctly
        assertEq(address(registry.token()), address(token));
    }

    function test_ConstructorInvalidTokenAddress() public {
        vm.expectRevert(TokenTrustedIssuersRegistry.InvalidTokenAddress.selector);
        new TokenTrustedIssuersRegistry(forwarder, address(0));
    }

    function test_AddTrustedIssuerSuccess() public {
        uint256[] memory topics = new uint256[](2);
        topics[0] = KYC_TOPIC;
        topics[1] = AML_TOPIC;

        vm.prank(governance);
        vm.expectEmit(true, true, false, false);
        emit IATKTrustedIssuersRegistry.TrustedIssuerAdded(
            governance, IClaimIssuer(address(issuer1)), topics, onchainID
        );
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Verify issuer was added
        assertTrue(registry.isTrustedIssuer(address(issuer1), onchainID));
        assertTrue(registry.hasClaimTopic(address(issuer1), KYC_TOPIC, onchainID));
        assertTrue(registry.hasClaimTopic(address(issuer1), AML_TOPIC, onchainID));
        assertFalse(registry.hasClaimTopic(address(issuer1), ACCREDITATION_TOPIC, onchainID));

        // Verify topics
        uint256[] memory issuerTopics = registry.getTrustedIssuerClaimTopics(IClaimIssuer(address(issuer1)), onchainID);
        assertEq(issuerTopics.length, 2);
        assertEq(issuerTopics[0], KYC_TOPIC);
        assertEq(issuerTopics[1], AML_TOPIC);

        // Verify in list
        IClaimIssuer[] memory allIssuers = registry.getTrustedIssuers(onchainID);
        assertEq(allIssuers.length, 1);
        assertEq(address(allIssuers[0]), address(issuer1));
    }

    function test_AddTrustedIssuerRequiresGovernanceRole() public {
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                TokenTrustedIssuersRegistry.AccessControlUnauthorizedAccount.selector,
                user1,
                ATKAssetRoles.GOVERNANCE_ROLE
            )
        );
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);
    }

    function test_AddTrustedIssuerInvalidAddress() public {
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(governance);
        vm.expectRevert(TokenTrustedIssuersRegistry.InvalidIssuerAddress.selector);
        registry.addTrustedIssuer(IClaimIssuer(address(0)), topics);
    }

    function test_AddTrustedIssuerNoTopics() public {
        uint256[] memory topics = new uint256[](0);

        vm.prank(governance);
        vm.expectRevert(TokenTrustedIssuersRegistry.NoClaimTopicsProvided.selector);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);
    }

    function test_AddTrustedIssuerAlreadyExists() public {
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        // Add issuer first time
        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Try to add again
        vm.prank(governance);
        vm.expectRevert(
            abi.encodeWithSelector(TokenTrustedIssuersRegistry.IssuerAlreadyExists.selector, address(issuer1))
        );
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);
    }

    function test_RemoveTrustedIssuerSuccess() public {
        // Add issuer first
        uint256[] memory topics = new uint256[](2);
        topics[0] = KYC_TOPIC;
        topics[1] = AML_TOPIC;

        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Remove issuer
        vm.prank(governance);
        vm.expectEmit(true, true, false, false);
        emit IATKTrustedIssuersRegistry.TrustedIssuerRemoved(governance, IClaimIssuer(address(issuer1)), onchainID);
        registry.removeTrustedIssuer(IClaimIssuer(address(issuer1)));

        // Verify issuer was removed
        assertFalse(registry.isTrustedIssuer(address(issuer1), onchainID));
        assertFalse(registry.hasClaimTopic(address(issuer1), KYC_TOPIC, onchainID));
        assertFalse(registry.hasClaimTopic(address(issuer1), AML_TOPIC, onchainID));

        // Verify removed from list
        IClaimIssuer[] memory allIssuers = registry.getTrustedIssuers(onchainID);
        assertEq(allIssuers.length, 0);
    }

    function test_RemoveTrustedIssuerRequiresGovernanceRole() public {
        // Add issuer first
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Try to remove without permission
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                TokenTrustedIssuersRegistry.AccessControlUnauthorizedAccount.selector,
                user1,
                ATKAssetRoles.GOVERNANCE_ROLE
            )
        );
        registry.removeTrustedIssuer(IClaimIssuer(address(issuer1)));
    }

    function test_RemoveTrustedIssuerDoesNotExist() public {
        vm.prank(governance);
        vm.expectRevert(
            abi.encodeWithSelector(TokenTrustedIssuersRegistry.IssuerDoesNotExist.selector, address(issuer1))
        );
        registry.removeTrustedIssuer(IClaimIssuer(address(issuer1)));
    }

    function test_UpdateIssuerClaimTopicsSuccess() public {
        // Add issuer first
        uint256[] memory originalTopics = new uint256[](2);
        originalTopics[0] = KYC_TOPIC;
        originalTopics[1] = AML_TOPIC;

        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), originalTopics);

        // Update topics
        uint256[] memory newTopics = new uint256[](2);
        newTopics[0] = AML_TOPIC;
        newTopics[1] = ACCREDITATION_TOPIC;

        vm.prank(governance);
        vm.expectEmit(true, true, false, false);
        emit IATKTrustedIssuersRegistry.ClaimTopicsUpdated(
            governance, IClaimIssuer(address(issuer1)), newTopics, onchainID
        );
        registry.updateIssuerClaimTopics(IClaimIssuer(address(issuer1)), newTopics);

        // Verify updated topics
        assertFalse(registry.hasClaimTopic(address(issuer1), KYC_TOPIC, onchainID));
        assertTrue(registry.hasClaimTopic(address(issuer1), AML_TOPIC, onchainID));
        assertTrue(registry.hasClaimTopic(address(issuer1), ACCREDITATION_TOPIC, onchainID));

        uint256[] memory issuerTopics = registry.getTrustedIssuerClaimTopics(IClaimIssuer(address(issuer1)), onchainID);
        assertEq(issuerTopics.length, 2);
        assertEq(issuerTopics[0], AML_TOPIC);
        assertEq(issuerTopics[1], ACCREDITATION_TOPIC);
    }

    function test_UpdateIssuerClaimTopicsRequiresGovernanceRole() public {
        // Add issuer first
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Try to update without permission
        uint256[] memory newTopics = new uint256[](1);
        newTopics[0] = AML_TOPIC;

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                TokenTrustedIssuersRegistry.AccessControlUnauthorizedAccount.selector,
                user1,
                ATKAssetRoles.GOVERNANCE_ROLE
            )
        );
        registry.updateIssuerClaimTopics(IClaimIssuer(address(issuer1)), newTopics);
    }

    function test_UpdateIssuerClaimTopicsDoesNotExist() public {
        uint256[] memory newTopics = new uint256[](1);
        newTopics[0] = AML_TOPIC;

        vm.prank(governance);
        vm.expectRevert(
            abi.encodeWithSelector(TokenTrustedIssuersRegistry.IssuerDoesNotExist.selector, address(issuer1))
        );
        registry.updateIssuerClaimTopics(IClaimIssuer(address(issuer1)), newTopics);
    }

    function test_UpdateIssuerClaimTopicsNoTopics() public {
        // Add issuer first
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Try to update with empty topics
        uint256[] memory newTopics = new uint256[](0);

        vm.prank(governance);
        vm.expectRevert(TokenTrustedIssuersRegistry.NoClaimTopicsProvided.selector);
        registry.updateIssuerClaimTopics(IClaimIssuer(address(issuer1)), newTopics);
    }

    function test_GetTrustedIssuersValidSubject() public {
        // Add multiple issuers
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);
        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer2)), topics);

        IClaimIssuer[] memory issuers = registry.getTrustedIssuers(onchainID);
        assertEq(issuers.length, 2);
        assertEq(address(issuers[0]), address(issuer1));
        assertEq(address(issuers[1]), address(issuer2));
    }

    function test_GetTrustedIssuersInvalidSubject() public {
        vm.expectRevert(TokenTrustedIssuersRegistry.InvalidSubjectAddress.selector);
        registry.getTrustedIssuers(wrongOnchainID);
    }

    function test_GetTrustedIssuersForClaimTopicValidSubject() public {
        // Add multiple issuers for different topics
        uint256[] memory topics1 = new uint256[](2);
        topics1[0] = KYC_TOPIC;
        topics1[1] = AML_TOPIC;

        uint256[] memory topics2 = new uint256[](1);
        topics2[0] = KYC_TOPIC;

        uint256[] memory topics3 = new uint256[](1);
        topics3[0] = ACCREDITATION_TOPIC;

        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics1);
        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer2)), topics2);
        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer3)), topics3);

        // Check KYC topic (should have issuer1 and issuer2)
        IClaimIssuer[] memory kycIssuers = registry.getTrustedIssuersForClaimTopic(KYC_TOPIC, onchainID);
        assertEq(kycIssuers.length, 2);
        assertTrue(address(kycIssuers[0]) == address(issuer1) || address(kycIssuers[1]) == address(issuer1));
        assertTrue(address(kycIssuers[0]) == address(issuer2) || address(kycIssuers[1]) == address(issuer2));

        // Check AML topic (should have only issuer1)
        IClaimIssuer[] memory amlIssuers = registry.getTrustedIssuersForClaimTopic(AML_TOPIC, onchainID);
        assertEq(amlIssuers.length, 1);
        assertEq(address(amlIssuers[0]), address(issuer1));

        // Check non-existent topic
        IClaimIssuer[] memory unknownIssuers = registry.getTrustedIssuersForClaimTopic(999, onchainID);
        assertEq(unknownIssuers.length, 0);
    }

    function test_GetTrustedIssuersForClaimTopicInvalidSubject() public {
        vm.expectRevert(TokenTrustedIssuersRegistry.InvalidSubjectAddress.selector);
        registry.getTrustedIssuersForClaimTopic(KYC_TOPIC, wrongOnchainID);
    }

    function test_IsTrustedIssuerValidSubject() public {
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        assertTrue(registry.isTrustedIssuer(address(issuer1), onchainID));
        assertFalse(registry.isTrustedIssuer(address(issuer2), onchainID));
    }

    function test_IsTrustedIssuerInvalidSubject() public {
        vm.expectRevert(TokenTrustedIssuersRegistry.InvalidSubjectAddress.selector);
        registry.isTrustedIssuer(address(issuer1), wrongOnchainID);
    }

    function test_HasClaimTopicValidSubject() public {
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        assertTrue(registry.hasClaimTopic(address(issuer1), KYC_TOPIC, onchainID));
        assertFalse(registry.hasClaimTopic(address(issuer1), AML_TOPIC, onchainID));
        assertFalse(registry.hasClaimTopic(address(issuer2), KYC_TOPIC, onchainID));
    }

    function test_HasClaimTopicInvalidSubject() public {
        vm.expectRevert(TokenTrustedIssuersRegistry.InvalidSubjectAddress.selector);
        registry.hasClaimTopic(address(issuer1), KYC_TOPIC, wrongOnchainID);
    }

    function test_GetTrustedIssuerClaimTopicsValidSubject() public {
        uint256[] memory topics = new uint256[](2);
        topics[0] = KYC_TOPIC;
        topics[1] = AML_TOPIC;

        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        uint256[] memory returnedTopics =
            registry.getTrustedIssuerClaimTopics(IClaimIssuer(address(issuer1)), onchainID);
        assertEq(returnedTopics.length, 2);
        assertEq(returnedTopics[0], KYC_TOPIC);
        assertEq(returnedTopics[1], AML_TOPIC);
    }

    function test_GetTrustedIssuerClaimTopicsInvalidSubject() public {
        vm.expectRevert(TokenTrustedIssuersRegistry.InvalidSubjectAddress.selector);
        registry.getTrustedIssuerClaimTopics(IClaimIssuer(address(issuer1)), wrongOnchainID);
    }

    function test_IsAuthorizedToAddClaim() public {
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        assertTrue(registry.isAuthorizedToAddClaim(address(issuer1), KYC_TOPIC, onchainID));
        assertFalse(registry.isAuthorizedToAddClaim(address(issuer1), AML_TOPIC, onchainID));
    }

    function test_MultipleIssuersManagement() public {
        // Add multiple issuers
        uint256[] memory topics1 = new uint256[](1);
        topics1[0] = KYC_TOPIC;

        uint256[] memory topics2 = new uint256[](1);
        topics2[0] = AML_TOPIC;

        uint256[] memory topics3 = new uint256[](2);
        topics3[0] = KYC_TOPIC;
        topics3[1] = ACCREDITATION_TOPIC;

        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics1);
        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer2)), topics2);
        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer3)), topics3);

        // Verify all are trusted
        assertTrue(registry.isTrustedIssuer(address(issuer1), onchainID));
        assertTrue(registry.isTrustedIssuer(address(issuer2), onchainID));
        assertTrue(registry.isTrustedIssuer(address(issuer3), onchainID));

        // Verify total count
        IClaimIssuer[] memory allIssuers = registry.getTrustedIssuers(onchainID);
        assertEq(allIssuers.length, 3);

        // Remove middle issuer
        vm.prank(governance);
        registry.removeTrustedIssuer(IClaimIssuer(address(issuer2)));

        // Verify updated state
        assertTrue(registry.isTrustedIssuer(address(issuer1), onchainID));
        assertFalse(registry.isTrustedIssuer(address(issuer2), onchainID));
        assertTrue(registry.isTrustedIssuer(address(issuer3), onchainID));

        allIssuers = registry.getTrustedIssuers(onchainID);
        assertEq(allIssuers.length, 2);
    }

    function test_SupportsInterface() public view {
        // Test ERC165 support
        assertTrue(registry.supportsInterface(type(IERC165).interfaceId));
        assertTrue(registry.supportsInterface(type(IATKTokenTrustedIssuersRegistry).interfaceId));
        assertTrue(registry.supportsInterface(type(IATKTrustedIssuersRegistry).interfaceId));
        assertTrue(registry.supportsInterface(type(ISMARTTrustedIssuersRegistry).interfaceId));
        assertTrue(registry.supportsInterface(type(IClaimAuthorizer).interfaceId));

        // Test unsupported interface
        assertFalse(registry.supportsInterface(0x12345678));
    }

    function test_ERC2771ContextIntegration() public view {
        // Verify registry is deployed correctly
        assertNotEq(address(registry), address(0));
    }

    function test_RemovalWithSwapAndPop() public {
        // Test the internal swap-and-pop logic by adding multiple issuers to same topic
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        // Add three issuers for KYC topic
        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);
        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer2)), topics);
        vm.prank(governance);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer3)), topics);

        // Verify all are present
        IClaimIssuer[] memory kycIssuers = registry.getTrustedIssuersForClaimTopic(KYC_TOPIC, onchainID);
        assertEq(kycIssuers.length, 3);

        // Remove the middle one (should trigger swap-and-pop)
        vm.prank(governance);
        registry.removeTrustedIssuer(IClaimIssuer(address(issuer2)));

        // Verify state after removal
        kycIssuers = registry.getTrustedIssuersForClaimTopic(KYC_TOPIC, onchainID);
        assertEq(kycIssuers.length, 2);
        assertFalse(registry.hasClaimTopic(address(issuer2), KYC_TOPIC, onchainID));
        assertTrue(registry.hasClaimTopic(address(issuer1), KYC_TOPIC, onchainID));
        assertTrue(registry.hasClaimTopic(address(issuer3), KYC_TOPIC, onchainID));
    }

    function test_FuzzAddRemoveIssuers(uint8 numIssuers, uint256 topic) public {
        numIssuers = uint8(bound(numIssuers, 1, 10)); // Reasonable range
        topic = bound(topic, 1, 100); // Reasonable topic range

        // Create mock issuers
        address[] memory issuers = new address[](numIssuers);
        for (uint8 i = 0; i < numIssuers; i++) {
            issuers[i] = address(new MockClaimIssuer());
        }

        uint256[] memory topics = new uint256[](1);
        topics[0] = topic;

        // Add all issuers
        for (uint8 i = 0; i < numIssuers; i++) {
            vm.prank(governance);
            registry.addTrustedIssuer(IClaimIssuer(issuers[i]), topics);
            assertTrue(registry.isTrustedIssuer(issuers[i], onchainID));
            assertTrue(registry.hasClaimTopic(issuers[i], topic, onchainID));
        }

        // Verify count
        IClaimIssuer[] memory topicIssuers = registry.getTrustedIssuersForClaimTopic(topic, onchainID);
        assertEq(topicIssuers.length, numIssuers);

        // Remove all issuers
        for (uint8 i = 0; i < numIssuers; i++) {
            vm.prank(governance);
            registry.removeTrustedIssuer(IClaimIssuer(issuers[i]));
            assertFalse(registry.isTrustedIssuer(issuers[i], onchainID));
            assertFalse(registry.hasClaimTopic(issuers[i], topic, onchainID));
        }

        // Verify empty
        topicIssuers = registry.getTrustedIssuersForClaimTopic(topic, onchainID);
        assertEq(topicIssuers.length, 0);
    }
}
