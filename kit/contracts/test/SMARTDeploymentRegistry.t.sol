// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import { Test, console } from "forge-std/Test.sol";
import { SMARTUtils } from "./utils/SMARTUtils.sol";
import {
    SMARTDeploymentRegistry,
    SMARTDeploymentAlreadyRegistered,
    InvalidSMARTComplianceAddress,
    InvalidSMARTIdentityRegistryStorageAddress,
    InvalidSMARTIdentityFactoryAddress,
    InvalidSMARTIdentityRegistryAddress,
    InvalidSMARTTrustedIssuersRegistryAddress,
    CoreDependenciesNotRegistered,
    InvalidModuleAddress,
    ModuleAlreadyRegistered,
    InvalidTokenRegistryAddress,
    TokenRegistryTypeAlreadyRegistered,
    TokenRegistryAddressAlreadyUsed
} from "../contracts/SMARTDeploymentRegistry.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { SMARTTokenRegistry } from "../contracts/SMARTTokenRegistry.sol";

// SMART Protocol Dependencies
import { SMARTCompliance } from "smart-protocol/contracts/SMARTCompliance.sol";
import { SMARTIdentityRegistryStorage } from "smart-protocol/contracts/SMARTIdentityRegistryStorage.sol";
import { SMARTIdentityFactory } from "smart-protocol/contracts/SMARTIdentityFactory.sol";
import { SMARTIdentityRegistry } from "smart-protocol/contracts/SMARTIdentityRegistry.sol";
import { SMARTTrustedIssuersRegistry } from "smart-protocol/contracts/SMARTTrustedIssuersRegistry.sol";
import { ISMARTComplianceModule } from "smart-protocol/contracts/interface/ISMARTComplianceModule.sol";
import { MockedComplianceModule } from "smart-protocol/test/utils/mocks/MockedComplianceModule.sol";

contract SMARTDeploymentRegistryTest is SMARTUtils {
    SMARTDeploymentRegistry internal registry;

    // Core contract instances from SMARTUtils
    SMARTCompliance internal sCompliance;
    SMARTIdentityRegistryStorage internal sIRS;
    SMARTIdentityFactory internal sIF;
    SMARTIdentityRegistry internal sIR;
    SMARTTrustedIssuersRegistry internal sTIR;

    address internal deployer; // user who deploys the registry
    address internal user1;
    address internal user2;
    address internal trustedForwarder;

    MockedComplianceModule internal mockModule1;
    MockedComplianceModule internal mockModule2;

    // Mock Token Registries
    SMARTTokenRegistry internal mockTokenRegistry1;
    SMARTTokenRegistry internal mockTokenRegistry2;

    function setUp() public virtual {
        deployer = vm.addr(0xBEEFCAFE); // Unique address for deployer
        vm.label(deployer, "RegistryDeployer");
        user1 = makeAddr("User1");
        user2 = makeAddr("User2");
        trustedForwarder = makeAddr("TrustedForwarder");

        sCompliance = infrastructureUtils.compliance();
        sIRS = infrastructureUtils.identityRegistryStorage();
        sIF = infrastructureUtils.identityFactory();
        sIR = infrastructureUtils.identityRegistry();
        sTIR = infrastructureUtils.trustedIssuersRegistry();

        vm.startPrank(deployer);
        registry = new SMARTDeploymentRegistry(trustedForwarder);
        vm.stopPrank();

        // Instantiate concrete mock modules
        mockModule1 = new MockedComplianceModule();
        mockModule2 = new MockedComplianceModule();

        // Instantiate mock token registries
        // Note: SMARTTokenRegistry constructor needs initialOwner and forwarder
        mockTokenRegistry1 = new SMARTTokenRegistry(trustedForwarder, deployer);
        mockTokenRegistry2 = new SMARTTokenRegistry(trustedForwarder, deployer);

        vm.label(address(registry), "SMARTDeploymentRegistry");
        vm.label(address(sCompliance), "SMARTCompliance_FromUtils");
        vm.label(address(sIRS), "SMARTIRS_FromUtils");
        vm.label(address(sIF), "SMARTIF_FromUtils");
        vm.label(address(sIR), "SMARTIR_FromUtils");
        vm.label(address(sTIR), "SMARTTIR_FromUtils");
        vm.label(address(mockModule1), "MockModule1");
        vm.label(address(mockModule2), "MockModule2");
        vm.label(address(mockTokenRegistry1), "MockTokenRegistry1");
        vm.label(address(mockTokenRegistry2), "MockTokenRegistry2");
    }

    // --- Test Constructor & Initial State ---
    function test_InitialState() public view {
        assertFalse(registry.areDependenciesRegistered(), "Dependencies should not be registered initially");
        assertEq(registry.deploymentRegistrar(), address(0), "Deployment registrar should be address(0) initially");
        assertEq(registry.registrationTimestamp(), 0, "Registration timestamp should be 0 initially");
        assertEq(address(registry.smartComplianceContract()), address(0));
        assertEq(address(registry.smartIdentityRegistryStorageContract()), address(0));
        assertEq(address(registry.smartIdentityFactoryContract()), address(0));
        assertEq(address(registry.smartIdentityRegistryContract()), address(0));
        assertEq(address(registry.smartTrustedIssuersRegistryContract()), address(0));
        assertEq(registry.getRegisteredComplianceModules().length, 0, "No compliance modules initially");
        assertEq(
            address(registry.getTokenRegistryByType("AnyType")),
            address(0),
            "getTokenRegistryByType for non-existent type"
        );
    }

    // --- Test registerDeployment ---
    function test_RegisterDeployment_Success() public {
        vm.prank(user1);
        registry.registerDeployment(sCompliance, sIRS, sIF, sIR, sTIR);

        assertTrue(registry.areDependenciesRegistered(), "Dependencies should be registered");
        assertEq(registry.deploymentRegistrar(), user1, "Registrar should be user1");
        assertTrue(registry.registrationTimestamp() > 0, "Timestamp should be set");
        assertEq(address(registry.smartComplianceContract()), address(sCompliance));
        assertEq(address(registry.smartIdentityRegistryStorageContract()), address(sIRS));
        assertEq(address(registry.smartIdentityFactoryContract()), address(sIF));
        assertEq(address(registry.smartIdentityRegistryContract()), address(sIR));
        assertEq(address(registry.smartTrustedIssuersRegistryContract()), address(sTIR));
        assertTrue(registry.hasRole(registry.DEPLOYMENT_OWNER_ROLE(), user1), "User1 should have DEPLOYMENT_OWNER_ROLE");
    }

    function test_RegisterDeployment_Event() public {
        vm.expectEmit(true, true, true, true);
        emit SMARTDeploymentRegistry.SMARTDeploymentRegistered(
            user1, block.timestamp, address(sCompliance), address(sIRS), address(sIF), address(sIR), address(sTIR)
        );
        vm.prank(user1);
        registry.registerDeployment(sCompliance, sIRS, sIF, sIR, sTIR);
    }

    function test_Revert_RegisterDeployment_AlreadyRegistered() public {
        vm.prank(user1);
        registry.registerDeployment(sCompliance, sIRS, sIF, sIR, sTIR);

        // Use global error selector directly
        vm.expectRevert(SMARTDeploymentAlreadyRegistered.selector);
        vm.prank(user2);
        registry.registerDeployment(sCompliance, sIRS, sIF, sIR, sTIR);
    }

    function test_Revert_RegisterDeployment_InvalidCompliance() public {
        vm.expectRevert(InvalidSMARTComplianceAddress.selector);
        vm.prank(user1);
        registry.registerDeployment(SMARTCompliance(address(0)), sIRS, sIF, sIR, sTIR);
    }

    function test_Revert_RegisterDeployment_InvalidIdentityRegistryStorage() public {
        vm.expectRevert(InvalidSMARTIdentityRegistryStorageAddress.selector);
        vm.prank(user1);
        registry.registerDeployment(sCompliance, SMARTIdentityRegistryStorage(address(0)), sIF, sIR, sTIR);
    }

    function test_Revert_RegisterDeployment_InvalidIdentityFactory() public {
        vm.expectRevert(InvalidSMARTIdentityFactoryAddress.selector);
        vm.prank(user1);
        registry.registerDeployment(sCompliance, sIRS, SMARTIdentityFactory(address(0)), sIR, sTIR);
    }

    function test_Revert_RegisterDeployment_InvalidIdentityRegistry() public {
        vm.expectRevert(InvalidSMARTIdentityRegistryAddress.selector);
        vm.prank(user1);
        registry.registerDeployment(sCompliance, sIRS, sIF, SMARTIdentityRegistry(address(0)), sTIR);
    }

    function test_Revert_RegisterDeployment_InvalidTrustedIssuersRegistry() public {
        vm.expectRevert(InvalidSMARTTrustedIssuersRegistryAddress.selector);
        vm.prank(user1);
        registry.registerDeployment(sCompliance, sIRS, sIF, sIR, SMARTTrustedIssuersRegistry(address(0)));
    }

    function _registerDeploymentAsUser(address _user) internal {
        vm.startPrank(_user);
        registry.registerDeployment(sCompliance, sIRS, sIF, sIR, sTIR);
        vm.stopPrank();
    }

    function test_RegisterComplianceModule_Success() public {
        _registerDeploymentAsUser(user1);

        vm.prank(user1);
        registry.registerComplianceModule(mockModule1);

        assertTrue(registry.isComplianceModuleRegistered(address(mockModule1)));
        ISMARTComplianceModule[] memory modules = registry.getRegisteredComplianceModules();
        assertEq(modules.length, 1);
        assertEq(address(modules[0]), address(mockModule1));
    }

    function test_RegisterComplianceModule_Event() public {
        _registerDeploymentAsUser(user1);

        vm.expectEmit(true, true, true, true);
        emit SMARTDeploymentRegistry.SMARTComplianceModuleRegistered(user1, address(mockModule1), block.timestamp);
        vm.prank(user1);
        registry.registerComplianceModule(mockModule1);
    }

    function test_Revert_RegisterComplianceModule_NotDeploymentOwner() public {
        _registerDeploymentAsUser(user1);

        bytes memory expectedError = abi.encodeWithSelector(
            IAccessControl.AccessControlUnauthorizedAccount.selector, user2, registry.DEPLOYMENT_OWNER_ROLE()
        );
        vm.expectRevert(expectedError);
        vm.prank(user2);
        registry.registerComplianceModule(mockModule1);
    }

    function test_Revert_RegisterComplianceModule_InvalidModuleAddress() public {
        _registerDeploymentAsUser(user1);
        vm.expectRevert(InvalidModuleAddress.selector);
        vm.prank(user1);
        registry.registerComplianceModule(ISMARTComplianceModule(address(0)));
    }

    function test_Revert_RegisterComplianceModule_ModuleAlreadyRegistered() public {
        _registerDeploymentAsUser(user1);
        vm.prank(user1);
        registry.registerComplianceModule(mockModule1);

        vm.expectRevert(ModuleAlreadyRegistered.selector);
        vm.prank(user1);
        registry.registerComplianceModule(mockModule1);
    }

    function test_RegisterTokenRegistry_Success() public {
        _registerDeploymentAsUser(user1);
        string memory typeName = "Bond";

        vm.prank(user1);
        registry.registerTokenRegistry(typeName, mockTokenRegistry1);

        assertEq(
            address(registry.getTokenRegistryByType(typeName)), address(mockTokenRegistry1), "Registry address mismatch"
        );
        assertTrue(
            registry.isTokenRegistryAddressUsed(address(mockTokenRegistry1)),
            "Registry address should be marked as used"
        );
    }

    function test_RegisterTokenRegistry_Event() public {
        _registerDeploymentAsUser(user1);
        string memory typeName = "Equity";
        bytes32 typeHash = keccak256(abi.encodePacked(typeName));

        vm.expectEmit(true, true, true, true);
        emit SMARTDeploymentRegistry.SMARTTokenRegistryRegistered(
            user1, typeName, typeHash, address(mockTokenRegistry1), block.timestamp
        );
        vm.prank(user1);
        registry.registerTokenRegistry(typeName, mockTokenRegistry1);
    }

    function test_Revert_RegisterTokenRegistry_NotDeploymentOwner() public {
        _registerDeploymentAsUser(user1);
        string memory typeName = "Bond";

        bytes memory expectedError = abi.encodeWithSelector(
            IAccessControl.AccessControlUnauthorizedAccount.selector, user2, registry.DEPLOYMENT_OWNER_ROLE()
        );
        vm.expectRevert(expectedError);
        vm.prank(user2);
        registry.registerTokenRegistry(typeName, mockTokenRegistry1);
    }

    function test_Revert_RegisterTokenRegistry_CoreDependenciesNotRegistered() public {
        string memory typeName = "Bond";

        // Should throw this because there is no DEPLOYMENT_OWNER if the core dependencies are not registered.
        bytes memory expectedError = abi.encodeWithSelector(
            IAccessControl.AccessControlUnauthorizedAccount.selector, user1, registry.DEPLOYMENT_OWNER_ROLE()
        );
        vm.expectRevert(expectedError);
        vm.prank(user1); // Let's assume user1 has the role for other reasons or it doesn't matter for this revert.
        registry.registerTokenRegistry(typeName, mockTokenRegistry1);
    }

    function test_Revert_RegisterTokenRegistry_InvalidRegistryAddress() public {
        _registerDeploymentAsUser(user1);
        string memory typeName = "Bond";
        vm.expectRevert(InvalidTokenRegistryAddress.selector);
        vm.prank(user1);
        registry.registerTokenRegistry(typeName, SMARTTokenRegistry(address(0)));
    }

    function test_Revert_RegisterTokenRegistry_TypeAlreadyRegistered() public {
        _registerDeploymentAsUser(user1);
        string memory typeName = "Bond";
        bytes32 typeHash = keccak256(abi.encodePacked(typeName));

        vm.prank(user1);
        registry.registerTokenRegistry(typeName, mockTokenRegistry1);

        vm.expectRevert(abi.encodeWithSelector(TokenRegistryTypeAlreadyRegistered.selector, typeHash));
        vm.prank(user1);
        registry.registerTokenRegistry(typeName, mockTokenRegistry2); // Different address, same type
    }

    function test_Revert_RegisterTokenRegistry_AddressAlreadyUsed() public {
        _registerDeploymentAsUser(user1);
        string memory typeName1 = "Bond";
        string memory typeName2 = "Equity";

        vm.prank(user1);
        registry.registerTokenRegistry(typeName1, mockTokenRegistry1);

        vm.expectRevert(abi.encodeWithSelector(TokenRegistryAddressAlreadyUsed.selector, address(mockTokenRegistry1)));
        vm.prank(user1);
        registry.registerTokenRegistry(typeName2, mockTokenRegistry1); // Same address, different type
    }

    function test_GetTokenRegistryByType_Success() public {
        _registerDeploymentAsUser(user1);
        string memory typeName = "CommercialPaper";
        vm.prank(user1);
        registry.registerTokenRegistry(typeName, mockTokenRegistry1);

        SMARTTokenRegistry retrievedRegistry = registry.getTokenRegistryByType(typeName);
        assertEq(address(retrievedRegistry), address(mockTokenRegistry1));
    }

    function test_GetTokenRegistryByType_NotFound() public {
        _registerDeploymentAsUser(user1);
        string memory typeName = "NonExistentType";
        SMARTTokenRegistry retrievedRegistry = registry.getTokenRegistryByType(typeName);
        assertEq(address(retrievedRegistry), address(0));
    }

    function test_ResetDeployment_Success() public {
        _registerDeploymentAsUser(user1);
        vm.prank(user1);
        registry.registerComplianceModule(mockModule1);

        string memory tokenTypeName = "Bonds";
        vm.prank(user1);
        registry.registerTokenRegistry(tokenTypeName, mockTokenRegistry1);
        assertTrue(registry.isTokenRegistryAddressUsed(address(mockTokenRegistry1)), "TR address used before reset");

        vm.prank(user1);
        registry.resetDeployment();

        assertFalse(registry.areDependenciesRegistered());
        assertEq(registry.deploymentRegistrar(), address(0));
        assertEq(registry.registrationTimestamp(), 0);
        assertEq(address(registry.smartComplianceContract()), address(0));
        assertEq(address(registry.smartIdentityRegistryStorageContract()), address(0));
        assertEq(address(registry.smartIdentityFactoryContract()), address(0));
        assertEq(address(registry.smartIdentityRegistryContract()), address(0));
        assertEq(address(registry.smartTrustedIssuersRegistryContract()), address(0));
        assertFalse(registry.isComplianceModuleRegistered(address(mockModule1)));
        assertEq(registry.getRegisteredComplianceModules().length, 0);

        // Token Registry Checks
        assertFalse(registry.isTokenRegistryAddressUsed(address(mockTokenRegistry1)), "TR address NOT used after reset");
        assertEq(
            address(registry.getTokenRegistryByType(tokenTypeName)), address(0), "getTokenRegistryByType after reset"
        );

        _registerDeploymentAsUser(user2);
        assertTrue(registry.areDependenciesRegistered());
        assertEq(registry.deploymentRegistrar(), user2);
        assertTrue(registry.hasRole(registry.DEPLOYMENT_OWNER_ROLE(), user2));
        assertTrue(
            registry.hasRole(registry.DEPLOYMENT_OWNER_ROLE(), user1),
            "User1 should retain DEPLOYMENT_OWNER_ROLE after reset"
        );
    }

    function test_ResetDeployment_Event() public {
        _registerDeploymentAsUser(user1);

        vm.expectEmit(true, true, true, true);
        emit SMARTDeploymentRegistry.SMARTDeploymentReset(user1, block.timestamp);
        vm.prank(user1);
        registry.resetDeployment();
    }

    function test_Revert_ResetDeployment_NotDeploymentOwner() public {
        _registerDeploymentAsUser(user1);

        bytes memory expectedError = abi.encodeWithSelector(
            IAccessControl.AccessControlUnauthorizedAccount.selector, user2, registry.DEPLOYMENT_OWNER_ROLE()
        );
        vm.expectRevert(expectedError);
        vm.prank(user2);
        registry.resetDeployment();
    }

    function test_GrantRevokeRenounceDeploymentOwnerRole() public {
        _registerDeploymentAsUser(user1);

        vm.prank(user1);
        registry.grantDeploymentOwnerRole(user2);
        assertTrue(registry.isDeploymentOwner(user2), "User2 should have role after grant");

        vm.prank(user1);
        registry.revokeDeploymentOwnerRole(user2);
        assertFalse(registry.isDeploymentOwner(user2), "User2 should not have role after revoke");

        vm.prank(user1);
        registry.renounceDeploymentOwnerRole();
        assertFalse(registry.isDeploymentOwner(user1), "User1 should not have role after renounce");
    }

    function test_Revert_GrantDeploymentOwnerRole_NotDeploymentOwner() public {
        _registerDeploymentAsUser(user1);

        bytes memory expectedError = abi.encodeWithSelector(
            IAccessControl.AccessControlUnauthorizedAccount.selector, user2, registry.DEPLOYMENT_OWNER_ROLE()
        );
        vm.expectRevert(expectedError);
        vm.prank(user2);
        registry.grantDeploymentOwnerRole(makeAddr("anotherUser"));
    }

    function test_Revert_RevokeDeploymentOwnerRole_NotDeploymentOwner() public {
        _registerDeploymentAsUser(user1);
        vm.prank(user1);
        registry.grantDeploymentOwnerRole(user2);

        address attacker = makeAddr("Attacker");
        bytes memory expectedError = abi.encodeWithSelector(
            IAccessControl.AccessControlUnauthorizedAccount.selector, attacker, registry.DEPLOYMENT_OWNER_ROLE()
        );
        vm.expectRevert(expectedError);
        vm.prank(attacker);
        registry.revokeDeploymentOwnerRole(user2);
    }

    function test_RenounceRole_NoRevertIfHasRole() public {
        _registerDeploymentAsUser(user1);
        assertTrue(registry.isDeploymentOwner(user1));
        vm.prank(user1);
        registry.renounceDeploymentOwnerRole();
        assertFalse(registry.isDeploymentOwner(user1));
    }

    function test_RenounceRole_NoRevertIfNotHasRole() public {
        assertFalse(registry.isDeploymentOwner(user2));
        vm.prank(user2);
        registry.renounceDeploymentOwnerRole();
        assertFalse(registry.isDeploymentOwner(user2));
    }

    function test_GetRegisteredComplianceModules() public {
        _registerDeploymentAsUser(user1);
        ISMARTComplianceModule[] memory modules_empty = registry.getRegisteredComplianceModules();
        assertEq(modules_empty.length, 0, "Should be empty initially");

        vm.prank(user1);
        registry.registerComplianceModule(mockModule1);
        ISMARTComplianceModule[] memory modules1 = registry.getRegisteredComplianceModules();
        assertEq(modules1.length, 1);
        assertEq(address(modules1[0]), address(mockModule1));

        vm.prank(user1);
        registry.registerComplianceModule(mockModule2);
        ISMARTComplianceModule[] memory modules2 = registry.getRegisteredComplianceModules();
        assertEq(modules2.length, 2);
        assertEq(address(modules2[0]), address(mockModule1));
        assertEq(address(modules2[1]), address(mockModule2));
    }

    function test_isDeploymentOwner() public {
        assertFalse(registry.isDeploymentOwner(user1), "user1 should not be owner initially");
        _registerDeploymentAsUser(user1);
        assertTrue(registry.isDeploymentOwner(user1), "user1 should be owner after registration");

        vm.prank(user1);
        registry.grantDeploymentOwnerRole(user2);
        assertTrue(registry.isDeploymentOwner(user2), "user2 should be owner after grant");

        vm.prank(user1);
        registry.revokeDeploymentOwnerRole(user2);
        assertFalse(registry.isDeploymentOwner(user2), "user2 should not be owner after revoke");
    }
}
