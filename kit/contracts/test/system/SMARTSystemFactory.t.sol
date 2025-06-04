// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { SMARTSystemFactory } from "../../contracts/system/SMARTSystemFactory.sol";
import { ISMARTSystem } from "../../contracts/system/ISMARTSystem.sol";
import { SMARTSystem } from "../../contracts/system/SMARTSystem.sol";
import { SMARTSystemRoles } from "../../contracts/system/SMARTSystemRoles.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import {
    ComplianceImplementationNotSet,
    IdentityRegistryImplementationNotSet,
    IdentityRegistryStorageImplementationNotSet,
    TrustedIssuersRegistryImplementationNotSet,
    TopicSchemeRegistryImplementationNotSet,
    IdentityFactoryImplementationNotSet,
    IdentityImplementationNotSet,
    TokenIdentityImplementationNotSet,
    TokenAccessManagerImplementationNotSet,
    IndexOutOfBounds
} from "../../contracts/system/SMARTSystemErrors.sol";

// Implementations for testing
import { SMARTIdentityRegistryStorageImplementation } from
    "../../contracts/system/identity-registry-storage/SMARTIdentityRegistryStorageImplementation.sol";
import { SMARTTrustedIssuersRegistryImplementation } from
    "../../contracts/system/trusted-issuers-registry/SMARTTrustedIssuersRegistryImplementation.sol";
import { SMARTIdentityRegistryImplementation } from
    "../../contracts/system/identity-registry/SMARTIdentityRegistryImplementation.sol";
import { SMARTTopicSchemeRegistryImplementation } from
    "../../contracts/system/topic-scheme-registry/SMARTTopicSchemeRegistryImplementation.sol";
import { SMARTComplianceImplementation } from "../../contracts/system/compliance/SMARTComplianceImplementation.sol";
import { SMARTIdentityFactoryImplementation } from
    "../../contracts/system/identity-factory/SMARTIdentityFactoryImplementation.sol";
import { SMARTIdentityImplementation } from
    "../../contracts/system/identity-factory/identities/SMARTIdentityImplementation.sol";
import { SMARTTokenIdentityImplementation } from
    "../../contracts/system/identity-factory/identities/SMARTTokenIdentityImplementation.sol";
import { SMARTTokenAccessManagerImplementation } from
    "../../contracts/system/access-manager/SMARTTokenAccessManagerImplementation.sol";

// Import compliance module
import { SMARTIdentityVerificationModule } from
    "../../contracts/system/compliance/modules/SMARTIdentityVerificationModule.sol";

contract SMARTSystemFactoryTest is Test {
    SMARTSystemFactory public factory;

    // Implementation addresses
    address public complianceImpl;
    address public identityRegistryImpl;
    address public identityRegistryStorageImpl;
    address public trustedIssuersRegistryImpl;
    address public topicSchemeRegistryImpl;
    address public identityFactoryImpl;
    address public identityImpl;
    address public tokenIdentityImpl;
    address public tokenAccessManagerImpl;
    address public identityVerificationModule;
    address public forwarder;

    // Test addresses
    address public admin = makeAddr("admin");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    event SMARTSystemCreated(address indexed sender, address indexed systemAddress);

    function setUp() public {
        forwarder = makeAddr("forwarder");

        // Deploy all implementations
        complianceImpl = address(new SMARTComplianceImplementation(forwarder));
        identityRegistryImpl = address(new SMARTIdentityRegistryImplementation(forwarder));
        identityRegistryStorageImpl = address(new SMARTIdentityRegistryStorageImplementation(forwarder));
        trustedIssuersRegistryImpl = address(new SMARTTrustedIssuersRegistryImplementation(forwarder));
        topicSchemeRegistryImpl = address(new SMARTTopicSchemeRegistryImplementation(forwarder));
        identityFactoryImpl = address(new SMARTIdentityFactoryImplementation(forwarder));
        identityImpl = address(new SMARTIdentityImplementation(forwarder));
        tokenIdentityImpl = address(new SMARTTokenIdentityImplementation(forwarder));
        tokenAccessManagerImpl = address(new SMARTTokenAccessManagerImplementation(forwarder));
        identityVerificationModule = address(new SMARTIdentityVerificationModule(forwarder));

        // Deploy factory with valid implementations
        factory = new SMARTSystemFactory(
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            tokenIdentityImpl,
            tokenAccessManagerImpl,
            identityVerificationModule,
            forwarder
        );
    }

    function test_ConstructorWithValidImplementations() public view {
        assertEq(factory.defaultComplianceImplementation(), complianceImpl);
        assertEq(factory.defaultIdentityRegistryImplementation(), identityRegistryImpl);
        assertEq(factory.defaultIdentityRegistryStorageImplementation(), identityRegistryStorageImpl);
        assertEq(factory.defaultTrustedIssuersRegistryImplementation(), trustedIssuersRegistryImpl);
        assertEq(factory.defaultTopicSchemeRegistryImplementation(), topicSchemeRegistryImpl);
        assertEq(factory.defaultIdentityFactoryImplementation(), identityFactoryImpl);
        assertEq(factory.defaultIdentityImplementation(), identityImpl);
        assertEq(factory.defaultTokenIdentityImplementation(), tokenIdentityImpl);
        assertEq(factory.defaultTokenAccessManagerImplementation(), tokenAccessManagerImpl);
        assertEq(factory.factoryForwarder(), forwarder);
        assertEq(factory.getSystemCount(), 0);
    }

    function test_ConstructorWithZeroComplianceImplementation() public {
        vm.expectRevert(ComplianceImplementationNotSet.selector);
        new SMARTSystemFactory(
            address(0), // Zero compliance implementation
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            tokenIdentityImpl,
            tokenAccessManagerImpl,
            identityVerificationModule,
            forwarder
        );
    }

    function test_ConstructorWithZeroIdentityRegistryImplementation() public {
        vm.expectRevert(IdentityRegistryImplementationNotSet.selector);
        new SMARTSystemFactory(
            complianceImpl,
            address(0), // Zero identity registry implementation
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            tokenIdentityImpl,
            tokenAccessManagerImpl,
            identityVerificationModule,
            forwarder
        );
    }

    function test_ConstructorWithZeroIdentityRegistryStorageImplementation() public {
        vm.expectRevert(IdentityRegistryStorageImplementationNotSet.selector);
        new SMARTSystemFactory(
            complianceImpl,
            identityRegistryImpl,
            address(0), // Zero identity registry storage implementation
            trustedIssuersRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            tokenIdentityImpl,
            tokenAccessManagerImpl,
            identityVerificationModule,
            forwarder
        );
    }

    function test_ConstructorWithZeroTrustedIssuersRegistryImplementation() public {
        vm.expectRevert(TrustedIssuersRegistryImplementationNotSet.selector);
        new SMARTSystemFactory(
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            address(0), // Zero trusted issuers registry implementation
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            tokenIdentityImpl,
            tokenAccessManagerImpl,
            identityVerificationModule,
            forwarder
        );
    }

    function test_ConstructorWithZeroTopicSchemeRegistryImplementation() public {
        vm.expectRevert(TopicSchemeRegistryImplementationNotSet.selector);
        new SMARTSystemFactory(
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            address(0), // Zero topic scheme registry implementation
            identityFactoryImpl,
            identityImpl,
            tokenIdentityImpl,
            tokenAccessManagerImpl,
            identityVerificationModule,
            forwarder
        );
    }

    function test_ConstructorWithZeroIdentityFactoryImplementation() public {
        vm.expectRevert(IdentityFactoryImplementationNotSet.selector);
        new SMARTSystemFactory(
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            topicSchemeRegistryImpl,
            address(0), // Zero identity factory implementation
            identityImpl,
            tokenIdentityImpl,
            tokenAccessManagerImpl,
            identityVerificationModule,
            forwarder
        );
    }

    function test_ConstructorWithZeroIdentityImplementation() public {
        vm.expectRevert(IdentityImplementationNotSet.selector);
        new SMARTSystemFactory(
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            address(0), // Zero identity implementation
            tokenIdentityImpl,
            tokenAccessManagerImpl,
            identityVerificationModule,
            forwarder
        );
    }

    function test_ConstructorWithZeroTokenIdentityImplementation() public {
        vm.expectRevert(TokenIdentityImplementationNotSet.selector);
        new SMARTSystemFactory(
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            address(0), // Zero token identity implementation
            tokenAccessManagerImpl,
            identityVerificationModule,
            forwarder
        );
    }

    function test_ConstructorWithZeroTokenAccessManagerImplementation() public {
        vm.expectRevert(TokenAccessManagerImplementationNotSet.selector);
        new SMARTSystemFactory(
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            tokenIdentityImpl,
            address(0), // Zero token access manager implementation
            identityVerificationModule,
            forwarder
        );
    }

    function test_CreateSystemSuccess() public {
        vm.prank(admin);
        address systemAddress = factory.createSystem();

        assertNotEq(systemAddress, address(0));
        assertEq(factory.getSystemCount(), 1);
        assertEq(factory.getSystemAtIndex(0), systemAddress);

        // Verify the created system has correct properties
        IAccessControl system = IAccessControl(systemAddress);
        assertTrue(system.hasRole(SMARTSystemRoles.DEFAULT_ADMIN_ROLE, admin));
    }

    function test_CreateMultipleSystems() public {
        // Create first system
        vm.prank(user1);
        address system1 = factory.createSystem();

        // Create second system
        vm.prank(user2);
        address system2 = factory.createSystem();

        assertEq(factory.getSystemCount(), 2);
        assertEq(factory.getSystemAtIndex(0), system1);
        assertEq(factory.getSystemAtIndex(1), system2);
        assertNotEq(system1, system2);

        // Verify each system has correct admin
        IAccessControl smartSystem1 = IAccessControl(system1);
        IAccessControl smartSystem2 = IAccessControl(system2);
        assertTrue(smartSystem1.hasRole(SMARTSystemRoles.DEFAULT_ADMIN_ROLE, user1));
        assertTrue(smartSystem2.hasRole(SMARTSystemRoles.DEFAULT_ADMIN_ROLE, user2));
    }

    function test_GetSystemCount() public {
        assertEq(factory.getSystemCount(), 0);

        vm.prank(admin);
        factory.createSystem();
        assertEq(factory.getSystemCount(), 1);

        vm.prank(user1);
        factory.createSystem();
        assertEq(factory.getSystemCount(), 2);
    }

    function test_GetSystemAtIndexValidIndex() public {
        vm.prank(admin);
        address system1 = factory.createSystem();

        vm.prank(user1);
        address system2 = factory.createSystem();

        assertEq(factory.getSystemAtIndex(0), system1);
        assertEq(factory.getSystemAtIndex(1), system2);
    }

    function test_GetSystemAtIndexInvalidIndex() public {
        // No systems created yet
        vm.expectRevert(abi.encodeWithSelector(IndexOutOfBounds.selector, 0, 0));
        factory.getSystemAtIndex(0);

        // Create one system
        vm.prank(admin);
        factory.createSystem();

        // Index 1 should be out of bounds
        vm.expectRevert(abi.encodeWithSelector(IndexOutOfBounds.selector, 1, 1));
        factory.getSystemAtIndex(1);

        // Large index should be out of bounds
        vm.expectRevert(abi.encodeWithSelector(IndexOutOfBounds.selector, 999, 1));
        factory.getSystemAtIndex(999);
    }

    function test_SystemCreatedEventEmitted() public {
        vm.prank(admin);

        // Record logs to verify event was emitted
        vm.recordLogs();
        address systemAddress = factory.createSystem();

        // Verify system was created and event logs exist
        assertNotEq(systemAddress, address(0));
        assertTrue(vm.getRecordedLogs().length > 0);
    }

    function test_ERC2771ContextIntegration() public view {
        // Verify forwarder is set correctly
        assertEq(factory.factoryForwarder(), forwarder);

        // Test that the factory inherits from ERC2771Context
        // This is implicitly tested through the constructor and forwarder storage
    }

    function test_ImmutableVariablesCannotBeChanged() public view {
        // All variables are immutable, so they cannot be changed after construction
        // This test verifies they are set correctly and remain constant
        assertEq(factory.defaultComplianceImplementation(), complianceImpl);
        assertEq(factory.defaultIdentityRegistryImplementation(), identityRegistryImpl);
        assertEq(factory.defaultIdentityRegistryStorageImplementation(), identityRegistryStorageImpl);
        assertEq(factory.defaultTrustedIssuersRegistryImplementation(), trustedIssuersRegistryImpl);
        assertEq(factory.defaultTopicSchemeRegistryImplementation(), topicSchemeRegistryImpl);
        assertEq(factory.defaultIdentityFactoryImplementation(), identityFactoryImpl);
        assertEq(factory.defaultIdentityImplementation(), identityImpl);
        assertEq(factory.defaultTokenIdentityImplementation(), tokenIdentityImpl);
        assertEq(factory.defaultTokenAccessManagerImplementation(), tokenAccessManagerImpl);
        assertEq(factory.factoryForwarder(), forwarder);
    }

    function test_CreateSystemWithZeroForwarder() public {
        // Test factory can be created with zero forwarder address
        SMARTSystemFactory factoryWithZeroForwarder = new SMARTSystemFactory(
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            tokenIdentityImpl,
            tokenAccessManagerImpl,
            identityVerificationModule,
            address(0) // Zero forwarder
        );

        assertEq(factoryWithZeroForwarder.factoryForwarder(), address(0));

        vm.prank(admin);
        address systemAddress = factoryWithZeroForwarder.createSystem();
        assertNotEq(systemAddress, address(0));
    }

    function test_FuzzCreateSystems(uint8 numSystems) public {
        vm.assume(numSystems > 0 && numSystems <= 50); // Reasonable limits

        address[] memory systems = new address[](numSystems);

        for (uint8 i = 0; i < numSystems; i++) {
            address user = makeAddr(string(abi.encodePacked("user", i)));
            vm.prank(user);
            systems[i] = factory.createSystem();
        }

        assertEq(factory.getSystemCount(), numSystems);

        for (uint8 i = 0; i < numSystems; i++) {
            assertEq(factory.getSystemAtIndex(i), systems[i]);
        }
    }
}
