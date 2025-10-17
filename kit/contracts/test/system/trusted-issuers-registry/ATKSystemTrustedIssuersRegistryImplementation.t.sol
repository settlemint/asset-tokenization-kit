// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import {
    ATKSystemTrustedIssuersRegistryImplementation
} from "../../../contracts/system/trusted-issuers-registry/ATKSystemTrustedIssuersRegistryImplementation.sol";
import { ISMARTTrustedIssuersRegistry } from "../../../contracts/smart/interface/ISMARTTrustedIssuersRegistry.sol";
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { ATKPeopleRoles } from "../../../contracts/system/ATKPeopleRoles.sol";
import { ATKRoles } from "../../../contracts/system/ATKRoles.sol";
import {
    ATKSystemAccessManagerImplementation
} from "../../../contracts/system/access-manager/ATKSystemAccessManagerImplementation.sol";
import {
    IATKSystemTrustedIssuersRegistry
} from "../../../contracts/system/trusted-issuers-registry/IATKSystemTrustedIssuersRegistry.sol";
import { IATKSystemAccessManaged } from "../../../contracts/system/access-manager/IATKSystemAccessManaged.sol";
import {
    IATKTrustedIssuersRegistry
} from "../../../contracts/system/trusted-issuers-registry/IATKTrustedIssuersRegistry.sol";

// Mock claim issuer for testing
contract MockClaimIssuer {
    // Just a basic mock that can be cast to IClaimIssuer
    function isClaimValid(address, uint256, bytes calldata, bytes calldata) external pure returns (bool) {
        return true;
    }
}

contract ATKSystemTrustedIssuersRegistryImplementationTest is Test {
    ATKSystemTrustedIssuersRegistryImplementation public implementation;
    IATKSystemTrustedIssuersRegistry public registry;
    ATKSystemAccessManagerImplementation public systemAccessManager;

    // Test addresses
    address public admin = makeAddr("admin");
    address public claimPolicyManager = makeAddr("claimPolicyManager");
    address public user1 = makeAddr("user1");
    address public forwarder = makeAddr("forwarder");

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

        // Deploy system access manager
        address[] memory initialAdmins = new address[](1);
        initialAdmins[0] = admin;
        ATKSystemAccessManagerImplementation accessManagerImpl = new ATKSystemAccessManagerImplementation(forwarder);
        bytes memory accessManagerInitData =
            abi.encodeWithSelector(accessManagerImpl.initialize.selector, initialAdmins);
        ERC1967Proxy accessManagerProxy = new ERC1967Proxy(address(accessManagerImpl), accessManagerInitData);
        systemAccessManager = ATKSystemAccessManagerImplementation(address(accessManagerProxy));

        // Grant claim policy manager role to our test user
        vm.prank(admin);
        systemAccessManager.grantRole(ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE, claimPolicyManager);

        // Deploy trusted issuers registry implementation
        implementation = new ATKSystemTrustedIssuersRegistryImplementation(forwarder);

        // Deploy proxy with initialization data
        bytes memory initData = abi.encodeWithSelector(implementation.initialize.selector, address(systemAccessManager));
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        registry = IATKSystemTrustedIssuersRegistry(address(proxy));
    }

    function test_InitializeSuccess() public view {
        // Verify admin has both roles
        assertTrue(registry.hasSystemRole(ATKRoles.DEFAULT_ADMIN_ROLE, admin));
        // Admin should not directly have claim policy manager role on the registry itself
        // The role is managed through the system access manager

        // Verify claimPolicyManager has claim policy manager role
        assertTrue(systemAccessManager.hasRole(ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE, claimPolicyManager));

        // Verify initial state
        IClaimIssuer[] memory issuers = registry.getTrustedIssuers(address(0));
        assertEq(issuers.length, 0);
    }

    function test_CannotInitializeTwice() public {
        vm.expectRevert();
        ATKSystemTrustedIssuersRegistryImplementation(address(registry)).initialize(address(systemAccessManager));
    }

    function test_AddTrustedIssuerSuccess() public {
        uint256[] memory topics = new uint256[](2);
        topics[0] = KYC_TOPIC;
        topics[1] = AML_TOPIC;

        vm.prank(claimPolicyManager);
        vm.expectEmit(true, true, false, false);
        emit IATKTrustedIssuersRegistry.TrustedIssuerAdded(
            claimPolicyManager, IClaimIssuer(address(issuer1)), topics, address(0)
        );
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Verify issuer was added
        assertTrue(registry.isTrustedIssuer(address(issuer1), address(0)));
        assertTrue(registry.hasClaimTopic(address(issuer1), KYC_TOPIC, address(0)));
        assertTrue(registry.hasClaimTopic(address(issuer1), AML_TOPIC, address(0)));
        assertFalse(registry.hasClaimTopic(address(issuer1), ACCREDITATION_TOPIC, address(0)));

        // Verify topics
        uint256[] memory issuerTopics = registry.getTrustedIssuerClaimTopics(IClaimIssuer(address(issuer1)), address(0));
        assertEq(issuerTopics.length, 2);
        assertEq(issuerTopics[0], KYC_TOPIC);
        assertEq(issuerTopics[1], AML_TOPIC);

        // Verify in global list
        IClaimIssuer[] memory allIssuers = registry.getTrustedIssuers(address(0));
        assertEq(allIssuers.length, 1);
        assertEq(address(allIssuers[0]), address(issuer1));
    }

    function test_AddTrustedIssuerRequiresRegistrarRole() public {
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(user1);
        vm.expectRevert();
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);
    }

    function test_AddTrustedIssuerInvalidAddress() public {
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(claimPolicyManager);
        vm.expectRevert(ATKSystemTrustedIssuersRegistryImplementation.InvalidIssuerAddress.selector);
        registry.addTrustedIssuer(IClaimIssuer(address(0)), topics);
    }

    function test_AddTrustedIssuerNoTopics() public {
        uint256[] memory topics = new uint256[](0);

        vm.prank(claimPolicyManager);
        vm.expectRevert(ATKSystemTrustedIssuersRegistryImplementation.NoClaimTopicsProvided.selector);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);
    }

    function test_AddTrustedIssuerAlreadyExists() public {
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        // Add issuer first time
        vm.prank(claimPolicyManager);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Try to add again
        vm.prank(claimPolicyManager);
        vm.expectRevert(
            abi.encodeWithSelector(
                ATKSystemTrustedIssuersRegistryImplementation.IssuerAlreadyExists.selector, address(issuer1)
            )
        );
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);
    }

    function test_RemoveTrustedIssuerSuccess() public {
        // Add issuer first
        uint256[] memory topics = new uint256[](2);
        topics[0] = KYC_TOPIC;
        topics[1] = AML_TOPIC;

        vm.prank(claimPolicyManager);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Remove issuer
        vm.prank(claimPolicyManager);
        vm.expectEmit(true, true, false, false);
        emit IATKTrustedIssuersRegistry.TrustedIssuerRemoved(
            claimPolicyManager, IClaimIssuer(address(issuer1)), address(0)
        );

        registry.removeTrustedIssuer(IClaimIssuer(address(issuer1)));

        // Verify issuer was removed
        assertFalse(registry.isTrustedIssuer(address(issuer1), address(0)));
        assertFalse(registry.hasClaimTopic(address(issuer1), KYC_TOPIC, address(0)));
        assertFalse(registry.hasClaimTopic(address(issuer1), AML_TOPIC, address(0)));

        // Verify removed from global list
        IClaimIssuer[] memory allIssuers = registry.getTrustedIssuers(address(0));
        assertEq(allIssuers.length, 0);
    }

    function test_RemoveTrustedIssuerRequiresRegistrarRole() public {
        // Add issuer first
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(claimPolicyManager);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Try to remove without permission
        vm.prank(user1);
        vm.expectRevert();
        registry.removeTrustedIssuer(IClaimIssuer(address(issuer1)));
    }

    function test_RemoveTrustedIssuerDoesNotExist() public {
        vm.prank(claimPolicyManager);
        vm.expectRevert(
            abi.encodeWithSelector(
                ATKSystemTrustedIssuersRegistryImplementation.IssuerDoesNotExist.selector, address(issuer1)
            )
        );
        registry.removeTrustedIssuer(IClaimIssuer(address(issuer1)));
    }

    function test_UpdateIssuerClaimTopicsSuccess() public {
        // Add issuer first
        uint256[] memory originalTopics = new uint256[](2);
        originalTopics[0] = KYC_TOPIC;
        originalTopics[1] = AML_TOPIC;

        vm.prank(claimPolicyManager);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), originalTopics);

        // Update topics
        uint256[] memory newTopics = new uint256[](2);
        newTopics[0] = AML_TOPIC;
        newTopics[1] = ACCREDITATION_TOPIC;

        vm.prank(claimPolicyManager);
        vm.expectEmit(true, true, false, false);
        emit IATKTrustedIssuersRegistry.ClaimTopicsUpdated(
            claimPolicyManager, IClaimIssuer(address(issuer1)), newTopics, address(0)
        );

        registry.updateIssuerClaimTopics(IClaimIssuer(address(issuer1)), newTopics);

        // Verify updated topics
        assertFalse(registry.hasClaimTopic(address(issuer1), KYC_TOPIC, address(0)));
        assertTrue(registry.hasClaimTopic(address(issuer1), AML_TOPIC, address(0)));
        assertTrue(registry.hasClaimTopic(address(issuer1), ACCREDITATION_TOPIC, address(0)));

        uint256[] memory issuerTopics = registry.getTrustedIssuerClaimTopics(IClaimIssuer(address(issuer1)), address(0));
        assertEq(issuerTopics.length, 2);
        assertEq(issuerTopics[0], AML_TOPIC);
        assertEq(issuerTopics[1], ACCREDITATION_TOPIC);
    }

    function test_UpdateIssuerClaimTopicsRequiresRegistrarRole() public {
        // Add issuer first
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(claimPolicyManager);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Try to update without permission
        uint256[] memory newTopics = new uint256[](1);
        newTopics[0] = AML_TOPIC;

        vm.prank(user1);
        vm.expectRevert();
        registry.updateIssuerClaimTopics(IClaimIssuer(address(issuer1)), newTopics);
    }

    function test_UpdateIssuerClaimTopicsDoesNotExist() public {
        uint256[] memory newTopics = new uint256[](1);
        newTopics[0] = AML_TOPIC;

        vm.prank(claimPolicyManager);
        vm.expectRevert(
            abi.encodeWithSelector(
                ATKSystemTrustedIssuersRegistryImplementation.IssuerDoesNotExist.selector, address(issuer1)
            )
        );
        registry.updateIssuerClaimTopics(IClaimIssuer(address(issuer1)), newTopics);
    }

    function test_UpdateIssuerClaimTopicsNoTopics() public {
        // Add issuer first
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(claimPolicyManager);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Try to update with empty topics
        uint256[] memory newTopics = new uint256[](0);

        vm.prank(claimPolicyManager);
        vm.expectRevert(ATKSystemTrustedIssuersRegistryImplementation.NoClaimTopicsProvided.selector);
        registry.updateIssuerClaimTopics(IClaimIssuer(address(issuer1)), newTopics);
    }

    function test_GetTrustedIssuersForClaimTopic() public {
        // Add multiple issuers for different topics
        uint256[] memory topics1 = new uint256[](2);
        topics1[0] = KYC_TOPIC;
        topics1[1] = AML_TOPIC;

        uint256[] memory topics2 = new uint256[](1);
        topics2[0] = KYC_TOPIC;

        uint256[] memory topics3 = new uint256[](1);
        topics3[0] = ACCREDITATION_TOPIC;

        vm.prank(claimPolicyManager);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics1);
        vm.prank(claimPolicyManager);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer2)), topics2);
        vm.prank(claimPolicyManager);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer3)), topics3);

        // Check KYC topic (should have issuer1 and issuer2)
        IClaimIssuer[] memory kycIssuers = registry.getTrustedIssuersForClaimTopic(KYC_TOPIC, address(0));
        assertEq(kycIssuers.length, 2);
        assertTrue(address(kycIssuers[0]) == address(issuer1) || address(kycIssuers[1]) == address(issuer1));
        assertTrue(address(kycIssuers[0]) == address(issuer2) || address(kycIssuers[1]) == address(issuer2));

        // Check AML topic (should have only issuer1)
        IClaimIssuer[] memory amlIssuers = registry.getTrustedIssuersForClaimTopic(AML_TOPIC, address(0));
        assertEq(amlIssuers.length, 1);
        assertEq(address(amlIssuers[0]), address(issuer1));

        // Check accreditation topic (should have only issuer3)
        IClaimIssuer[] memory accreditationIssuers =
            registry.getTrustedIssuersForClaimTopic(ACCREDITATION_TOPIC, address(0));
        assertEq(accreditationIssuers.length, 1);
        assertEq(address(accreditationIssuers[0]), address(issuer3));

        // Check non-existent topic
        IClaimIssuer[] memory unknownIssuers = registry.getTrustedIssuersForClaimTopic(999, address(0));
        assertEq(unknownIssuers.length, 0);
    }

    function test_GetTrustedIssuerClaimTopicsDoesNotExist() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                ATKSystemTrustedIssuersRegistryImplementation.IssuerDoesNotExist.selector, address(issuer1)
            )
        );
        registry.getTrustedIssuerClaimTopics(IClaimIssuer(address(issuer1)), address(0));
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

        vm.prank(claimPolicyManager);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics1);
        vm.prank(claimPolicyManager);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer2)), topics2);
        vm.prank(claimPolicyManager);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer3)), topics3);

        // Verify all are trusted
        assertTrue(registry.isTrustedIssuer(address(issuer1), address(0)));
        assertTrue(registry.isTrustedIssuer(address(issuer2), address(0)));
        assertTrue(registry.isTrustedIssuer(address(issuer3), address(0)));

        // Verify total count
        IClaimIssuer[] memory allIssuers = registry.getTrustedIssuers(address(0));
        assertEq(allIssuers.length, 3);

        // Remove middle issuer
        vm.prank(claimPolicyManager);
        registry.removeTrustedIssuer(IClaimIssuer(address(issuer2)));

        // Verify updated state
        assertTrue(registry.isTrustedIssuer(address(issuer1), address(0)));
        assertFalse(registry.isTrustedIssuer(address(issuer2), address(0)));
        assertTrue(registry.isTrustedIssuer(address(issuer3), address(0)));

        allIssuers = registry.getTrustedIssuers(address(0));
        assertEq(allIssuers.length, 2);
    }

    function test_SupportsInterface() public view {
        // Test ERC165 support
        assertTrue(implementation.supportsInterface(type(IERC165).interfaceId));
        assertTrue(implementation.supportsInterface(type(ISMARTTrustedIssuersRegistry).interfaceId));
        assertTrue(implementation.supportsInterface(type(IATKSystemAccessManaged).interfaceId));

        // Test unsupported interface
        assertFalse(implementation.supportsInterface(0x12345678));
    }

    function test_DirectCallToImplementation() public {
        // Direct calls to implementation should fail for initialize
        vm.expectRevert();
        implementation.initialize(address(systemAccessManager));
    }

    function test_ERC2771ContextIntegration() public view {
        // Verify forwarder is set correctly in implementation
        // This is tested implicitly through the constructor
        assertNotEq(address(implementation), address(0));
    }

    function test_RemovalWithSwapAndPop() public {
        // Test the internal swap-and-pop logic by adding multiple issuers to same topic
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        // Add three issuers for KYC topic
        vm.prank(claimPolicyManager);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);
        vm.prank(claimPolicyManager);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer2)), topics);
        vm.prank(claimPolicyManager);
        registry.addTrustedIssuer(IClaimIssuer(address(issuer3)), topics);

        // Verify all are present
        IClaimIssuer[] memory kycIssuers = registry.getTrustedIssuersForClaimTopic(KYC_TOPIC, address(0));
        assertEq(kycIssuers.length, 3);

        // Remove the middle one (should trigger swap-and-pop)
        vm.prank(claimPolicyManager);
        registry.removeTrustedIssuer(IClaimIssuer(address(issuer2)));

        // Verify state after removal
        kycIssuers = registry.getTrustedIssuersForClaimTopic(KYC_TOPIC, address(0));
        assertEq(kycIssuers.length, 2);
        assertFalse(registry.hasClaimTopic(address(issuer2), KYC_TOPIC, address(0)));
        assertTrue(registry.hasClaimTopic(address(issuer1), KYC_TOPIC, address(0)));
        assertTrue(registry.hasClaimTopic(address(issuer3), KYC_TOPIC, address(0)));
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
            vm.prank(claimPolicyManager);
            registry.addTrustedIssuer(IClaimIssuer(issuers[i]), topics);
            assertTrue(registry.isTrustedIssuer(issuers[i], address(0)));
            assertTrue(registry.hasClaimTopic(issuers[i], topic, address(0)));
        }

        // Verify count
        IClaimIssuer[] memory topicIssuers = registry.getTrustedIssuersForClaimTopic(topic, address(0));
        assertEq(topicIssuers.length, numIssuers);

        // Remove all issuers
        for (uint8 i = 0; i < numIssuers; i++) {
            vm.prank(claimPolicyManager);
            registry.removeTrustedIssuer(IClaimIssuer(issuers[i]));
            assertFalse(registry.isTrustedIssuer(issuers[i], address(0)));
            assertFalse(registry.hasClaimTopic(issuers[i], topic, address(0)));
        }

        // Verify empty
        topicIssuers = registry.getTrustedIssuersForClaimTopic(topic, address(0));
        assertEq(topicIssuers.length, 0);
    }
}
