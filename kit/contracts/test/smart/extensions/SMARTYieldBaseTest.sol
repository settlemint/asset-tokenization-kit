// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { AbstractSMARTTest } from "./AbstractSMARTTest.sol";
import { SMARTYieldHelpers, MockERC20 } from "./../../utils/SMARTYieldHelpers.sol";
import { IATKFixedYieldScheduleFactory } from "../../../contracts/addons/yield/IATKFixedYieldScheduleFactory.sol";
import { ATKFixedYieldScheduleFactoryImplementation } from
    "../../../contracts/addons/yield/ATKFixedYieldScheduleFactoryImplementation.sol";
import { ATKSystemRoles } from "../../../contracts/system/ATKSystemRoles.sol";
import { SystemUtils } from "../../utils/SystemUtils.sol";
import { IdentityUtils } from "../../utils/IdentityUtils.sol";
import { ClaimUtils } from "../../utils/ClaimUtils.sol";
import { TokenUtils } from "../../utils/TokenUtils.sol";
import { MockedComplianceModule } from "../../utils/mocks/MockedComplianceModule.sol";
import { ATKTopics } from "../../../contracts/system/ATKTopics.sol";
import { SMARTComplianceModuleParamPair } from
    "../../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { Test } from "forge-std/Test.sol";
import { ISMART } from "../../../contracts/smart/interface/ISMART.sol";
import { ISMARTTokenAccessManager } from
    "../../../contracts/smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { TestConstants } from "../../Constants.sol";

/// @title Base test contract for SMART Yield functionality
/// @notice Provides shared state and setup for yield tests
abstract contract SMARTYieldBaseTest is AbstractSMARTTest, SMARTYieldHelpers {
    IATKFixedYieldScheduleFactory internal yieldScheduleFactory;
    address internal yieldPaymentToken;

    function setUp() public virtual override {
        // --- Setup platform admin ---
        platformAdmin = makeAddr("Platform Admin");

        // --- Setup infrastructure ---
        systemUtils = new SystemUtils(platformAdmin);
        mockComplianceModule = systemUtils.mockedComplianceModule();

        // --- Initialize Actors ---
        tokenIssuer = makeAddr("Token issuer");
        clientBE = makeAddr("Client BE");
        clientJP = makeAddr("Client JP");
        clientUS = makeAddr("Client US");
        clientUnverified = makeAddr("Client Unverified");
        claimIssuer = vm.addr(claimIssuerPrivateKey);

        // --- Setup access manager ---
        accessManager = systemUtils.createTokenAccessManager(tokenIssuer);

        // --- Setup utilities
        identityUtils = new IdentityUtils(
            platformAdmin,
            systemUtils.identityFactory(),
            systemUtils.identityRegistry(),
            systemUtils.trustedIssuersRegistry()
        );
        claimUtils = new ClaimUtils(
            platformAdmin,
            claimIssuer,
            claimIssuerPrivateKey,
            systemUtils.identityRegistry(),
            systemUtils.identityFactory(),
            systemUtils.topicSchemeRegistry()
        );
        tokenUtils = new TokenUtils(
            platformAdmin, systemUtils.identityFactory(), systemUtils.identityRegistry(), systemUtils.compliance()
        );

        // --- Initialize Test Data FIRST ---
        requiredClaimTopics = new uint256[](2);
        requiredClaimTopics[0] = systemUtils.getTopicId(ATKTopics.TOPIC_KYC);
        requiredClaimTopics[1] = systemUtils.getTopicId(ATKTopics.TOPIC_AML);

        // --- Setup Identities AFTER requiredClaimTopics is initialized ---
        _setupIdentities();

        modulePairs = new SMARTComplianceModuleParamPair[](2);
        modulePairs[0] = SMARTComplianceModuleParamPair({
            module: address(systemUtils.identityVerificationModule()),
            params: abi.encode(requiredClaimTopics)
        });
        modulePairs[1] =
            SMARTComplianceModuleParamPair({ module: address(mockComplianceModule), params: abi.encode("") });

        // Setup yield-specific components BEFORE setting up the token
        _setupYieldInfrastructure();

        // Now setup the token
        _setupToken();

        assertNotEq(address(token), address(0), "Token not deployed");
        vm.label(address(token), "Token");

        // Grant REGISTRAR_ROLE to the token contract on the Identity Registry
        // Needed for custody address recovery
        address registryAddress = address(systemUtils.identityRegistry());
        address tokenAddress = address(token);

        vm.prank(platformAdmin);
        IAccessControl(payable(registryAddress)).grantRole(ATKSystemRoles.REGISTRAR_ROLE, tokenAddress);

        // Verify the role was granted
        assertTrue(
            IAccessControl(payable(registryAddress)).hasRole(ATKSystemRoles.REGISTRAR_ROLE, tokenAddress),
            "Token was not granted REGISTRAR_ROLE"
        );
    }

    function _setupYieldInfrastructure() internal virtual {
        // Deploy yield payment token (using a simple ERC20 mock for testing)
        if (yieldPaymentToken == address(0)) {
            yieldPaymentToken = address(new MockERC20("Yield Token", "YIELD"));
        }

        // Deploy yield schedule factory
        vm.startPrank(platformAdmin);
        ATKFixedYieldScheduleFactoryImplementation fixedYieldScheduleFactoryImpl =
            new ATKFixedYieldScheduleFactoryImplementation(address(address(0)));

        yieldScheduleFactory = IATKFixedYieldScheduleFactory(
            systemUtils.systemAddonRegistry().registerSystemAddon(
                "fixed-yield-schedule-factory",
                address(fixedYieldScheduleFactoryImpl),
                abi.encodeWithSelector(
                    ATKFixedYieldScheduleFactoryImplementation.initialize.selector,
                    address(systemUtils.system()),
                    platformAdmin
                )
            )
        );
        vm.label(address(yieldScheduleFactory), "Yield Schedule Factory");

        IAccessControl(address(yieldScheduleFactory)).grantRole(ATKSystemRoles.DEPLOYER_ROLE, tokenIssuer);

        // Grant bypass list manager role to yield schedule factory through the centralized access manager
        // The platform admin should already have COMPLIANCE_MANAGER_ROLE from SystemUtils setup
        // which gives them authority to grant BYPASS_LIST_MANAGER_ROLE
        systemUtils.systemAccessManager().grantRole(
            ATKSystemRoles.BYPASS_LIST_MANAGER_ROLE, address(yieldScheduleFactory)
        );

        vm.stopPrank();

        // Start at a high block number that can accommodate timestamps as block numbers
        _ensureBlockAlignment();
    }

    function _setUpYieldTest() internal virtual {
        // This method is kept for backward compatibility but now does nothing
        // since everything is handled in setUp()
    }

    function _setupIdentities() internal override {
        // (Reverted to original logic provided by user)
        // Create the token issuer identixty
        identityUtils.createClientIdentity(tokenIssuer, TestConstants.COUNTRY_CODE_BE);
        // Issue claims to the token issuer as well (assuming they need verification)
        uint256[] memory claimTopics = new uint256[](3);
        claimTopics[0] = systemUtils.getTopicId(ATKTopics.TOPIC_KYC);
        claimTopics[1] = systemUtils.getTopicId(ATKTopics.TOPIC_AML);
        claimTopics[2] = systemUtils.getTopicId(ATKTopics.TOPIC_COLLATERAL);
        // Use claimIssuer address directly, createIssuerIdentity handles creating the on-chain identity
        vm.label(claimIssuer, "Claim Issuer");
        address claimIssuerIdentity = identityUtils.createIssuerIdentity(claimIssuer, claimTopics);
        vm.label(claimIssuerIdentity, "Claim Issuer Identity");

        // Now issue claims TO the token issuer
        claimUtils.issueAllClaims(tokenIssuer);

        // Create the client identities
        address clientBEIdentity = identityUtils.createClientIdentity(clientBE, TestConstants.COUNTRY_CODE_BE);
        vm.label(clientBEIdentity, "Client BE Identity");
        address clientJPIdentity = identityUtils.createClientIdentity(clientJP, TestConstants.COUNTRY_CODE_JP);
        vm.label(clientJPIdentity, "Client JP Identity");
        address clientUSIdentity = identityUtils.createClientIdentity(clientUS, TestConstants.COUNTRY_CODE_US);
        vm.label(clientUSIdentity, "Client US Identity");
        address clientUnverifiedIdentity =
            identityUtils.createClientIdentity(clientUnverified, TestConstants.COUNTRY_CODE_BE);
        vm.label(clientUnverifiedIdentity, "Client Unverified Identity");

        // Issue claims to clients
        claimUtils.issueAllClaims(clientBE);
        claimUtils.issueAllClaims(clientJP);
        claimUtils.issueAllClaims(clientUS);
        // Only issue KYC claim to the unverified client
        claimUtils.issueKYCClaim(clientUnverified);
    }
}
