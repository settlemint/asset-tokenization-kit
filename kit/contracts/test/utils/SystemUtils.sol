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


        _startBootstrap(platformAdmin);
        _deployComplianceModulesAndGrantRoles(platformAdmin);
    }

    function _deploySystemFactory() internal returns (ATKSystemFactory) {
        (
            address a0,
            address a1,
            address a2,
            address a3,
            address a4,
            address a5,
            address a6,
            address a7
        ) = _deploySystemFactoryPart1();
        (
            address a8,
            address a9,
            address a10,
            address a11,
            address a12,
            address a13,
            address a14
        ) = _deploySystemFactoryPart2();

        return new ATKSystemFactory(
            a0,
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
            a8,
            a9,
            a10,
            a11,
            a12,
            a13,
            a14,
            TRUSTED_FORWARDER_ADDRESS
        );
    }

    function _deploySystemFactoryPart1()
        internal
        returns (
            address a0,
            address a1,
            address a2,
            address a3,
            address a4,
            address a5,
            address a6,
            address a7
        )
    {
        a0 = address(new ATKSystemImplementation(TRUSTED_FORWARDER_ADDRESS));
        a1 = address(new ATKComplianceImplementation(TRUSTED_FORWARDER_ADDRESS));
        a2 = address(new ATKIdentityRegistryImplementation(TRUSTED_FORWARDER_ADDRESS));
        a3 = address(new ATKIdentityRegistryStorageImplementation(TRUSTED_FORWARDER_ADDRESS));
        a4 = address(new ATKSystemTrustedIssuersRegistryImplementation(TRUSTED_FORWARDER_ADDRESS));
        a5 = address(new ATKTrustedIssuersMetaRegistryImplementation(TRUSTED_FORWARDER_ADDRESS));
        a6 = address(new ATKTopicSchemeRegistryImplementation(TRUSTED_FORWARDER_ADDRESS));
        a7 = address(new ATKIdentityFactoryImplementation(TRUSTED_FORWARDER_ADDRESS));
    }

    function _deploySystemFactoryPart2()
        internal
        returns (
            address a8,
            address a9,
            address a10,
            address a11,
            address a12,
            address a13,
            address a14
        )
    {
        a8 = address(new ATKIdentityImplementation(TRUSTED_FORWARDER_ADDRESS));
        a9 = address(new ATKContractIdentityImplementation(TRUSTED_FORWARDER_ADDRESS));
        a10 = address(new ATKTokenAccessManagerImplementation(TRUSTED_FORWARDER_ADDRESS));
        a11 = address(new ATKTokenFactoryRegistryImplementation(TRUSTED_FORWARDER_ADDRESS));
        a12 = address(new ATKComplianceModuleRegistryImplementation(TRUSTED_FORWARDER_ADDRESS));
        a13 = address(new ATKSystemAddonRegistryImplementation(TRUSTED_FORWARDER_ADDRESS));
        a14 = address(new ATKSystemAccessManagerImplementation(TRUSTED_FORWARDER_ADDRESS));
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

    function getTopicId(string memory topicName) public view returns (uint256) {
        return topicSchemeRegistry.getTopicId(topicName);
    }

    function createTokenAccessManager(address initialAdmin) external returns (ISMARTTokenAccessManager) {
        address[] memory initialAdmins = new address[](1);
        initialAdmins[0] = initialAdmin;
        return ISMARTTokenAccessManager(address(new ATKTokenAccessManagerProxy(address(system), initialAdmins)));
    }
}
