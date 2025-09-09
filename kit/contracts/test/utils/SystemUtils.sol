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
    address internal constant TRUSTED_FORWARDER_ADDRESS = address(0);
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
        systemFactory = _deploySystemFactory();
        _labelSystemFactory();

        _startBootstrap(platformAdmin);
        _labelSystemContracts();

        _deployComplianceModulesAndGrantRoles(platformAdmin);
        _labelComplianceModules();
    }

    function _deploySystemFactory() internal returns (ATKSystemFactory) {
        address atkSystemImpl = address(new ATKSystemImplementation(TRUSTED_FORWARDER_ADDRESS));
        vm.label(atkSystemImpl, "ATKSystemImplementation");
        address complianceImpl = address(new ATKComplianceImplementation(TRUSTED_FORWARDER_ADDRESS));
        vm.label(complianceImpl, "ATKComplianceImplementation");
        address identityRegistryImpl = address(new ATKIdentityRegistryImplementation(TRUSTED_FORWARDER_ADDRESS));
        vm.label(identityRegistryImpl, "ATKIdentityRegistryImplementation");
        address identityRegistryStorageImpl =
            address(new ATKIdentityRegistryStorageImplementation(TRUSTED_FORWARDER_ADDRESS));
        vm.label(identityRegistryStorageImpl, "ATKIdentityRegistryStorageImplementation");
        address systemTrustedIssuersRegistryImpl =
            address(new ATKSystemTrustedIssuersRegistryImplementation(TRUSTED_FORWARDER_ADDRESS));
        vm.label(systemTrustedIssuersRegistryImpl, "ATKSystemTrustedIssuersRegistryImplementation");
        address trustedIssuersMetaRegistryImpl =
            address(new ATKTrustedIssuersMetaRegistryImplementation(TRUSTED_FORWARDER_ADDRESS));
        vm.label(trustedIssuersMetaRegistryImpl, "ATKTrustedIssuersMetaRegistryImplementation");
        address topicSchemeRegistryImpl = address(new ATKTopicSchemeRegistryImplementation(TRUSTED_FORWARDER_ADDRESS));
        vm.label(topicSchemeRegistryImpl, "ATKTopicSchemeRegistryImplementation");
        address identityFactoryImpl = address(new ATKIdentityFactoryImplementation(TRUSTED_FORWARDER_ADDRESS));
        vm.label(identityFactoryImpl, "ATKIdentityFactoryImplementation");
        address identityImpl = address(new ATKIdentityImplementation(TRUSTED_FORWARDER_ADDRESS));
        vm.label(identityImpl, "ATKIdentityImplementation");
        address contractIdentityImpl = address(new ATKContractIdentityImplementation(TRUSTED_FORWARDER_ADDRESS));
        vm.label(contractIdentityImpl, "ATKContractIdentityImplementation");
        address tokenAccessManagerImpl = address(new ATKTokenAccessManagerImplementation(TRUSTED_FORWARDER_ADDRESS));
        vm.label(tokenAccessManagerImpl, "ATKTokenAccessManagerImplementation");
        address tokenFactoryRegistryImpl = address(new ATKTokenFactoryRegistryImplementation(TRUSTED_FORWARDER_ADDRESS));
        vm.label(tokenFactoryRegistryImpl, "ATKTokenFactoryRegistryImplementation");
        address complianceModuleRegistryImpl =
            address(new ATKComplianceModuleRegistryImplementation(TRUSTED_FORWARDER_ADDRESS));
        vm.label(complianceModuleRegistryImpl, "ATKComplianceModuleRegistryImplementation");
        address systemAddonRegistryImpl = address(new ATKSystemAddonRegistryImplementation(TRUSTED_FORWARDER_ADDRESS));
        vm.label(systemAddonRegistryImpl, "ATKSystemAddonRegistryImplementation");
        address systemAccessManagerImpl = address(new ATKSystemAccessManagerImplementation(TRUSTED_FORWARDER_ADDRESS));
        vm.label(systemAccessManagerImpl, "ATKSystemAccessManagerImplementation");

        ATKSystemFactory.SystemImplementations memory implementations = ATKSystemFactory.SystemImplementations({
            atkSystemImplementation: atkSystemImpl,
            complianceImplementation: complianceImpl,
            identityRegistryImplementation: identityRegistryImpl,
            identityRegistryStorageImplementation: identityRegistryStorageImpl,
            systemTrustedIssuersRegistryImplementation: systemTrustedIssuersRegistryImpl,
            trustedIssuersMetaRegistryImplementation: trustedIssuersMetaRegistryImpl,
            topicSchemeRegistryImplementation: topicSchemeRegistryImpl,
            identityFactoryImplementation: identityFactoryImpl,
            identityImplementation: identityImpl,
            contractIdentityImplementation: contractIdentityImpl,
            tokenAccessManagerImplementation: tokenAccessManagerImpl,
            tokenFactoryRegistryImplementation: tokenFactoryRegistryImpl,
            complianceModuleRegistryImplementation: complianceModuleRegistryImpl,
            addonRegistryImplementation: systemAddonRegistryImpl,
            systemAccessManagerImplementation: systemAccessManagerImpl
        });

        return new ATKSystemFactory(implementations, TRUSTED_FORWARDER_ADDRESS);
    }

    function _startBootstrap(address platformAdmin) internal {
        vm.startPrank(platformAdmin);
        system = IATKSystem(systemFactory.createSystem());

        system.bootstrap();

        systemAccessManager = IATKSystemAccessManager(system.accessManager());

        compliance = ISMARTCompliance(system.compliance());

        identityRegistry = ISMARTIdentityRegistry(system.identityRegistry());
        identityRegistryStorage = ISMARTIdentityRegistryStorage(system.identityRegistryStorage());
        trustedIssuersRegistry = IATKTrustedIssuersRegistry(system.trustedIssuersRegistry());
        topicSchemeRegistry = ISMARTTopicSchemeRegistry(system.topicSchemeRegistry());
        identityFactory = IATKIdentityFactory(system.identityFactory());

        complianceModuleRegistry = IATKComplianceModuleRegistry(system.complianceModuleRegistry());
        systemAddonRegistry = IATKSystemAddonRegistry(system.systemAddonRegistry());
        tokenFactoryRegistry = IATKTokenFactoryRegistry(system.tokenFactoryRegistry());
    }

    function _deployComplianceModulesAndGrantRoles(address platformAdmin) internal {
        mockedComplianceModule = new MockedComplianceModule();
        identityVerificationModule = new SMARTIdentityVerificationComplianceModule(TRUSTED_FORWARDER_ADDRESS);
        countryAllowListComplianceModule = new CountryAllowListComplianceModule(TRUSTED_FORWARDER_ADDRESS);
        countryBlockListComplianceModule = new CountryBlockListComplianceModule(TRUSTED_FORWARDER_ADDRESS);

        bytes32[] memory platformAdminRoles = new bytes32[](5);
        platformAdminRoles[0] = ATKPeopleRoles.TOKEN_MANAGER_ROLE;
        platformAdminRoles[1] = ATKPeopleRoles.ADDON_MANAGER_ROLE;
        platformAdminRoles[2] = ATKPeopleRoles.COMPLIANCE_MANAGER_ROLE;
        platformAdminRoles[3] = ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE;
        platformAdminRoles[4] = ATKPeopleRoles.IDENTITY_MANAGER_ROLE;

        systemAccessManager.grantMultipleRoles(platformAdmin, platformAdminRoles);
        vm.stopPrank();
    }

    function _labelSystemFactory() internal {
        vm.label(address(systemFactory), "System Factory");
    }

    function _labelSystemContracts() internal {
        vm.label(address(system), "System");
        vm.label(address(systemAccessManager), "System Access Manager");
        vm.label(address(compliance), "Compliance");
        vm.label(address(identityRegistry), "Identity Registry");
        vm.label(address(identityRegistryStorage), "Identity Registry Storage");
        vm.label(address(trustedIssuersRegistry), "Trusted Issuers Registry");
        vm.label(address(topicSchemeRegistry), "Topic Scheme Registry");
        vm.label(address(identityFactory), "Identity Factory");
        vm.label(address(complianceModuleRegistry), "Compliance Module Registry");
        vm.label(address(systemAddonRegistry), "System Addon Registry");
        vm.label(address(tokenFactoryRegistry), "Token Factory Registry");
    }

    function _labelComplianceModules() internal {
        vm.label(address(mockedComplianceModule), "Mocked Compliance Module");
        vm.label(address(identityVerificationModule), "Identity Verification Module");
        vm.label(address(countryAllowListComplianceModule), "Country Allow List Compliance Module");
        vm.label(address(countryBlockListComplianceModule), "Country Block List Compliance Module");
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
