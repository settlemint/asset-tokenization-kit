// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { MockedComplianceModule } from "./mocks/MockedComplianceModule.sol";

// System
import { ATKSystemFactory } from "../../contracts/system/ATKSystemFactory.sol";
import { IATKSystem } from "../../contracts/system/IATKSystem.sol";
import { ATKSystemImplementation } from "../../contracts/system/ATKSystemImplementation.sol";
import { ATKPeopleRoles } from "../../contracts/system/ATKPeopleRoles.sol";

// Implementations
import { ATKIdentityRegistryStorageImplementation } from
    "../../contracts/system/identity-registry-storage/ATKIdentityRegistryStorageImplementation.sol";
import { ATKSystemTrustedIssuersRegistryImplementation } from
    "../../contracts/system/trusted-issuers-registry/ATKSystemTrustedIssuersRegistryImplementation.sol";
import { ATKIdentityRegistryImplementation } from
    "../../contracts/system/identity-registry/ATKIdentityRegistryImplementation.sol";
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
import { ATKTopicSchemeRegistryImplementation } from
    "../../contracts/system/topic-scheme-registry/ATKTopicSchemeRegistryImplementation.sol";
import { ATKTokenFactoryRegistryImplementation } from
    "../../contracts/system/tokens/factory/ATKTokenFactoryRegistryImplementation.sol";
import { ATKComplianceModuleRegistryImplementation } from
    "../../contracts/system/compliance/ATKComplianceModuleRegistryImplementation.sol";
import { ATKSystemAddonRegistryImplementation } from
    "../../contracts/system/addons/ATKSystemAddonRegistryImplementation.sol";
import { ATKTrustedIssuersMetaRegistryImplementation } from
    "../../contracts/system/trusted-issuers-registry/ATKTrustedIssuersMetaRegistryImplementation.sol";
import { IATKTrustedIssuersRegistry } from
    "../../contracts/system/trusted-issuers-registry/IATKTrustedIssuersRegistry.sol";

// Proxies
import { ATKTokenAccessManagerProxy } from "../../contracts/system/tokens/access/ATKTokenAccessManagerProxy.sol";

// Interfaces
import { ISMARTIdentityRegistry } from "../../contracts/smart/interface/ISMARTIdentityRegistry.sol";
import { IATKIdentityFactory } from "../../contracts/system/identity-factory/IATKIdentityFactory.sol";
import { ISMARTCompliance } from "../../contracts/smart/interface/ISMARTCompliance.sol";
import { ISMARTIdentityRegistryStorage } from "../../contracts/smart/interface/ISMARTIdentityRegistryStorage.sol";
import { ISMARTTokenAccessManager } from "../../contracts/smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { ISMARTTopicSchemeRegistry } from "../../contracts/smart/interface/ISMARTTopicSchemeRegistry.sol";
import { IATKComplianceModuleRegistry } from "../../contracts/system/compliance/IATKComplianceModuleRegistry.sol";
import { IATKSystemAddonRegistry } from "../../contracts/system/addons/IATKSystemAddonRegistry.sol";
import { IATKTokenFactoryRegistry } from "../../contracts/system/tokens/factory/IATKTokenFactoryRegistry.sol";
import { IATKSystemAccessManager } from "../../contracts/system/access-manager/IATKSystemAccessManager.sol";
import { IATKTrustedIssuersMetaRegistry } from
    "../../contracts/system/trusted-issuers-registry/IATKTrustedIssuersMetaRegistry.sol";

// Compliance Modules
import { CountryAllowListComplianceModule } from "../../contracts/smart/modules/CountryAllowListComplianceModule.sol";
import { CountryBlockListComplianceModule } from "../../contracts/smart/modules/CountryBlockListComplianceModule.sol";
import { SMARTIdentityVerificationComplianceModule } from
    "../../contracts/smart/modules/SMARTIdentityVerificationComplianceModule.sol";

contract SystemUtils is Test {
    // System
    ATKSystemFactory public systemFactory;
    IATKSystem public system;
    IATKSystemAccessManager public systemAccessManager;

    // Core Contract Instances (now holding proxy addresses)
    ISMARTIdentityRegistryStorage public identityRegistryStorage; // Proxy
    IATKTrustedIssuersRegistry public trustedIssuersRegistry; // Proxy
    IATKTrustedIssuersMetaRegistry public trustedIssuersMetaRegistry; // Proxy
    ISMARTIdentityRegistry public identityRegistry; // Proxy
    ISMARTCompliance public compliance; // Proxy
    IATKIdentityFactory public identityFactory; // Proxy
    ISMARTTopicSchemeRegistry public topicSchemeRegistry; // Proxy
    IATKComplianceModuleRegistry public complianceModuleRegistry; // Proxy
    IATKSystemAddonRegistry public systemAddonRegistry; // Proxy
    IATKTokenFactoryRegistry public tokenFactoryRegistry; // Proxy

    // Compliance Modules
    MockedComplianceModule public mockedComplianceModule;
    SMARTIdentityVerificationComplianceModule public identityVerificationModule;
    CountryAllowListComplianceModule public countryAllowListComplianceModule;
    CountryBlockListComplianceModule public countryBlockListComplianceModule;

    // --- Setup ---
    constructor(address platformAdmin) {
        // --- Predeployed implementations ---
        address forwarder = address(0);

        systemFactory = new ATKSystemFactory(
            address(new ATKSystemImplementation(forwarder)),
            address(new ATKComplianceImplementation(forwarder)),
            address(new ATKIdentityRegistryImplementation(forwarder)),
            address(new ATKIdentityRegistryStorageImplementation(forwarder)),
            address(new ATKSystemTrustedIssuersRegistryImplementation(forwarder)),
            address(new ATKTrustedIssuersMetaRegistryImplementation(forwarder)),
            address(new ATKTopicSchemeRegistryImplementation(forwarder)),
            address(new ATKIdentityFactoryImplementation(forwarder)),
            address(new ATKIdentityImplementation(forwarder)),
            address(new ATKContractIdentityImplementation(forwarder)),
            address(new ATKTokenAccessManagerImplementation(forwarder)),
            address(new ATKTokenFactoryRegistryImplementation(forwarder)),
            address(new ATKComplianceModuleRegistryImplementation(forwarder)),
            address(new ATKSystemAddonRegistryImplementation(forwarder)),
            address(new ATKSystemAccessManagerImplementation(forwarder)),
            forwarder
        );
        vm.label(address(systemFactory), "System Factory");

        vm.startPrank(platformAdmin); // Use admin for initialization and binding
        // --- During onboarding ---
        system = IATKSystem(systemFactory.createSystem());
        vm.label(address(system), "System");
        system.bootstrap();

        // System access manager is already configured during bootstrap
        // All system contracts are initialized with the same access manager
        systemAccessManager = IATKSystemAccessManager(system.accessManager());
        vm.label(address(systemAccessManager), "System Access Manager");

        compliance = ISMARTCompliance(system.compliance());
        vm.label(address(compliance), "Compliance");
        identityRegistry = ISMARTIdentityRegistry(system.identityRegistry());
        vm.label(address(identityRegistry), "Identity Registry");
        identityRegistryStorage = ISMARTIdentityRegistryStorage(system.identityRegistryStorage());
        vm.label(address(identityRegistryStorage), "Identity Registry Storage");
        trustedIssuersRegistry = IATKTrustedIssuersRegistry(system.trustedIssuersRegistry());
        vm.label(address(trustedIssuersRegistry), "Trusted Issuers Registry");
        topicSchemeRegistry = ISMARTTopicSchemeRegistry(system.topicSchemeRegistry());
        vm.label(address(topicSchemeRegistry), "Topic Scheme Registry");
        identityFactory = IATKIdentityFactory(system.identityFactory());
        vm.label(address(identityFactory), "Identity Factory");

        complianceModuleRegistry = IATKComplianceModuleRegistry(system.complianceModuleRegistry());
        vm.label(address(complianceModuleRegistry), "Compliance Module Registry");
        systemAddonRegistry = IATKSystemAddonRegistry(system.systemAddonRegistry());
        vm.label(address(systemAddonRegistry), "System Addon Registry");
        tokenFactoryRegistry = IATKTokenFactoryRegistry(system.tokenFactoryRegistry());
        vm.label(address(tokenFactoryRegistry), "Token Factory Registry");

        // --- Deploy Other Contracts ---
        mockedComplianceModule = new MockedComplianceModule();
        vm.label(address(mockedComplianceModule), "Mocked Compliance Module");
        identityVerificationModule = new SMARTIdentityVerificationComplianceModule(forwarder);
        vm.label(address(identityVerificationModule), "Identity Verification Module");
        countryAllowListComplianceModule = new CountryAllowListComplianceModule(forwarder);
        vm.label(address(countryAllowListComplianceModule), "Country Allow List Compliance Module");
        countryBlockListComplianceModule = new CountryBlockListComplianceModule(forwarder);
        vm.label(address(countryBlockListComplianceModule), "Country Block List Compliance Module");

        // Grant necessary roles to platformAdmin in the system access manager
        bytes32[] memory platformAdminRoles = new bytes32[](5);
        platformAdminRoles[0] = ATKPeopleRoles.TOKEN_MANAGER_ROLE;
        platformAdminRoles[1] = ATKPeopleRoles.ADDON_MANAGER_ROLE;
        platformAdminRoles[2] = ATKPeopleRoles.COMPLIANCE_MANAGER_ROLE;
        platformAdminRoles[3] = ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE;
        platformAdminRoles[4] = ATKPeopleRoles.IDENTITY_MANAGER_ROLE;

        systemAccessManager.grantMultipleRoles(platformAdmin, platformAdminRoles);

        vm.stopPrank();
    }

    function getTopicId(string memory topicName) public view returns (uint256) {
        return topicSchemeRegistry.getTopicId(topicName);
    }

    function createTokenAccessManager(address initialAdmin) external returns (ISMARTTokenAccessManager) {
        address[] memory initialAdmins = new address[](1);
        initialAdmins[0] = initialAdmin;
        return ISMARTTokenAccessManager(address(new ATKTokenAccessManagerProxy(address(system), initialAdmins)));
    }
}
