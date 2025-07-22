// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../../utils/SystemUtils.sol";
import "../../utils/ClaimUtils.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";
import { IERC734 } from "@onchainid/contracts/interface/IERC734.sol";
import { IATKIdentityFactory } from "../../../contracts/system/identity-factory/IATKIdentityFactory.sol";
import { IERC3643TrustedIssuersRegistry } from
    "../../../contracts/smart/interface/ERC-3643/IERC3643TrustedIssuersRegistry.sol";
import { ISMARTTopicSchemeRegistry } from "../../../contracts/smart/interface/ISMARTTopicSchemeRegistry.sol";
import { ATKTopics } from "../../../contracts/system/ATKTopics.sol";
import { IATKIdentity } from "../../../contracts/system/identity-factory/identities/IATKIdentity.sol";

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
    IERC3643TrustedIssuersRegistry public trustedIssuersRegistry;
    ISMARTTopicSchemeRegistry public topicSchemeRegistry;

    // Test addresses and keys
    address public admin;
    address public user;
    address public claimIssuer;
    uint256 public claimIssuerPrivateKey;

    // Identity contracts
    IATKIdentity public userIdentity;
    IIdentity public issuerIdentity;

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
        kycTopicId = topicSchemeRegistry.getTopicId(ATKTopics.TOPIC_KYC);
        amlTopicId = topicSchemeRegistry.getTopicId(ATKTopics.TOPIC_AML);

        // Deploy ClaimUtils for testing
        claimUtils = new ClaimUtils(
            admin,
            claimIssuer,
            claimIssuerPrivateKey,
            systemUtils.identityRegistry(),
            identityFactory,
            topicSchemeRegistry
        );
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

        // No need to add claim signer keys since the issuer identity contract will call addClaim
        // on its own behalf (caller == issuer), which is automatically authorized

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
            1, // ECDSA scheme
            issuerIdentityAddr,
            kycSignature,
            kycData,
            ""
        );

        // The issuer identity contract calls addClaim on the user's identity
        // The ClaimAuthorizationExtension will authorize this because:
        // 1. _msgSender() will be the issuer identity address (issuerIdentityAddr)
        // 2. The trusted issuers registry is registered as a ClaimAuthorizer on the user's identity
        // 3. The issuer is registered in the trusted issuers registry for this topic
        vm.prank(issuerIdentityAddr); // Make the issuer identity contract the msg.sender
        bytes32 kycClaimId = userIdentity.addClaim(
            kycTopicId,
            1, // ECDSA scheme
            issuerIdentityAddr,
            kycSignature,
            kycData,
            ""
        );

        assertTrue(kycClaimId != bytes32(0), "KYC claim addition failed");

        // Test AML claim addition
        vm.expectEmit(false, true, true, true); // Don't check exact claimId, it will be calculated
        emit ClaimAdded(
            bytes32(0), // claimId will be calculated by the identity contract
            amlTopicId,
            1, // ECDSA scheme
            issuerIdentityAddr,
            amlSignature,
            amlData,
            ""
        );

        vm.prank(issuerIdentityAddr); // Make the issuer identity contract the msg.sender
        bytes32 amlClaimId = userIdentity.addClaim(
            amlTopicId,
            1, // ECDSA scheme
            issuerIdentityAddr,
            amlSignature,
            amlData,
            ""
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
}
