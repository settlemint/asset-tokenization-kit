// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { ATKSystemFactory } from "../../contracts/system/ATKSystemFactory.sol";
import { ATKSystemImplementations } from "../../contracts/system/ATKSystemFactory.sol";
import { IATKSystem } from "../../contracts/system/IATKSystem.sol";
import { ATKSystemImplementation } from "../../contracts/system/ATKSystemImplementation.sol";
import { ATKSystemRoles } from "../../contracts/system/ATKSystemRoles.sol";
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
    IndexOutOfBounds,
    IdentityVerificationModuleNotSet,
    TokenFactoryRegistryImplementationNotSet,
    AddonRegistryImplementationNotSet,
    ComplianceModuleRegistryImplementationNotSet,
    SystemAccessManagerImplementationNotSet,
    InvalidSystemImplementation
} from "../../contracts/system/ATKSystemErrors.sol";

// Implementations for testing
import { ATKIdentityRegistryStorageImplementation } from
    "../../contracts/system/identity-registry-storage/ATKIdentityRegistryStorageImplementation.sol";
import { ATKTrustedIssuersRegistryImplementation } from
    "../../contracts/system/trusted-issuers-registry/ATKTrustedIssuersRegistryImplementation.sol";
import { ATKIdentityRegistryImplementation } from
    "../../contracts/system/identity-registry/ATKIdentityRegistryImplementation.sol";
import { ATKTopicSchemeRegistryImplementation } from
    "../../contracts/system/topic-scheme-registry/ATKTopicSchemeRegistryImplementation.sol";
import { ATKComplianceImplementation } from "../../contracts/system/compliance/ATKComplianceImplementation.sol";
import { ATKIdentityFactoryImplementation } from
    "../../contracts/system/identity-factory/ATKIdentityFactoryImplementation.sol";
import { ATKIdentityImplementation } from
    "../../contracts/system/identity-factory/identities/ATKIdentityImplementation.sol";
import { ATKTokenIdentityImplementation } from
    "../../contracts/system/identity-factory/identities/ATKTokenIdentityImplementation.sol";
import { ATKTokenAccessManagerImplementation } from
    "../../contracts/system/access-manager/ATKTokenAccessManagerImplementation.sol";
import { ATKTokenFactoryRegistryImplementation } from
    "../../contracts/system/token-factory/ATKTokenFactoryRegistryImplementation.sol";
import { ATKSystemAddonRegistryImplementation } from
    "../../contracts/system/addons/ATKSystemAddonRegistryImplementation.sol";
import { ATKComplianceModuleRegistryImplementation } from
    "../../contracts/system/compliance/ATKComplianceModuleRegistryImplementation.sol";
import { ATKSystemAccessManagerImplementation } from
    "../../contracts/system/access-manager/ATKSystemAccessManagerImplementation.sol";

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
    address public topicSchemeRegistryImpl;
    address public identityFactoryImpl;
    address public identityImpl;
    address public tokenIdentityImpl;
    address public tokenAccessManagerImpl;
    address public systemAccessManagerImpl;
    address public identityVerificationModule;
    address public tokenFactoryRegistryImpl;
    address public addonRegistryImpl;
    address public complianceModuleRegistryImpl;
    address public forwarder;

    // Test addresses
    address public admin = makeAddr("admin");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    event SMARTSystemCreated(address indexed sender, address indexed systemAddress);

    function _buildImplementations() private view returns (ATKSystemImplementations memory) {
        return ATKSystemImplementations({
            atkSystemImplementation: systemImpl,
            complianceImplementation: complianceImpl,
            identityRegistryImplementation: identityRegistryImpl,
            identityRegistryStorageImplementation: identityRegistryStorageImpl,
            trustedIssuersRegistryImplementation: trustedIssuersRegistryImpl,
            topicSchemeRegistryImplementation: topicSchemeRegistryImpl,
            identityFactoryImplementation: identityFactoryImpl,
            identityImplementation: identityImpl,
            tokenIdentityImplementation: tokenIdentityImpl,
            tokenAccessManagerImplementation: tokenAccessManagerImpl,
            identityVerificationModule: identityVerificationModule,
            tokenFactoryRegistryImplementation: tokenFactoryRegistryImpl,
            complianceModuleRegistryImplementation: complianceModuleRegistryImpl,
            addonRegistryImplementation: addonRegistryImpl,
            systemAccessManagerImplementation: systemAccessManagerImpl
        });
    }

    function _buildImplementationsWithOverride(
        address overrideAddr,
        string memory fieldName
    )
        private
        view
        returns (ATKSystemImplementations memory)
    {
        ATKSystemImplementations memory implementations = _buildImplementations();

        if (keccak256(bytes(fieldName)) == keccak256(bytes("atkSystemImplementation"))) {
            implementations.atkSystemImplementation = overrideAddr;
        } else if (keccak256(bytes(fieldName)) == keccak256(bytes("complianceImplementation"))) {
            implementations.complianceImplementation = overrideAddr;
        } else if (keccak256(bytes(fieldName)) == keccak256(bytes("identityRegistryImplementation"))) {
            implementations.identityRegistryImplementation = overrideAddr;
        } else if (keccak256(bytes(fieldName)) == keccak256(bytes("identityRegistryStorageImplementation"))) {
            implementations.identityRegistryStorageImplementation = overrideAddr;
        } else if (keccak256(bytes(fieldName)) == keccak256(bytes("trustedIssuersRegistryImplementation"))) {
            implementations.trustedIssuersRegistryImplementation = overrideAddr;
        } else if (keccak256(bytes(fieldName)) == keccak256(bytes("topicSchemeRegistryImplementation"))) {
            implementations.topicSchemeRegistryImplementation = overrideAddr;
        } else if (keccak256(bytes(fieldName)) == keccak256(bytes("identityFactoryImplementation"))) {
            implementations.identityFactoryImplementation = overrideAddr;
        } else if (keccak256(bytes(fieldName)) == keccak256(bytes("identityImplementation"))) {
            implementations.identityImplementation = overrideAddr;
        } else if (keccak256(bytes(fieldName)) == keccak256(bytes("tokenIdentityImplementation"))) {
            implementations.tokenIdentityImplementation = overrideAddr;
        } else if (keccak256(bytes(fieldName)) == keccak256(bytes("tokenAccessManagerImplementation"))) {
            implementations.tokenAccessManagerImplementation = overrideAddr;
        } else if (keccak256(bytes(fieldName)) == keccak256(bytes("systemAccessManagerImplementation"))) {
            implementations.systemAccessManagerImplementation = overrideAddr;
        } else if (keccak256(bytes(fieldName)) == keccak256(bytes("identityVerificationModule"))) {
            implementations.identityVerificationModule = overrideAddr;
        } else if (keccak256(bytes(fieldName)) == keccak256(bytes("tokenFactoryRegistryImplementation"))) {
            implementations.tokenFactoryRegistryImplementation = overrideAddr;
        } else if (keccak256(bytes(fieldName)) == keccak256(bytes("complianceModuleRegistryImplementation"))) {
            implementations.complianceModuleRegistryImplementation = overrideAddr;
        } else if (keccak256(bytes(fieldName)) == keccak256(bytes("addonRegistryImplementation"))) {
            implementations.addonRegistryImplementation = overrideAddr;
        }

        return implementations;
    }

    function setUp() public {
        forwarder = makeAddr("forwarder");

        // Deploy all implementations
        systemImpl = address(new ATKSystemImplementation(forwarder));
        complianceImpl = address(new ATKComplianceImplementation(forwarder));
        identityRegistryImpl = address(new ATKIdentityRegistryImplementation(forwarder));
        identityRegistryStorageImpl = address(new ATKIdentityRegistryStorageImplementation(forwarder));
        trustedIssuersRegistryImpl = address(new ATKTrustedIssuersRegistryImplementation(forwarder));
        topicSchemeRegistryImpl = address(new ATKTopicSchemeRegistryImplementation(forwarder));
        identityFactoryImpl = address(new ATKIdentityFactoryImplementation(forwarder));
        identityImpl = address(new ATKIdentityImplementation(forwarder));
        tokenIdentityImpl = address(new ATKTokenIdentityImplementation(forwarder));
        tokenAccessManagerImpl = address(new ATKTokenAccessManagerImplementation(forwarder));
        systemAccessManagerImpl = address(new ATKSystemAccessManagerImplementation(forwarder));
        identityVerificationModule = address(new SMARTIdentityVerificationComplianceModule(forwarder));
        tokenFactoryRegistryImpl = address(new ATKTokenFactoryRegistryImplementation(forwarder));
        addonRegistryImpl = address(new ATKSystemAddonRegistryImplementation(forwarder));
        complianceModuleRegistryImpl = address(new ATKComplianceModuleRegistryImplementation(forwarder));

        // Deploy factory with valid implementations
        factory = new ATKSystemFactory(_buildImplementations(), forwarder);
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
        assertEq(factory.defaultSystemAccessManagerImplementation(), systemAccessManagerImpl);
        assertEq(factory.factoryForwarder(), forwarder);
        assertEq(factory.getSystemCount(), 0);
    }

    function test_ConstructorWithZeroComplianceImplementation() public {
        vm.expectRevert(ComplianceImplementationNotSet.selector);
        new ATKSystemFactory(_buildImplementationsWithOverride(address(0), "complianceImplementation"), forwarder);
    }

    function test_ConstructorWithZeroIdentityRegistryImplementation() public {
        vm.expectRevert(IdentityRegistryImplementationNotSet.selector);
        new ATKSystemFactory(_buildImplementationsWithOverride(address(0), "identityRegistryImplementation"), forwarder);
    }

    function test_ConstructorWithZeroIdentityRegistryStorageImplementation() public {
        vm.expectRevert(IdentityRegistryStorageImplementationNotSet.selector);
        new ATKSystemFactory(
            _buildImplementationsWithOverride(address(0), "identityRegistryStorageImplementation"), forwarder
        );
    }

    function test_ConstructorWithZeroTrustedIssuersRegistryImplementation() public {
        vm.expectRevert(TrustedIssuersRegistryImplementationNotSet.selector);
        new ATKSystemFactory(
            _buildImplementationsWithOverride(address(0), "trustedIssuersRegistryImplementation"), forwarder
        );
    }

    function test_ConstructorWithZeroTopicSchemeRegistryImplementation() public {
        vm.expectRevert(TopicSchemeRegistryImplementationNotSet.selector);
        new ATKSystemFactory(
            _buildImplementationsWithOverride(address(0), "topicSchemeRegistryImplementation"), forwarder
        );
    }

    function test_ConstructorWithZeroIdentityFactoryImplementation() public {
        vm.expectRevert(IdentityFactoryImplementationNotSet.selector);
        new ATKSystemFactory(_buildImplementationsWithOverride(address(0), "identityFactoryImplementation"), forwarder);
    }

    function test_ConstructorWithZeroIdentityImplementation() public {
        vm.expectRevert(IdentityImplementationNotSet.selector);
        new ATKSystemFactory(_buildImplementationsWithOverride(address(0), "identityImplementation"), forwarder);
    }

    function test_ConstructorWithZeroTokenIdentityImplementation() public {
        vm.expectRevert(TokenIdentityImplementationNotSet.selector);
        new ATKSystemFactory(_buildImplementationsWithOverride(address(0), "tokenIdentityImplementation"), forwarder);
    }

    function test_ConstructorWithZeroTokenAccessManagerImplementation() public {
        vm.expectRevert(TokenAccessManagerImplementationNotSet.selector);
        new ATKSystemFactory(
            _buildImplementationsWithOverride(address(0), "tokenAccessManagerImplementation"), forwarder
        );
    }

    function test_ConstructorWithZeroSystemAccessManagerImplementation() public {
        vm.expectRevert(SystemAccessManagerImplementationNotSet.selector);
        new ATKSystemFactory(
            _buildImplementationsWithOverride(address(0), "systemAccessManagerImplementation"), forwarder
        );
    }

    function test_ConstructorWithZeroIdentityVerificationModule() public {
        vm.expectRevert(IdentityVerificationModuleNotSet.selector);
        new ATKSystemFactory(_buildImplementationsWithOverride(address(0), "identityVerificationModule"), forwarder);
    }

    function test_ConstructorWithZeroComplianceModuleRegistryImplementation() public {
        vm.expectRevert(ComplianceModuleRegistryImplementationNotSet.selector);
        new ATKSystemFactory(
            _buildImplementationsWithOverride(address(0), "complianceModuleRegistryImplementation"), forwarder
        );
    }

    function test_ConstructorWithZeroAddonRegistryImplementation() public {
        vm.expectRevert(AddonRegistryImplementationNotSet.selector);
        new ATKSystemFactory(_buildImplementationsWithOverride(address(0), "addonRegistryImplementation"), forwarder);
    }

    function test_ConstructorWithZeroTokenFactoryRegistryImplementation() public {
        vm.expectRevert(TokenFactoryRegistryImplementationNotSet.selector);
        new ATKSystemFactory(
            _buildImplementationsWithOverride(address(0), "tokenFactoryRegistryImplementation"), forwarder
        );
    }

    function test_ConstructorWithZeroSystemImplementation() public {
        vm.expectRevert(InvalidSystemImplementation.selector);
        new ATKSystemFactory(_buildImplementationsWithOverride(address(0), "atkSystemImplementation"), forwarder);
    }

    function test_CreateSystemSuccess() public {
        vm.prank(admin);
        address systemAddress = factory.createSystem();

        assertNotEq(systemAddress, address(0));
        assertEq(factory.getSystemCount(), 1);
        assertEq(factory.getSystemAtIndex(0), systemAddress);

        // Bootstrap the system to set up the access manager
        vm.prank(admin);
        IATKSystem(systemAddress).bootstrap();

        // Verify the created system has correct properties
        IATKSystem system = IATKSystem(systemAddress);
        address systemAccessManager = system.systemAccessManager();
        assertTrue(IAccessControl(systemAccessManager).hasRole(ATKSystemRoles.DEFAULT_ADMIN_ROLE, admin));
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

        // Bootstrap both systems to set up access managers
        vm.prank(user1);
        IATKSystem(system1).bootstrap();
        vm.prank(user2);
        IATKSystem(system2).bootstrap();

        // Verify each system has correct admin
        IATKSystem smartSystem1 = IATKSystem(system1);
        IATKSystem smartSystem2 = IATKSystem(system2);
        address accessManager1 = smartSystem1.systemAccessManager();
        address accessManager2 = smartSystem2.systemAccessManager();
        assertTrue(IAccessControl(accessManager1).hasRole(ATKSystemRoles.DEFAULT_ADMIN_ROLE, user1));
        assertTrue(IAccessControl(accessManager2).hasRole(ATKSystemRoles.DEFAULT_ADMIN_ROLE, user2));
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
        assertEq(factory.defaultSystemAccessManagerImplementation(), systemAccessManagerImpl);
        assertEq(factory.defaultIdentityVerificationModule(), identityVerificationModule);
        assertEq(factory.factoryForwarder(), forwarder);
    }

    function test_CreateSystemWithZeroForwarder() public {
        // Test factory can be created with zero forwarder address
        ATKSystemFactory factoryWithZeroForwarder = new ATKSystemFactory(
            _buildImplementations(),
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
