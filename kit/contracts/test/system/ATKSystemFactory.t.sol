// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { ATKSystemFactory } from "../../contracts/system/ATKSystemFactory.sol";
import { ATKSystemImplementation } from "../../contracts/system/ATKSystemImplementation.sol";
import { ATKRoles } from "../../contracts/system/ATKRoles.sol";
import {
    ComplianceImplementationNotSet,
    IdentityRegistryImplementationNotSet,
    IdentityRegistryStorageImplementationNotSet,
    SystemTrustedIssuersRegistryImplementationNotSet,
    TopicSchemeRegistryImplementationNotSet,
    IdentityFactoryImplementationNotSet,
    IdentityImplementationNotSet,
    ContractIdentityImplementationNotSet,
    TokenAccessManagerImplementationNotSet,
    IndexOutOfBounds,
    TokenFactoryRegistryImplementationNotSet,
    AddonRegistryImplementationNotSet,
    ComplianceModuleRegistryImplementationNotSet,
    SystemAccessManagerImplementationNotSet,
    TrustedIssuersMetaRegistryImplementationNotSet
} from "../../contracts/system/ATKSystemErrors.sol";
import { IATKSystemAccessManaged } from "../../contracts/system/access-manager/IATKSystemAccessManaged.sol";

// Implementations for testing
import { ATKIdentityRegistryStorageImplementation } from
    "../../contracts/system/identity-registry-storage/ATKIdentityRegistryStorageImplementation.sol";
import { ATKSystemTrustedIssuersRegistryImplementation } from
    "../../contracts/system/trusted-issuers-registry/ATKSystemTrustedIssuersRegistryImplementation.sol";
import { ATKIdentityRegistryImplementation } from
    "../../contracts/system/identity-registry/ATKIdentityRegistryImplementation.sol";
import { ATKTopicSchemeRegistryImplementation } from
    "../../contracts/system/topic-scheme-registry/ATKTopicSchemeRegistryImplementation.sol";
import { ATKComplianceImplementation } from "../../contracts/system/compliance/ATKComplianceImplementation.sol";
import { ATKIdentityFactoryImplementation } from
    "../../contracts/system/identity-factory/ATKIdentityFactoryImplementation.sol";
import { ATKIdentityImplementation } from
    "../../contracts/system/identity-factory/identities/ATKIdentityImplementation.sol";
import { ATKContractIdentityImplementation } from
    "../../contracts/system/identity-factory/identities/ATKContractIdentityImplementation.sol";
import { ATKTokenAccessManagerImplementation } from
    "../../contracts/system/tokens/access/ATKTokenAccessManagerImplementation.sol";
import { ATKSystemAccessManagerImplementation } from
    "../../contracts/system/access-manager/ATKSystemAccessManagerImplementation.sol";
import { ATKTokenFactoryRegistryImplementation } from
    "../../contracts/system/tokens/factory/ATKTokenFactoryRegistryImplementation.sol";
import { ATKSystemAddonRegistryImplementation } from
    "../../contracts/system/addons/ATKSystemAddonRegistryImplementation.sol";
import { ATKComplianceModuleRegistryImplementation } from
    "../../contracts/system/compliance/ATKComplianceModuleRegistryImplementation.sol";
import { ATKTrustedIssuersMetaRegistryImplementation } from
    "../../contracts/system/trusted-issuers-registry/ATKTrustedIssuersMetaRegistryImplementation.sol";

// Import compliance module
import { SMARTIdentityVerificationComplianceModule } from
    "../../contracts/smart/modules/SMARTIdentityVerificationComplianceModule.sol";

contract ATKSystemFactoryTest is Test {
    ATKSystemFactory public factory;

    // Implementation addresses
    address public systemImpl;
    address public complianceImpl;
    address public identityRegistryImpl;
    address public identityRegistryStorageImpl;
    address public trustedIssuersRegistryImpl;
    address public trustedIssuersMetaRegistryImpl;
    address public topicSchemeRegistryImpl;
    address public identityFactoryImpl;
    address public identityImpl;
    // address public contractIdentityImpl; // Removed - replaced with contractIdentityImpl
    address public contractIdentityImpl;
    address public tokenAccessManagerImpl;
    address public identityVerificationModule;
    address public tokenFactoryRegistryImpl;
    address public addonRegistryImpl;
    address public complianceModuleRegistryImpl;
    address public systemAccessManagerImpl;
    address public forwarder;

    // Test addresses
    address public admin = makeAddr("admin");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    event SMARTSystemCreated(address indexed sender, address indexed systemAddress);

    function setUp() public {
        forwarder = makeAddr("forwarder");

        // Deploy all implementations
        systemImpl = address(new ATKSystemImplementation(forwarder));
        complianceImpl = address(new ATKComplianceImplementation(forwarder));
        identityRegistryImpl = address(new ATKIdentityRegistryImplementation(forwarder));
        identityRegistryStorageImpl = address(new ATKIdentityRegistryStorageImplementation(forwarder));
        trustedIssuersRegistryImpl = address(new ATKSystemTrustedIssuersRegistryImplementation(forwarder));
        trustedIssuersMetaRegistryImpl = address(new ATKTrustedIssuersMetaRegistryImplementation(forwarder));
        topicSchemeRegistryImpl = address(new ATKTopicSchemeRegistryImplementation(forwarder));
        identityFactoryImpl = address(new ATKIdentityFactoryImplementation(forwarder));
        identityImpl = address(new ATKIdentityImplementation(forwarder));
        // contractIdentityImpl = address(new ATKTokenIdentityImplementation(forwarder)); // Removed - using
        // contractIdentityImpl instead
        contractIdentityImpl = address(new ATKContractIdentityImplementation(forwarder));
        tokenAccessManagerImpl = address(new ATKTokenAccessManagerImplementation(forwarder));
        identityVerificationModule = address(new SMARTIdentityVerificationComplianceModule(forwarder));
        tokenFactoryRegistryImpl = address(new ATKTokenFactoryRegistryImplementation(forwarder));
        addonRegistryImpl = address(new ATKSystemAddonRegistryImplementation(forwarder));
        complianceModuleRegistryImpl = address(new ATKComplianceModuleRegistryImplementation(forwarder));
        systemAccessManagerImpl = address(new ATKSystemAccessManagerImplementation(forwarder));

        // Deploy factory with valid implementations
        factory = new ATKSystemFactory(
            systemImpl,
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            trustedIssuersMetaRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            contractIdentityImpl,
            tokenAccessManagerImpl,
            tokenFactoryRegistryImpl,
            complianceModuleRegistryImpl,
            addonRegistryImpl,
            systemAccessManagerImpl,
            forwarder
        );
    }

    function test_ConstructorWithValidImplementations() public view {
        assertEq(factory.defaultComplianceImplementation(), complianceImpl);
        assertEq(factory.defaultIdentityRegistryImplementation(), identityRegistryImpl);
        assertEq(factory.defaultIdentityRegistryStorageImplementation(), identityRegistryStorageImpl);
        assertEq(factory.defaultSystemTrustedIssuersRegistryImplementation(), trustedIssuersRegistryImpl);
        assertEq(factory.defaultTrustedIssuersMetaRegistryImplementation(), trustedIssuersMetaRegistryImpl);
        assertEq(factory.defaultTopicSchemeRegistryImplementation(), topicSchemeRegistryImpl);
        assertEq(factory.defaultIdentityFactoryImplementation(), identityFactoryImpl);
        assertEq(factory.defaultIdentityImplementation(), identityImpl);
        assertEq(factory.defaultContractIdentityImplementation(), contractIdentityImpl);
        assertEq(factory.defaultContractIdentityImplementation(), contractIdentityImpl);
        assertEq(factory.defaultTokenAccessManagerImplementation(), tokenAccessManagerImpl);
        assertEq(factory.factoryForwarder(), forwarder);
        assertEq(factory.getSystemCount(), 0);
    }

    function test_ConstructorWithZeroComplianceImplementation() public {
        vm.expectRevert(ComplianceImplementationNotSet.selector);
        new ATKSystemFactory(
            systemImpl,
            address(0), // Zero compliance implementation
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            trustedIssuersMetaRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            contractIdentityImpl,
            tokenAccessManagerImpl,
            tokenFactoryRegistryImpl,
            complianceModuleRegistryImpl,
            addonRegistryImpl,
            systemAccessManagerImpl,
            forwarder
        );
    }

    function test_ConstructorWithZeroIdentityRegistryImplementation() public {
        vm.expectRevert(IdentityRegistryImplementationNotSet.selector);
        new ATKSystemFactory(
            systemImpl,
            complianceImpl,
            address(0), // Zero identity registry implementation
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            trustedIssuersMetaRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            contractIdentityImpl,
            tokenAccessManagerImpl,
            tokenFactoryRegistryImpl,
            complianceModuleRegistryImpl,
            addonRegistryImpl,
            systemAccessManagerImpl,
            forwarder
        );
    }

    function test_ConstructorWithZeroIdentityRegistryStorageImplementation() public {
        vm.expectRevert(IdentityRegistryStorageImplementationNotSet.selector);
        new ATKSystemFactory(
            systemImpl,
            complianceImpl,
            identityRegistryImpl,
            address(0), // Zero identity registry storage implementation
            trustedIssuersRegistryImpl,
            trustedIssuersMetaRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            contractIdentityImpl,
            tokenAccessManagerImpl,
            tokenFactoryRegistryImpl,
            complianceModuleRegistryImpl,
            addonRegistryImpl,
            systemAccessManagerImpl,
            forwarder
        );
    }

    function test_ConstructorWithZeroTrustedIssuersRegistryImplementation() public {
        vm.expectRevert(SystemTrustedIssuersRegistryImplementationNotSet.selector);
        new ATKSystemFactory(
            systemImpl,
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            address(0), // Zero trusted issuers registry implementation
            trustedIssuersMetaRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            contractIdentityImpl,
            tokenAccessManagerImpl,
            tokenFactoryRegistryImpl,
            complianceModuleRegistryImpl,
            addonRegistryImpl,
            systemAccessManagerImpl,
            forwarder
        );
    }

    function test_ConstructorWithZeroTrustedIssuersMetaRegistryImplementation() public {
        vm.expectRevert(TrustedIssuersMetaRegistryImplementationNotSet.selector);
        new ATKSystemFactory(
            systemImpl,
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            address(0), // Zero trusted issuers meta registry implementation
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            contractIdentityImpl,
            tokenAccessManagerImpl,
            tokenFactoryRegistryImpl,
            complianceModuleRegistryImpl,
            addonRegistryImpl,
            systemAccessManagerImpl,
            forwarder
        );
    }

    function test_ConstructorWithZeroTopicSchemeRegistryImplementation() public {
        vm.expectRevert(TopicSchemeRegistryImplementationNotSet.selector);
        new ATKSystemFactory(
            systemImpl,
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            trustedIssuersMetaRegistryImpl,
            address(0), // Zero topic scheme registry implementation
            identityFactoryImpl,
            identityImpl,
            contractIdentityImpl,
            tokenAccessManagerImpl,
            tokenFactoryRegistryImpl,
            complianceModuleRegistryImpl,
            addonRegistryImpl,
            systemAccessManagerImpl,
            forwarder
        );
    }

    function test_ConstructorWithZeroIdentityFactoryImplementation() public {
        vm.expectRevert(IdentityFactoryImplementationNotSet.selector);
        new ATKSystemFactory(
            systemImpl,
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            trustedIssuersMetaRegistryImpl,
            topicSchemeRegistryImpl,
            address(0), // Zero identity factory implementation
            identityImpl,
            contractIdentityImpl,
            tokenAccessManagerImpl,
            tokenFactoryRegistryImpl,
            complianceModuleRegistryImpl,
            addonRegistryImpl,
            systemAccessManagerImpl,
            forwarder
        );
    }

    function test_ConstructorWithZeroIdentityImplementation() public {
        vm.expectRevert(IdentityImplementationNotSet.selector);
        new ATKSystemFactory(
            systemImpl,
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            trustedIssuersMetaRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            address(0), // Zero identity implementation
            contractIdentityImpl,
            tokenAccessManagerImpl,
            tokenFactoryRegistryImpl,
            complianceModuleRegistryImpl,
            addonRegistryImpl,
            systemAccessManagerImpl,
            forwarder
        );
    }

    function test_ConstructorWithZeroTokenIdentityImplementation() public {
        vm.expectRevert(ContractIdentityImplementationNotSet.selector);
        new ATKSystemFactory(
            systemImpl,
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            trustedIssuersMetaRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            address(0), // Zero contract identity implementation
            tokenAccessManagerImpl,
            tokenFactoryRegistryImpl,
            complianceModuleRegistryImpl,
            addonRegistryImpl,
            systemAccessManagerImpl,
            forwarder
        );
    }

    function test_ConstructorWithZeroContractIdentityImplementation() public {
        vm.expectRevert(ContractIdentityImplementationNotSet.selector);
        new ATKSystemFactory(
            systemImpl,
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            trustedIssuersMetaRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            address(0), // Zero contract identity implementation
            tokenAccessManagerImpl,
            tokenFactoryRegistryImpl,
            complianceModuleRegistryImpl,
            addonRegistryImpl,
            systemAccessManagerImpl,
            forwarder
        );
    }

    function test_ConstructorWithZeroTokenAccessManagerImplementation() public {
        vm.expectRevert(TokenAccessManagerImplementationNotSet.selector);
        new ATKSystemFactory(
            systemImpl,
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            trustedIssuersMetaRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            contractIdentityImpl,
            address(0), // Zero token access manager implementation
            tokenFactoryRegistryImpl,
            complianceModuleRegistryImpl,
            addonRegistryImpl,
            systemAccessManagerImpl,
            forwarder
        );
    }

    function test_ConstructorWithZeroComplianceModuleRegistryImplementation() public {
        vm.expectRevert(ComplianceModuleRegistryImplementationNotSet.selector);
        new ATKSystemFactory(
            systemImpl,
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            trustedIssuersMetaRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            contractIdentityImpl,
            tokenAccessManagerImpl,
            tokenFactoryRegistryImpl,
            address(0), // complianceModuleRegistryImpl
            addonRegistryImpl,
            systemAccessManagerImpl,
            forwarder
        );
    }

    function test_ConstructorWithZeroAddonRegistryImplementation() public {
        vm.expectRevert(AddonRegistryImplementationNotSet.selector);
        new ATKSystemFactory(
            systemImpl,
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            trustedIssuersMetaRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            contractIdentityImpl,
            tokenAccessManagerImpl,
            tokenFactoryRegistryImpl,
            complianceModuleRegistryImpl,
            address(0), // addonRegistryImpl
            systemAccessManagerImpl,
            forwarder
        );
    }

    function test_ConstructorWithZeroTokenFactoryRegistryImplementation() public {
        vm.expectRevert(TokenFactoryRegistryImplementationNotSet.selector);
        new ATKSystemFactory(
            systemImpl,
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            trustedIssuersMetaRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            contractIdentityImpl,
            tokenAccessManagerImpl,
            address(0), // tokenFactoryRegistryImpl
            complianceModuleRegistryImpl,
            addonRegistryImpl,
            systemAccessManagerImpl,
            forwarder
        );
    }

    function test_ConstructorWithZeroSystemAccessManagerImplementation() public {
        vm.expectRevert(SystemAccessManagerImplementationNotSet.selector);
        new ATKSystemFactory(
            systemImpl,
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            trustedIssuersMetaRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            contractIdentityImpl,
            tokenAccessManagerImpl,
            tokenFactoryRegistryImpl,
            complianceModuleRegistryImpl,
            addonRegistryImpl,
            address(0), // systemAccessManagerImpl
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
        IATKSystemAccessManaged system = IATKSystemAccessManaged(systemAddress);
        assertTrue(system.hasSystemRole(ATKRoles.DEFAULT_ADMIN_ROLE, admin));
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
        IATKSystemAccessManaged smartSystem1 = IATKSystemAccessManaged(system1);
        IATKSystemAccessManaged smartSystem2 = IATKSystemAccessManaged(system2);
        assertTrue(smartSystem1.hasSystemRole(ATKRoles.DEFAULT_ADMIN_ROLE, user1));
        assertTrue(smartSystem2.hasSystemRole(ATKRoles.DEFAULT_ADMIN_ROLE, user2));
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
        assertEq(factory.defaultSystemTrustedIssuersRegistryImplementation(), trustedIssuersRegistryImpl);
        assertEq(factory.defaultTopicSchemeRegistryImplementation(), topicSchemeRegistryImpl);
        assertEq(factory.defaultIdentityFactoryImplementation(), identityFactoryImpl);
        assertEq(factory.defaultIdentityImplementation(), identityImpl);
        assertEq(factory.defaultContractIdentityImplementation(), contractIdentityImpl);
        assertEq(factory.defaultTokenAccessManagerImplementation(), tokenAccessManagerImpl);
        // Note: defaultIdentityVerificationModule() removed as functionality moved to compliance module registry
        assertEq(factory.factoryForwarder(), forwarder);
    }

    function test_CreateSystemWithZeroForwarder() public {
        // Test factory can be created with zero forwarder address
        ATKSystemFactory factoryWithZeroForwarder = new ATKSystemFactory(
            systemImpl,
            complianceImpl,
            identityRegistryImpl,
            identityRegistryStorageImpl,
            trustedIssuersRegistryImpl,
            trustedIssuersMetaRegistryImpl,
            topicSchemeRegistryImpl,
            identityFactoryImpl,
            identityImpl,
            contractIdentityImpl,
            tokenAccessManagerImpl,
            tokenFactoryRegistryImpl,
            complianceModuleRegistryImpl,
            addonRegistryImpl,
            systemAccessManagerImpl,
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
