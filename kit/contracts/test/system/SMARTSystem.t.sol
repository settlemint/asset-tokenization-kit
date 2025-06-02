// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test, console } from "forge-std/Test.sol";
import { SMARTSystem } from "../../contracts/system/SMARTSystem.sol";
import { ISMARTSystem } from "../../contracts/system/ISMARTSystem.sol";
import { SMARTSystemRoles } from "../../contracts/system/SMARTSystemRoles.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

// Import SystemUtils for proper setup
import { SystemUtils } from "../utils/SystemUtils.sol";

// Import required interfaces
import { ISMARTCompliance } from "../../contracts/interface/ISMARTCompliance.sol";
import { ISMARTIdentityFactory } from "../../contracts/system/identity-factory/ISMARTIdentityFactory.sol";
import { IERC3643TrustedIssuersRegistry } from "../../contracts/interface/ERC-3643/IERC3643TrustedIssuersRegistry.sol";
import { ISMARTIdentityRegistryStorage } from "../../contracts/interface/ISMARTIdentityRegistryStorage.sol";
import { ISMARTIdentityRegistry } from "../../contracts/interface/ISMARTIdentityRegistry.sol";
import { ISMARTTopicSchemeRegistry } from "../../contracts/system/topic-scheme-registry/ISMARTTopicSchemeRegistry.sol";
import { ISMARTTokenAccessManager } from "../../contracts/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { ISMARTTokenFactory } from "../../contracts/system/token-factory/ISMARTTokenFactory.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { SMARTComplianceModuleParamPair } from "../../contracts/interface/structs/SMARTComplianceModuleParamPair.sol";

// Import system errors
import { SystemAlreadyBootstrapped } from "../../contracts/system/SMARTSystemErrors.sol";

// Import actual implementations
import { SMARTComplianceImplementation } from "../../contracts/system/compliance/SMARTComplianceImplementation.sol";
import { SMARTIdentityRegistryImplementation } from
    "../../contracts/system/identity-registry/SMARTIdentityRegistryImplementation.sol";
import { SMARTIdentityRegistryStorageImplementation } from
    "../../contracts/system/identity-registry-storage/SMARTIdentityRegistryStorageImplementation.sol";
import { SMARTTrustedIssuersRegistryImplementation } from
    "../../contracts/system/trusted-issuers-registry/SMARTTrustedIssuersRegistryImplementation.sol";
import { SMARTIdentityFactoryImplementation } from
    "../../contracts/system/identity-factory/SMARTIdentityFactoryImplementation.sol";
import { SMARTIdentityImplementation } from
    "../../contracts/system/identity-factory/identities/SMARTIdentityImplementation.sol";
import { SMARTTokenIdentityImplementation } from
    "../../contracts/system/identity-factory/identities/SMARTTokenIdentityImplementation.sol";
import { SMARTTokenAccessManagerImplementation } from
    "../../contracts/system/access-manager/SMARTTokenAccessManagerImplementation.sol";
import { SMARTTopicSchemeRegistryImplementation } from
    "../../contracts/system/topic-scheme-registry/SMARTTopicSchemeRegistryImplementation.sol";

// Mock contracts for testing edge cases that require invalid contracts
contract MockInvalidContract {
// This contract doesn't implement IERC165
}

contract SMARTSystemTest is Test {
    SystemUtils public systemUtils;
    SMARTSystem public smartSystem;

    address public admin = address(0x1);
    address public user = address(0x2);
    MockInvalidContract public mockInvalidContract;

    // Actual implementation instances
    SMARTComplianceImplementation public complianceImpl;
    SMARTIdentityRegistryImplementation public identityRegistryImpl;
    SMARTIdentityRegistryStorageImplementation public identityRegistryStorageImpl;
    SMARTTrustedIssuersRegistryImplementation public trustedIssuersRegistryImpl;
    SMARTTopicSchemeRegistryImplementation public topicSchemeRegistryImpl;
    SMARTIdentityFactoryImplementation public identityFactoryImpl;
    SMARTIdentityImplementation public identityImpl;
    SMARTTokenIdentityImplementation public tokenIdentityImpl;
    SMARTTokenAccessManagerImplementation public tokenAccessManagerImpl;

    address public forwarder = address(0x5);

    function setUp() public {
        systemUtils = new SystemUtils(admin);
        smartSystem = SMARTSystem(address(systemUtils.system()));
        mockInvalidContract = new MockInvalidContract();

        // Deploy actual implementations for testing updates
        complianceImpl = new SMARTComplianceImplementation(forwarder);
        identityRegistryImpl = new SMARTIdentityRegistryImplementation(forwarder);
        identityRegistryStorageImpl = new SMARTIdentityRegistryStorageImplementation(forwarder);
        trustedIssuersRegistryImpl = new SMARTTrustedIssuersRegistryImplementation(forwarder);
        topicSchemeRegistryImpl = new SMARTTopicSchemeRegistryImplementation(forwarder);
        identityFactoryImpl = new SMARTIdentityFactoryImplementation(forwarder);
        identityImpl = new SMARTIdentityImplementation(forwarder);
        tokenIdentityImpl = new SMARTTokenIdentityImplementation(forwarder);
        tokenAccessManagerImpl = new SMARTTokenAccessManagerImplementation(forwarder);
    }

    function test_InitialState() public view {
        // Check that implementation addresses are set
        assertTrue(smartSystem.complianceImplementation() != address(0));
        assertTrue(smartSystem.identityRegistryImplementation() != address(0));
        assertTrue(smartSystem.identityRegistryStorageImplementation() != address(0));
        assertTrue(smartSystem.trustedIssuersRegistryImplementation() != address(0));
        assertTrue(smartSystem.topicSchemeRegistryImplementation() != address(0));
        assertTrue(smartSystem.identityFactoryImplementation() != address(0));
        assertTrue(smartSystem.identityImplementation() != address(0));
        assertTrue(smartSystem.tokenIdentityImplementation() != address(0));
        assertTrue(smartSystem.tokenAccessManagerImplementation() != address(0));

        // Proxy addresses should be set (system is already bootstrapped)
        assertTrue(smartSystem.complianceProxy() != address(0));
        assertTrue(smartSystem.identityRegistryProxy() != address(0));
        assertTrue(smartSystem.identityRegistryStorageProxy() != address(0));
        assertTrue(smartSystem.trustedIssuersRegistryProxy() != address(0));
        assertTrue(smartSystem.topicSchemeRegistryProxy() != address(0));
        assertTrue(smartSystem.identityFactoryProxy() != address(0));

        // Admin should have default admin role
        assertTrue(IAccessControl(address(smartSystem)).hasRole(SMARTSystemRoles.DEFAULT_ADMIN_ROLE, admin));
    }

    function test_Bootstrap_OnlyAdmin() public {
        // Create a new system that hasn't been bootstrapped yet
        address newComplianceImpl = address(new SMARTComplianceImplementation(forwarder));
        address newIdentityRegistryImpl = address(new SMARTIdentityRegistryImplementation(forwarder));
        address newIdentityStorageImpl = address(new SMARTIdentityRegistryStorageImplementation(forwarder));
        address newTrustedIssuersImpl = address(new SMARTTrustedIssuersRegistryImplementation(forwarder));
        address newTopicSchemeRegistryImpl = address(new SMARTTopicSchemeRegistryImplementation(forwarder));
        address newIdentityFactoryImpl = address(new SMARTIdentityFactoryImplementation(forwarder));
        address newIdentityImplAddr = address(new SMARTIdentityImplementation(forwarder));
        address newTokenIdentityImpl = address(new SMARTTokenIdentityImplementation(forwarder));
        address newTokenAccessManagerImpl = address(new SMARTTokenAccessManagerImplementation(forwarder));

        SMARTSystem newSystem = new SMARTSystem(
            admin,
            newComplianceImpl,
            newIdentityRegistryImpl,
            newIdentityStorageImpl,
            newTrustedIssuersImpl,
            newTopicSchemeRegistryImpl,
            newIdentityFactoryImpl,
            newIdentityImplAddr,
            newTokenIdentityImpl,
            newTokenAccessManagerImpl,
            forwarder
        );

        vm.prank(user);
        vm.expectRevert();
        newSystem.bootstrap();
    }

    function test_Bootstrap_AlreadyBootstrapped() public {
        // smartSystem is already bootstrapped in setUp via SystemUtils
        vm.prank(admin);
        vm.expectRevert(SystemAlreadyBootstrapped.selector); // Should revert when trying to bootstrap again
        smartSystem.bootstrap();
    }

    function test_SetComplianceImplementation() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit ISMARTSystem.ComplianceImplementationUpdated(admin, address(complianceImpl));

        smartSystem.setComplianceImplementation(address(complianceImpl));
        assertEq(smartSystem.complianceImplementation(), address(complianceImpl));
    }

    function test_SetComplianceImplementation_OnlyAdmin() public {
        vm.prank(user);
        vm.expectRevert();
        smartSystem.setComplianceImplementation(address(complianceImpl));
    }

    function test_SetComplianceImplementation_ZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert();
        smartSystem.setComplianceImplementation(address(0));
    }

    function test_SetComplianceImplementation_InvalidInterface() public {
        vm.prank(admin);
        vm.expectRevert();
        smartSystem.setComplianceImplementation(address(mockInvalidContract));
    }

    function test_SetIdentityRegistryImplementation() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit ISMARTSystem.IdentityRegistryImplementationUpdated(admin, address(identityRegistryImpl));

        smartSystem.setIdentityRegistryImplementation(address(identityRegistryImpl));
        assertEq(smartSystem.identityRegistryImplementation(), address(identityRegistryImpl));
    }

    function test_SetIdentityRegistryImplementation_ZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert();
        smartSystem.setIdentityRegistryImplementation(address(0));
    }

    function test_SetIdentityRegistryImplementation_InvalidInterface() public {
        vm.prank(admin);
        vm.expectRevert();
        smartSystem.setIdentityRegistryImplementation(address(mockInvalidContract));
    }

    function test_SetIdentityRegistryStorageImplementation() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit ISMARTSystem.IdentityRegistryStorageImplementationUpdated(admin, address(identityRegistryStorageImpl));

        smartSystem.setIdentityRegistryStorageImplementation(address(identityRegistryStorageImpl));
        assertEq(smartSystem.identityRegistryStorageImplementation(), address(identityRegistryStorageImpl));
    }

    function test_SetTrustedIssuersRegistryImplementation() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit ISMARTSystem.TrustedIssuersRegistryImplementationUpdated(admin, address(trustedIssuersRegistryImpl));

        smartSystem.setTrustedIssuersRegistryImplementation(address(trustedIssuersRegistryImpl));
        assertEq(smartSystem.trustedIssuersRegistryImplementation(), address(trustedIssuersRegistryImpl));
    }

    function test_SetIdentityFactoryImplementation() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit ISMARTSystem.IdentityFactoryImplementationUpdated(admin, address(identityFactoryImpl));

        smartSystem.setIdentityFactoryImplementation(address(identityFactoryImpl));
        assertEq(smartSystem.identityFactoryImplementation(), address(identityFactoryImpl));
    }

    function test_SetIdentityImplementation() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit ISMARTSystem.IdentityImplementationUpdated(admin, address(identityImpl));

        smartSystem.setIdentityImplementation(address(identityImpl));
        assertEq(smartSystem.identityImplementation(), address(identityImpl));
    }

    function test_SetTokenIdentityImplementation() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit ISMARTSystem.TokenIdentityImplementationUpdated(admin, address(tokenIdentityImpl));

        smartSystem.setTokenIdentityImplementation(address(tokenIdentityImpl));
        assertEq(smartSystem.tokenIdentityImplementation(), address(tokenIdentityImpl));
    }

    function test_SetTokenAccessManagerImplementation() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit ISMARTSystem.TokenAccessManagerImplementationUpdated(admin, address(tokenAccessManagerImpl));

        smartSystem.setTokenAccessManagerImplementation(address(tokenAccessManagerImpl));
        assertEq(smartSystem.tokenAccessManagerImplementation(), address(tokenAccessManagerImpl));
    }

    function test_CreateTokenFactory_OnlyAdmin() public {
        vm.prank(user);
        vm.expectRevert();
        smartSystem.createTokenFactory("TestFactory", address(0x123), address(identityImpl));
    }

    function test_CreateTokenFactory_InvalidFactoryAddress() public {
        vm.prank(admin);
        vm.expectRevert();
        smartSystem.createTokenFactory("TestFactory", address(0), address(identityImpl));
    }

    function test_CreateTokenFactory_InvalidTokenImplementation() public {
        vm.prank(admin);
        vm.expectRevert();
        smartSystem.createTokenFactory("TestFactory", address(0x123), address(0));
    }

    function test_SupportsInterface() public view {
        assertTrue(smartSystem.supportsInterface(type(ISMARTSystem).interfaceId));
        assertTrue(smartSystem.supportsInterface(type(IERC165).interfaceId));
        assertTrue(smartSystem.supportsInterface(type(IAccessControl).interfaceId));
        assertFalse(smartSystem.supportsInterface(bytes4(0xffffffff)));
    }

    function test_ConstructorWithZeroAddresses() public {
        // Test various zero address scenarios
        vm.expectRevert();
        new SMARTSystem(
            admin,
            address(0), // compliance
            address(identityRegistryImpl),
            address(identityRegistryStorageImpl),
            address(trustedIssuersRegistryImpl),
            address(topicSchemeRegistryImpl),
            address(identityFactoryImpl),
            address(identityImpl),
            address(tokenIdentityImpl),
            address(tokenAccessManagerImpl),
            forwarder
        );

        vm.expectRevert();
        new SMARTSystem(
            admin,
            address(complianceImpl),
            address(0), // identity registry
            address(identityRegistryStorageImpl),
            address(trustedIssuersRegistryImpl),
            address(topicSchemeRegistryImpl),
            address(identityFactoryImpl),
            address(identityImpl),
            address(tokenIdentityImpl),
            address(tokenAccessManagerImpl),
            forwarder
        );
    }

    function test_ConstructorWithInvalidInterfaces() public {
        vm.expectRevert();
        new SMARTSystem(
            admin,
            address(mockInvalidContract), // Invalid compliance
            address(identityRegistryImpl),
            address(identityRegistryStorageImpl),
            address(trustedIssuersRegistryImpl),
            address(topicSchemeRegistryImpl),
            address(identityFactoryImpl),
            address(identityImpl),
            address(tokenIdentityImpl),
            address(tokenAccessManagerImpl),
            forwarder
        );
    }

    function test_IntegrationWithActualContracts() public view {
        // Test that the system works with actual proxy contracts
        ISMARTCompliance compliance = ISMARTCompliance(smartSystem.complianceProxy());
        ISMARTIdentityRegistry identityRegistry = ISMARTIdentityRegistry(smartSystem.identityRegistryProxy());
        ISMARTIdentityRegistryStorage identityStorage =
            ISMARTIdentityRegistryStorage(smartSystem.identityRegistryStorageProxy());
        IERC3643TrustedIssuersRegistry trustedIssuers =
            IERC3643TrustedIssuersRegistry(smartSystem.trustedIssuersRegistryProxy());
        ISMARTTopicSchemeRegistry topicSchemeRegistry =
            ISMARTTopicSchemeRegistry(smartSystem.topicSchemeRegistryProxy());
        ISMARTIdentityFactory identityFactory = ISMARTIdentityFactory(smartSystem.identityFactoryProxy());

        // Verify contracts are properly deployed and functioning
        assertTrue(address(compliance) != address(0));
        assertTrue(address(identityRegistry) != address(0));
        assertTrue(address(identityStorage) != address(0));
        assertTrue(address(trustedIssuers) != address(0));
        assertTrue(address(topicSchemeRegistry) != address(0));
        assertTrue(address(identityFactory) != address(0));

        // Test interface support
        assertTrue(IERC165(address(compliance)).supportsInterface(type(ISMARTCompliance).interfaceId));
        assertTrue(IERC165(address(identityRegistry)).supportsInterface(type(ISMARTIdentityRegistry).interfaceId));
        assertTrue(IERC165(address(identityStorage)).supportsInterface(type(ISMARTIdentityRegistryStorage).interfaceId));
        assertTrue(IERC165(address(trustedIssuers)).supportsInterface(type(IERC3643TrustedIssuersRegistry).interfaceId));
        assertTrue(IERC165(address(topicSchemeRegistry)).supportsInterface(type(ISMARTTopicSchemeRegistry).interfaceId));
        assertTrue(IERC165(address(identityFactory)).supportsInterface(type(ISMARTIdentityFactory).interfaceId));
    }

    function test_UpdateImplementationFlow() public {
        // Test a complete flow of updating an implementation
        address oldImpl = smartSystem.complianceImplementation();

        // Deploy new implementation
        SMARTComplianceImplementation newImpl = new SMARTComplianceImplementation(forwarder);

        vm.prank(admin);
        smartSystem.setComplianceImplementation(address(newImpl));

        assertEq(smartSystem.complianceImplementation(), address(newImpl));
        assertTrue(smartSystem.complianceImplementation() != oldImpl);
    }

    function test_AllSetterFunctionsWithActualImplementations() public {
        vm.startPrank(admin);

        // Test all implementation setters with actual implementations
        smartSystem.setComplianceImplementation(address(complianceImpl));
        smartSystem.setIdentityRegistryImplementation(address(identityRegistryImpl));
        smartSystem.setIdentityRegistryStorageImplementation(address(identityRegistryStorageImpl));
        smartSystem.setTrustedIssuersRegistryImplementation(address(trustedIssuersRegistryImpl));
        smartSystem.setTopicSchemeRegistryImplementation(address(topicSchemeRegistryImpl));
        smartSystem.setIdentityFactoryImplementation(address(identityFactoryImpl));
        smartSystem.setIdentityImplementation(address(identityImpl));
        smartSystem.setTokenIdentityImplementation(address(tokenIdentityImpl));
        smartSystem.setTokenAccessManagerImplementation(address(tokenAccessManagerImpl));

        // Verify all implementations are set correctly
        assertEq(smartSystem.complianceImplementation(), address(complianceImpl));
        assertEq(smartSystem.identityRegistryImplementation(), address(identityRegistryImpl));
        assertEq(smartSystem.identityRegistryStorageImplementation(), address(identityRegistryStorageImpl));
        assertEq(smartSystem.trustedIssuersRegistryImplementation(), address(trustedIssuersRegistryImpl));
        assertEq(smartSystem.topicSchemeRegistryImplementation(), address(topicSchemeRegistryImpl));
        assertEq(smartSystem.identityFactoryImplementation(), address(identityFactoryImpl));
        assertEq(smartSystem.identityImplementation(), address(identityImpl));
        assertEq(smartSystem.tokenIdentityImplementation(), address(tokenIdentityImpl));
        assertEq(smartSystem.tokenAccessManagerImplementation(), address(tokenAccessManagerImpl));

        vm.stopPrank();
    }

    function test_SetTopicSchemeRegistryImplementation() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit ISMARTSystem.TopicSchemeRegistryImplementationUpdated(admin, address(topicSchemeRegistryImpl));

        smartSystem.setTopicSchemeRegistryImplementation(address(topicSchemeRegistryImpl));
        assertEq(smartSystem.topicSchemeRegistryImplementation(), address(topicSchemeRegistryImpl));
    }

    function test_SetTopicSchemeRegistryImplementation_OnlyAdmin() public {
        vm.prank(user);
        vm.expectRevert();
        smartSystem.setTopicSchemeRegistryImplementation(address(topicSchemeRegistryImpl));
    }

    function test_SetTopicSchemeRegistryImplementation_ZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert();
        smartSystem.setTopicSchemeRegistryImplementation(address(0));
    }

    function test_SetTopicSchemeRegistryImplementation_InvalidInterface() public {
        vm.prank(admin);
        vm.expectRevert();
        smartSystem.setTopicSchemeRegistryImplementation(address(mockInvalidContract));
    }
}
