// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Adjust import path assuming SMARTInfrastructureSetup will be in ./utils/
import { Test } from "forge-std/Test.sol";
import { ISMART } from "../../../contracts/smart/interface/ISMART.sol";
import { ISMARTTokenAccessManager } from
    "../../../contracts/smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { SMARTComplianceModuleParamPair } from
    "../../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { ExpressionNode } from "../../../contracts/smart/interface/structs/ExpressionNode.sol";
import { ATKTopics } from "../../../contracts/system/ATKTopics.sol";
import { TestConstants } from "../../Constants.sol";
import { ClaimUtils } from "../../utils/ClaimUtils.sol";
import { IdentityUtils } from "../../utils/IdentityUtils.sol";
import { TokenUtils } from "../../utils/TokenUtils.sol";
import { SystemUtils } from "../../utils/SystemUtils.sol";
import { MockedComplianceModule } from "../../utils/mocks/MockedComplianceModule.sol";
import { SMARTToken } from "../examples/SMARTToken.sol";
import { ATKPeopleRoles } from "../../../contracts/system/ATKPeopleRoles.sol";
import { ClaimExpressionUtils } from "../../utils/ClaimExpressionUtils.sol";

abstract contract AbstractSMARTTest is Test {
    // --- State Variables ---
    ISMART internal token; // Token instance to be tested (set in inheriting contracts)
    ISMARTTokenAccessManager internal accessManager;
    MockedComplianceModule internal mockComplianceModule;

    // --- Test Actors ---
    address public platformAdmin;
    address public tokenIssuer;
    address public clientBE;
    address public clientJP;
    address public clientUS;
    address public clientUnverified;
    address public claimIssuer;

    // --- Test Data ---
    uint256[] public requiredClaimTopics;
    SMARTComplianceModuleParamPair[] public modulePairs;

    // --- Private Keys ---
    uint256 internal claimIssuerPrivateKey = 0x12345;

    // --- Utils ---
    SystemUtils internal systemUtils;
    IdentityUtils internal identityUtils;
    ClaimUtils internal claimUtils;
    TokenUtils internal tokenUtils;

    // --- Constants ---
    uint256 internal constant INITIAL_MINT_AMOUNT = 1000 ether;

    // --- Setup ---
    function setUp() public virtual {
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
        requiredClaimTopics[0] = systemUtils.getTopicId(ATKTopics.TOPIC_INVESTOR_KYC);
        requiredClaimTopics[1] = systemUtils.getTopicId(ATKTopics.TOPIC_INVESTOR_AML);

        // --- Setup Identities AFTER requiredClaimTopics is initialized ---
        _setupIdentities();

        modulePairs = new SMARTComplianceModuleParamPair[](2);
        modulePairs[0] = SMARTComplianceModuleParamPair({
            module: address(systemUtils.identityVerificationModule()),
            params: abi.encode(ClaimExpressionUtils.topicsToExpressionNodes(requiredClaimTopics))
        });
        modulePairs[1] =
            SMARTComplianceModuleParamPair({ module: address(mockComplianceModule), params: abi.encode("") });

        _setupToken();

        assertNotEq(address(token), address(0), "Token not deployed");
        vm.label(address(token), "Token");
    }

    function _setupToken() internal virtual { }

    // --- Helper Functions ---

    /**
     * @notice Issues a large, long-lived collateral claim to the token's identity.
     * @dev Should be called by inheriting test suites in setUp() *after* _setupToken()
     *      if they require the token to be generally mintable, unless they need
     *      specific collateral scenarios (like SMARTCollateralTest).
     */
    function _setupDefaultCollateralClaim() internal {
        require(address(token) != address(0), "Token must be set up before adding collateral claim");

        // Use a very large amount and a long expiry
        uint256 largeCollateralAmount = type(uint256).max / 2; // Avoid hitting absolute max
        uint256 farFutureExpiry = block.timestamp + 3650 days; // ~10 years

        claimUtils.issueCollateralClaim(address(token), tokenIssuer, largeCollateralAmount, farFutureExpiry);
    }

    function _mintInitialBalances() internal {
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, INITIAL_MINT_AMOUNT);
        tokenUtils.mintToken(address(token), tokenIssuer, clientJP, INITIAL_MINT_AMOUNT);
        tokenUtils.mintToken(address(token), tokenIssuer, clientUS, INITIAL_MINT_AMOUNT);
        // clientUnverified does not get initial balance
        mockComplianceModule.reset(); // Reset count after setup mints
    }

    function _setupIdentities() internal {
        // (Reverted to original logic provided by user)
        // Create the token issuer identixty
        identityUtils.createClientIdentity(tokenIssuer, TestConstants.COUNTRY_CODE_BE);
        // Issue claims to the token issuer as well (assuming they need verification)
        uint256[] memory claimTopics = new uint256[](3);
        claimTopics[0] = systemUtils.getTopicId(ATKTopics.TOPIC_INVESTOR_KYC);
        claimTopics[1] = systemUtils.getTopicId(ATKTopics.TOPIC_INVESTOR_AML);
        claimTopics[2] = systemUtils.getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL);
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

    function _grantAllRoles(address tokenAddress, address tokenIssuer_) internal {
        vm.startPrank(tokenIssuer_);
        // Grant all roles to the token issuer
        accessManager.grantRole(SMARTToken(tokenAddress).TOKEN_ADMIN_ROLE(), tokenIssuer_);
        accessManager.grantRole(SMARTToken(tokenAddress).COMPLIANCE_ADMIN_ROLE(), tokenIssuer_);
        accessManager.grantRole(SMARTToken(tokenAddress).VERIFICATION_ADMIN_ROLE(), tokenIssuer_);
        accessManager.grantRole(SMARTToken(tokenAddress).MINTER_ROLE(), tokenIssuer_);
        accessManager.grantRole(SMARTToken(tokenAddress).BURNER_ROLE(), tokenIssuer_);
        accessManager.grantRole(SMARTToken(tokenAddress).FREEZER_ROLE(), tokenIssuer_);
        accessManager.grantRole(SMARTToken(tokenAddress).FORCED_TRANSFER_ROLE(), tokenIssuer_);
        accessManager.grantRole(SMARTToken(tokenAddress).RECOVERY_ROLE(), tokenIssuer_);
        accessManager.grantRole(SMARTToken(tokenAddress).PAUSER_ROLE(), tokenIssuer_);
        accessManager.grantRole(SMARTToken(tokenAddress).CAP_MANAGEMENT_ROLE(), tokenIssuer_);
        accessManager.grantRole(ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE, tokenIssuer_);
        vm.stopPrank();
    }

    // =====================================================================
    //                      INITIALIZATION & BASIC TESTS
    // =====================================================================

    function _topicsToExpressionNodes(uint256[] memory topics) internal pure returns (ExpressionNode[] memory) {
        return ClaimExpressionUtils.topicsToExpressionNodes(topics);
    }

    function test_InitialState() public view {
        require(address(token) != address(0), "Token not deployed");
    }
}
