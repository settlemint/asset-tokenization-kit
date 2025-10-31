// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { SystemUtils } from "../../utils/SystemUtils.sol";
import { IdentityUtils } from "../../utils/IdentityUtils.sol";
import { TokenUtils } from "../../utils/TokenUtils.sol";
import { ClaimUtils } from "../../utils/ClaimUtils.sol";
import { ISMART } from "../../../contracts/smart/interface/ISMART.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { SMARTToken } from "../examples/SMARTToken.sol";
import {
    SMARTComplianceModuleParamPair
} from "../../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import {
    ISMARTTokenAccessManager
} from "../../../contracts/smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { ATKTopics } from "../../../contracts/system/ATKTopics.sol";
import { TestConstants } from "../../Constants.sol";
import { ATKPeopleRoles } from "../../../contracts/system/ATKPeopleRoles.sol";
import { IATKCompliance } from "../../../contracts/system/compliance/IATKCompliance.sol";

abstract contract AbstractComplianceModuleTest is Test {
    SystemUtils internal systemUtils;
    IdentityUtils internal identityUtils;
    TokenUtils internal tokenUtils;
    ClaimUtils internal claimUtils;

    ISMARTTokenAccessManager internal accessManager;

    // Users
    address internal platformAdmin;
    address internal tokenIssuer;
    address internal user1;
    address internal user2;
    address internal user3;
    address internal claimIssuer;

    // --- Private Keys ---
    uint256 internal claimIssuerPrivateKey = 0x12345;

    // Identities
    IIdentity internal identity1;
    IIdentity internal identity2;
    // user3 has no identity

    // Token
    ISMART internal smartToken;

    function setUp() public virtual {
        platformAdmin = makeAddr("platformAdmin");
        tokenIssuer = makeAddr("tokenIssuer");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        claimIssuer = vm.addr(claimIssuerPrivateKey);

        systemUtils = new SystemUtils(platformAdmin);
        identityUtils = new IdentityUtils(
            platformAdmin,
            systemUtils.identityFactory(),
            systemUtils.identityRegistry(),
            systemUtils.trustedIssuersRegistry()
        );
        tokenUtils = new TokenUtils(
            platformAdmin, systemUtils.identityFactory(), systemUtils.identityRegistry(), systemUtils.compliance()
        );
        claimUtils = new ClaimUtils(
            platformAdmin,
            claimIssuer,
            claimIssuerPrivateKey,
            systemUtils.identityRegistry(),
            systemUtils.identityFactory(),
            systemUtils.topicSchemeRegistry()
        );

        // --- Setup access manager ---
        accessManager = systemUtils.createTokenAccessManager(tokenIssuer);

        // Create identities
        // Create the token issuer identixty
        identityUtils.createClientIdentity(tokenIssuer, TestConstants.COUNTRY_CODE_BE);

        // Issue claims to the token issuer as well (assuming they need verification)
        uint256[] memory claimTopics = new uint256[](4);
        claimTopics[0] = systemUtils.getTopicId(ATKTopics.TOPIC_INVESTOR_KYC);
        claimTopics[1] = systemUtils.getTopicId(ATKTopics.TOPIC_INVESTOR_AML);
        claimTopics[2] = systemUtils.getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL);
        claimTopics[3] = systemUtils.getTopicId(ATKTopics.TOPIC_ASSET_BASE_PRICE);
        // Use claimIssuer address directly, createIssuerIdentity handles creating the on-chain identity
        vm.label(claimIssuer, "Claim Issuer");
        address claimIssuerIdentity = identityUtils.createIssuerIdentity(claimIssuer, claimTopics);
        vm.label(claimIssuerIdentity, "Claim Issuer Identity");

        claimUtils.issueAllClaims(tokenIssuer);

        identity1 = IIdentity(identityUtils.createClientIdentity(user1, TestConstants.COUNTRY_CODE_US)); // USA
        identity2 = IIdentity(identityUtils.createClientIdentity(user2, TestConstants.COUNTRY_CODE_BE)); // Belgium
            // user3 has no identity

        // Add token issuer to the bypass list so that he is allowed to do things for testing
        vm.startPrank(platformAdmin);
        systemUtils.systemAccessManager().grantRole(ATKPeopleRoles.COMPLIANCE_MANAGER_ROLE, platformAdmin);
        IATKCompliance(address(systemUtils.compliance())).addToBypassList(tokenIssuer);
        vm.stopPrank();

        // Create token
        vm.startPrank(tokenIssuer);
        smartToken = new SMARTToken(
            "Test Token",
            "TEST",
            18,
            1000e18, // cap
            address(0), // onchainID_
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            new SMARTComplianceModuleParamPair[](0),
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL),
            address(accessManager)
        );

        // Grant roles to the token issuer
        accessManager.grantRole(SMARTToken(address(smartToken)).COMPLIANCE_ADMIN_ROLE(), tokenIssuer);
        accessManager.grantRole(SMARTToken(address(smartToken)).MINTER_ROLE(), tokenIssuer);
        accessManager.grantRole(SMARTToken(address(smartToken)).BURNER_ROLE(), tokenIssuer);
        accessManager.grantRole(SMARTToken(address(smartToken)).FREEZER_ROLE(), tokenIssuer);
        accessManager.grantRole(SMARTToken(address(smartToken)).FORCED_TRANSFER_ROLE(), tokenIssuer);
        accessManager.grantRole(SMARTToken(address(smartToken)).RECOVERY_ROLE(), tokenIssuer);
        accessManager.grantRole(SMARTToken(address(smartToken)).PAUSER_ROLE(), tokenIssuer);
        accessManager.grantRole(SMARTToken(address(smartToken)).CAP_MANAGEMENT_ROLE(), tokenIssuer);
        accessManager.grantRole(SMARTToken(address(smartToken)).TOKEN_ADMIN_ROLE(), tokenIssuer);

        // Create the token's on-chain identity
        tokenUtils.createAndSetTokenOnchainID(address(smartToken), tokenIssuer);

        // Issue a collateral claim
        uint256 largeCollateralAmount = type(uint256).max / 2; // Avoid hitting absolute max
        uint256 farFutureExpiry = block.timestamp + 3650 days; // ~10 years

        claimUtils.issueCollateralClaim(address(smartToken), tokenIssuer, largeCollateralAmount, farFutureExpiry);
        vm.stopPrank();
    }
}
