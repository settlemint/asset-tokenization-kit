// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { MockedComplianceModule } from "./mocks/MockedComplianceModule.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

// System
import { SMARTSystemFactory } from "../../contracts/system/SMARTSystemFactory.sol";
import { ISMARTSystem } from "../../contracts/system/ISMARTSystem.sol";

// Implementations
import { SMARTIdentityRegistryStorageImplementation } from
    "../../contracts/system/identity-registry-storage/SMARTIdentityRegistryStorageImplementation.sol";
import { SMARTTrustedIssuersRegistryImplementation } from
    "../../contracts/system/trusted-issuers-registry/SMARTTrustedIssuersRegistryImplementation.sol";
import { SMARTIdentityRegistryImplementation } from
    "../../contracts/system/identity-registry/SMARTIdentityRegistryImplementation.sol";
import { SMARTComplianceImplementation } from "../../contracts/system/compliance/SMARTComplianceImplementation.sol";
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

// Proxies
import { SMARTTokenAccessManagerProxy } from "../../contracts/system/access-manager/SMARTTokenAccessManagerProxy.sol";

// Interfaces
import { ISMARTIdentityRegistry } from "../../contracts/smart/interface/ISMARTIdentityRegistry.sol";
import { ISMARTIdentityFactory } from "../../contracts/system/identity-factory/ISMARTIdentityFactory.sol";
import { ISMARTCompliance } from "../../contracts/smart/interface/ISMARTCompliance.sol";
import { IERC3643TrustedIssuersRegistry } from
    "../../contracts/smart/interface/ERC-3643/IERC3643TrustedIssuersRegistry.sol";
import { ISMARTIdentityRegistryStorage } from "../../contracts/smart/interface/ISMARTIdentityRegistryStorage.sol";
import { ISMARTTokenAccessManager } from "../../contracts/smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { ISMARTTopicSchemeRegistry } from "../../contracts/smart/interface/ISMARTTopicSchemeRegistry.sol";

// Compliance Modules
import { CountryAllowListComplianceModule } from
    "../../contracts/system/compliance/modules/CountryAllowListComplianceModule.sol";
import { CountryBlockListComplianceModule } from
    "../../contracts/system/compliance/modules/CountryBlockListComplianceModule.sol";
import { SMARTIdentityVerificationModule } from
    "../../contracts/system/compliance/modules/SMARTIdentityVerificationModule.sol";

contract SystemUtils is Test {
    // System
    SMARTSystemFactory public systemFactory;
    ISMARTSystem public system;

    // Core Contract Instances (now holding proxy addresses)
    ISMARTIdentityRegistryStorage public identityRegistryStorage; // Proxy
    IERC3643TrustedIssuersRegistry public trustedIssuersRegistry; // Proxy
    ISMARTIdentityRegistry public identityRegistry; // Proxy
    ISMARTCompliance public compliance; // Proxy
    ISMARTIdentityFactory public identityFactory; // Proxy
    ISMARTTopicSchemeRegistry public topicSchemeRegistry; // Proxy
    // Compliance Modules
    MockedComplianceModule public mockedComplianceModule;
    CountryAllowListComplianceModule public countryAllowListComplianceModule;
    CountryBlockListComplianceModule public countryBlockListComplianceModule;
    SMARTIdentityVerificationModule public identityVerificationModule;

    // --- Setup ---
    constructor(address platformAdmin) {
        // --- Predeployed implementations ---
        address forwarder = address(0);

        IIdentity identityImpl = new SMARTIdentityImplementation(forwarder);
        IIdentity tokenIdentityImpl = new SMARTTokenIdentityImplementation(forwarder);

        SMARTIdentityRegistryStorageImplementation storageImpl =
            new SMARTIdentityRegistryStorageImplementation(forwarder);
        SMARTTrustedIssuersRegistryImplementation issuersImpl = new SMARTTrustedIssuersRegistryImplementation(forwarder);
        SMARTComplianceImplementation complianceImpl = new SMARTComplianceImplementation(forwarder);
        SMARTIdentityRegistryImplementation registryImpl = new SMARTIdentityRegistryImplementation(forwarder);
        SMARTIdentityFactoryImplementation factoryImpl = new SMARTIdentityFactoryImplementation(forwarder);
        SMARTTokenAccessManagerImplementation accessManagerImpl = new SMARTTokenAccessManagerImplementation(forwarder);
        SMARTTopicSchemeRegistryImplementation topicSchemeRegistryImpl =
            new SMARTTopicSchemeRegistryImplementation(forwarder);

        identityVerificationModule = new SMARTIdentityVerificationModule(forwarder);
        vm.label(address(identityVerificationModule), "Identity Verification Module");

        systemFactory = new SMARTSystemFactory(
            address(complianceImpl),
            address(registryImpl),
            address(storageImpl),
            address(issuersImpl),
            address(topicSchemeRegistryImpl),
            address(factoryImpl),
            address(identityImpl),
            address(tokenIdentityImpl),
            address(accessManagerImpl),
            address(identityVerificationModule),
            forwarder
        );
        vm.label(address(systemFactory), "System Factory");

        vm.startPrank(platformAdmin); // Use admin for initialization and binding
        // --- During onboarding ---
        system = ISMARTSystem(systemFactory.createSystem());
        vm.label(address(system), "System");
        system.bootstrap();

        compliance = ISMARTCompliance(system.complianceProxy());
        vm.label(address(compliance), "Compliance");
        identityRegistry = ISMARTIdentityRegistry(system.identityRegistryProxy());
        vm.label(address(identityRegistry), "Identity Registry");
        identityRegistryStorage = ISMARTIdentityRegistryStorage(system.identityRegistryStorageProxy());
        vm.label(address(identityRegistryStorage), "Identity Registry Storage");
        trustedIssuersRegistry = IERC3643TrustedIssuersRegistry(system.trustedIssuersRegistryProxy());
        vm.label(address(trustedIssuersRegistry), "Trusted Issuers Registry");
        topicSchemeRegistry = ISMARTTopicSchemeRegistry(system.topicSchemeRegistryProxy());
        vm.label(address(topicSchemeRegistry), "Topic Scheme Registry");
        identityFactory = ISMARTIdentityFactory(system.identityFactoryProxy());
        vm.label(address(identityFactory), "Identity Factory");

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
        return ISMARTTokenAccessManager(address(new SMARTTokenAccessManagerProxy(address(system), initialAdmin)));
    }
}
