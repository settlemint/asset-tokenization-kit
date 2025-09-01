// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { SystemUtils } from "../../utils/SystemUtils.sol";
import { ClaimUtils } from "../../utils/ClaimUtils.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";
import { IERC734 } from "@onchainid/contracts/interface/IERC734.sol";
import { IATKIdentityFactory } from "../../../contracts/system/identity-factory/IATKIdentityFactory.sol";
import { ISMARTTrustedIssuersRegistry } from
    "../../../contracts/smart/interface/ISMARTTrustedIssuersRegistry.sol";
import { ISMARTTopicSchemeRegistry } from "../../../contracts/smart/interface/ISMARTTopicSchemeRegistry.sol";
import { ATKTopics } from "../../../contracts/system/ATKTopics.sol";
import { IATKIdentity } from "../../../contracts/system/identity-factory/identities/IATKIdentity.sol";
import { ERC734KeyPurposes } from "../../../contracts/onchainid/ERC734KeyPurposes.sol";
import { ERC734KeyTypes } from "../../../contracts/onchainid/ERC734KeyTypes.sol";
import { ERC735ClaimSchemes } from "../../../contracts/onchainid/ERC735ClaimSchemes.sol";
import { IContractWithIdentity } from "../../../contracts/system/identity-factory/IContractWithIdentity.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title Mock Contract for testing contract identities
 * @notice A simple mock contract that implements IContractWithIdentity for testing purposes
 */
contract MockContractWithIdentity is IContractWithIdentity {
    address public override onchainID;
    address public admin;

    constructor(address _admin) {
        admin = _admin;
    }

    function setOnchainID(address _onchainID) external {
        require(msg.sender == admin, "Only admin can set onchainID");
        onchainID = _onchainID;
    }

    function canAddClaim(address actor) external view override returns (bool) {
        return actor == admin;
    }

    function canRemoveClaim(address actor) external view override returns (bool) {
        return actor == admin;
    }

    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return interfaceId == type(IContractWithIdentity).interfaceId || interfaceId == type(IERC165).interfaceId;
    }
}

/**
 * @title ATK Identity Factory Trusted Issuer Round Trip Test
 * @notice Tests the complete flow of:
 * 1. Creating an identity via the identity factory
 * 2. Adding a claim issuer to the trusted issuers registry with topics
 * 3. Setting the trusted issuers registry as a ClaimAuthorizer on the created identity
 * 4. Having the claim issuer directly add claims to the identity (bypassing wallet owner)
 * @dev This tests the scenario where trusted issuers can add claims directly to identities
 */
contract ATKIdentityFactoryTrustedIssuerRoundTripTest is Test {
    SystemUtils public systemUtils;
    ClaimUtils public claimUtils;

    // System contracts
    IATKIdentityFactory public identityFactory;
    ISMARTTrustedIssuersRegistry public trustedIssuersRegistry;
    ISMARTTopicSchemeRegistry public topicSchemeRegistry;

    // Test addresses and keys
    address public admin;
    address public user;
    address public claimIssuer;
    uint256 public claimIssuerPrivateKey;

    // Identity contracts
    IATKIdentity public userIdentity;
    IIdentity public issuerIdentity;

    // Contract identity test variables
    MockContractWithIdentity public mockContract;
    IIdentity public contractIdentity;

    // Claim topics
    uint256 public kycTopicId;
    uint256 public amlTopicId;

    // Events to test
    event ClaimAdded(
        bytes32 indexed claimId,
        uint256 indexed topic,
        uint256 scheme,
        address indexed issuer,
        bytes signature,
        bytes data,
        string uri
    );

    function setUp() public {
        admin = makeAddr("admin");
        user = makeAddr("user");

        // Generate claim issuer with private key
        claimIssuerPrivateKey = 0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234;
        claimIssuer = vm.addr(claimIssuerPrivateKey);

        // Deploy system using SystemUtils
        systemUtils = new SystemUtils(admin);

        // Get system contract references
        identityFactory = systemUtils.identityFactory();
        trustedIssuersRegistry = systemUtils.trustedIssuersRegistry();
        topicSchemeRegistry = systemUtils.topicSchemeRegistry();

        // Get topic IDs
        kycTopicId = topicSchemeRegistry.getTopicId(ATKTopics.TOPIC_INVESTOR_KYC);
        amlTopicId = topicSchemeRegistry.getTopicId(ATKTopics.TOPIC_INVESTOR_AML);

        // Deploy ClaimUtils for testing
        claimUtils = new ClaimUtils(
            admin,
            claimIssuer,
            claimIssuerPrivateKey,
            systemUtils.identityRegistry(),
            identityFactory,
            topicSchemeRegistry
        );

        // Create mock contract for testing contract identities
        mockContract = new MockContractWithIdentity(admin);
    }

    /**
     * @notice Tests the complete round trip of trusted issuer claim authorization
     */
    function testTrustedIssuerClaimRoundTrip() public {
        // Step 1: Create identities for user and claim issuer via the factory
        vm.startPrank(admin);

        bytes32[] memory managementKeys = new bytes32[](0);

        // Create user identity
        address userIdentityAddr = identityFactory.createIdentity(user, managementKeys);
        userIdentity = IATKIdentity(userIdentityAddr);
        assertTrue(userIdentityAddr != address(0), "User identity creation failed");

        // Create claim issuer identity
        address issuerIdentityAddr = identityFactory.createIdentity(claimIssuer, managementKeys);
        issuerIdentity = IIdentity(issuerIdentityAddr);
        assertTrue(issuerIdentityAddr != address(0), "Issuer identity creation failed");

        vm.stopPrank();

        // Add claim signer key to the issuer's identity so the claimIssuer wallet can act on behalf of the issuer
        // identity
        // The claimIssuer wallet needs either CLAIM_SIGNER_KEY (purpose 3) or MANAGEMENT_KEY (purpose 1)
        // in the issuer identity to be authorized to add claims on behalf of that issuer
        vm.prank(claimIssuer);
        bytes32 issuerKey = keccak256(abi.encode(claimIssuer));
        IERC734(issuerIdentityAddr).addKey(issuerKey, ERC734KeyPurposes.CLAIM_SIGNER_KEY, ERC734KeyTypes.ECDSA);

        // Step 2: Register the claim issuer in the trusted issuers registry with topics
        uint256[] memory allowedTopics = new uint256[](2);
        allowedTopics[0] = kycTopicId;
        allowedTopics[1] = amlTopicId;

        vm.prank(admin);
        trustedIssuersRegistry.addTrustedIssuer(IClaimIssuer(issuerIdentityAddr), allowedTopics);

        // Verify the issuer is registered for both topics
        assertTrue(
            trustedIssuersRegistry.hasClaimTopic(issuerIdentityAddr, kycTopicId), "Issuer not registered for KYC topic"
        );
        assertTrue(
            trustedIssuersRegistry.hasClaimTopic(issuerIdentityAddr, amlTopicId), "Issuer not registered for AML topic"
        );

        // Step 3: The trusted issuers registry is already set as a ClaimAuthorizer during identity creation
        // by the identity factory (see ATKIdentityFactoryImplementation lines 484-486)
        // So we can skip manual registration

        // Step 4: Create and sign claims as the issuer
        string memory kycClaimData = "KYC Verified by Trusted Issuer";
        string memory amlClaimData = "AML Verified by Trusted Issuer";

        (bytes memory kycData, bytes memory kycSignature) =
            claimUtils.createClaimSignature(userIdentityAddr, kycTopicId, kycClaimData);

        (bytes memory amlData, bytes memory amlSignature) =
            claimUtils.createClaimSignature(userIdentityAddr, amlTopicId, amlClaimData);

        // Step 5: The issuer identity contract adds claims directly to the user's identity
        // This should succeed because the issuer identity is registered as a trusted issuer
        // and the trusted issuers registry is set as a ClaimAuthorizer on the user's identity

        // Test KYC claim addition - the issuer identity contract calls addClaim on the user's identity
        vm.expectEmit(false, true, true, true); // Don't check exact claimId, it will be calculated
        emit ClaimAdded(
            bytes32(0), // claimId will be calculated by the identity contract
            kycTopicId,
            ERC735ClaimSchemes.SCHEME_ECDSA,
            issuerIdentityAddr,
            kycSignature,
            kycData,
            ""
        );

        // The claimIssuer wallet (which has claim signer key in the issuer identity) calls addClaim
        // The ClaimAuthorizationExtension will authorize this because:
        // 1. _msgSender() will be claimIssuer wallet
        // 2. claimIssuer has CLAIM_SIGNER_KEY in the issuer identity, so _isAuthorizedToActForIssuer returns true
        // 3. The trusted issuers registry is registered as a ClaimAuthorizer on the user's identity
        // 4. The issuer identity is registered in the trusted issuers registry for this topic
        vm.prank(claimIssuer); // The wallet with claim signer key makes the call
        bytes32 kycClaimId = userIdentity.addClaim(
            kycTopicId, ERC735ClaimSchemes.SCHEME_ECDSA, issuerIdentityAddr, kycSignature, kycData, ""
        );

        assertTrue(kycClaimId != bytes32(0), "KYC claim addition failed");

        // Test AML claim addition
        vm.expectEmit(false, true, true, true); // Don't check exact claimId, it will be calculated
        emit ClaimAdded(
            bytes32(0), // claimId will be calculated by the identity contract
            amlTopicId,
            ERC735ClaimSchemes.SCHEME_ECDSA,
            issuerIdentityAddr,
            amlSignature,
            amlData,
            ""
        );

        vm.prank(claimIssuer); // The wallet with claim signer key makes the call
        bytes32 amlClaimId = userIdentity.addClaim(
            amlTopicId, ERC735ClaimSchemes.SCHEME_ECDSA, issuerIdentityAddr, amlSignature, amlData, ""
        );

        assertTrue(amlClaimId != bytes32(0), "AML claim addition failed");

        // Step 6: Verify the claims were added correctly
        (
            uint256 kycTopic,
            uint256 kycScheme,
            address kycIssuer,
            bytes memory kycSig,
            bytes memory kycClaimDataReturned,
            string memory kycUri
        ) = userIdentity.getClaim(kycClaimId);

        assertEq(kycTopic, kycTopicId, "KYC topic mismatch");
        assertEq(kycScheme, 1, "KYC scheme mismatch");
        assertEq(kycIssuer, issuerIdentityAddr, "KYC issuer mismatch");
        assertEq(kycSig, kycSignature, "KYC signature mismatch");
        assertEq(kycClaimDataReturned, kycData, "KYC data mismatch");
        assertEq(kycUri, "", "KYC URI mismatch");

        (
            uint256 amlTopic,
            uint256 amlScheme,
            address amlIssuer,
            bytes memory amlSig,
            bytes memory amlClaimDataReturned,
            string memory amlUri
        ) = userIdentity.getClaim(amlClaimId);

        assertEq(amlTopic, amlTopicId, "AML topic mismatch");
        assertEq(amlScheme, 1, "AML scheme mismatch");
        assertEq(amlIssuer, issuerIdentityAddr, "AML issuer mismatch");
        assertEq(amlSig, amlSignature, "AML signature mismatch");
        assertEq(amlClaimDataReturned, amlData, "AML data mismatch");
        assertEq(amlUri, "", "AML URI mismatch");

        // Step 7: Verify claim validation via the issuer
        assertTrue(
            claimUtils.verifyClaim(issuerIdentityAddr, userIdentity, kycTopicId, kycSignature, kycData),
            "KYC claim validation failed"
        );
        assertTrue(
            claimUtils.verifyClaim(issuerIdentityAddr, userIdentity, amlTopicId, amlSignature, amlData),
            "AML claim validation failed"
        );
    }

    /**
     * @notice Tests that untrusted issuers cannot add claims even if they have valid signatures
     */
    function testUntrustedIssuerCannotAddClaims() public {
        // Create user identity
        vm.prank(admin);
        bytes32[] memory managementKeys = new bytes32[](0);
        address userIdentityAddr = identityFactory.createIdentity(user, managementKeys);
        userIdentity = IATKIdentity(userIdentityAddr);

        // Create untrusted issuer
        uint256 untrustedIssuerPrivateKey = 0x987654321fedcba987654321fedcba987654321fedcba987654321fedcba98;
        address untrustedIssuer = vm.addr(untrustedIssuerPrivateKey);

        vm.prank(admin);
        address untrustedIssuerIdentityAddr = identityFactory.createIdentity(untrustedIssuer, managementKeys);

        // The trusted issuers registry is already set as claim authorizer during identity creation
        // (but the untrusted issuer is not added to the registry)

        // Create valid claim signature
        string memory claimData = "Malicious Claim";
        bytes memory encodedData = abi.encode(claimData);
        bytes32 dataHash = keccak256(abi.encode(userIdentityAddr, kycTopicId, encodedData));
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", dataHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(untrustedIssuerPrivateKey, prefixedHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Attempt to add claim should fail
        vm.prank(untrustedIssuer);
        vm.expectRevert();
        userIdentity.addClaim(kycTopicId, 1, untrustedIssuerIdentityAddr, signature, encodedData, "");
    }

    /**
     * @notice Tests that trusted issuers cannot add claims for topics they're not authorized for
     */
    function testTrustedIssuerCannotAddUnauthorizedTopicClaims() public {
        // Create identities
        vm.startPrank(admin);
        bytes32[] memory managementKeys = new bytes32[](0);
        address userIdentityAddr = identityFactory.createIdentity(user, managementKeys);
        userIdentity = IATKIdentity(userIdentityAddr);
        address issuerIdentityAddr = identityFactory.createIdentity(claimIssuer, managementKeys);
        vm.stopPrank();

        // Register issuer for only KYC topic (not AML)
        uint256[] memory allowedTopics = new uint256[](1);
        allowedTopics[0] = kycTopicId;

        vm.prank(admin);
        trustedIssuersRegistry.addTrustedIssuer(IClaimIssuer(issuerIdentityAddr), allowedTopics);

        // The trusted issuers registry is already set as claim authorizer during identity creation

        // Try to add AML claim (should fail)
        (bytes memory amlData, bytes memory amlSignature) =
            claimUtils.createClaimSignature(userIdentityAddr, amlTopicId, "Unauthorized AML Claim");

        vm.prank(claimIssuer);
        vm.expectRevert();
        userIdentity.addClaim(amlTopicId, 1, issuerIdentityAddr, amlSignature, amlData, "");

        // But KYC claim should succeed
        (bytes memory kycData, bytes memory kycSignature) =
            claimUtils.createClaimSignature(userIdentityAddr, kycTopicId, "Authorized KYC Claim");

        vm.prank(claimIssuer);
        bytes32 claimId = userIdentity.addClaim(kycTopicId, 1, issuerIdentityAddr, kycSignature, kycData, "");

        assertTrue(claimId != bytes32(0), "Authorized KYC claim should succeed");
    }

    /**
     * @notice Tests removal of trusted issuer and subsequent claim addition failure
     */
    function testRemovedTrustedIssuerCannotAddClaims() public {
        // Setup: Create identities and register trusted issuer
        vm.startPrank(admin);
        bytes32[] memory managementKeys = new bytes32[](0);
        address userIdentityAddr = identityFactory.createIdentity(user, managementKeys);
        userIdentity = IATKIdentity(userIdentityAddr);
        address issuerIdentityAddr = identityFactory.createIdentity(claimIssuer, managementKeys);

        uint256[] memory allowedTopics = new uint256[](1);
        allowedTopics[0] = kycTopicId;
        trustedIssuersRegistry.addTrustedIssuer(IClaimIssuer(issuerIdentityAddr), allowedTopics);
        vm.stopPrank();

        // The trusted issuers registry is already set as claim authorizer during identity creation

        // Verify issuer can add claims initially
        (bytes memory kycData, bytes memory kycSignature) =
            claimUtils.createClaimSignature(userIdentityAddr, kycTopicId, "Initial KYC Claim");

        vm.prank(claimIssuer);
        bytes32 claimId = userIdentity.addClaim(kycTopicId, 1, issuerIdentityAddr, kycSignature, kycData, "");
        assertTrue(claimId != bytes32(0), "Initial claim should succeed");

        // Remove trusted issuer
        vm.prank(admin);
        trustedIssuersRegistry.removeTrustedIssuer(IClaimIssuer(issuerIdentityAddr));

        // Verify issuer can no longer add claims
        (bytes memory kycData2, bytes memory kycSignature2) =
            claimUtils.createClaimSignature(userIdentityAddr, kycTopicId, "Post-removal KYC Claim");

        vm.prank(claimIssuer);
        vm.expectRevert();
        userIdentity.addClaim(kycTopicId, 1, issuerIdentityAddr, kycSignature2, kycData2, "");
    }

    /**
     * @notice Tests that only wallets with CLAIM_SIGNER_KEY or MANAGEMENT_KEY can add claims on behalf of an issuer
     */
    function testUnauthorizedKeyCannotAddClaimsOnBehalfOfIssuer() public {
        // Create identities
        vm.startPrank(admin);
        bytes32[] memory managementKeys = new bytes32[](0);
        address userIdentityAddr = identityFactory.createIdentity(user, managementKeys);
        userIdentity = IATKIdentity(userIdentityAddr);
        address issuerIdentityAddr = identityFactory.createIdentity(claimIssuer, managementKeys);

        // Register issuer in trusted issuers registry for KYC topic
        uint256[] memory allowedTopics = new uint256[](1);
        allowedTopics[0] = kycTopicId;
        trustedIssuersRegistry.addTrustedIssuer(IClaimIssuer(issuerIdentityAddr), allowedTopics);
        vm.stopPrank();

        // Add claim signer key to the issuer identity for the claimIssuer wallet (this is the authorized wallet)
        vm.prank(claimIssuer);
        bytes32 issuerKey = keccak256(abi.encode(claimIssuer));
        IERC734(issuerIdentityAddr).addKey(issuerKey, ERC734KeyPurposes.CLAIM_SIGNER_KEY, ERC734KeyTypes.ECDSA);

        // Create an unauthorized wallet that does NOT have any keys in the issuer identity
        address unauthorizedWallet = makeAddr("unauthorizedWallet");
        // Do not add any keys for this wallet in the issuer identity

        // Create a valid claim signature
        (bytes memory claimData, bytes memory signature) =
            claimUtils.createClaimSignature(userIdentityAddr, kycTopicId, "KYC Claim from Unauthorized Wallet");

        // Attempt to add claim with unauthorized wallet should fail
        // Even though the issuer is trusted for this topic, the wallet has no authority to act for the issuer
        vm.prank(unauthorizedWallet);
        vm.expectRevert(); // Should revert because unauthorizedWallet has no keys in the issuer identity
        userIdentity.addClaim(kycTopicId, 1, issuerIdentityAddr, signature, claimData, "");

        // Verify that the authorized wallet can still add claims successfully
        vm.prank(claimIssuer); // This wallet has CLAIM_SIGNER_KEY in the issuer identity
        bytes32 claimId = userIdentity.addClaim(kycTopicId, 1, issuerIdentityAddr, signature, claimData, "");

        assertTrue(claimId != bytes32(0), "Authorized claim addition should succeed");
    }

    /**
     * @notice Tests that wallets with other key purposes (not CLAIM_SIGNER, MANAGEMENT, or ACTION) cannot add claims
     */
    function testWalletWithWrongKeyPurposeCannotAddClaims() public {
        // Create identities
        vm.startPrank(admin);
        bytes32[] memory managementKeys = new bytes32[](0);
        address userIdentityAddr = identityFactory.createIdentity(user, managementKeys);
        userIdentity = IATKIdentity(userIdentityAddr);
        address issuerIdentityAddr = identityFactory.createIdentity(claimIssuer, managementKeys);

        // Register issuer in trusted issuers registry for KYC topic
        uint256[] memory allowedTopics = new uint256[](1);
        allowedTopics[0] = kycTopicId;
        trustedIssuersRegistry.addTrustedIssuer(IClaimIssuer(issuerIdentityAddr), allowedTopics);
        vm.stopPrank();

        // Create wallet and give it ENCRYPTION_KEY (purpose 4) instead of authorized purposes (MANAGEMENT_KEY,
        // ACTION_KEY, or CLAIM_SIGNER_KEY)
        address encryptionKeyWallet = makeAddr("encryptionKeyWallet");

        vm.prank(claimIssuer); // Owner of issuer identity adds the key
        bytes32 encryptionKey = keccak256(abi.encode(encryptionKeyWallet));
        IERC734(issuerIdentityAddr).addKey(encryptionKey, ERC734KeyPurposes.ENCRYPTION_KEY, ERC734KeyTypes.ECDSA);

        // Create a valid claim signature
        (bytes memory claimData, bytes memory signature) =
            claimUtils.createClaimSignature(userIdentityAddr, kycTopicId, "KYC Claim from Encryption Key Wallet");

        // Attempt to add claim with ENCRYPTION_KEY wallet should fail
        // ENCRYPTION_KEY is not sufficient for claim authorization - only MANAGEMENT_KEY, ACTION_KEY, or
        // CLAIM_SIGNER_KEY are allowed
        vm.prank(encryptionKeyWallet);
        vm.expectRevert(); // Should revert because ENCRYPTION_KEY (purpose 4) is not authorized for claim operations
        userIdentity.addClaim(kycTopicId, 1, issuerIdentityAddr, signature, claimData, "");
    }

    // ============================================================
    // CONTRACT IDENTITY TESTS
    // ============================================================

    /**
     * @notice Tests the complete round trip of trusted issuer claim authorization for CONTRACT identities
     */
    function testTrustedIssuerClaimRoundTripForContractIdentity() public {
        // Step 1: Create contract identity via the factory
        vm.startPrank(admin);

        // Create contract identity using the mock contract
        address contractIdentityAddr = identityFactory.createContractIdentity(address(mockContract));
        contractIdentity = IIdentity(contractIdentityAddr);
        assertTrue(contractIdentityAddr != address(0), "Contract identity creation failed");

        // Set the contract's onchainID to point to the created identity
        mockContract.setOnchainID(contractIdentityAddr);
        assertEq(mockContract.onchainID(), contractIdentityAddr, "Contract onchainID not set correctly");

        // Create claim issuer identity
        bytes32[] memory managementKeys = new bytes32[](0);
        address issuerIdentityAddr = identityFactory.createIdentity(claimIssuer, managementKeys);
        issuerIdentity = IIdentity(issuerIdentityAddr);
        assertTrue(issuerIdentityAddr != address(0), "Issuer identity creation failed");

        vm.stopPrank();

        // Add claim signer key to the issuer's identity so the claimIssuer wallet can act on behalf of the issuer
        // identity
        vm.prank(claimIssuer);
        bytes32 issuerKey = keccak256(abi.encode(claimIssuer));
        IERC734(issuerIdentityAddr).addKey(issuerKey, ERC734KeyPurposes.CLAIM_SIGNER_KEY, ERC734KeyTypes.ECDSA);

        // Step 2: Register the claim issuer in the trusted issuers registry with topics
        uint256[] memory allowedTopics = new uint256[](2);
        allowedTopics[0] = kycTopicId;
        allowedTopics[1] = amlTopicId;

        vm.prank(admin);
        trustedIssuersRegistry.addTrustedIssuer(IClaimIssuer(issuerIdentityAddr), allowedTopics);

        // Verify the issuer is registered for both topics
        assertTrue(
            trustedIssuersRegistry.hasClaimTopic(issuerIdentityAddr, kycTopicId), "Issuer not registered for KYC topic"
        );
        assertTrue(
            trustedIssuersRegistry.hasClaimTopic(issuerIdentityAddr, amlTopicId), "Issuer not registered for AML topic"
        );

        // Step 3: Create and sign claims as the issuer
        string memory kycClaimData = "KYC Verified for Contract by Trusted Issuer";
        string memory amlClaimData = "AML Verified for Contract by Trusted Issuer";

        (bytes memory kycData, bytes memory kycSignature) =
            claimUtils.createClaimSignature(contractIdentityAddr, kycTopicId, kycClaimData);

        (bytes memory amlData, bytes memory amlSignature) =
            claimUtils.createClaimSignature(contractIdentityAddr, amlTopicId, amlClaimData);

        // Step 4: The issuer identity contract adds claims directly to the contract's identity
        // This should succeed because:
        // 1. The issuer identity is registered as a trusted issuer
        // 2. The trusted issuers registry is set as a ClaimAuthorizer on the contract's identity
        // 3. The claimIssuer wallet has CLAIM_SIGNER_KEY in the issuer identity

        // Test KYC claim addition for contract identity
        vm.expectEmit(false, true, true, true); // Don't check exact claimId, it will be calculated
        emit ClaimAdded(
            bytes32(0), // claimId will be calculated by the identity contract
            kycTopicId,
            ERC735ClaimSchemes.SCHEME_ECDSA,
            issuerIdentityAddr,
            kycSignature,
            kycData,
            ""
        );

        vm.prank(claimIssuer);
        bytes32 kycClaimId = contractIdentity.addClaim(
            kycTopicId, ERC735ClaimSchemes.SCHEME_ECDSA, issuerIdentityAddr, kycSignature, kycData, ""
        );

        assertTrue(kycClaimId != bytes32(0), "KYC claim addition to contract identity failed");

        // Test AML claim addition for contract identity
        vm.expectEmit(false, true, true, true);
        emit ClaimAdded(
            bytes32(0), amlTopicId, ERC735ClaimSchemes.SCHEME_ECDSA, issuerIdentityAddr, amlSignature, amlData, ""
        );

        vm.prank(claimIssuer);
        bytes32 amlClaimId = contractIdentity.addClaim(
            amlTopicId, ERC735ClaimSchemes.SCHEME_ECDSA, issuerIdentityAddr, amlSignature, amlData, ""
        );

        assertTrue(amlClaimId != bytes32(0), "AML claim addition to contract identity failed");

        // Step 5: Verify the claims were added correctly to the contract identity
        (
            uint256 kycTopic,
            uint256 kycScheme,
            address kycIssuer,
            bytes memory kycSig,
            bytes memory kycClaimDataReturned,
            string memory kycUri
        ) = contractIdentity.getClaim(kycClaimId);

        assertEq(kycTopic, kycTopicId, "Contract KYC topic mismatch");
        assertEq(kycScheme, 1, "Contract KYC scheme mismatch");
        assertEq(kycIssuer, issuerIdentityAddr, "Contract KYC issuer mismatch");
        assertEq(kycSig, kycSignature, "Contract KYC signature mismatch");
        assertEq(kycClaimDataReturned, kycData, "Contract KYC data mismatch");
        assertEq(kycUri, "", "Contract KYC URI mismatch");

        (
            uint256 amlTopic,
            uint256 amlScheme,
            address amlIssuer,
            bytes memory amlSig,
            bytes memory amlClaimDataReturned,
            string memory amlUri
        ) = contractIdentity.getClaim(amlClaimId);

        assertEq(amlTopic, amlTopicId, "Contract AML topic mismatch");
        assertEq(amlScheme, 1, "Contract AML scheme mismatch");
        assertEq(amlIssuer, issuerIdentityAddr, "Contract AML issuer mismatch");
        assertEq(amlSig, amlSignature, "Contract AML signature mismatch");
        assertEq(amlClaimDataReturned, amlData, "Contract AML data mismatch");
        assertEq(amlUri, "", "Contract AML URI mismatch");

        // Step 6: Verify claim validation via the issuer for contract identity
        assertTrue(
            claimUtils.verifyClaim(issuerIdentityAddr, contractIdentity, kycTopicId, kycSignature, kycData),
            "Contract KYC claim validation failed"
        );
        assertTrue(
            claimUtils.verifyClaim(issuerIdentityAddr, contractIdentity, amlTopicId, amlSignature, amlData),
            "Contract AML claim validation failed"
        );
    }

    /**
     * @notice Tests that contract identities also prevent untrusted issuers from adding claims
     */
    function testUntrustedIssuerCannotAddClaimsToContractIdentity() public {
        // Create contract identity
        vm.startPrank(admin);
        address contractIdentityAddr = identityFactory.createContractIdentity(address(mockContract));
        contractIdentity = IIdentity(contractIdentityAddr);
        mockContract.setOnchainID(contractIdentityAddr);
        vm.stopPrank();

        // Create untrusted issuer
        uint256 untrustedIssuerPrivateKey = 0x987654321fedcba987654321fedcba987654321fedcba987654321fedcba98;
        address untrustedIssuer = vm.addr(untrustedIssuerPrivateKey);

        vm.prank(admin);
        bytes32[] memory managementKeys = new bytes32[](0);
        address untrustedIssuerIdentityAddr = identityFactory.createIdentity(untrustedIssuer, managementKeys);

        // Create valid claim signature for contract identity
        string memory claimData = "Malicious Claim for Contract";
        bytes memory encodedData = abi.encode(claimData);
        bytes32 dataHash = keccak256(abi.encode(contractIdentityAddr, kycTopicId, encodedData));
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", dataHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(untrustedIssuerPrivateKey, prefixedHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Attempt to add claim to contract identity should fail
        vm.prank(untrustedIssuer);
        vm.expectRevert();
        contractIdentity.addClaim(kycTopicId, 1, untrustedIssuerIdentityAddr, signature, encodedData, "");
    }

    /**
     * @notice Tests that trusted issuers cannot add unauthorized topic claims to contract identities
     */
    function testTrustedIssuerCannotAddUnauthorizedTopicClaimsToContractIdentity() public {
        // Create contract identity
        vm.startPrank(admin);
        address contractIdentityAddr = identityFactory.createContractIdentity(address(mockContract));
        contractIdentity = IIdentity(contractIdentityAddr);
        mockContract.setOnchainID(contractIdentityAddr);

        // Create issuer identity
        bytes32[] memory managementKeys = new bytes32[](0);
        address issuerIdentityAddr = identityFactory.createIdentity(claimIssuer, managementKeys);
        vm.stopPrank();

        // Register issuer for only KYC topic (not AML)
        uint256[] memory allowedTopics = new uint256[](1);
        allowedTopics[0] = kycTopicId;

        vm.prank(admin);
        trustedIssuersRegistry.addTrustedIssuer(IClaimIssuer(issuerIdentityAddr), allowedTopics);

        // Try to add AML claim to contract identity (should fail)
        (bytes memory amlData, bytes memory amlSignature) =
            claimUtils.createClaimSignature(contractIdentityAddr, amlTopicId, "Unauthorized AML Claim for Contract");

        vm.prank(claimIssuer);
        vm.expectRevert();
        contractIdentity.addClaim(amlTopicId, 1, issuerIdentityAddr, amlSignature, amlData, "");

        // But KYC claim to contract identity should succeed
        (bytes memory kycData, bytes memory kycSignature) =
            claimUtils.createClaimSignature(contractIdentityAddr, kycTopicId, "Authorized KYC Claim for Contract");

        vm.prank(claimIssuer);
        bytes32 claimId = contractIdentity.addClaim(kycTopicId, 1, issuerIdentityAddr, kycSignature, kycData, "");

        assertTrue(claimId != bytes32(0), "Authorized KYC claim for contract identity should succeed");
    }

    /**
     * @notice Tests that removed trusted issuers cannot add claims to contract identities
     */
    function testRemovedTrustedIssuerCannotAddClaimsToContractIdentity() public {
        // Setup: Create contract identity and register trusted issuer
        vm.startPrank(admin);
        address contractIdentityAddr = identityFactory.createContractIdentity(address(mockContract));
        contractIdentity = IIdentity(contractIdentityAddr);
        mockContract.setOnchainID(contractIdentityAddr);

        bytes32[] memory managementKeys = new bytes32[](0);
        address issuerIdentityAddr = identityFactory.createIdentity(claimIssuer, managementKeys);

        uint256[] memory allowedTopics = new uint256[](1);
        allowedTopics[0] = kycTopicId;
        trustedIssuersRegistry.addTrustedIssuer(IClaimIssuer(issuerIdentityAddr), allowedTopics);
        vm.stopPrank();

        // Verify issuer can add claims to contract identity initially
        (bytes memory kycData, bytes memory kycSignature) =
            claimUtils.createClaimSignature(contractIdentityAddr, kycTopicId, "Initial KYC Claim for Contract");

        vm.prank(claimIssuer);
        bytes32 claimId = contractIdentity.addClaim(kycTopicId, 1, issuerIdentityAddr, kycSignature, kycData, "");
        assertTrue(claimId != bytes32(0), "Initial claim to contract identity should succeed");

        // Remove trusted issuer
        vm.prank(admin);
        trustedIssuersRegistry.removeTrustedIssuer(IClaimIssuer(issuerIdentityAddr));

        // Verify issuer can no longer add claims to contract identity
        (bytes memory kycData2, bytes memory kycSignature2) =
            claimUtils.createClaimSignature(contractIdentityAddr, kycTopicId, "Post-removal KYC Claim for Contract");

        vm.prank(claimIssuer);
        vm.expectRevert();
        contractIdentity.addClaim(kycTopicId, 1, issuerIdentityAddr, kycSignature2, kycData2, "");
    }

    /**
     * @notice Tests that contract admin permissions work correctly for contract identities
     * @dev This test verifies that the contract's canAddClaim/canRemoveClaim permissions are respected
     */
    function testContractIdentityRespectContractPermissions() public {
        // Create contract identity
        vm.startPrank(admin);
        address contractIdentityAddr = identityFactory.createContractIdentity(address(mockContract));
        contractIdentity = IIdentity(contractIdentityAddr);
        mockContract.setOnchainID(contractIdentityAddr);
        vm.stopPrank();

        // Create a non-admin user
        address nonAdmin = makeAddr("nonAdmin");

        // The key insight here is that contract identities delegate permission checks
        // to the contract itself via canAddClaim/canRemoveClaim functions

        // Verify the contract identity was created correctly
        assertTrue(contractIdentityAddr != address(0), "Contract identity should be created");
        assertEq(mockContract.onchainID(), contractIdentityAddr, "Contract should reference its identity");
        assertTrue(mockContract.canAddClaim(admin), "Admin should be able to add claims to contract");
        assertFalse(mockContract.canAddClaim(nonAdmin), "Non-admin should not be able to add claims to contract");
        assertTrue(mockContract.canRemoveClaim(admin), "Admin should be able to remove claims from contract");
        assertFalse(
            mockContract.canRemoveClaim(nonAdmin), "Non-admin should not be able to remove claims from contract"
        );
    }
}
