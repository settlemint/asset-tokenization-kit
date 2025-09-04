// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { ATKIdentityImplementation } from
    "../../../../contracts/system/identity-factory/identities/ATKIdentityImplementation.sol";
import { ATKSystemTrustedIssuersRegistryImplementation } from
    "../../../../contracts/system/trusted-issuers-registry/ATKSystemTrustedIssuersRegistryImplementation.sol";
import { ATKSystemAccessManagerImplementation } from
    "../../../../contracts/system/access-manager/ATKSystemAccessManagerImplementation.sol";
import { IClaimAuthorizer } from "../../../../contracts/onchainid/extensions/IClaimAuthorizer.sol";
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { ERC734KeyPurposes } from "../../../../contracts/onchainid/ERC734KeyPurposes.sol";
import { ERC734KeyTypes } from "../../../../contracts/onchainid/ERC734KeyTypes.sol";
import { ATKPeopleRoles } from "../../../../contracts/system/ATKPeopleRoles.sol";

/// @title ClaimAuthorizationSystem Test
/// @notice Tests for the new claim authorization system (SRT-754)
/// @dev Tests the integration between identity contracts, authorization extension, and trusted address(mockIssuer)
/// registry
contract ClaimAuthorizationSystemTest is Test {
    // --- Test Constants ---
    uint256 constant TEST_CLAIM_TOPIC = 1;
    uint256 constant TEST_CLAIM_SCHEME = 1;
    string constant TEST_CLAIM_URI = "https://example.com/claim";
    bytes constant TEST_CLAIM_DATA = "test_claim_data";

    // --- Contracts ---
    ATKIdentityImplementation identityLogic;
    ERC1967Proxy identityProxy;
    ATKIdentityImplementation identity;

    ATKSystemTrustedIssuersRegistryImplementation trustedIssuersRegistryLogic;
    ERC1967Proxy trustedIssuersRegistryProxy;
    ATKSystemTrustedIssuersRegistryImplementation trustedIssuersRegistry;

    ATKSystemAccessManagerImplementation systemAccessManagerLogic;
    ERC1967Proxy systemAccessManagerProxy;
    ATKSystemAccessManagerImplementation systemAccessManager;

    MockClaimIssuer mockIssuer;
    ATKIdentityImplementation issuerIdentity;
    ERC1967Proxy issuerIdentityProxy;
    MockAuthorizationContract mockAuthContract;

    // --- Test Actors ---
    address owner = makeAddr("owner");
    address user = makeAddr("user");
    address admin = makeAddr("admin");
    address unauthorizedKey = makeAddr("unauthorizedKey");
    address issuerOwner = makeAddr("issuerOwner");

    function setUp() public {
        // Deploy identity system with proxy
        identityLogic = new ATKIdentityImplementation(address(0));
        identityProxy = new ERC1967Proxy(
            address(identityLogic),
            abi.encodeWithSelector(ATKIdentityImplementation.initialize.selector, owner, new address[](0))
        );
        identity = ATKIdentityImplementation(address(identityProxy));

        // Deploy system access manager first
        systemAccessManagerLogic = new ATKSystemAccessManagerImplementation(address(0));
        address[] memory initialAdmins = new address[](1);
        initialAdmins[0] = admin;
        systemAccessManagerProxy = new ERC1967Proxy(
            address(systemAccessManagerLogic),
            abi.encodeWithSelector(systemAccessManagerLogic.initialize.selector, initialAdmins)
        );
        systemAccessManager = ATKSystemAccessManagerImplementation(address(systemAccessManagerProxy));

        // Deploy trusted issuers registry
        trustedIssuersRegistryLogic = new ATKSystemTrustedIssuersRegistryImplementation(address(0));
        trustedIssuersRegistryProxy = new ERC1967Proxy(
            address(trustedIssuersRegistryLogic),
            abi.encodeWithSelector(trustedIssuersRegistryLogic.initialize.selector, address(systemAccessManager))
        );
        trustedIssuersRegistry = ATKSystemTrustedIssuersRegistryImplementation(address(trustedIssuersRegistryProxy));

        // Configure trusted issuers registry with system access manager
        vm.prank(admin);
        // System access manager is set during initialization

        // Deploy mock contracts and issuer identity
        mockIssuer = new MockClaimIssuer();
        mockAuthContract = new MockAuthorizationContract();

        // Deploy issuer identity (using same logic contract but different owner)
        issuerIdentityProxy = new ERC1967Proxy(
            address(identityLogic),
            abi.encodeWithSelector(ATKIdentityImplementation.initialize.selector, issuerOwner, new address[](0))
        );
        issuerIdentity = ATKIdentityImplementation(address(issuerIdentityProxy));

        // Grant the admin the claim policy manager role in the system access manager
        vm.prank(admin);
        systemAccessManager.grantRole(ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE, admin);
    }

    // --- Authorization Contract Registration Tests ---

    function test_RegisterClaimAuthorizationContract_Success() public {
        vm.prank(owner);
        identity.registerClaimAuthorizationContract(address(trustedIssuersRegistry));

        assertTrue(identity.isClaimAuthorizationContractRegistered(address(trustedIssuersRegistry)));

        address[] memory contracts = identity.getClaimAuthorizationContracts();
        assertEq(contracts.length, 1);
        assertEq(contracts[0], address(trustedIssuersRegistry));
    }

    function test_RegisterClaimAuthorizationContract_RevertOnNonManager() public {
        vm.prank(user);
        vm.expectRevert();
        identity.registerClaimAuthorizationContract(address(trustedIssuersRegistry));
    }

    function test_RegisterClaimAuthorizationContract_RevertOnInvalidContract() public {
        vm.prank(owner);
        vm.expectRevert();
        identity.registerClaimAuthorizationContract(address(0));
    }

    function test_RegisterClaimAuthorizationContract_RevertOnAlreadyRegistered() public {
        vm.prank(owner);
        identity.registerClaimAuthorizationContract(address(trustedIssuersRegistry));

        vm.prank(owner);
        vm.expectRevert();
        identity.registerClaimAuthorizationContract(address(trustedIssuersRegistry));
    }

    function test_RemoveClaimAuthorizationContract_Success() public {
        // Register first
        vm.prank(owner);
        identity.registerClaimAuthorizationContract(address(trustedIssuersRegistry));

        // Remove
        vm.prank(owner);
        identity.removeClaimAuthorizationContract(address(trustedIssuersRegistry));

        assertFalse(identity.isClaimAuthorizationContractRegistered(address(trustedIssuersRegistry)));
        assertEq(identity.getClaimAuthorizationContracts().length, 0);
    }

    function test_RemoveClaimAuthorizationContract_RevertOnNotRegistered() public {
        vm.prank(owner);
        vm.expectRevert();
        identity.removeClaimAuthorizationContract(address(trustedIssuersRegistry));
    }

    // --- Claim Addition with Authorization Tests ---

    function test_AddClaim_WithTrustedIssuerAuthorization_Success() public {
        // Setup trusted address(mockIssuer)
        vm.prank(admin);
        uint256[] memory topics = new uint256[](1);
        topics[0] = TEST_CLAIM_TOPIC;
        trustedIssuersRegistry.addTrustedIssuer(IClaimIssuer(address(mockIssuer)), topics);

        // Register authorization contract
        vm.prank(owner);
        identity.registerClaimAuthorizationContract(address(trustedIssuersRegistry));

        // Add claim - should succeed through authorization
        // Use the issuer as the caller since mockIssuer doesn't implement ERC734
        vm.prank(address(mockIssuer));
        bytes32 claimId = identity.addClaim(
            TEST_CLAIM_TOPIC, TEST_CLAIM_SCHEME, address(mockIssuer), "", TEST_CLAIM_DATA, TEST_CLAIM_URI
        );

        // Verify claim was added
        (uint256 topic, uint256 scheme, address claimIssuer,, bytes memory data, string memory uri) =
            identity.getClaim(claimId);

        assertEq(topic, TEST_CLAIM_TOPIC);
        assertEq(scheme, TEST_CLAIM_SCHEME);
        assertEq(claimIssuer, address(mockIssuer));
        assertEq(data, TEST_CLAIM_DATA);
        assertEq(uri, TEST_CLAIM_URI);
    }

    function test_AddClaim_WithoutAuthorizationFallbackToClaimKey_Success() public {
        // Don't register any authorization contracts
        // Give mockIssuer address claim signer key (treat mockIssuer as key)
        vm.prank(owner);
        bytes32 issuerKeyHash = keccak256(abi.encode(address(mockIssuer)));
        identity.addKey(issuerKeyHash, ERC734KeyPurposes.ACTION_KEY, ERC734KeyTypes.ECDSA);

        // Add claim - should succeed through claim key
        // mockIssuer acts on its own behalf and has claim key
        vm.prank(address(mockIssuer));
        bytes32 claimId = identity.addClaim(
            TEST_CLAIM_TOPIC, TEST_CLAIM_SCHEME, address(mockIssuer), "", TEST_CLAIM_DATA, TEST_CLAIM_URI
        );

        // Verify claim was added
        (uint256 topic,,,,,) = identity.getClaim(claimId);
        assertEq(topic, TEST_CLAIM_TOPIC);
    }

    function test_AddClaim_WithoutAuthorizationNoClaimKey_RevertUnauthorized() public {
        // Don't register authorization contracts, don't give claim key
        vm.prank(user);
        vm.expectRevert();
        identity.addClaim(TEST_CLAIM_TOPIC, TEST_CLAIM_SCHEME, address(mockIssuer), "", TEST_CLAIM_DATA, TEST_CLAIM_URI);
    }

    function test_AddClaim_UntrustedIssuerWithClaimKey_Success() public {
        // Register authorization contract but don't add address(mockIssuer) as trusted
        vm.prank(owner);
        identity.registerClaimAuthorizationContract(address(trustedIssuersRegistry));

        // Give mockIssuer address claim signer key (treat mockIssuer as key)
        vm.prank(owner);
        bytes32 issuerKeyHash = keccak256(abi.encode(address(mockIssuer)));
        identity.addKey(issuerKeyHash, ERC734KeyPurposes.ACTION_KEY, ERC734KeyTypes.ECDSA);

        // Add claim - should succeed through claim key fallback
        // mockIssuer acts on its own behalf and has claim key
        vm.prank(address(mockIssuer));
        bytes32 claimId = identity.addClaim(
            TEST_CLAIM_TOPIC, TEST_CLAIM_SCHEME, address(mockIssuer), "", TEST_CLAIM_DATA, TEST_CLAIM_URI
        );

        // Verify claim was added
        (uint256 topic,,,,,) = identity.getClaim(claimId);
        assertEq(topic, TEST_CLAIM_TOPIC);
    }

    // --- Multiple Authorization Contracts Tests ---

    function test_AddClaim_MultipleAuthContracts_FirstApproves() public {
        // Register multiple authorization contracts
        vm.prank(owner);
        identity.registerClaimAuthorizationContract(address(trustedIssuersRegistry));

        vm.prank(owner);
        identity.registerClaimAuthorizationContract(address(mockAuthContract));

        // Setup: trusted registry denies, mock contract approves
        vm.prank(admin);
        uint256[] memory topics = new uint256[](1);
        topics[0] = 999; // Different topic, so trusted registry won't approve
        trustedIssuersRegistry.addTrustedIssuer(IClaimIssuer(address(mockIssuer)), topics);

        mockAuthContract.setAuthorization(address(mockIssuer), TEST_CLAIM_TOPIC, true);

        // Add claim - should succeed through mock contract authorization
        // Use the issuer as the caller since mockIssuer doesn't implement ERC734
        vm.prank(address(mockIssuer));
        bytes32 claimId = identity.addClaim(
            TEST_CLAIM_TOPIC, TEST_CLAIM_SCHEME, address(mockIssuer), "", TEST_CLAIM_DATA, TEST_CLAIM_URI
        );

        // Verify claim was added
        (uint256 topic,,,,,) = identity.getClaim(claimId);
        assertEq(topic, TEST_CLAIM_TOPIC);
    }

    function test_AddClaim_AuthContractFails_ContinueToNext() public {
        // Deploy a failing authorization contract
        MockFailingAuthContract failingAuthContract = new MockFailingAuthContract();

        // Register both failing and working contracts
        vm.prank(owner);
        identity.registerClaimAuthorizationContract(address(failingAuthContract));

        vm.prank(owner);
        identity.registerClaimAuthorizationContract(address(trustedIssuersRegistry));

        // Setup trusted registry to approve
        vm.prank(admin);
        uint256[] memory topics = new uint256[](1);
        topics[0] = TEST_CLAIM_TOPIC;
        trustedIssuersRegistry.addTrustedIssuer(IClaimIssuer(address(mockIssuer)), topics);

        // Add claim - should succeed despite first contract failing
        // Use the issuer as the caller since mockIssuer doesn't implement ERC734
        vm.prank(address(mockIssuer));
        bytes32 claimId = identity.addClaim(
            TEST_CLAIM_TOPIC, TEST_CLAIM_SCHEME, address(mockIssuer), "", TEST_CLAIM_DATA, TEST_CLAIM_URI
        );

        // Verify claim was added
        (uint256 topic,,,,,) = identity.getClaim(claimId);
        assertEq(topic, TEST_CLAIM_TOPIC);
    }

    // --- Trusted Issuer Registry IClaimAuthorization Tests ---

    function test_TrustedIssuersRegistry_IsAuthorizedToAddClaim_Success() public {
        // Add trusted address(mockIssuer)
        vm.prank(admin);
        uint256[] memory topics = new uint256[](2);
        topics[0] = TEST_CLAIM_TOPIC;
        topics[1] = 42;
        trustedIssuersRegistry.addTrustedIssuer(IClaimIssuer(address(mockIssuer)), topics);

        // Test authorization
        assertTrue(trustedIssuersRegistry.isAuthorizedToAddClaim(address(mockIssuer), TEST_CLAIM_TOPIC, address(0)));
        assertTrue(trustedIssuersRegistry.isAuthorizedToAddClaim(address(mockIssuer), 42, address(0)));
        assertFalse(trustedIssuersRegistry.isAuthorizedToAddClaim(address(mockIssuer), 999, address(0)));
        assertFalse(trustedIssuersRegistry.isAuthorizedToAddClaim(user, TEST_CLAIM_TOPIC, address(0)));
    }

    function test_TrustedIssuersRegistry_SupportsIClaimAuthorization() public view {
        assertTrue(trustedIssuersRegistry.supportsInterface(type(IClaimAuthorizer).interfaceId));
    }

    // --- Edge Cases ---

    function test_AddClaim_NoAuthContractsRegistered_RequiresIssuerAuthorization() public {
        // Set up issuerIdentity with management and claim signer keys
        address issuerManagementKey = makeAddr("issuerManagementKey");
        address claimSignerKey = makeAddr("claimSignerKey");

        // Add additional management and claim signer keys to the issuer identity (using issuerOwner)
        vm.prank(issuerOwner);
        bytes32 issuerManagementKeyHash = keccak256(abi.encode(issuerManagementKey));
        issuerIdentity.addKey(issuerManagementKeyHash, ERC734KeyPurposes.MANAGEMENT_KEY, ERC734KeyTypes.ECDSA);

        // Add a claim signer key to the issuer identity
        vm.prank(issuerOwner);
        bytes32 claimSignerKeyHash = keccak256(abi.encode(claimSignerKey));
        issuerIdentity.addKey(claimSignerKeyHash, ERC734KeyPurposes.ACTION_KEY, ERC734KeyTypes.ECDSA);

        // Register trusted issuers registry
        vm.prank(owner);
        identity.registerClaimAuthorizationContract(address(trustedIssuersRegistry));

        // Add the issuerIdentity to trusted issuers registry for this topic
        vm.prank(admin);
        uint256[] memory topics = new uint256[](1);
        topics[0] = TEST_CLAIM_TOPIC;
        trustedIssuersRegistry.addTrustedIssuer(IClaimIssuer(address(issuerIdentity)), topics);

        // Try to add claim using an unauthorized key (not management or claim signer)
        // This should fail because unauthorizedKey is not authorized to act on behalf of issuerIdentity
        vm.prank(unauthorizedKey);
        vm.expectRevert(abi.encodeWithSelector(ATKIdentityImplementation.SenderLacksActionKey.selector));
        identity.addClaim(
            TEST_CLAIM_TOPIC, TEST_CLAIM_SCHEME, address(issuerIdentity), "", TEST_CLAIM_DATA, TEST_CLAIM_URI
        );
    }

    function test_AddClaim_AuthContractRemovedBetweenCalls() public {
        // Register and setup authorization
        vm.prank(owner);
        identity.registerClaimAuthorizationContract(address(trustedIssuersRegistry));

        vm.prank(admin);
        uint256[] memory topics = new uint256[](1);
        topics[0] = TEST_CLAIM_TOPIC;
        trustedIssuersRegistry.addTrustedIssuer(IClaimIssuer(address(mockIssuer)), topics);

        // First call succeeds
        // Use the issuer as the caller since mockIssuer doesn't implement ERC734
        vm.prank(address(mockIssuer));
        identity.addClaim(TEST_CLAIM_TOPIC, TEST_CLAIM_SCHEME, address(mockIssuer), "", TEST_CLAIM_DATA, TEST_CLAIM_URI);

        // Remove authorization contract
        vm.prank(owner);
        identity.removeClaimAuthorizationContract(address(trustedIssuersRegistry));

        // Second call should fail (no claim key)
        vm.prank(user);
        vm.expectRevert();
        identity.addClaim(999, TEST_CLAIM_SCHEME, address(mockIssuer), "", TEST_CLAIM_DATA, TEST_CLAIM_URI);
    }
}

// --- Mock Contracts ---

contract MockClaimIssuer {
    function isClaimValid(IIdentity, uint256, bytes calldata, bytes calldata) external pure returns (bool) {
        return true;
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}

contract MockAuthorizationContract is IClaimAuthorizer {
    mapping(address => mapping(uint256 => bool)) private _authorizations;

    function setAuthorization(address issuer, uint256 topic, bool authorized) external {
        _authorizations[issuer][topic] = authorized;
    }

    function isAuthorizedToAddClaim(address issuer, uint256 topic, address) external view returns (bool) {
        return _authorizations[issuer][topic];
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == type(IClaimAuthorizer).interfaceId || interfaceId == type(IERC165).interfaceId;
    }
}

contract MockFailingAuthContract is IClaimAuthorizer {
    function isAuthorizedToAddClaim(address, uint256, address) external pure returns (bool) {
        revert("Authorization failed");
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == type(IClaimAuthorizer).interfaceId || interfaceId == type(IERC165).interfaceId;
    }
}
