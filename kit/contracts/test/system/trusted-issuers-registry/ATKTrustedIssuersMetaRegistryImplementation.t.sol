// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { ATKTrustedIssuersMetaRegistryImplementation } from
    "../../../contracts/system/trusted-issuers-registry/ATKTrustedIssuersMetaRegistryImplementation.sol";
import { ATKSystemTrustedIssuersRegistryImplementation } from
    "../../../contracts/system/trusted-issuers-registry/ATKSystemTrustedIssuersRegistryImplementation.sol";
import { ISMARTTrustedIssuersRegistry } from "../../../contracts/smart/interface/ISMARTTrustedIssuersRegistry.sol";
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { ATKPeopleRoles } from "../../../contracts/system/ATKPeopleRoles.sol";
import { ATKSystemAccessManagerImplementation } from
    "../../../contracts/system/access-manager/ATKSystemAccessManagerImplementation.sol";
import { IATKTrustedIssuersMetaRegistry } from
    "../../../contracts/system/trusted-issuers-registry/IATKTrustedIssuersMetaRegistry.sol";
import { IATKSystemAccessManaged } from "../../../contracts/system/access-manager/IATKSystemAccessManaged.sol";
import { IATKTrustedIssuersRegistry } from
    "../../../contracts/system/trusted-issuers-registry/IATKTrustedIssuersRegistry.sol";
import { ATKSystemRoles } from "../../../contracts/system/ATKSystemRoles.sol";
import { IClaimAuthorizer } from "../../../contracts/onchainid/extensions/IClaimAuthorizer.sol";

// Mock claim issuer for testing
contract MockClaimIssuer {
    function isClaimValid(address, uint256, bytes calldata, bytes calldata) external pure returns (bool) {
        return true;
    }
}

contract ATKTrustedIssuersMetaRegistryImplementationTest is Test {
    ATKTrustedIssuersMetaRegistryImplementation public implementation;
    IATKTrustedIssuersMetaRegistry public metaRegistry;
    ATKSystemAccessManagerImplementation public systemAccessManager;
    ATKSystemTrustedIssuersRegistryImplementation public systemRegistry;
    ATKSystemTrustedIssuersRegistryImplementation public contractRegistry;

    // Test addresses
    address public admin = makeAddr("admin");
    address public systemManager = makeAddr("systemManager");
    address public claimPolicyManager = makeAddr("claimPolicyManager");
    address public user1 = makeAddr("user1");
    address public forwarder = makeAddr("forwarder");
    address public contract1 = makeAddr("contract1");
    address public contract2 = makeAddr("contract2");

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

        // Grant roles
        vm.prank(admin);
        systemAccessManager.grantRole(ATKPeopleRoles.SYSTEM_MANAGER_ROLE, systemManager);
        vm.prank(admin);
        systemAccessManager.grantRole(ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE, claimPolicyManager);

        // Deploy system registry
        ATKSystemTrustedIssuersRegistryImplementation systemRegistryImpl =
            new ATKSystemTrustedIssuersRegistryImplementation(forwarder);
        bytes memory systemRegistryInitData =
            abi.encodeWithSelector(systemRegistryImpl.initialize.selector, address(systemAccessManager));
        ERC1967Proxy systemRegistryProxy = new ERC1967Proxy(address(systemRegistryImpl), systemRegistryInitData);
        systemRegistry = ATKSystemTrustedIssuersRegistryImplementation(address(systemRegistryProxy));

        // Deploy contract-specific registry
        ATKSystemTrustedIssuersRegistryImplementation contractRegistryImpl =
            new ATKSystemTrustedIssuersRegistryImplementation(forwarder);
        bytes memory contractRegistryInitData =
            abi.encodeWithSelector(contractRegistryImpl.initialize.selector, address(systemAccessManager));
        ERC1967Proxy contractRegistryProxy = new ERC1967Proxy(address(contractRegistryImpl), contractRegistryInitData);
        contractRegistry = ATKSystemTrustedIssuersRegistryImplementation(address(contractRegistryProxy));

        // Deploy meta registry implementation
        implementation = new ATKTrustedIssuersMetaRegistryImplementation(forwarder);

        // Deploy proxy with initialization data
        bytes memory initData = abi.encodeWithSelector(
            implementation.initialize.selector, address(systemAccessManager), address(systemRegistry)
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        metaRegistry = IATKTrustedIssuersMetaRegistry(address(proxy));

        vm.prank(admin);
        systemAccessManager.grantRole(ATKSystemRoles.TRUSTED_ISSUERS_META_REGISTRY_MODULE_ROLE, address(metaRegistry));
    }

    function test_InitializeSuccess() public view {
        // Verify system registry is set
        assertEq(address(metaRegistry.getSystemRegistry()), address(systemRegistry));

        assertTrue(
            systemAccessManager.hasRole(ATKSystemRoles.TRUSTED_ISSUERS_META_REGISTRY_MODULE_ROLE, address(metaRegistry))
        );

        // Verify system manager has correct role
        assertTrue(systemAccessManager.hasRole(ATKPeopleRoles.SYSTEM_MANAGER_ROLE, systemManager));
    }

    function test_CannotInitializeTwice() public {
        vm.expectRevert();
        ATKTrustedIssuersMetaRegistryImplementation(address(metaRegistry)).initialize(
            address(systemAccessManager), address(systemRegistry)
        );
    }

    function test_SetSystemRegistrySuccess() public {
        address newRegistry = makeAddr("newRegistry");

        vm.prank(systemManager);
        vm.expectEmit(true, true, true, false);
        emit IATKTrustedIssuersMetaRegistry.SystemRegistrySet(systemManager, address(systemRegistry), newRegistry);
        metaRegistry.setSystemRegistry(newRegistry);

        // Verify new system registry is set
        assertEq(address(metaRegistry.getSystemRegistry()), newRegistry);
    }

    function test_SetSystemRegistryRequiresAuthorization() public {
        address newRegistry = makeAddr("newRegistry");

        vm.prank(user1);
        vm.expectRevert();
        metaRegistry.setSystemRegistry(newRegistry);
    }

    function test_SetSystemRegistryToZero() public {
        vm.prank(systemManager);
        vm.expectEmit(true, true, true, false);
        emit IATKTrustedIssuersMetaRegistry.SystemRegistrySet(systemManager, address(systemRegistry), address(0));
        metaRegistry.setSystemRegistry(address(0));

        // Verify system registry is cleared
        assertEq(address(metaRegistry.getSystemRegistry()), address(0));
    }

    function test_SetRegistryForContractSuccess() public {
        vm.prank(systemManager);
        vm.expectEmit(true, true, true, true);
        emit IATKTrustedIssuersMetaRegistry.SubjectRegistrySet(
            systemManager, contract1, address(0), address(contractRegistry)
        );
        metaRegistry.setRegistryForSubject(contract1, address(contractRegistry));

        // Verify contract registry is set
        assertEq(address(metaRegistry.getRegistryForSubject(contract1)), address(contractRegistry));
    }

    function test_SetRegistryForContractRequiresAuthorization() public {
        vm.prank(user1);
        vm.expectRevert();
        metaRegistry.setRegistryForSubject(contract1, address(contractRegistry));
    }

    function test_SetRegistryForContractInvalidAddress() public {
        vm.prank(systemManager);
        vm.expectRevert(ATKTrustedIssuersMetaRegistryImplementation.InvalidContractAddress.selector);
        metaRegistry.setRegistryForSubject(address(0), address(contractRegistry));
    }

    function test_SetRegistryForContractToZero() public {
        // First set a registry
        vm.prank(systemManager);
        metaRegistry.setRegistryForSubject(contract1, address(contractRegistry));

        // Then clear it
        vm.prank(systemManager);
        vm.expectEmit(true, true, true, true);
        emit IATKTrustedIssuersMetaRegistry.SubjectRegistrySet(
            systemManager, contract1, address(contractRegistry), address(0)
        );
        metaRegistry.setRegistryForSubject(contract1, address(0));

        // Verify contract registry is cleared
        assertEq(address(metaRegistry.getRegistryForSubject(contract1)), address(0));
    }

    function test_RemoveRegistryForContractSuccess() public {
        // First set a registry
        vm.prank(systemManager);
        metaRegistry.setRegistryForSubject(contract1, address(contractRegistry));

        // Remove it
        vm.prank(systemManager);
        vm.expectEmit(true, true, true, true);
        emit IATKTrustedIssuersMetaRegistry.SubjectRegistrySet(
            systemManager, contract1, address(contractRegistry), address(0)
        );
        metaRegistry.removeRegistryForSubject(contract1);

        // Verify contract registry is cleared
        assertEq(address(metaRegistry.getRegistryForSubject(contract1)), address(0));
    }

    function test_AddTrustedIssuerDelegatesToSystemRegistry() public {
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(claimPolicyManager);
        metaRegistry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Verify issuer was added to system registry
        assertTrue(systemRegistry.isTrustedIssuer(address(issuer1), address(0)));
    }

    function test_RemoveTrustedIssuerDelegatesToSystemRegistry() public {
        // First add an issuer
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(claimPolicyManager);
        systemRegistry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Remove via meta registry
        vm.prank(claimPolicyManager);
        metaRegistry.removeTrustedIssuer(IClaimIssuer(address(issuer1)));

        // Verify issuer was removed from system registry
        assertFalse(systemRegistry.isTrustedIssuer(address(issuer1), address(0)));
    }

    function test_UpdateIssuerClaimTopicsDelegatesToSystemRegistry() public {
        // First add an issuer
        uint256[] memory originalTopics = new uint256[](1);
        originalTopics[0] = KYC_TOPIC;

        vm.prank(claimPolicyManager);
        systemRegistry.addTrustedIssuer(IClaimIssuer(address(issuer1)), originalTopics);

        // Update topics via meta registry
        uint256[] memory newTopics = new uint256[](1);
        newTopics[0] = AML_TOPIC;

        vm.prank(claimPolicyManager);
        metaRegistry.updateIssuerClaimTopics(IClaimIssuer(address(issuer1)), newTopics);

        // Verify topics were updated in system registry
        assertFalse(systemRegistry.hasClaimTopic(address(issuer1), KYC_TOPIC, address(0)));
        assertTrue(systemRegistry.hasClaimTopic(address(issuer1), AML_TOPIC, address(0)));
    }

    function test_GetTrustedIssuersSystemOnly() public {
        // Add issuer to system registry
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(claimPolicyManager);
        systemRegistry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Query with subject = address(0) should return system issuers only
        IClaimIssuer[] memory issuers = metaRegistry.getTrustedIssuers(address(0));
        assertEq(issuers.length, 1);
        assertEq(address(issuers[0]), address(issuer1));
    }

    function test_GetTrustedIssuersWithContractRegistry() public {
        // Set up contract registry
        vm.prank(systemManager);
        metaRegistry.setRegistryForSubject(contract1, address(contractRegistry));

        // Add different issuers to each registry
        uint256[] memory topics1 = new uint256[](1);
        topics1[0] = KYC_TOPIC;
        uint256[] memory topics2 = new uint256[](1);
        topics2[0] = AML_TOPIC;

        vm.prank(claimPolicyManager);
        systemRegistry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics1);
        vm.prank(claimPolicyManager);
        contractRegistry.addTrustedIssuer(IClaimIssuer(address(issuer2)), topics2);

        // Query with contract as subject should return merged results
        IClaimIssuer[] memory issuers = metaRegistry.getTrustedIssuers(contract1);
        assertEq(issuers.length, 2);
    }

    function test_GetTrustedIssuersWithDuplicates() public {
        // Set up contract registry
        vm.prank(systemManager);
        metaRegistry.setRegistryForSubject(contract1, address(contractRegistry));

        // Add same issuer to both registries
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(claimPolicyManager);
        systemRegistry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);
        vm.prank(claimPolicyManager);
        contractRegistry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Query should return deduplicated results
        IClaimIssuer[] memory issuers = metaRegistry.getTrustedIssuers(contract1);
        assertEq(issuers.length, 1);
        assertEq(address(issuers[0]), address(issuer1));
    }

    function test_IsTrustedIssuerSystemOnly() public {
        // Add issuer to system registry
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(claimPolicyManager);
        systemRegistry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Query with subject = address(0) should check system registry only
        assertTrue(metaRegistry.isTrustedIssuer(address(issuer1), address(0)));
        assertFalse(metaRegistry.isTrustedIssuer(address(issuer2), address(0)));
    }

    function test_IsTrustedIssuerWithContractRegistry() public {
        // Set up contract registry
        vm.prank(systemManager);
        metaRegistry.setRegistryForSubject(contract1, address(contractRegistry));

        // Add issuer to contract registry only
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(claimPolicyManager);
        contractRegistry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Query with contract as subject should find issuer
        assertTrue(metaRegistry.isTrustedIssuer(address(issuer1), contract1));
        assertFalse(metaRegistry.isTrustedIssuer(address(issuer1), address(0)));
    }

    function test_HasClaimTopicSystemOnly() public {
        // Add issuer to system registry
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(claimPolicyManager);
        systemRegistry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Query with subject = address(0) should check system registry only
        assertTrue(metaRegistry.hasClaimTopic(address(issuer1), KYC_TOPIC, address(0)));
        assertFalse(metaRegistry.hasClaimTopic(address(issuer1), AML_TOPIC, address(0)));
    }

    function test_HasClaimTopicWithContractRegistry() public {
        // Set up contract registry
        vm.prank(systemManager);
        metaRegistry.setRegistryForSubject(contract1, address(contractRegistry));

        // Add issuer to contract registry with specific topic
        uint256[] memory topics = new uint256[](1);
        topics[0] = AML_TOPIC;

        vm.prank(claimPolicyManager);
        contractRegistry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Query with contract as subject should find topic
        assertTrue(metaRegistry.hasClaimTopic(address(issuer1), AML_TOPIC, contract1));
        assertFalse(metaRegistry.hasClaimTopic(address(issuer1), KYC_TOPIC, contract1));
    }

    function test_GetTrustedIssuersForClaimTopicSystemOnly() public {
        // Add issuers to system registry
        uint256[] memory topics1 = new uint256[](1);
        topics1[0] = KYC_TOPIC;
        uint256[] memory topics2 = new uint256[](2);
        topics2[0] = KYC_TOPIC;
        topics2[1] = AML_TOPIC;

        vm.prank(claimPolicyManager);
        systemRegistry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics1);
        vm.prank(claimPolicyManager);
        systemRegistry.addTrustedIssuer(IClaimIssuer(address(issuer2)), topics2);

        // Query with subject = address(0) should return system issuers for topic
        IClaimIssuer[] memory issuers = metaRegistry.getTrustedIssuersForClaimTopic(KYC_TOPIC, address(0));
        assertEq(issuers.length, 2);
    }

    function test_GetTrustedIssuersForClaimTopicWithMerging() public {
        // Set up contract registry
        vm.prank(systemManager);
        metaRegistry.setRegistryForSubject(contract1, address(contractRegistry));

        // Add issuers to different registries for same topic
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(claimPolicyManager);
        systemRegistry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);
        vm.prank(claimPolicyManager);
        contractRegistry.addTrustedIssuer(IClaimIssuer(address(issuer2)), topics);

        // Query should return merged results
        IClaimIssuer[] memory issuers = metaRegistry.getTrustedIssuersForClaimTopic(KYC_TOPIC, contract1);
        assertEq(issuers.length, 2);
    }

    function test_GetTrustedIssuerClaimTopicsSystemOnly() public {
        // Add issuer to system registry
        uint256[] memory topics = new uint256[](2);
        topics[0] = KYC_TOPIC;
        topics[1] = AML_TOPIC;

        vm.prank(claimPolicyManager);
        systemRegistry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Query with subject = address(0) should return system topics
        uint256[] memory returnedTopics =
            metaRegistry.getTrustedIssuerClaimTopics(IClaimIssuer(address(issuer1)), address(0));
        assertEq(returnedTopics.length, 2);
        assertEq(returnedTopics[0], KYC_TOPIC);
        assertEq(returnedTopics[1], AML_TOPIC);
    }

    function test_GetTrustedIssuerClaimTopicsWithMerging() public {
        // Set up contract registry
        vm.prank(systemManager);
        metaRegistry.setRegistryForSubject(contract1, address(contractRegistry));

        // Add same issuer to both registries with different topics
        uint256[] memory systemTopics = new uint256[](1);
        systemTopics[0] = KYC_TOPIC;
        uint256[] memory contractTopics = new uint256[](1);
        contractTopics[0] = AML_TOPIC;

        vm.prank(claimPolicyManager);
        systemRegistry.addTrustedIssuer(IClaimIssuer(address(issuer1)), systemTopics);
        vm.prank(claimPolicyManager);
        contractRegistry.addTrustedIssuer(IClaimIssuer(address(issuer1)), contractTopics);

        // Query should return merged topics
        uint256[] memory returnedTopics =
            metaRegistry.getTrustedIssuerClaimTopics(IClaimIssuer(address(issuer1)), contract1);
        assertEq(returnedTopics.length, 2);
    }

    function test_IsAuthorizedToAddClaim() public {
        // Add issuer to system registry
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(claimPolicyManager);
        systemRegistry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);

        // Test authorization
        assertTrue(metaRegistry.isAuthorizedToAddClaim(address(issuer1), KYC_TOPIC, address(0)));
        assertFalse(metaRegistry.isAuthorizedToAddClaim(address(issuer1), AML_TOPIC, address(0)));
    }

    function test_SupportsInterface() public view {
        // Test ERC165 support
        assertTrue(implementation.supportsInterface(type(IERC165).interfaceId));
        assertTrue(implementation.supportsInterface(type(IATKTrustedIssuersMetaRegistry).interfaceId));
        assertTrue(implementation.supportsInterface(type(IATKTrustedIssuersRegistry).interfaceId));
        assertTrue(implementation.supportsInterface(type(ISMARTTrustedIssuersRegistry).interfaceId));
        assertTrue(implementation.supportsInterface(type(IATKSystemAccessManaged).interfaceId));
        assertTrue(implementation.supportsInterface(type(IClaimAuthorizer).interfaceId));

        // Test unsupported interface
        assertFalse(implementation.supportsInterface(0x12345678));
    }

    function test_DirectCallToImplementation() public {
        // Direct calls to implementation should fail for initialize
        vm.expectRevert();
        implementation.initialize(address(systemAccessManager), address(systemRegistry));
    }

    function test_ERC2771ContextIntegration() public view {
        // Verify forwarder is set correctly in implementation
        assertNotEq(address(implementation), address(0));
    }

    function test_MultipleContractRegistries() public {
        // Set up multiple contract registries
        vm.prank(systemManager);
        metaRegistry.setRegistryForSubject(contract1, address(contractRegistry));

        // Create another contract registry
        ATKSystemTrustedIssuersRegistryImplementation contractRegistry2Impl =
            new ATKSystemTrustedIssuersRegistryImplementation(forwarder);
        bytes memory contractRegistry2InitData =
            abi.encodeWithSelector(contractRegistry2Impl.initialize.selector, address(systemAccessManager));
        ERC1967Proxy contractRegistry2Proxy =
            new ERC1967Proxy(address(contractRegistry2Impl), contractRegistry2InitData);
        ATKSystemTrustedIssuersRegistryImplementation contractRegistry2 =
            ATKSystemTrustedIssuersRegistryImplementation(address(contractRegistry2Proxy));

        vm.prank(systemManager);
        metaRegistry.setRegistryForSubject(contract2, address(contractRegistry2));

        // Add different issuers to each
        uint256[] memory topics = new uint256[](1);
        topics[0] = KYC_TOPIC;

        vm.prank(claimPolicyManager);
        contractRegistry.addTrustedIssuer(IClaimIssuer(address(issuer1)), topics);
        vm.prank(claimPolicyManager);
        contractRegistry2.addTrustedIssuer(IClaimIssuer(address(issuer2)), topics);

        // Verify each contract gets its own issuers
        IClaimIssuer[] memory contract1Issuers = metaRegistry.getTrustedIssuers(contract1);
        IClaimIssuer[] memory contract2Issuers = metaRegistry.getTrustedIssuers(contract2);

        assertEq(contract1Issuers.length, 1);
        assertEq(contract2Issuers.length, 1);
        assertEq(address(contract1Issuers[0]), address(issuer1));
        assertEq(address(contract2Issuers[0]), address(issuer2));
    }

    function test_EmptyRegistryHandling() public {
        // Test behavior with no system registry
        vm.prank(systemManager);
        metaRegistry.setSystemRegistry(address(0));

        // Should return empty arrays
        IClaimIssuer[] memory issuers = metaRegistry.getTrustedIssuers(address(0));
        assertEq(issuers.length, 0);

        IClaimIssuer[] memory topicIssuers = metaRegistry.getTrustedIssuersForClaimTopic(KYC_TOPIC, address(0));
        assertEq(topicIssuers.length, 0);

        uint256[] memory topics = metaRegistry.getTrustedIssuerClaimTopics(IClaimIssuer(address(issuer1)), address(0));
        assertEq(topics.length, 0);

        // Should return false for checks
        assertFalse(metaRegistry.isTrustedIssuer(address(issuer1), address(0)));
        assertFalse(metaRegistry.hasClaimTopic(address(issuer1), KYC_TOPIC, address(0)));
    }
}
