// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { ATKSystemImplementation } from "../../contracts/system/ATKSystemImplementation.sol";
import { IATKSystem } from "../../contracts/system/IATKSystem.sol";
import { ATKPeopleRoles } from "../../contracts/system/ATKPeopleRoles.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

// Import SystemUtils for proper setup
import { SystemUtils } from "../utils/SystemUtils.sol";

// Import required interfaces
import { ISMARTCompliance } from "../../contracts/smart/interface/ISMARTCompliance.sol";
import { IATKIdentityFactory } from "../../contracts/system/identity-factory/IATKIdentityFactory.sol";
import { ISMARTTrustedIssuersRegistry } from "../../contracts/smart/interface/ISMARTTrustedIssuersRegistry.sol";
import { ISMARTIdentityRegistryStorage } from "../../contracts/smart/interface/ISMARTIdentityRegistryStorage.sol";
import { ISMARTIdentityRegistry } from "../../contracts/smart/interface/ISMARTIdentityRegistry.sol";
import { ISMARTTopicSchemeRegistry } from "../../contracts/smart/interface/ISMARTTopicSchemeRegistry.sol";
import { IATKTypedImplementationRegistry } from "../../contracts/system/IATKTypedImplementationRegistry.sol";
import { IATKCompliance } from "../../contracts/system/compliance/IATKCompliance.sol";
import { IATKSystemAccessManaged } from "../../contracts/system/access-manager/IATKSystemAccessManaged.sol";
import { ATKRoles } from "../../contracts/system/ATKRoles.sol";
import { ATKSystemRoles } from "../../contracts/system/ATKSystemRoles.sol";
import { ATKTopics } from "../../contracts/system/ATKTopics.sol";
import { IContractWithIdentity } from "../../contracts/system/identity-factory/IContractWithIdentity.sol";
import { MockedIdentity } from "../utils/mocks/MockedIdentity.sol";
import { SMARTComplianceModuleParamPair } from "../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { IATKSystemFactory } from "../../contracts/system/IATKSystemFactory.sol";

// Import system errors
import {
    SystemAlreadyBootstrapped,
    ComplianceImplementationNotSet,
    IdentityRegistryImplementationNotSet,
    InvalidImplementationInterface,
    InvalidTargetIdentity
} from "../../contracts/system/ATKSystemErrors.sol";

// Import actual implementations
import { ATKComplianceImplementation } from "../../contracts/system/compliance/ATKComplianceImplementation.sol";
import { ATKIdentityRegistryImplementation } from
    "../../contracts/system/identity-registry/ATKIdentityRegistryImplementation.sol";
import { ATKIdentityRegistryStorageImplementation } from
    "../../contracts/system/identity-registry-storage/ATKIdentityRegistryStorageImplementation.sol";
import { ATKSystemTrustedIssuersRegistryImplementation } from
    "../../contracts/system/trusted-issuers-registry/ATKSystemTrustedIssuersRegistryImplementation.sol";
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
import { ATKTopicSchemeRegistryImplementation } from
    "../../contracts/system/topic-scheme-registry/ATKTopicSchemeRegistryImplementation.sol";
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

// Mock contracts for testing edge cases that require invalid contracts
contract MockInvalidContract {
// This contract doesn't implement IERC165
}

// Struct to group implementation addresses to avoid stack too deep errors
struct SystemImplementations {
    address compliance;
    address identityRegistry;
    address identityRegistryStorage;
    address trustedIssuersRegistry;
    address topicSchemeRegistry;
    address identityFactory;
    address identity;
    address contractIdentity;
    address tokenAccessManager;
    address identityVerificationModule;
    address tokenFactoryRegistry;
    address complianceModuleRegistry;
    address addonRegistry;
    address systemAccessManager;
}

contract ATKSystemTest is Test {
    // --- Module Type Hashes ---
    bytes32 internal constant COMPLIANCE = keccak256("COMPLIANCE");
    bytes32 internal constant IDENTITY_REGISTRY = keccak256("IDENTITY_REGISTRY");
    bytes32 internal constant IDENTITY_REGISTRY_STORAGE = keccak256("IDENTITY_REGISTRY_STORAGE");
    bytes32 internal constant SYSTEM_TRUSTED_ISSUERS_REGISTRY = keccak256("SYSTEM_TRUSTED_ISSUERS_REGISTRY");
    bytes32 internal constant TRUSTED_ISSUERS_META_REGISTRY = keccak256("TRUSTED_ISSUERS_META_REGISTRY");
    bytes32 internal constant TOPIC_SCHEME_REGISTRY = keccak256("TOPIC_SCHEME_REGISTRY");
    bytes32 internal constant IDENTITY_FACTORY = keccak256("IDENTITY_FACTORY");
    bytes32 internal constant TOKEN_ACCESS_MANAGER = keccak256("TOKEN_ACCESS_MANAGER");
    bytes32 internal constant IDENTITY = keccak256("IDENTITY");
    bytes32 internal constant CONTRACT_IDENTITY = keccak256("CONTRACT_IDENTITY");
    bytes32 internal constant COMPLIANCE_MODULE_REGISTRY = keccak256("COMPLIANCE_MODULE_REGISTRY");
    bytes32 internal constant ADDON_REGISTRY = keccak256("ADDON_REGISTRY");
    bytes32 internal constant TOKEN_FACTORY_REGISTRY = keccak256("TOKEN_FACTORY_REGISTRY");

    SystemUtils public systemUtils;
    IATKSystem public atkSystem;

    address public admin = address(0x1);
    address public user = address(0x2);
    MockInvalidContract public mockInvalidContract;

    // Actual implementation instances (created lazily)
    ATKComplianceImplementation public complianceImpl;
    ATKIdentityRegistryImplementation public identityRegistryImpl;
    ATKIdentityRegistryStorageImplementation public identityRegistryStorageImpl;
    ATKSystemTrustedIssuersRegistryImplementation public trustedIssuersRegistryImpl;
    ATKTrustedIssuersMetaRegistryImplementation public trustedIssuersMetaRegistryImpl;
    ATKTopicSchemeRegistryImplementation public topicSchemeRegistryImpl;
    ATKIdentityFactoryImplementation public identityFactoryImpl;
    ATKIdentityImplementation public identityImpl;
    ATKContractIdentityImplementation public contractIdentityImpl;
    ATKTokenAccessManagerImplementation public tokenAccessManagerImpl;
    SMARTIdentityVerificationComplianceModule public identityVerificationModule;
    ATKTokenFactoryRegistryImplementation public tokenFactoryRegistryImpl;
    ATKComplianceModuleRegistryImplementation public complianceModuleRegistryImpl;
    ATKSystemAddonRegistryImplementation public addonRegistryImpl;

    address public forwarder = address(0x5);

    function setUp() public {
        systemUtils = new SystemUtils(admin);
        atkSystem = IATKSystem(address(systemUtils.system()));
        mockInvalidContract = new MockInvalidContract();

        // All implementations created lazily to minimize setup complexity
    }

    // Helper functions to create implementations lazily when needed
    function _getComplianceImpl() internal returns (ATKComplianceImplementation) {
        if (address(complianceImpl) == address(0)) {
            complianceImpl = new ATKComplianceImplementation(forwarder);
        }
        return complianceImpl;
    }

    function _getIdentityRegistryImpl() internal returns (ATKIdentityRegistryImplementation) {
        if (address(identityRegistryImpl) == address(0)) {
            identityRegistryImpl = new ATKIdentityRegistryImplementation(forwarder);
        }
        return identityRegistryImpl;
    }

    function _getIdentityFactoryImpl() internal returns (ATKIdentityFactoryImplementation) {
        if (address(identityFactoryImpl) == address(0)) {
            identityFactoryImpl = new ATKIdentityFactoryImplementation(forwarder);
        }
        return identityFactoryImpl;
    }

    function _getIdentityImpl() internal returns (ATKIdentityImplementation) {
        if (address(identityImpl) == address(0)) {
            identityImpl = new ATKIdentityImplementation(forwarder);
        }
        return identityImpl;
    }

    function _getContractIdentityImpl() internal returns (ATKContractIdentityImplementation) {
        if (address(contractIdentityImpl) == address(0)) {
            contractIdentityImpl = new ATKContractIdentityImplementation(forwarder);
        }
        return contractIdentityImpl;
    }

    // Helper functions to create remaining implementations lazily when needed
    function _getIdentityRegistryStorageImpl() internal returns (ATKIdentityRegistryStorageImplementation) {
        if (address(identityRegistryStorageImpl) == address(0)) {
            identityRegistryStorageImpl = new ATKIdentityRegistryStorageImplementation(forwarder);
        }
        return identityRegistryStorageImpl;
    }

    function _getTrustedIssuersRegistryImpl() internal returns (ATKSystemTrustedIssuersRegistryImplementation) {
        if (address(trustedIssuersRegistryImpl) == address(0)) {
            trustedIssuersRegistryImpl = new ATKSystemTrustedIssuersRegistryImplementation(forwarder);
        }
        return trustedIssuersRegistryImpl;
    }

    function _getTrustedIssuersMetaRegistryImpl() internal returns (ATKTrustedIssuersMetaRegistryImplementation) {
        if (address(trustedIssuersMetaRegistryImpl) == address(0)) {
            trustedIssuersMetaRegistryImpl = new ATKTrustedIssuersMetaRegistryImplementation(forwarder);
        }
        return trustedIssuersMetaRegistryImpl;
    }

    function _getTopicSchemeRegistryImpl() internal returns (ATKTopicSchemeRegistryImplementation) {
        if (address(topicSchemeRegistryImpl) == address(0)) {
            topicSchemeRegistryImpl = new ATKTopicSchemeRegistryImplementation(forwarder);
        }
        return topicSchemeRegistryImpl;
    }

    function _getTokenAccessManagerImpl() internal returns (ATKTokenAccessManagerImplementation) {
        if (address(tokenAccessManagerImpl) == address(0)) {
            tokenAccessManagerImpl = new ATKTokenAccessManagerImplementation(forwarder);
        }
        return tokenAccessManagerImpl;
    }

    function _getIdentityVerificationModule() internal returns (SMARTIdentityVerificationComplianceModule) {
        if (address(identityVerificationModule) == address(0)) {
            identityVerificationModule = new SMARTIdentityVerificationComplianceModule(forwarder);
        }
        return identityVerificationModule;
    }

    // Helper function to create all implementations to avoid stack too deep errors
    function _createAllImplementations() internal returns (SystemImplementations memory) {
        return SystemImplementations({
            compliance: address(new ATKComplianceImplementation(forwarder)),
            identityRegistry: address(new ATKIdentityRegistryImplementation(forwarder)),
            identityRegistryStorage: address(new ATKIdentityRegistryStorageImplementation(forwarder)),
            trustedIssuersRegistry: address(new ATKSystemTrustedIssuersRegistryImplementation(forwarder)),
            topicSchemeRegistry: address(new ATKTopicSchemeRegistryImplementation(forwarder)),
            identityFactory: address(new ATKIdentityFactoryImplementation(forwarder)),
            identity: address(new ATKIdentityImplementation(forwarder)),
            contractIdentity: address(new ATKContractIdentityImplementation(forwarder)),
            tokenAccessManager: address(new ATKTokenAccessManagerImplementation(forwarder)),
            identityVerificationModule: address(new SMARTIdentityVerificationComplianceModule(forwarder)),
            tokenFactoryRegistry: address(new ATKTokenFactoryRegistryImplementation(forwarder)),
            complianceModuleRegistry: address(new ATKComplianceModuleRegistryImplementation(forwarder)),
            addonRegistry: address(new ATKSystemAddonRegistryImplementation(forwarder)),
            systemAccessManager: address(new ATKSystemAccessManagerImplementation(forwarder))
        });
    }

    // Helper function to create a system with given implementations
    function _createSystemWithImplementations(SystemImplementations memory impls) internal returns (IATKSystem) {
        ATKSystemImplementation systemImplementation = new ATKSystemImplementation(forwarder);
        IATKSystem.SystemInitImplementations memory initImpls = IATKSystem.SystemInitImplementations({
            complianceImplementation: impls.compliance,
            identityRegistryImplementation: impls.identityRegistry,
            identityRegistryStorageImplementation: impls.identityRegistryStorage,
            trustedIssuersRegistryImplementation: impls.trustedIssuersRegistry,
            trustedIssuersMetaRegistryImplementation: address(new ATKTrustedIssuersMetaRegistryImplementation(forwarder)),
            topicSchemeRegistryImplementation: impls.topicSchemeRegistry,
            identityFactoryImplementation: impls.identityFactory,
            identityImplementation: impls.identity,
            contractIdentityImplementation: impls.contractIdentity,
            tokenAccessManagerImplementation: impls.tokenAccessManager,
            tokenFactoryRegistryImplementation: impls.tokenFactoryRegistry,
            complianceModuleRegistryImplementation: impls.complianceModuleRegistry,
            addonRegistryImplementation: impls.addonRegistry,
            identityVerificationComplianceModule: impls.identityVerificationModule
        });
        bytes memory initData = abi.encodeWithSelector(
            systemImplementation.initialize.selector, admin, impls.systemAccessManager, initImpls
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(systemImplementation), initData);
        return IATKSystem(address(proxy));
    }

    function test_InitialState() public view {
        // Check that implementation addresses are set
        assertTrue(IATKTypedImplementationRegistry(address(atkSystem)).implementation(COMPLIANCE) != address(0));
        assertTrue(IATKTypedImplementationRegistry(address(atkSystem)).implementation(IDENTITY_REGISTRY) != address(0));
        assertTrue(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(IDENTITY_REGISTRY_STORAGE) != address(0)
        );
        assertTrue(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(SYSTEM_TRUSTED_ISSUERS_REGISTRY)
                != address(0)
        );
        assertTrue(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(TRUSTED_ISSUERS_META_REGISTRY)
                != address(0)
        );
        assertTrue(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(TOPIC_SCHEME_REGISTRY) != address(0)
        );
        assertTrue(IATKTypedImplementationRegistry(address(atkSystem)).implementation(IDENTITY_FACTORY) != address(0));
        assertTrue(IATKTypedImplementationRegistry(address(atkSystem)).implementation(IDENTITY) != address(0));
        assertTrue(IATKTypedImplementationRegistry(address(atkSystem)).implementation(CONTRACT_IDENTITY) != address(0));
        assertTrue(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(TOKEN_ACCESS_MANAGER) != address(0)
        );

        // Proxy addresses should be set (system is already bootstrapped)
        assertTrue(atkSystem.compliance() != address(0));
        assertTrue(atkSystem.identityRegistry() != address(0));
        assertTrue(atkSystem.identityRegistryStorage() != address(0));
        assertTrue(atkSystem.trustedIssuersRegistry() != address(0));
        assertTrue(atkSystem.topicSchemeRegistry() != address(0));
        assertTrue(atkSystem.identityFactory() != address(0));

        // Compliance module should be set via compliance module registry

        // Admin should have default admin role
        assertTrue(IATKSystemAccessManaged(address(atkSystem)).hasSystemRole(ATKRoles.DEFAULT_ADMIN_ROLE, admin));
    }

    function test_SetComplianceImplementation_OnlyAdmin_AccessControl() public {
        // Test that only admin can perform system operations
        // Verifies access control for setting compliance implementation
        ATKComplianceImplementation impl = _getComplianceImpl();
        vm.prank(user);
        vm.expectRevert();
        // Try to set an implementation as non-admin - should revert
        ATKSystemImplementation(address(atkSystem)).setComplianceImplementation(address(impl));
    }

    function test_Bootstrap_AlreadyBootstrapped() public {
        // atkSystem is already bootstrapped in setUp via SystemUtils
        vm.prank(admin);
        vm.expectRevert(abi.encodeWithSelector(SystemAlreadyBootstrapped.selector)); // Should revert when trying to
            // bootstrap again
        atkSystem.bootstrap();
    }

    function test_Bootstrap_RoleVerification() public {
        // Test role verification after bootstrap
        // Since the system is already bootstrapped in setUp

        // Verify admin has DEFAULT_ADMIN_ROLE (should be granted during initialization)
        assertTrue(systemUtils.systemAccessManager().hasRole(ATKRoles.DEFAULT_ADMIN_ROLE, admin));
        assertTrue(systemUtils.systemAccessManager().hasRole(ATKPeopleRoles.SYSTEM_MANAGER_ROLE, admin));

        // Verify user does not have DEFAULT_ADMIN_ROLE
        assertFalse(systemUtils.systemAccessManager().hasRole(ATKRoles.DEFAULT_ADMIN_ROLE, user));
        assertFalse(systemUtils.systemAccessManager().hasRole(ATKPeopleRoles.SYSTEM_MANAGER_ROLE, user));

        // Since the system is already bootstrapped, calling bootstrap should revert with SystemAlreadyBootstrapped
        vm.prank(admin);
        vm.expectRevert(SystemAlreadyBootstrapped.selector);
        atkSystem.bootstrap();

        // Also test with non-admin user
        vm.prank(user);
        vm.expectRevert(); // Should revert due to lack of permissions or already bootstrapped
        atkSystem.bootstrap();
    }

    function test_SetComplianceImplementation() public {
        ATKComplianceImplementation impl = _getComplianceImpl();
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit IATKSystem.ComplianceImplementationUpdated(admin, address(impl));

        ATKSystemImplementation(address(atkSystem)).setComplianceImplementation(address(impl));
        assertEq(IATKTypedImplementationRegistry(address(atkSystem)).implementation(COMPLIANCE), address(impl));
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
        ATKIdentityRegistryImplementation impl = _getIdentityRegistryImpl();
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit IATKSystem.IdentityRegistryImplementationUpdated(admin, address(impl));

        ATKSystemImplementation(address(atkSystem)).setIdentityRegistryImplementation(address(impl));
        assertEq(IATKTypedImplementationRegistry(address(atkSystem)).implementation(IDENTITY_REGISTRY), address(impl));
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
        ATKIdentityRegistryStorageImplementation impl = _getIdentityRegistryStorageImpl();
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit IATKSystem.IdentityRegistryStorageImplementationUpdated(admin, address(impl));

        ATKSystemImplementation(address(atkSystem)).setIdentityRegistryStorageImplementation(address(impl));
        assertEq(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(IDENTITY_REGISTRY_STORAGE), address(impl)
        );
    }

    function test_SetTrustedIssuersRegistryImplementation() public {
        ATKSystemTrustedIssuersRegistryImplementation impl = _getTrustedIssuersRegistryImpl();
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit IATKSystem.SystemTrustedIssuersRegistryImplementationUpdated(admin, address(impl));

        ATKSystemImplementation(address(atkSystem)).setSystemTrustedIssuersRegistryImplementation(address(impl));
        assertEq(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(SYSTEM_TRUSTED_ISSUERS_REGISTRY),
            address(impl)
        );
    }

    function test_SetIdentityFactoryImplementation() public {
        ATKIdentityFactoryImplementation impl = _getIdentityFactoryImpl();
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit IATKSystem.IdentityFactoryImplementationUpdated(admin, address(impl));

        ATKSystemImplementation(address(atkSystem)).setIdentityFactoryImplementation(address(impl));
        assertEq(IATKTypedImplementationRegistry(address(atkSystem)).implementation(IDENTITY_FACTORY), address(impl));
    }

    function test_SetIdentityImplementation() public {
        ATKIdentityImplementation impl = _getIdentityImpl();
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit IATKSystem.IdentityImplementationUpdated(admin, address(impl));

        ATKSystemImplementation(address(atkSystem)).setIdentityImplementation(address(impl));
        assertEq(IATKTypedImplementationRegistry(address(atkSystem)).implementation(IDENTITY), address(impl));
    }

    function test_SetContractIdentityImplementation() public {
        ATKContractIdentityImplementation impl = _getContractIdentityImpl();
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit IATKSystem.ContractIdentityImplementationUpdated(admin, address(impl));

        ATKSystemImplementation(address(atkSystem)).setContractIdentityImplementation(address(impl));
        assertEq(IATKTypedImplementationRegistry(address(atkSystem)).implementation(CONTRACT_IDENTITY), address(impl));
    }

    function test_SetTokenAccessManagerImplementation() public {
        ATKTokenAccessManagerImplementation impl = _getTokenAccessManagerImpl();
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit IATKSystem.TokenAccessManagerImplementationUpdated(admin, address(impl));

        ATKSystemImplementation(address(atkSystem)).setTokenAccessManagerImplementation(address(impl));
        assertEq(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(TOKEN_ACCESS_MANAGER), address(impl)
        );
    }

    function test_SupportsInterface() public view {
        assertTrue(atkSystem.supportsInterface(type(IATKSystem).interfaceId));
        assertTrue(atkSystem.supportsInterface(type(IERC165).interfaceId));
        assertTrue(atkSystem.supportsInterface(type(IATKSystemAccessManaged).interfaceId));
        assertFalse(atkSystem.supportsInterface(bytes4(0xffffffff)));
    }

    function test_ConstructorWithZeroAddresses() public {
        ATKSystemImplementation systemImplementation = new ATKSystemImplementation(forwarder);
        SystemImplementations memory impls = _createAllImplementations();

        // Test with zero compliance address
        impls.compliance = address(0);
        bytes memory initData1 = abi.encodeWithSelector(
            systemImplementation.initialize.selector,
            admin,
            impls.systemAccessManager,
            IATKSystem.SystemInitImplementations({
                complianceImplementation: impls.compliance,
                identityRegistryImplementation: impls.identityRegistry,
                identityRegistryStorageImplementation: impls.identityRegistryStorage,
                trustedIssuersRegistryImplementation: impls.trustedIssuersRegistry,
                trustedIssuersMetaRegistryImplementation: address(new ATKTrustedIssuersMetaRegistryImplementation(forwarder)),
                topicSchemeRegistryImplementation: impls.topicSchemeRegistry,
                identityFactoryImplementation: impls.identityFactory,
                identityImplementation: impls.identity,
                contractIdentityImplementation: impls.contractIdentity,
                tokenAccessManagerImplementation: impls.tokenAccessManager,
                tokenFactoryRegistryImplementation: impls.tokenFactoryRegistry,
                complianceModuleRegistryImplementation: impls.complianceModuleRegistry,
                addonRegistryImplementation: impls.addonRegistry,
                identityVerificationComplianceModule: impls.identityVerificationModule
            })
        );
        vm.expectRevert(abi.encodeWithSelector(ComplianceImplementationNotSet.selector));
        new ERC1967Proxy(address(systemImplementation), initData1);

        // Reset compliance and test with zero identity registry address
        impls.compliance = address(new ATKComplianceImplementation(forwarder));
        impls.identityRegistry = address(0);
        bytes memory initData2 = abi.encodeWithSelector(
            systemImplementation.initialize.selector,
            admin,
            impls.systemAccessManager,
            IATKSystem.SystemInitImplementations({
                complianceImplementation: impls.compliance,
                identityRegistryImplementation: impls.identityRegistry,
                identityRegistryStorageImplementation: impls.identityRegistryStorage,
                trustedIssuersRegistryImplementation: impls.trustedIssuersRegistry,
                trustedIssuersMetaRegistryImplementation: address(new ATKTrustedIssuersMetaRegistryImplementation(forwarder)),
                topicSchemeRegistryImplementation: impls.topicSchemeRegistry,
                identityFactoryImplementation: impls.identityFactory,
                identityImplementation: impls.identity,
                contractIdentityImplementation: impls.contractIdentity,
                tokenAccessManagerImplementation: impls.tokenAccessManager,
                tokenFactoryRegistryImplementation: impls.tokenFactoryRegistry,
                complianceModuleRegistryImplementation: impls.complianceModuleRegistry,
                addonRegistryImplementation: impls.addonRegistry,
                identityVerificationComplianceModule: impls.identityVerificationModule
            })
        );
        vm.expectRevert(abi.encodeWithSelector(IdentityRegistryImplementationNotSet.selector));
        new ERC1967Proxy(address(systemImplementation), initData2);
    }

    function test_ConstructorWithInvalidInterfaces() public {
        ATKSystemImplementation systemImplementation = new ATKSystemImplementation(forwarder);
        SystemImplementations memory impls = _createAllImplementations();
        impls.compliance = address(mockInvalidContract); // Invalid compliance

        bytes memory initData = abi.encodeWithSelector(
            systemImplementation.initialize.selector,
            admin,
            impls.systemAccessManager,
            IATKSystem.SystemInitImplementations({
                complianceImplementation: impls.compliance,
                identityRegistryImplementation: impls.identityRegistry,
                identityRegistryStorageImplementation: impls.identityRegistryStorage,
                trustedIssuersRegistryImplementation: impls.trustedIssuersRegistry,
                trustedIssuersMetaRegistryImplementation: address(new ATKTrustedIssuersMetaRegistryImplementation(forwarder)),
                topicSchemeRegistryImplementation: impls.topicSchemeRegistry,
                identityFactoryImplementation: impls.identityFactory,
                identityImplementation: impls.identity,
                contractIdentityImplementation: impls.contractIdentity,
                tokenAccessManagerImplementation: impls.tokenAccessManager,
                tokenFactoryRegistryImplementation: impls.tokenFactoryRegistry,
                complianceModuleRegistryImplementation: impls.complianceModuleRegistry,
                addonRegistryImplementation: impls.addonRegistry,
                identityVerificationComplianceModule: impls.identityVerificationModule
            })
        );
        vm.expectRevert(
            abi.encodeWithSelector(
                InvalidImplementationInterface.selector, address(mockInvalidContract), type(IATKCompliance).interfaceId
            )
        );
        new ERC1967Proxy(address(systemImplementation), initData);
    }

    function test_IntegrationWithActualContracts() public view {
        // Test that the system works with actual proxy contracts
        ISMARTCompliance compliance = ISMARTCompliance(atkSystem.compliance());
        ISMARTIdentityRegistry identityRegistry = ISMARTIdentityRegistry(atkSystem.identityRegistry());
        ISMARTIdentityRegistryStorage identityStorage =
            ISMARTIdentityRegistryStorage(atkSystem.identityRegistryStorage());
        ISMARTTrustedIssuersRegistry trustedIssuers = ISMARTTrustedIssuersRegistry(atkSystem.trustedIssuersRegistry());
        ISMARTTopicSchemeRegistry topicSchemeRegistry = ISMARTTopicSchemeRegistry(atkSystem.topicSchemeRegistry());
        IATKIdentityFactory identityFactory = IATKIdentityFactory(atkSystem.identityFactory());

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
        assertTrue(IERC165(address(trustedIssuers)).supportsInterface(type(ISMARTTrustedIssuersRegistry).interfaceId));
        assertTrue(IERC165(address(topicSchemeRegistry)).supportsInterface(type(ISMARTTopicSchemeRegistry).interfaceId));
        assertTrue(IERC165(address(identityFactory)).supportsInterface(type(IATKIdentityFactory).interfaceId));
    }

    function test_UpdateImplementationFlow() public {
        // Test a complete flow of updating an implementation
        address oldImpl = IATKTypedImplementationRegistry(address(atkSystem)).implementation(COMPLIANCE);

        // Deploy new implementation
        ATKComplianceImplementation newImpl = new ATKComplianceImplementation(forwarder);

        vm.prank(admin);
        ATKSystemImplementation(address(atkSystem)).setComplianceImplementation(address(newImpl));

        assertEq(IATKTypedImplementationRegistry(address(atkSystem)).implementation(COMPLIANCE), address(newImpl));
        assertTrue(IATKTypedImplementationRegistry(address(atkSystem)).implementation(COMPLIANCE) != oldImpl);
    }

    function test_AllSetterFunctionsWithActualImplementations() public {
        vm.startPrank(admin);

        // Test all implementation setters with actual implementations
        ATKComplianceImplementation compImpl = _getComplianceImpl();
        ATKIdentityRegistryImplementation idRegImpl = _getIdentityRegistryImpl();
        ATKIdentityRegistryStorageImplementation idRegStorageImpl = _getIdentityRegistryStorageImpl();
        ATKSystemTrustedIssuersRegistryImplementation trustedIssuersImpl = _getTrustedIssuersRegistryImpl();
        ATKTrustedIssuersMetaRegistryImplementation trustedIssuersMetaImpl = _getTrustedIssuersMetaRegistryImpl();
        ATKTopicSchemeRegistryImplementation topicSchemeImpl = _getTopicSchemeRegistryImpl();
        ATKIdentityFactoryImplementation idFactoryImpl = _getIdentityFactoryImpl();
        ATKIdentityImplementation idImpl = _getIdentityImpl();
        ATKContractIdentityImplementation contractIdImpl = _getContractIdentityImpl();
        ATKTokenAccessManagerImplementation accessManagerImpl = _getTokenAccessManagerImpl();

        ATKSystemImplementation(address(atkSystem)).setComplianceImplementation(address(compImpl));
        ATKSystemImplementation(address(atkSystem)).setIdentityRegistryImplementation(address(idRegImpl));
        ATKSystemImplementation(address(atkSystem)).setIdentityRegistryStorageImplementation(address(idRegStorageImpl));
        ATKSystemImplementation(address(atkSystem)).setSystemTrustedIssuersRegistryImplementation(
            address(trustedIssuersImpl)
        );
        ATKSystemImplementation(address(atkSystem)).setTrustedIssuersMetaRegistryImplementation(
            address(trustedIssuersMetaImpl)
        );
        ATKSystemImplementation(address(atkSystem)).setTopicSchemeRegistryImplementation(address(topicSchemeImpl));
        ATKSystemImplementation(address(atkSystem)).setIdentityFactoryImplementation(address(idFactoryImpl));
        ATKSystemImplementation(address(atkSystem)).setIdentityImplementation(address(idImpl));
        ATKSystemImplementation(address(atkSystem)).setContractIdentityImplementation(address(contractIdImpl));
        ATKSystemImplementation(address(atkSystem)).setTokenAccessManagerImplementation(address(accessManagerImpl));

        // Verify all implementations are set correctly
        assertEq(IATKTypedImplementationRegistry(address(atkSystem)).implementation(COMPLIANCE), address(compImpl));
        assertEq(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(IDENTITY_REGISTRY), address(idRegImpl)
        );
        assertEq(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(IDENTITY_REGISTRY_STORAGE),
            address(idRegStorageImpl)
        );
        assertEq(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(SYSTEM_TRUSTED_ISSUERS_REGISTRY),
            address(trustedIssuersImpl)
        );
        assertEq(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(TRUSTED_ISSUERS_META_REGISTRY),
            address(trustedIssuersMetaImpl)
        );
        assertEq(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(TOPIC_SCHEME_REGISTRY),
            address(topicSchemeImpl)
        );
        assertEq(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(IDENTITY_FACTORY), address(idFactoryImpl)
        );
        assertEq(IATKTypedImplementationRegistry(address(atkSystem)).implementation(IDENTITY), address(idImpl));
        assertEq(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(CONTRACT_IDENTITY),
            address(contractIdImpl)
        );
        assertEq(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(TOKEN_ACCESS_MANAGER),
            address(accessManagerImpl)
        );

        vm.stopPrank();
    }

    function test_SetTopicSchemeRegistryImplementation() public {
        ATKTopicSchemeRegistryImplementation impl = _getTopicSchemeRegistryImpl();
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit IATKSystem.TopicSchemeRegistryImplementationUpdated(admin, address(impl));

        ATKSystemImplementation(address(atkSystem)).setTopicSchemeRegistryImplementation(address(impl));
        assertEq(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(TOPIC_SCHEME_REGISTRY), address(impl)
        );
    }

    function test_SetTopicSchemeRegistryImplementation_OnlyAdmin() public {
        ATKTopicSchemeRegistryImplementation impl = _getTopicSchemeRegistryImpl();
        vm.prank(user);
        vm.expectRevert();
        ATKSystemImplementation(address(atkSystem)).setTopicSchemeRegistryImplementation(address(impl));
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

    // Note: IdentityVerificationModule tests removed as the functionality is now handled through compliance module
    // registry

    function test_SystemInitialization_AllComponentsConfigured() public view {
        // Test that all components are properly configured in the bootstrapped system
        // Verify all components are properly set including identity verification module
        assertTrue(IATKTypedImplementationRegistry(address(atkSystem)).implementation(COMPLIANCE) != address(0));
        assertTrue(IATKTypedImplementationRegistry(address(atkSystem)).implementation(IDENTITY_REGISTRY) != address(0));
        assertTrue(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(IDENTITY_REGISTRY_STORAGE) != address(0)
        );
        assertTrue(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(SYSTEM_TRUSTED_ISSUERS_REGISTRY)
                != address(0)
        );
        assertTrue(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(TRUSTED_ISSUERS_META_REGISTRY)
                != address(0)
        );
        assertTrue(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(TOPIC_SCHEME_REGISTRY) != address(0)
        );
        assertTrue(IATKTypedImplementationRegistry(address(atkSystem)).implementation(IDENTITY_FACTORY) != address(0));
        assertTrue(IATKTypedImplementationRegistry(address(atkSystem)).implementation(IDENTITY) != address(0));
        assertTrue(IATKTypedImplementationRegistry(address(atkSystem)).implementation(CONTRACT_IDENTITY) != address(0));
        assertTrue(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(TOKEN_ACCESS_MANAGER) != address(0)
        );
        // Identity verification module is now handled through compliance module registry
        assertTrue(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(TOKEN_FACTORY_REGISTRY) != address(0)
        );
        assertTrue(
            IATKTypedImplementationRegistry(address(atkSystem)).implementation(COMPLIANCE_MODULE_REGISTRY) != address(0)
        );
        assertTrue(IATKTypedImplementationRegistry(address(atkSystem)).implementation(ADDON_REGISTRY) != address(0));

        // Verify default identity verification module is registered globally with empty params
        SMARTComplianceModuleParamPair[] memory globals = IATKCompliance(atkSystem.compliance()).getGlobalComplianceModules();
        bool foundExpected = false;
        address expected = IATKSystemFactory(address(systemUtils.systemFactory())).defaultIdentityVerificationComplianceModule();
        for (uint256 i = 0; i < globals.length; ++i) {
            if (globals[i].module == expected && globals[i].params.length == 0) {
                foundExpected = true;
                break;
            }
        }
        assertTrue(foundExpected, "Default identity verification module should be registered globally with empty params");
    }

    // --- Issuer Identity Tests ---

    function test_IssuerIdentity_CreatedDuringBootstrap() public view {
        // Test that issuer identity is created and accessible after bootstrap
        address organisationIdentity = ATKSystemImplementation(address(atkSystem)).organisationIdentity();
        assertTrue(organisationIdentity != address(0), "Organisation identity should be created during bootstrap");
    }

    function test_IssuerIdentity_ImplementsIContractWithIdentity() public view {
        // Test that the system implements IContractWithIdentity for issuer identity management
        assertTrue(
            IERC165(address(atkSystem)).supportsInterface(type(IContractWithIdentity).interfaceId),
            "System should implement IContractWithIdentity interface"
        );

        // Test onchainID returns the issuer identity
        address onchainID = IContractWithIdentity(address(atkSystem)).onchainID();
        address organisationIdentity = ATKSystemImplementation(address(atkSystem)).organisationIdentity();
        assertEq(onchainID, organisationIdentity, "onchainID should return the organisation identity address");
    }

    function test_IssueIssuerClaim_Success() public {
        // Test successful issuer claim issuance by token factory using a mocked identity

        // Create a mocked identity that records claims
        MockedIdentity subject = new MockedIdentity();

        // Create a test token factory address to use
        address testTokenFactory = makeAddr("testTokenFactory");

        // Debug: Check if admin has DEFAULT_ADMIN_ROLE
        bool hasDefaultAdmin = systemUtils.systemAccessManager().hasRole(ATKRoles.DEFAULT_ADMIN_ROLE, admin);
        assertTrue(hasDefaultAdmin, "Admin should have DEFAULT_ADMIN_ROLE");

        // Grant TOKEN_FACTORY_MODULE_ROLE to test factory using admin privileges
        // First admin needs TOKEN_FACTORY_REGISTRY_MODULE_ROLE to grant TOKEN_FACTORY_MODULE_ROLE
        vm.startPrank(admin);
        systemUtils.systemAccessManager().grantRole(ATKSystemRoles.TOKEN_FACTORY_REGISTRY_MODULE_ROLE, admin);
        systemUtils.systemAccessManager().grantRole(ATKSystemRoles.TOKEN_FACTORY_MODULE_ROLE, testTokenFactory);
        vm.stopPrank();

        // Verify the role was granted
        bool hasRole =
            systemUtils.systemAccessManager().hasRole(ATKSystemRoles.TOKEN_FACTORY_MODULE_ROLE, testTokenFactory);
        assertTrue(hasRole, "Token factory should have been granted the role");

        // Issue claim as token factory
        vm.startPrank(testTokenFactory);
        uint256 topicId =
            ISMARTTopicSchemeRegistry(atkSystem.topicSchemeRegistry()).getTopicId(ATKTopics.TOPIC_ASSET_ISSUER);
        ATKSystemImplementation(address(atkSystem)).issueClaimByOrganisation(address(subject), topicId, "");
        vm.stopPrank();

        // Verify the claim was recorded on the mocked identity for the ASSET_ISSUER topic
        assertEq(subject.claimCountByTopic(topicId), 1, "Organisation claim should be added to the subject identity");
    }

    function test_IssueIssuerClaim_UnauthorizedReverts() public {
        // Test that unauthorized accounts cannot issue issuer claims
        address mockIdentity = address(new MockedIdentity());

        // User without TOKEN_FACTORY_MODULE_ROLE should not be able to issue claims
        vm.prank(user);
        vm.expectRevert(); // Should revert due to access control
        ATKSystemImplementation(address(atkSystem)).issueClaimByOrganisation(mockIdentity, 0, "");
    }

    function test_IssueIssuerClaim_InvalidTargetIdentityReverts() public {
        // Test that issuing claim to zero address reverts

        // Create a test token factory address to use
        address testTokenFactory = makeAddr("testTokenFactory");

        // Grant TOKEN_FACTORY_MODULE_ROLE to test factory using admin privileges
        // First admin needs TOKEN_FACTORY_REGISTRY_MODULE_ROLE to grant TOKEN_FACTORY_MODULE_ROLE
        vm.startPrank(admin);
        systemUtils.systemAccessManager().grantRole(ATKSystemRoles.TOKEN_FACTORY_REGISTRY_MODULE_ROLE, admin);
        systemUtils.systemAccessManager().grantRole(ATKSystemRoles.TOKEN_FACTORY_MODULE_ROLE, testTokenFactory);
        vm.stopPrank();

        // Try to issue claim to zero address
        vm.prank(testTokenFactory);
        vm.expectRevert(InvalidTargetIdentity.selector);
        ATKSystemImplementation(address(atkSystem)).issueClaimByOrganisation(address(0), 0, "");
    }

    function test_IssuerIdentity_TopicRegistered() public view {
        // Test that TOPIC_ISSUER is properly registered
        uint256 topicId =
            ISMARTTopicSchemeRegistry(atkSystem.topicSchemeRegistry()).getTopicId(ATKTopics.TOPIC_ASSET_ISSUER);
        assertTrue(topicId != 0, "TOPIC_ASSET_ISSUER should be registered with non-zero ID");
    }

    function test_IssuerIdentity_TrustedIssuer() public view {
        // Test that issuer identity is registered as trusted issuer for TOPIC_ISSUER
        address organisationIdentity = ATKSystemImplementation(address(atkSystem)).organisationIdentity();
        uint256 topicId =
            ISMARTTopicSchemeRegistry(atkSystem.topicSchemeRegistry()).getTopicId(ATKTopics.TOPIC_ASSET_ISSUER);

        // Check if issuer identity is trusted for the TOPIC_ISSUER
        bool isTrusted = ISMARTTrustedIssuersRegistry(atkSystem.trustedIssuersRegistry()).isTrustedIssuer(
            organisationIdentity, address(0)
        );
        assertTrue(isTrusted, "Issuer identity should be registered as trusted issuer");

        // Check if it's trusted specifically for TOPIC_ISSUER topic
        bool isTrustedForTopic = ISMARTTrustedIssuersRegistry(atkSystem.trustedIssuersRegistry()).hasClaimTopic(
            organisationIdentity, topicId, address(0)
        );
        assertTrue(isTrustedForTopic, "Issuer identity should be trusted for TOPIC_ISSUER topic");
    }
}
