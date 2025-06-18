// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test, console } from "forge-std/Test.sol";
import { ATKSystemImplementation } from "../../contracts/system/ATKSystemImplementation.sol";
import { IATKSystem } from "../../contracts/system/IATKSystem.sol";
import { ATKSystemRoles } from "../../contracts/system/ATKSystemRoles.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

// Import SystemUtils for proper setup
import { SystemUtils } from "../utils/SystemUtils.sol";

// Import required interfaces
import { ISMARTCompliance } from "../../contracts/smart/interface/ISMARTCompliance.sol";
import { IATKIdentityFactory } from "../../contracts/system/identity-factory/IATKIdentityFactory.sol";
import { IERC3643TrustedIssuersRegistry } from
    "../../contracts/smart/interface/ERC-3643/IERC3643TrustedIssuersRegistry.sol";
import { ISMARTIdentityRegistryStorage } from "../../contracts/smart/interface/ISMARTIdentityRegistryStorage.sol";
import { ISMARTIdentityRegistry } from "../../contracts/smart/interface/ISMARTIdentityRegistry.sol";
import { ISMARTTopicSchemeRegistry } from "../../contracts/smart/interface/ISMARTTopicSchemeRegistry.sol";
import { ISMARTTokenAccessManager } from "../../contracts/smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { IATKTokenFactory } from "../../contracts/system/token-factory/IATKTokenFactory.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { SMARTComplianceModuleParamPair } from
    "../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";

// Import system errors
import {
    SystemAlreadyBootstrapped,
    IdentityVerificationModuleNotSet,
    ComplianceImplementationNotSet,
    IdentityRegistryImplementationNotSet,
    InvalidImplementationInterface
} from "../../contracts/system/ATKSystemErrors.sol";

// Import actual implementations
import { ATKComplianceImplementation } from "../../contracts/system/compliance/ATKComplianceImplementation.sol";
import { ATKIdentityRegistryImplementation } from
    "../../contracts/system/identity-registry/ATKIdentityRegistryImplementation.sol";
import { ATKIdentityRegistryStorageImplementation } from
    "../../contracts/system/identity-registry-storage/ATKIdentityRegistryStorageImplementation.sol";
import { ATKTrustedIssuersRegistryImplementation } from
    "../../contracts/system/trusted-issuers-registry/ATKTrustedIssuersRegistryImplementation.sol";
import { ATKIdentityFactoryImplementation } from
    "../../contracts/system/identity-factory/ATKIdentityFactoryImplementation.sol";
import { ATKIdentityImplementation } from
    "../../contracts/system/identity-factory/identities/ATKIdentityImplementation.sol";
import { ATKTokenIdentityImplementation } from
    "../../contracts/system/identity-factory/identities/ATKTokenIdentityImplementation.sol";
import { ATKTokenAccessManagerImplementation } from
    "../../contracts/system/access-manager/ATKTokenAccessManagerImplementation.sol";
import { ATKTopicSchemeRegistryImplementation } from
    "../../contracts/system/topic-scheme-registry/ATKTopicSchemeRegistryImplementation.sol";

// Import compliance module
import { SMARTIdentityVerificationComplianceModule } from
    "../../contracts/smart/modules/SMARTIdentityVerificationComplianceModule.sol";

// Mock contracts for testing edge cases that require invalid contracts
contract MockInvalidContract {
// This contract doesn't implement IERC165
}

contract ATKSystemTest is Test {
    SystemUtils public systemUtils;
    IATKSystem public atkSystem;

    address public admin = address(0x1);
    address public user = address(0x2);
    MockInvalidContract public mockInvalidContract;

    // Actual implementation instances
    ATKComplianceImplementation public complianceImpl;
    ATKIdentityRegistryImplementation public identityRegistryImpl;
    ATKIdentityRegistryStorageImplementation public identityRegistryStorageImpl;
    ATKTrustedIssuersRegistryImplementation public trustedIssuersRegistryImpl;
    ATKTopicSchemeRegistryImplementation public topicSchemeRegistryImpl;
    ATKIdentityFactoryImplementation public identityFactoryImpl;
    ATKIdentityImplementation public identityImpl;
    ATKTokenIdentityImplementation public tokenIdentityImpl;
    ATKTokenAccessManagerImplementation public tokenAccessManagerImpl;
    SMARTIdentityVerificationComplianceModule public identityVerificationModule;

    address public forwarder = address(0x5);

    function setUp() public {
        systemUtils = new SystemUtils(admin);
        atkSystem = IATKSystem(address(systemUtils.system()));
        mockInvalidContract = new MockInvalidContract();

        // Deploy actual implementations for testing updates
        complianceImpl = new ATKComplianceImplementation(forwarder);
        identityRegistryImpl = new ATKIdentityRegistryImplementation(forwarder);
        identityRegistryStorageImpl = new ATKIdentityRegistryStorageImplementation(forwarder);
        trustedIssuersRegistryImpl = new ATKTrustedIssuersRegistryImplementation(forwarder);
        topicSchemeRegistryImpl = new ATKTopicSchemeRegistryImplementation(forwarder);
        identityFactoryImpl = new ATKIdentityFactoryImplementation(forwarder);
        identityImpl = new ATKIdentityImplementation(forwarder);
        tokenIdentityImpl = new ATKTokenIdentityImplementation(forwarder);
        tokenAccessManagerImpl = new ATKTokenAccessManagerImplementation(forwarder);
        identityVerificationModule = new SMARTIdentityVerificationComplianceModule(forwarder);
    }

    function test_InitialState() public view {
        // Check that implementation addresses are set
        assertTrue(atkSystem.complianceImplementation() != address(0));
        assertTrue(atkSystem.identityRegistryImplementation() != address(0));
        assertTrue(atkSystem.identityRegistryStorageImplementation() != address(0));
        assertTrue(atkSystem.trustedIssuersRegistryImplementation() != address(0));
        assertTrue(atkSystem.topicSchemeRegistryImplementation() != address(0));
        assertTrue(atkSystem.identityFactoryImplementation() != address(0));
        assertTrue(atkSystem.identityImplementation() != address(0));
        assertTrue(atkSystem.tokenIdentityImplementation() != address(0));
        assertTrue(atkSystem.tokenAccessManagerImplementation() != address(0));

        // Proxy addresses should be set (system is already bootstrapped)
        assertTrue(atkSystem.complianceProxy() != address(0));
        assertTrue(atkSystem.identityRegistryProxy() != address(0));
        assertTrue(atkSystem.identityRegistryStorageProxy() != address(0));
        assertTrue(atkSystem.trustedIssuersRegistryProxy() != address(0));
        assertTrue(atkSystem.topicSchemeRegistryProxy() != address(0));
        assertTrue(atkSystem.identityFactoryProxy() != address(0));

        // Compliance module should be set
        assertTrue(atkSystem.identityVerificationModule() != address(0));

        // Admin should have default admin role
        assertTrue(IAccessControl(address(atkSystem)).hasRole(ATKSystemRoles.DEFAULT_ADMIN_ROLE, admin));
    }

    function test_Bootstrap_OnlyAdmin() public {
        // Create a new system that hasn't been bootstrapped yet
        address newComplianceImpl = address(new ATKComplianceImplementation(forwarder));
        address newIdentityRegistryImpl = address(new ATKIdentityRegistryImplementation(forwarder));
        address newIdentityStorageImpl = address(new ATKIdentityRegistryStorageImplementation(forwarder));
        address newTrustedIssuersImpl = address(new ATKTrustedIssuersRegistryImplementation(forwarder));
        address newTopicSchemeRegistryImpl = address(new ATKTopicSchemeRegistryImplementation(forwarder));
        address newIdentityFactoryImpl = address(new ATKIdentityFactoryImplementation(forwarder));
        address newIdentityImplAddr = address(new ATKIdentityImplementation(forwarder));
        address newTokenIdentityImpl = address(new ATKTokenIdentityImplementation(forwarder));
        address newTokenAccessManagerImpl = address(new ATKTokenAccessManagerImplementation(forwarder));
        address newIdentityVerificationModule = address(new SMARTIdentityVerificationComplianceModule(forwarder));

        ATKSystemImplementation systemImplementation = new ATKSystemImplementation(forwarder);
        bytes memory initData = abi.encodeWithSelector(
            systemImplementation.initialize.selector,
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
            address(newIdentityVerificationModule)
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(systemImplementation), initData);
        IATKSystem newSystem = IATKSystem(address(proxy));

        vm.prank(user);
        vm.expectRevert();
        newSystem.bootstrap();
    }

    function test_Bootstrap_AlreadyBootstrapped() public {
        // atkSystem is already bootstrapped in setUp via SystemUtils
        vm.prank(admin);
        vm.expectRevert(abi.encodeWithSelector(SystemAlreadyBootstrapped.selector)); // Should revert when trying to
            // bootstrap again
        atkSystem.bootstrap();
    }

    function test_SetComplianceImplementation() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit IATKSystem.ComplianceImplementationUpdated(admin, address(complianceImpl));

        ATKSystemImplementation(address(atkSystem)).setComplianceImplementation(address(complianceImpl));
        assertEq(ATKSystemImplementation(address(atkSystem)).complianceImplementation(), address(complianceImpl));
    }

    function test_SetComplianceImplementation_OnlyAdmin() public {
        vm.prank(user);
        vm.expectRevert();
        ATKSystemImplementation(address(atkSystem)).setComplianceImplementation(address(complianceImpl));
    }

    function test_SetComplianceImplementation_ZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert();
        ATKSystemImplementation(address(atkSystem)).setComplianceImplementation(address(0));
    }

    function test_SetComplianceImplementation_InvalidInterface() public {
        vm.prank(admin);
        vm.expectRevert();
        ATKSystemImplementation(address(atkSystem)).setComplianceImplementation(address(mockInvalidContract));
    }

    function test_SetIdentityRegistryImplementation() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit IATKSystem.IdentityRegistryImplementationUpdated(admin, address(identityRegistryImpl));

        ATKSystemImplementation(address(atkSystem)).setIdentityRegistryImplementation(address(identityRegistryImpl));
        assertEq(
            ATKSystemImplementation(address(atkSystem)).identityRegistryImplementation(), address(identityRegistryImpl)
        );
    }

    function test_SetIdentityRegistryImplementation_ZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert();
        ATKSystemImplementation(address(atkSystem)).setIdentityRegistryImplementation(address(0));
    }

    function test_SetIdentityRegistryImplementation_InvalidInterface() public {
        vm.prank(admin);
        vm.expectRevert();
        ATKSystemImplementation(address(atkSystem)).setIdentityRegistryImplementation(address(mockInvalidContract));
    }

    function test_SetIdentityRegistryStorageImplementation() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit IATKSystem.IdentityRegistryStorageImplementationUpdated(admin, address(identityRegistryStorageImpl));

        ATKSystemImplementation(address(atkSystem)).setIdentityRegistryStorageImplementation(
            address(identityRegistryStorageImpl)
        );
        assertEq(
            ATKSystemImplementation(address(atkSystem)).identityRegistryStorageImplementation(),
            address(identityRegistryStorageImpl)
        );
    }

    function test_SetTrustedIssuersRegistryImplementation() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit IATKSystem.TrustedIssuersRegistryImplementationUpdated(admin, address(trustedIssuersRegistryImpl));

        ATKSystemImplementation(address(atkSystem)).setTrustedIssuersRegistryImplementation(
            address(trustedIssuersRegistryImpl)
        );
        assertEq(
            ATKSystemImplementation(address(atkSystem)).trustedIssuersRegistryImplementation(),
            address(trustedIssuersRegistryImpl)
        );
    }

    function test_SetIdentityFactoryImplementation() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit IATKSystem.IdentityFactoryImplementationUpdated(admin, address(identityFactoryImpl));

        ATKSystemImplementation(address(atkSystem)).setIdentityFactoryImplementation(address(identityFactoryImpl));
        assertEq(
            ATKSystemImplementation(address(atkSystem)).identityFactoryImplementation(), address(identityFactoryImpl)
        );
    }

    function test_SetIdentityImplementation() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit IATKSystem.IdentityImplementationUpdated(admin, address(identityImpl));

        ATKSystemImplementation(address(atkSystem)).setIdentityImplementation(address(identityImpl));
        assertEq(ATKSystemImplementation(address(atkSystem)).identityImplementation(), address(identityImpl));
    }

    function test_SetTokenIdentityImplementation() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit IATKSystem.TokenIdentityImplementationUpdated(admin, address(tokenIdentityImpl));

        ATKSystemImplementation(address(atkSystem)).setTokenIdentityImplementation(address(tokenIdentityImpl));
        assertEq(ATKSystemImplementation(address(atkSystem)).tokenIdentityImplementation(), address(tokenIdentityImpl));
    }

    function test_SetTokenAccessManagerImplementation() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit IATKSystem.TokenAccessManagerImplementationUpdated(admin, address(tokenAccessManagerImpl));

        ATKSystemImplementation(address(atkSystem)).setTokenAccessManagerImplementation(address(tokenAccessManagerImpl));
        assertEq(
            ATKSystemImplementation(address(atkSystem)).tokenAccessManagerImplementation(),
            address(tokenAccessManagerImpl)
        );
    }

    function test_CreateTokenFactory_OnlyAdmin() public {
        vm.prank(user);
        vm.expectRevert();
        atkSystem.createTokenFactory("TestFactory", address(0x123), address(identityImpl));
    }

    function test_CreateTokenFactory_InvalidFactoryAddress() public {
        vm.prank(admin);
        vm.expectRevert();
        atkSystem.createTokenFactory("TestFactory", address(0), address(identityImpl));
    }

    function test_CreateTokenFactory_InvalidTokenImplementation() public {
        vm.prank(admin);
        vm.expectRevert();
        atkSystem.createTokenFactory("TestFactory", address(0x123), address(0));
    }

    function test_SupportsInterface() public view {
        assertTrue(atkSystem.supportsInterface(type(IATKSystem).interfaceId));
        assertTrue(atkSystem.supportsInterface(type(IERC165).interfaceId));
        assertTrue(atkSystem.supportsInterface(type(IAccessControl).interfaceId));
        assertFalse(atkSystem.supportsInterface(bytes4(0xffffffff)));
    }

    function test_ConstructorWithZeroAddresses() public {
        ATKSystemImplementation systemImplementation = new ATKSystemImplementation(forwarder);

        // Test with zero compliance address
        bytes memory initData1 = abi.encodeWithSelector(
            systemImplementation.initialize.selector,
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
            address(identityVerificationModule)
        );
        vm.expectRevert(abi.encodeWithSelector(ComplianceImplementationNotSet.selector));
        new ERC1967Proxy(address(systemImplementation), initData1);

        // Test with zero identity registry address
        bytes memory initData2 = abi.encodeWithSelector(
            systemImplementation.initialize.selector,
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
            address(identityVerificationModule)
        );
        vm.expectRevert(abi.encodeWithSelector(IdentityRegistryImplementationNotSet.selector));
        new ERC1967Proxy(address(systemImplementation), initData2);
    }

    function test_ConstructorWithInvalidInterfaces() public {
        ATKSystemImplementation systemImplementation = new ATKSystemImplementation(forwarder);
        bytes memory initData = abi.encodeWithSelector(
            systemImplementation.initialize.selector,
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
            address(identityVerificationModule)
        );
        vm.expectRevert(
            abi.encodeWithSelector(
                InvalidImplementationInterface.selector,
                address(mockInvalidContract),
                type(ISMARTCompliance).interfaceId
            )
        );
        new ERC1967Proxy(address(systemImplementation), initData);
    }

    function test_IntegrationWithActualContracts() public view {
        // Test that the system works with actual proxy contracts
        ISMARTCompliance compliance = ISMARTCompliance(atkSystem.complianceProxy());
        ISMARTIdentityRegistry identityRegistry = ISMARTIdentityRegistry(atkSystem.identityRegistryProxy());
        ISMARTIdentityRegistryStorage identityStorage =
            ISMARTIdentityRegistryStorage(atkSystem.identityRegistryStorageProxy());
        IERC3643TrustedIssuersRegistry trustedIssuers =
            IERC3643TrustedIssuersRegistry(atkSystem.trustedIssuersRegistryProxy());
        ISMARTTopicSchemeRegistry topicSchemeRegistry = ISMARTTopicSchemeRegistry(atkSystem.topicSchemeRegistryProxy());
        IATKIdentityFactory identityFactory = IATKIdentityFactory(atkSystem.identityFactoryProxy());

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
        assertTrue(IERC165(address(identityFactory)).supportsInterface(type(IATKIdentityFactory).interfaceId));
    }

    function test_UpdateImplementationFlow() public {
        // Test a complete flow of updating an implementation
        address oldImpl = atkSystem.complianceImplementation();

        // Deploy new implementation
        ATKComplianceImplementation newImpl = new ATKComplianceImplementation(forwarder);

        vm.prank(admin);
        ATKSystemImplementation(address(atkSystem)).setComplianceImplementation(address(newImpl));

        assertEq(atkSystem.complianceImplementation(), address(newImpl));
        assertTrue(atkSystem.complianceImplementation() != oldImpl);
    }

    function test_AllSetterFunctionsWithActualImplementations() public {
        vm.startPrank(admin);

        // Test all implementation setters with actual implementations
        ATKSystemImplementation(address(atkSystem)).setComplianceImplementation(address(complianceImpl));
        ATKSystemImplementation(address(atkSystem)).setIdentityRegistryImplementation(address(identityRegistryImpl));
        ATKSystemImplementation(address(atkSystem)).setIdentityRegistryStorageImplementation(
            address(identityRegistryStorageImpl)
        );
        ATKSystemImplementation(address(atkSystem)).setTrustedIssuersRegistryImplementation(
            address(trustedIssuersRegistryImpl)
        );
        ATKSystemImplementation(address(atkSystem)).setTopicSchemeRegistryImplementation(
            address(topicSchemeRegistryImpl)
        );
        ATKSystemImplementation(address(atkSystem)).setIdentityFactoryImplementation(address(identityFactoryImpl));
        ATKSystemImplementation(address(atkSystem)).setIdentityImplementation(address(identityImpl));
        ATKSystemImplementation(address(atkSystem)).setTokenIdentityImplementation(address(tokenIdentityImpl));
        ATKSystemImplementation(address(atkSystem)).setTokenAccessManagerImplementation(address(tokenAccessManagerImpl));

        // Verify all implementations are set correctly
        assertEq(atkSystem.complianceImplementation(), address(complianceImpl));
        assertEq(atkSystem.identityRegistryImplementation(), address(identityRegistryImpl));
        assertEq(atkSystem.identityRegistryStorageImplementation(), address(identityRegistryStorageImpl));
        assertEq(atkSystem.trustedIssuersRegistryImplementation(), address(trustedIssuersRegistryImpl));
        assertEq(atkSystem.topicSchemeRegistryImplementation(), address(topicSchemeRegistryImpl));
        assertEq(atkSystem.identityFactoryImplementation(), address(identityFactoryImpl));
        assertEq(atkSystem.identityImplementation(), address(identityImpl));
        assertEq(atkSystem.tokenIdentityImplementation(), address(tokenIdentityImpl));
        assertEq(atkSystem.tokenAccessManagerImplementation(), address(tokenAccessManagerImpl));

        vm.stopPrank();
    }

    function test_SetTopicSchemeRegistryImplementation() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit IATKSystem.TopicSchemeRegistryImplementationUpdated(admin, address(topicSchemeRegistryImpl));

        ATKSystemImplementation(address(atkSystem)).setTopicSchemeRegistryImplementation(
            address(topicSchemeRegistryImpl)
        );
        assertEq(atkSystem.topicSchemeRegistryImplementation(), address(topicSchemeRegistryImpl));
    }

    function test_SetTopicSchemeRegistryImplementation_OnlyAdmin() public {
        vm.prank(user);
        vm.expectRevert();
        ATKSystemImplementation(address(atkSystem)).setTopicSchemeRegistryImplementation(
            address(topicSchemeRegistryImpl)
        );
    }

    function test_SetTopicSchemeRegistryImplementation_ZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert();
        ATKSystemImplementation(address(atkSystem)).setTopicSchemeRegistryImplementation(address(0));
    }

    function test_SetTopicSchemeRegistryImplementation_InvalidInterface() public {
        vm.prank(admin);
        vm.expectRevert();
        ATKSystemImplementation(address(atkSystem)).setTopicSchemeRegistryImplementation(address(mockInvalidContract));
    }

    // --- Identity Verification Module Tests ---

    function test_IdentityVerificationModule_InitialState() public view {
        // Verify identity verification module is properly set during initialization
        address moduleAddress = atkSystem.identityVerificationModule();
        assertTrue(moduleAddress != address(0));
        assertEq(moduleAddress, address(systemUtils.identityVerificationModule()));
    }

    function test_IdentityVerificationModule_GetterFunction() public view {
        // Test the getter function returns the correct address
        address expected = address(systemUtils.identityVerificationModule());
        address actual = atkSystem.identityVerificationModule();
        assertEq(actual, expected);
    }

    function test_Constructor_IdentityVerificationModule_ZeroAddress() public {
        ATKSystemImplementation systemImplementation = new ATKSystemImplementation(forwarder);
        // Test constructor reverts with zero address for identity verification module
        bytes memory initData = abi.encodeWithSelector(
            systemImplementation.initialize.selector,
            admin,
            address(complianceImpl),
            address(identityRegistryImpl),
            address(identityRegistryStorageImpl),
            address(trustedIssuersRegistryImpl),
            address(topicSchemeRegistryImpl),
            address(identityFactoryImpl),
            address(identityImpl),
            address(tokenIdentityImpl),
            address(tokenAccessManagerImpl),
            address(0) // Zero address for identity verification module
        );
        vm.expectRevert(abi.encodeWithSelector(IdentityVerificationModuleNotSet.selector));
        new ERC1967Proxy(address(systemImplementation), initData);
    }

    function test_Constructor_IdentityVerificationModule_ValidAddress() public {
        // Test constructor succeeds with valid identity verification module address
        SMARTIdentityVerificationComplianceModule newModule = new SMARTIdentityVerificationComplianceModule(forwarder);
        ATKSystemImplementation systemImplementation = new ATKSystemImplementation(forwarder);

        bytes memory initData = abi.encodeWithSelector(
            systemImplementation.initialize.selector,
            admin,
            address(complianceImpl),
            address(identityRegistryImpl),
            address(identityRegistryStorageImpl),
            address(trustedIssuersRegistryImpl),
            address(topicSchemeRegistryImpl),
            address(identityFactoryImpl),
            address(identityImpl),
            address(tokenIdentityImpl),
            address(tokenAccessManagerImpl),
            address(newModule)
        );

        ERC1967Proxy proxy = new ERC1967Proxy(address(systemImplementation), initData);
        IATKSystem newSystem = IATKSystem(address(proxy));

        assertEq(newSystem.identityVerificationModule(), address(newModule));
    }

    function test_IdentityVerificationModule_UsedInBootstrap() public {
        // Create a new system that hasn't been bootstrapped yet to test bootstrap functionality
        address newComplianceImpl = address(new ATKComplianceImplementation(forwarder));
        address newIdentityRegistryImpl = address(new ATKIdentityRegistryImplementation(forwarder));
        address newIdentityStorageImpl = address(new ATKIdentityRegistryStorageImplementation(forwarder));
        address newTrustedIssuersImpl = address(new ATKTrustedIssuersRegistryImplementation(forwarder));
        address newTopicSchemeRegistryImpl = address(new ATKTopicSchemeRegistryImplementation(forwarder));
        address newIdentityFactoryImpl = address(new ATKIdentityFactoryImplementation(forwarder));
        address newIdentityImplAddr = address(new ATKIdentityImplementation(forwarder));
        address newTokenIdentityImpl = address(new ATKTokenIdentityImplementation(forwarder));
        address newTokenAccessManagerImpl = address(new ATKTokenAccessManagerImplementation(forwarder));
        SMARTIdentityVerificationComplianceModule newModule = new SMARTIdentityVerificationComplianceModule(forwarder);

        ATKSystemImplementation systemImplementation = new ATKSystemImplementation(forwarder);
        bytes memory initData = abi.encodeWithSelector(
            systemImplementation.initialize.selector,
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
            address(newModule)
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(systemImplementation), initData);
        IATKSystem newSystem = IATKSystem(address(proxy));

        // Verify module is set before bootstrap
        assertEq(newSystem.identityVerificationModule(), address(newModule));

        // Bootstrap the system
        vm.prank(admin);
        newSystem.bootstrap();

        // Verify module is still accessible after bootstrap
        assertEq(newSystem.identityVerificationModule(), address(newModule));
    }

    function test_IdentityVerificationModule_ConsistencyAcrossSystemOperations() public {
        // Test that the identity verification module address remains consistent
        // across different system operations

        address initialModuleAddress = atkSystem.identityVerificationModule();

        // Perform various system operations
        vm.startPrank(admin);

        // Update some implementations
        ATKSystemImplementation(address(atkSystem)).setComplianceImplementation(address(complianceImpl));
        ATKSystemImplementation(address(atkSystem)).setIdentityRegistryImplementation(address(identityRegistryImpl));

        vm.stopPrank();

        // Verify identity verification module address hasn't changed
        assertEq(atkSystem.identityVerificationModule(), initialModuleAddress);
        assertEq(atkSystem.identityVerificationModule(), address(systemUtils.identityVerificationModule()));
    }

    function test_ConstructorWithAllValidParameters_IncludingIdentityVerificationModule() public {
        // Test constructor with all valid parameters including identity verification module
        SMARTIdentityVerificationComplianceModule newModule = new SMARTIdentityVerificationComplianceModule(forwarder);
        ATKSystemImplementation systemImplementation = new ATKSystemImplementation(forwarder);

        address newComplianceImpl = address(new ATKComplianceImplementation(forwarder));
        address newIdentityRegistryImpl = address(new ATKIdentityRegistryImplementation(forwarder));
        address newIdentityRegistryStorageImpl = address(new ATKIdentityRegistryStorageImplementation(forwarder));
        address newTrustedIssuersRegistryImpl = address(new ATKTrustedIssuersRegistryImplementation(forwarder));
        address newTopicSchemeRegistryImpl = address(new ATKTopicSchemeRegistryImplementation(forwarder));
        address newIdentityFactoryImpl = address(new ATKIdentityFactoryImplementation(forwarder));
        address newIdentityImpl = address(new ATKIdentityImplementation(forwarder));
        address newTokenIdentityImpl = address(new ATKTokenIdentityImplementation(forwarder));
        address newTokenAccessManagerImpl = address(new ATKTokenAccessManagerImplementation(forwarder));

        bytes memory initData = abi.encodeWithSelector(
            systemImplementation.initialize.selector,
            admin,
            newComplianceImpl,
            newIdentityRegistryImpl,
            newIdentityRegistryStorageImpl,
            newTrustedIssuersRegistryImpl,
            newTopicSchemeRegistryImpl,
            newIdentityFactoryImpl,
            newIdentityImpl,
            newTokenIdentityImpl,
            newTokenAccessManagerImpl,
            address(newModule)
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(systemImplementation), initData);
        IATKSystem newSystem = IATKSystem(address(proxy));

        // Verify all components are properly set including identity verification module
        assertTrue(newSystem.complianceImplementation() != address(0));
        assertTrue(newSystem.identityRegistryImplementation() != address(0));
        assertTrue(newSystem.identityRegistryStorageImplementation() != address(0));
        assertTrue(newSystem.trustedIssuersRegistryImplementation() != address(0));
        assertTrue(newSystem.topicSchemeRegistryImplementation() != address(0));
        assertTrue(newSystem.identityFactoryImplementation() != address(0));
        assertTrue(newSystem.identityImplementation() != address(0));
        assertTrue(newSystem.tokenIdentityImplementation() != address(0));
        assertTrue(newSystem.tokenAccessManagerImplementation() != address(0));
        assertEq(newSystem.identityVerificationModule(), address(newModule));
    }
}
