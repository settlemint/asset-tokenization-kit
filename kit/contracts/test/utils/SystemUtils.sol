// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { MockedComplianceModule } from "./mocks/MockedComplianceModule.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

// System
import { ATKSystemFactory } from "../../contracts/system/ATKSystemFactory.sol";
import { ATKSystemImplementations } from "../../contracts/system/ATKSystemFactory.sol";
import { IATKSystem } from "../../contracts/system/IATKSystem.sol";
import { ATKSystemImplementation } from "../../contracts/system/ATKSystemImplementation.sol";

// Implementations
import { ATKIdentityRegistryStorageImplementation } from
    "../../contracts/system/identity-registry-storage/ATKIdentityRegistryStorageImplementation.sol";
import { ATKTrustedIssuersRegistryImplementation } from
    "../../contracts/system/trusted-issuers-registry/ATKTrustedIssuersRegistryImplementation.sol";
import { ATKIdentityRegistryImplementation } from
    "../../contracts/system/identity-registry/ATKIdentityRegistryImplementation.sol";
import { ATKComplianceImplementation } from "../../contracts/system/compliance/ATKComplianceImplementation.sol";
import { ATKIdentityFactoryImplementation } from
    "../../contracts/system/identity-factory/ATKIdentityFactoryImplementation.sol";

import { ATKIdentityImplementation } from
    "../../contracts/system/identity-factory/identities/ATKIdentityImplementation.sol";
import { ATKTokenIdentityImplementation } from
    "../../contracts/system/identity-factory/identities/ATKTokenIdentityImplementation.sol";
import { ATKTokenAccessManagerImplementation } from
    "../../contracts/system/access-manager/ATKTokenAccessManagerImplementation.sol";
import { ATKSystemAccessManagerImplementation } from
    "../../contracts/system/access-manager/ATKSystemAccessManagerImplementation.sol";
import { ATKTopicSchemeRegistryImplementation } from
    "../../contracts/system/topic-scheme-registry/ATKTopicSchemeRegistryImplementation.sol";
import { ATKTokenFactoryRegistryImplementation } from
    "../../contracts/system/token-factory/ATKTokenFactoryRegistryImplementation.sol";
import { ATKComplianceModuleRegistryImplementation } from
    "../../contracts/system/compliance/ATKComplianceModuleRegistryImplementation.sol";
import { ATKSystemAddonRegistryImplementation } from
    "../../contracts/system/addons/ATKSystemAddonRegistryImplementation.sol";

// Proxies
import { ATKTokenAccessManagerProxy } from "../../contracts/system/access-manager/ATKTokenAccessManagerProxy.sol";

// Interfaces
import { ISMARTIdentityRegistry } from "../../contracts/smart/interface/ISMARTIdentityRegistry.sol";
import { IATKIdentityFactory } from "../../contracts/system/identity-factory/IATKIdentityFactory.sol";
import { ISMARTCompliance } from "../../contracts/smart/interface/ISMARTCompliance.sol";
import { IERC3643TrustedIssuersRegistry } from
    "../../contracts/smart/interface/ERC-3643/IERC3643TrustedIssuersRegistry.sol";
import { ISMARTIdentityRegistryStorage } from "../../contracts/smart/interface/ISMARTIdentityRegistryStorage.sol";
import { ISMARTTokenAccessManager } from "../../contracts/smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { ISMARTTopicSchemeRegistry } from "../../contracts/smart/interface/ISMARTTopicSchemeRegistry.sol";
import { IATKComplianceModuleRegistry } from "../../contracts/system/compliance/IATKComplianceModuleRegistry.sol";
import { IATKSystemAddonRegistry } from "../../contracts/system/addons/IATKSystemAddonRegistry.sol";
import { IATKTokenFactoryRegistry } from "../../contracts/system/token-factory/IATKTokenFactoryRegistry.sol";
import { IATKSystemAccessManager } from "../../contracts/system/access-manager/IATKSystemAccessManager.sol";

// Compliance Modules
import { CountryAllowListComplianceModule } from "../../contracts/smart/modules/CountryAllowListComplianceModule.sol";
import { CountryBlockListComplianceModule } from "../../contracts/smart/modules/CountryBlockListComplianceModule.sol";
import { SMARTIdentityVerificationComplianceModule } from
    "../../contracts/smart/modules/SMARTIdentityVerificationComplianceModule.sol";
import { ATKSystemRoles } from "../../contracts/system/ATKSystemRoles.sol";

contract SystemUtils is Test {
    // System
    ATKSystemFactory public systemFactory;
    IATKSystem public system;

    // Core Contract Instances (now holding proxy addresses)
    ISMARTIdentityRegistryStorage public identityRegistryStorage; // Proxy
    IERC3643TrustedIssuersRegistry public trustedIssuersRegistry; // Proxy
    ISMARTIdentityRegistry public identityRegistry; // Proxy
    ISMARTCompliance public compliance; // Proxy
    IATKIdentityFactory public identityFactory; // Proxy
    ISMARTTopicSchemeRegistry public topicSchemeRegistry; // Proxy
    IATKComplianceModuleRegistry public complianceModuleRegistry; // Proxy
    IATKSystemAddonRegistry public systemAddonRegistry; // Proxy
    IATKTokenFactoryRegistry public tokenFactoryRegistry; // Proxy
    IATKSystemAccessManager public systemAccessManager; // Proxy

    // Compliance Modules
    MockedComplianceModule public mockedComplianceModule;
    CountryAllowListComplianceModule public countryAllowListComplianceModule;
    CountryBlockListComplianceModule public countryBlockListComplianceModule;
    SMARTIdentityVerificationComplianceModule public identityVerificationModule;

    // --- Setup ---
    constructor(address platformAdmin) {
        // --- Predeployed implementations ---
        address forwarder = address(0);

        IIdentity identityImpl = new ATKIdentityImplementation(forwarder);
        IIdentity tokenIdentityImpl = new ATKTokenIdentityImplementation(forwarder);

        ATKSystemImplementation systemImplementation = new ATKSystemImplementation(forwarder);

        ATKIdentityRegistryStorageImplementation storageImpl = new ATKIdentityRegistryStorageImplementation(forwarder);
        ATKTrustedIssuersRegistryImplementation issuersImpl = new ATKTrustedIssuersRegistryImplementation(forwarder);
        ATKComplianceImplementation complianceImpl = new ATKComplianceImplementation(forwarder);
        ATKIdentityRegistryImplementation registryImpl = new ATKIdentityRegistryImplementation(forwarder);
        ATKIdentityFactoryImplementation factoryImpl = new ATKIdentityFactoryImplementation(forwarder);
        ATKTokenAccessManagerImplementation accessManagerImpl = new ATKTokenAccessManagerImplementation(forwarder);
        ATKSystemAccessManagerImplementation systemAccessManagerImpl =
            new ATKSystemAccessManagerImplementation(forwarder);
        ATKTopicSchemeRegistryImplementation topicSchemeRegistryImpl =
            new ATKTopicSchemeRegistryImplementation(forwarder);

        ATKTokenFactoryRegistryImplementation tokenFactoryRegistryImpl =
            new ATKTokenFactoryRegistryImplementation(forwarder);

        ATKComplianceModuleRegistryImplementation complianceModuleRegistryImpl =
            new ATKComplianceModuleRegistryImplementation(forwarder);
        ATKSystemAddonRegistryImplementation systemAddonRegistryImpl =
            new ATKSystemAddonRegistryImplementation(forwarder);

        identityVerificationModule = new SMARTIdentityVerificationComplianceModule(forwarder);
        vm.label(address(identityVerificationModule), "Identity Verification Module");

        ATKSystemImplementations memory implementations = ATKSystemImplementations({
            atkSystemImplementation: address(systemImplementation),
            complianceImplementation: address(complianceImpl),
            identityRegistryImplementation: address(registryImpl),
            identityRegistryStorageImplementation: address(storageImpl),
            trustedIssuersRegistryImplementation: address(issuersImpl),
            topicSchemeRegistryImplementation: address(topicSchemeRegistryImpl),
            identityFactoryImplementation: address(factoryImpl),
            identityImplementation: address(identityImpl),
            tokenIdentityImplementation: address(tokenIdentityImpl),
            tokenAccessManagerImplementation: address(accessManagerImpl),
            identityVerificationModule: address(identityVerificationModule),
            tokenFactoryRegistryImplementation: address(tokenFactoryRegistryImpl),
            complianceModuleRegistryImplementation: address(complianceModuleRegistryImpl),
            addonRegistryImplementation: address(systemAddonRegistryImpl),
            systemAccessManagerImplementation: address(systemAccessManagerImpl)
        });

        systemFactory = new ATKSystemFactory(implementations, forwarder);
        vm.label(address(systemFactory), "System Factory");

        vm.startPrank(platformAdmin); // Use admin for initialization and binding
        // --- During onboarding ---
        system = IATKSystem(systemFactory.createSystem());
        vm.label(address(system), "System");
        system.bootstrap();

        compliance = ISMARTCompliance(system.compliance());
        vm.label(address(compliance), "Compliance");
        identityRegistry = ISMARTIdentityRegistry(system.identityRegistry());
        vm.label(address(identityRegistry), "Identity Registry");
        identityRegistryStorage = ISMARTIdentityRegistryStorage(system.identityRegistryStorage());
        vm.label(address(identityRegistryStorage), "Identity Registry Storage");
        trustedIssuersRegistry = IERC3643TrustedIssuersRegistry(system.trustedIssuersRegistry());
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

        systemAccessManager = IATKSystemAccessManager(system.systemAccessManager());
        vm.label(address(systemAccessManager), "System Access Manager");

        // Grant necessary roles to the platform admin for testing
        systemAccessManager.grantRole(ATKSystemRoles.TOKEN_MANAGER_ROLE, platformAdmin);
        systemAccessManager.grantRole(ATKSystemRoles.SYSTEM_MANAGER_ROLE, platformAdmin);
        systemAccessManager.grantRole(ATKSystemRoles.IDENTITY_MANAGER_ROLE, platformAdmin);
        systemAccessManager.grantRole(ATKSystemRoles.COMPLIANCE_MANAGER_ROLE, platformAdmin);
        systemAccessManager.grantRole(ATKSystemRoles.ADDON_MANAGER_ROLE, platformAdmin);
        systemAccessManager.grantRole(ATKSystemRoles.CLAIM_POLICY_MANAGER_ROLE, platformAdmin);
        systemAccessManager.grantRole(ATKSystemRoles.BYPASS_LIST_MANAGER_ROLE, platformAdmin);
        systemAccessManager.grantRole(ATKSystemRoles.REGISTRAR_ROLE, platformAdmin);
        systemAccessManager.grantRole(ATKSystemRoles.DEPLOYER_ROLE, platformAdmin);

        // --- Deploy Other Contracts ---
        mockedComplianceModule = new MockedComplianceModule();
        vm.label(address(mockedComplianceModule), "Mocked Compliance Module");
        countryAllowListComplianceModule = new CountryAllowListComplianceModule(forwarder);
        vm.label(address(countryAllowListComplianceModule), "Country Allow List Compliance Module");
        countryBlockListComplianceModule = new CountryBlockListComplianceModule(forwarder);
        vm.label(address(countryBlockListComplianceModule), "Country Block List Compliance Module");

        vm.stopPrank();
    }

    function getTopicId(string memory topicName) public view returns (uint256) {
        return topicSchemeRegistry.getTopicId(topicName);
    }

    function createTokenAccessManager(address initialAdmin) external returns (ISMARTTokenAccessManager) {
        return ISMARTTokenAccessManager(address(new ATKTokenAccessManagerProxy(address(system), initialAdmin)));
    }
}
