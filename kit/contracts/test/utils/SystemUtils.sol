// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { MockedComplianceModule } from "./mocks/MockedComplianceModule.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

// System
import { ATKSystemFactory } from "../../contracts/system/ATKSystemFactory.sol";
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
import { ATKTopicSchemeRegistryImplementation } from
    "../../contracts/system/topic-scheme-registry/ATKTopicSchemeRegistryImplementation.sol";

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

// Compliance Modules
import { CountryAllowListComplianceModule } from "../../contracts/smart/modules/CountryAllowListComplianceModule.sol";
import { CountryBlockListComplianceModule } from "../../contracts/smart/modules/CountryBlockListComplianceModule.sol";
import { SMARTIdentityVerificationComplianceModule } from
    "../../contracts/smart/modules/SMARTIdentityVerificationComplianceModule.sol";

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
        ATKTopicSchemeRegistryImplementation topicSchemeRegistryImpl =
            new ATKTopicSchemeRegistryImplementation(forwarder);

        identityVerificationModule = new SMARTIdentityVerificationComplianceModule(forwarder);
        vm.label(address(identityVerificationModule), "Identity Verification Module");

        systemFactory = new ATKSystemFactory(
            address(systemImplementation),
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
        system = IATKSystem(systemFactory.createSystem());
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
        identityFactory = IATKIdentityFactory(system.identityFactoryProxy());
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
        return ISMARTTokenAccessManager(address(new ATKTokenAccessManagerProxy(address(system), initialAdmin)));
    }
}
