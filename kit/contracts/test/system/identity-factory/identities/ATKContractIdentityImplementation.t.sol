// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import {
    ATKContractIdentityImplementation
} from "../../../../contracts/system/identity-factory/identities/ATKContractIdentityImplementation.sol";
import {
    ATKContractIdentityProxy
} from "../../../../contracts/system/identity-factory/identities/ATKContractIdentityProxy.sol";
import {
    IATKContractIdentity
} from "../../../../contracts/system/identity-factory/identities/IATKContractIdentity.sol";
import { ZeroAddressNotAllowed } from "../../../../contracts/system/identity-factory/ATKIdentityErrors.sol";
import { IContractWithIdentity } from "../../../../contracts/system/identity-factory/IContractWithIdentity.sol";
import { IClaimAuthorizer } from "../../../../contracts/onchainid/extensions/IClaimAuthorizer.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";
import { IERC735 } from "@onchainid/contracts/interface/IERC735.sol";
import { IERC734 } from "@onchainid/contracts/interface/IERC734.sol";
import { ERC735 } from "../../../../contracts/onchainid/extensions/ERC735.sol";
import { ERC165, IERC165 } from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import { SystemUtils } from "../../../utils/SystemUtils.sol";
import { ERC735ClaimSchemes } from "../../../../contracts/onchainid/ERC735ClaimSchemes.sol";
import { OnChainContractIdentity } from "../../../../contracts/onchainid/extensions/OnChainContractIdentity.sol";

/// @title Mock Contract With Identity - Represents a contract (like a token) that has an associated identity
/// @dev This contract demonstrates the role of a "Contract" in the hierarchy: ContractOwner → Contract → Identity
contract MockContractWithIdentity is IContractWithIdentity, ERC165 {
    address public contractOwner;
    address public claimManager;

    constructor(address _contractOwner, address _claimManager) {
        contractOwner = _contractOwner;
        claimManager = _claimManager;
    }

    function onchainID() external pure override returns (address) {
        return address(0x1234); // Mock address - in real scenarios this would be set by the identity factory
    }

    /// @notice Contract owner and claim manager can add claims via contract permissions
    function canAddClaim(address actor) external view override returns (bool) {
        return actor == contractOwner || actor == claimManager;
    }

    /// @notice Contract owner and claim manager can remove claims via contract permissions
    function canRemoveClaim(address actor) external view override returns (bool) {
        return actor == contractOwner || actor == claimManager;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IContractWithIdentity).interfaceId || super.supportsInterface(interfaceId);
    }
}

/// @title Mock Claim Authorizer - Represents an authorizer that can whitelist claim issuers
/// @dev This demonstrates the "Authorizer" role: registered on Identity to control which Claim Issuers can add claims
contract MockClaimAuthorizer is IClaimAuthorizer, ERC165 {
    mapping(address => mapping(uint256 => bool)) public authorizedIssuers;

    /// @notice Whitelist or blacklist a claim issuer for a specific topic
    function setAuthorization(address issuer, uint256 topic, bool authorized) external {
        authorizedIssuers[issuer][topic] = authorized;
    }

    function isAuthorizedToAddClaim(address issuer, uint256 topic, address) external view override returns (bool) {
        return authorizedIssuers[issuer][topic];
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IClaimAuthorizer).interfaceId || super.supportsInterface(interfaceId);
    }
}

/// @title Failing Claim Authorizer - For testing error handling
contract FailingClaimAuthorizer is IClaimAuthorizer, ERC165 {
    function isAuthorizedToAddClaim(address, uint256, address) external pure override returns (bool) {
        revert("Always fails");
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IClaimAuthorizer).interfaceId || super.supportsInterface(interfaceId);
    }
}

/// @title Mock Claim Issuer - Represents an external claim issuer that can be whitelisted
/// @dev This demonstrates the "Claim Issuer" role: can be whitelisted via authorizers to add claims
/// @dev For testing purposes, we only implement the minimal IClaimIssuer interface needed
contract MockClaimIssuer is ERC165 {
    mapping(bytes32 => bool) public validClaims;

    function setClaimValid(
        address identity,
        uint256 topic,
        bytes memory signature,
        bytes memory data,
        bool valid
    )
        external
    {
        bytes32 claimHash = keccak256(abi.encode(identity, topic, signature, data));
        validClaims[claimHash] = valid;
    }

    function isClaimValid(
        IIdentity identity,
        uint256 topic,
        bytes calldata signature,
        bytes calldata data
    )
        external
        view
        returns (bool)
    {
        bytes32 claimHash = keccak256(abi.encode(address(identity), topic, signature, data));
        return validClaims[claimHash];
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IClaimIssuer).interfaceId || super.supportsInterface(interfaceId);
    }
}

/// @title Mock Identity Receiver - Represents an identity that can receive claims
/// @dev This mock allows us to test the issueClaimTo functionality
contract MockIdentityReceiver is IIdentity, ERC165 {
    struct ClaimData {
        uint256 topic;
        uint256 scheme;
        address issuer;
        bytes signature;
        bytes data;
        string uri;
    }

    mapping(bytes32 => ClaimData) public claims;
    mapping(bytes32 => bool) public claimExists;

    // For testing isClaimValid
    mapping(bytes32 => ClaimData) private validationClaims;

    function addClaim(
        uint256 _topic,
        uint256 _scheme,
        address _issuer,
        bytes memory _signature,
        bytes memory _data,
        string memory _uri
    )
        external
        override
        returns (bytes32 claimId)
    {
        claimId = keccak256(abi.encode(_issuer, _topic));
        claims[claimId] = ClaimData({
            topic: _topic, scheme: _scheme, issuer: _issuer, signature: _signature, data: _data, uri: _uri
        });
        claimExists[claimId] = true;
        return claimId;
    }

    // Helper for testing - returns claim in a struct
    function getClaimData(bytes32 _claimId) external view returns (ClaimData memory) {
        // Check validation claims first (for testing isClaimValid)
        if (validationClaims[_claimId].issuer != address(0)) {
            return validationClaims[_claimId];
        }

        require(claimExists[_claimId], "Claim does not exist");
        return claims[_claimId];
    }

    // IERC735 getClaim implementation
    function getClaim(bytes32 _claimId)
        external
        view
        override
        returns (
            uint256 topic,
            uint256 scheme,
            address issuer,
            bytes memory signature,
            bytes memory data,
            string memory uri
        )
    {
        // Check validation claims first (for testing isClaimValid)
        if (validationClaims[_claimId].issuer != address(0)) {
            ClaimData memory validClaim = validationClaims[_claimId];
            return (
                validClaim.topic,
                validClaim.scheme,
                validClaim.issuer,
                validClaim.signature,
                validClaim.data,
                validClaim.uri
            );
        }

        // Fall back to regular claims
        require(claimExists[_claimId], "Claim does not exist");
        ClaimData memory regularClaim = claims[_claimId];
        return (
            regularClaim.topic,
            regularClaim.scheme,
            regularClaim.issuer,
            regularClaim.signature,
            regularClaim.data,
            regularClaim.uri
        );
    }

    // For testing isClaimValid - set up expected claim data
    function setClaimForValidation(
        bytes32 _claimId,
        uint256 _topic,
        uint256 _scheme,
        address _issuer,
        bytes memory _signature,
        bytes memory _data,
        string memory _uri
    )
        external
    {
        validationClaims[_claimId] = ClaimData({
            topic: _topic, scheme: _scheme, issuer: _issuer, signature: _signature, data: _data, uri: _uri
        });
    }

    // Stub implementations for other IERC735/IIdentity methods
    function removeClaim(bytes32) external pure override returns (bool) {
        return true;
    }

    function getClaimIdsByTopic(uint256) external pure override returns (bytes32[] memory) {
        return new bytes32[](0);
    }

    function addKey(bytes32, uint256, uint256) external pure override returns (bool) {
        return true;
    }

    function removeKey(bytes32, uint256) external pure override returns (bool) {
        return true;
    }

    function execute(address, uint256, bytes calldata) external payable override returns (uint256) {
        return 0;
    }

    function approve(uint256, bool) external pure override returns (bool) {
        return true;
    }

    function getKey(bytes32) external pure override returns (uint256[] memory, uint256, bytes32) {
        return (new uint256[](0), 0, bytes32(0));
    }

    function getKeyPurposes(bytes32) external pure override returns (uint256[] memory) {
        return new uint256[](0);
    }

    function getKeysByPurpose(uint256) external pure override returns (bytes32[] memory) {
        return new bytes32[](0);
    }

    function keyHasPurpose(bytes32, uint256) external pure override returns (bool) {
        return false;
    }

    function isClaimValid(
        IIdentity,
        uint256,
        bytes calldata,
        bytes calldata
    )
        external
        pure
        override
        returns (bool)
    {
        return false;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IIdentity).interfaceId || interfaceId == type(IERC735).interfaceId
            || super.supportsInterface(interfaceId);
    }
}

/// @title ATK Contract Identity Implementation Test
/// @notice Tests the complete role hierarchy and authorization flow:
///
/// ROLE HIERARCHY:
/// 1. ContractOwner - Owns the contract (e.g., token contract) and can manage claims directly
/// 2. Contract - Has an associated identity and defines who can add/remove claims via contract permissions
/// 3. Identity - The identity contract that holds claims and has registered authorizers
/// 4. Authorizers - Smart contracts that can whitelist specific claim issuers for specific topics
/// 5. Claim Issuers - External entities that can add claims directly IF whitelisted by an authorizer
///
/// AUTHORIZATION FLOW:
/// - ContractOwner can ALWAYS add/remove claims (via contract permissions)
/// - ClaimManager can ALWAYS add/remove claims (via contract permissions)
/// - External Claim Issuers can ONLY add claims if:
///   a) They are whitelisted by at least one registered authorizer
///   b) The authorizer approves them for the specific claim topic
///   c) They provide valid claim signatures
///
/// PURPOSE:
/// This design allows trusted claim issuers to add claims directly to identities
/// instead of having to create off-chain claims and send them to the contract owner.
contract ATKContractIdentityImplementationTest is Test {
    SystemUtils public systemUtils;
    ATKContractIdentityImplementation public implementation;
    ATKContractIdentityProxy public proxy;

    // ROLE ACTORS - Smart contracts representing different entities in the hierarchy
    MockContractWithIdentity public testContract; // Contract that has an identity (e.g., token contract)
    MockClaimAuthorizer public trustedIssuerAuthorizer; // Primary authorizer for whitelisting claim issuers
    MockClaimAuthorizer public secondaryAuthorizer; // Secondary authorizer for different claim types
    FailingClaimAuthorizer public failingAuthorizer; // Test authorizer that always fails (for error handling)
    MockClaimIssuer public externalClaimIssuer; // External claim issuer that can be whitelisted
    MockClaimIssuer public anotherClaimIssuer; // Another external claim issuer

    // ROLE ADDRESSES - EOAs representing different user types
    address public admin; // System admin
    address public contractOwner; // Owner of the contract - can ALWAYS add/remove claims
    address public claimManager; // Designated claim manager - can ALWAYS add/remove claims
    address public unauthorizedUser; // Regular user - CANNOT add claims unless whitelisted
    address public trustedForwarder; // Meta-transaction forwarder

    // Test constants
    uint256 constant CLAIM_TOPIC = 1;
    uint256 constant CLAIM_SCHEME = ERC735ClaimSchemes.SCHEME_ECDSA;
    bytes constant CLAIM_DATA = hex"1234";
    bytes constant CLAIM_SIGNATURE = hex"5678";
    string constant CLAIM_URI = "https://example.com/claim";

    // Events
    event ClaimAdded(
        bytes32 indexed claimId,
        uint256 indexed topic,
        uint256 scheme,
        address indexed issuer,
        bytes signature,
        bytes data,
        string uri
    );
    event ClaimRemoved(
        bytes32 indexed claimId,
        uint256 indexed topic,
        uint256 scheme,
        address indexed issuer,
        bytes signature,
        bytes data,
        string uri
    );
    event ClaimAuthorizationContractRegistered(address indexed sender, address indexed authorizationContract);
    event ClaimAuthorizationContractRemoved(address indexed sender, address indexed authorizationContract);

    function setUp() public {
        // Setup role addresses
        admin = makeAddr("admin");
        contractOwner = makeAddr("contractOwner");
        claimManager = makeAddr("claimManager");
        unauthorizedUser = makeAddr("unauthorizedUser");
        trustedForwarder = makeAddr("trustedForwarder");

        // Deploy system utils
        systemUtils = new SystemUtils(admin);

        // Deploy role actors
        testContract = new MockContractWithIdentity(contractOwner, claimManager);
        trustedIssuerAuthorizer = new MockClaimAuthorizer();
        secondaryAuthorizer = new MockClaimAuthorizer();
        failingAuthorizer = new FailingClaimAuthorizer();
        externalClaimIssuer = new MockClaimIssuer();
        anotherClaimIssuer = new MockClaimIssuer();

        // Deploy implementation and proxy with one authorizer
        implementation = new ATKContractIdentityImplementation(trustedForwarder);
        address[] memory initialAuthorizers = new address[](1);
        initialAuthorizers[0] = address(trustedIssuerAuthorizer);

        proxy = new ATKContractIdentityProxy(address(systemUtils.system()), address(testContract), initialAuthorizers);
    }

    // ============================================================
    // INITIALIZATION TESTS
    // ============================================================

    function testInitializeSuccess() public {
        MockContractWithIdentity newContract = new MockContractWithIdentity(contractOwner, claimManager);

        address[] memory authorizers = new address[](2);
        authorizers[0] = address(trustedIssuerAuthorizer);
        authorizers[1] = address(secondaryAuthorizer);

        ATKContractIdentityProxy newProxy =
            new ATKContractIdentityProxy(address(systemUtils.system()), address(newContract), authorizers);

        assertEq(IATKContractIdentity(address(newProxy)).contractAddress(), address(newContract));

        address[] memory registeredAuthorizers =
            IATKContractIdentity(address(newProxy)).getClaimAuthorizationContracts();
        assertEq(registeredAuthorizers.length, 2);
        assertEq(registeredAuthorizers[0], address(trustedIssuerAuthorizer));
        assertEq(registeredAuthorizers[1], address(secondaryAuthorizer));
    }

    function testInitializeWithZeroAddressFails() public {
        address systemAddress = address(systemUtils.system());

        vm.expectRevert(ZeroAddressNotAllowed.selector);
        new ATKContractIdentityProxy(systemAddress, address(0), new address[](0));
    }

    function testInitializeWithInvalidContractFails() public {
        address invalidContract = makeAddr("invalidContract");
        address systemAddress = address(systemUtils.system());

        vm.expectRevert();
        new ATKContractIdentityProxy(systemAddress, invalidContract, new address[](0));
    }

    function testCannotReinitialize() public {
        vm.expectRevert();
        IATKContractIdentity(address(proxy)).initialize(address(testContract), new address[](0));
    }

    // ============================================================
    // ROLE-BASED CLAIM MANAGEMENT TESTS
    // ============================================================

    /// @notice Test that contract owner can add self-attested claims via contract permissions
    function testContractOwnerCanAddClaims() public {
        vm.prank(contractOwner);
        bytes32 claimId = IATKContractIdentity(address(proxy))
            .addClaim(CLAIM_TOPIC, CLAIM_SCHEME, address(proxy), CLAIM_SIGNATURE, CLAIM_DATA, CLAIM_URI);

        assertTrue(claimId != bytes32(0), "Contract owner should be able to add claims");

        (uint256 topic, uint256 scheme, address issuer, bytes memory signature, bytes memory data, string memory uri) =
            IERC735(address(proxy)).getClaim(claimId);

        assertEq(topic, CLAIM_TOPIC);
        assertEq(scheme, CLAIM_SCHEME);
        assertEq(issuer, address(proxy));
        assertEq(signature, CLAIM_SIGNATURE);
        assertEq(data, CLAIM_DATA);
        assertEq(uri, CLAIM_URI);
    }

    /// @notice Test that claim manager can also add claims via contract permissions
    function testClaimManagerCanAddClaims() public {
        vm.prank(claimManager);
        bytes32 claimId = IATKContractIdentity(address(proxy))
            .addClaim(CLAIM_TOPIC, CLAIM_SCHEME, address(proxy), CLAIM_SIGNATURE, CLAIM_DATA, CLAIM_URI);

        assertTrue(claimId != bytes32(0), "Claim manager should be able to add claims");
    }

    /// @notice Test that unauthorized users cannot add claims
    function testUnauthorizedUserCannotAddClaims() public {
        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(ATKContractIdentityImplementation.UnauthorizedOperation.selector, unauthorizedUser)
        );
        IATKContractIdentity(address(proxy))
            .addClaim(CLAIM_TOPIC, CLAIM_SCHEME, address(proxy), CLAIM_SIGNATURE, CLAIM_DATA, CLAIM_URI);
    }

    /// @notice Test that external claim issuers can add claims when whitelisted via authorizer
    function testExternalClaimIssuerCanAddClaimsWhenWhitelisted() public {
        bytes memory issuerClaimData = abi.encode("External issuer claim");
        bytes memory issuerSignature = abi.encodePacked(bytes32(uint256(0x1)), bytes32(uint256(0x2)), uint8(27));

        // Setup the external claim issuer to validate this claim
        externalClaimIssuer.setClaimValid(address(proxy), CLAIM_TOPIC, issuerSignature, issuerClaimData, true);

        // Initially, external claim issuer cannot add claims
        vm.prank(address(externalClaimIssuer));
        vm.expectRevert(
            abi.encodeWithSelector(
                ATKContractIdentityImplementation.UnauthorizedOperation.selector, address(externalClaimIssuer)
            )
        );
        IATKContractIdentity(address(proxy))
            .addClaim(
                CLAIM_TOPIC,
                CLAIM_SCHEME,
                address(externalClaimIssuer),
                issuerSignature,
                issuerClaimData,
                "external-claim"
            );

        // Whitelist the external claim issuer via authorizer
        trustedIssuerAuthorizer.setAuthorization(address(externalClaimIssuer), CLAIM_TOPIC, true);

        // Now the external claim issuer can add claims
        vm.prank(address(externalClaimIssuer));
        bytes32 claimId = IATKContractIdentity(address(proxy))
            .addClaim(
                CLAIM_TOPIC,
                CLAIM_SCHEME,
                address(externalClaimIssuer),
                issuerSignature,
                issuerClaimData,
                "external-claim"
            );

        assertTrue(claimId != bytes32(0), "Whitelisted external claim issuer should be able to add claims");

        // Verify the claim was added correctly
        (uint256 topic,, address issuer,, bytes memory data, string memory uri) =
            IERC735(address(proxy)).getClaim(claimId);
        assertEq(topic, CLAIM_TOPIC);
        assertEq(issuer, address(externalClaimIssuer));
        assertEq(data, issuerClaimData);
        assertEq(uri, "external-claim");
    }

    /// @notice Comprehensive test showing the complete role hierarchy in action
    function testCompleteRoleHierarchyDemo() public {
        // ============================================================
        // SETUP: Create different types of claims and signatures
        // ============================================================

        bytes memory contractOwnerData = abi.encode("Contract owner self-attested claim");
        bytes memory contractOwnerSig = abi.encodePacked(bytes32(uint256(0x10)), bytes32(uint256(0x20)), uint8(27));

        bytes memory externalIssuerData = abi.encode("External issuer verified claim");
        bytes memory externalIssuerSig = abi.encodePacked(bytes32(uint256(0x30)), bytes32(uint256(0x40)), uint8(27));

        bytes memory anotherIssuerData = abi.encode("Another issuer claim");
        bytes memory anotherIssuerSig = abi.encodePacked(bytes32(uint256(0x50)), bytes32(uint256(0x60)), uint8(27));

        // Setup claim issuers to validate their claims
        externalClaimIssuer.setClaimValid(address(proxy), CLAIM_TOPIC, externalIssuerSig, externalIssuerData, true);
        anotherClaimIssuer.setClaimValid(address(proxy), CLAIM_TOPIC + 1, anotherIssuerSig, anotherIssuerData, true);

        // ============================================================
        // STEP 1: Contract Owner adds self-attested claim (via contract permissions)
        // ============================================================

        vm.prank(contractOwner);
        bytes32 ownerClaimId = IATKContractIdentity(address(proxy))
            .addClaim(CLAIM_TOPIC, CLAIM_SCHEME, address(proxy), contractOwnerSig, contractOwnerData, "self-attested");
        assertTrue(ownerClaimId != bytes32(0), "Contract owner should be able to add self-attested claims");

        // ============================================================
        // STEP 2: External Claim Issuer cannot add claims (not whitelisted)
        // ============================================================

        vm.prank(address(externalClaimIssuer));
        vm.expectRevert(
            abi.encodeWithSelector(
                ATKContractIdentityImplementation.UnauthorizedOperation.selector, address(externalClaimIssuer)
            )
        );
        IATKContractIdentity(address(proxy))
            .addClaim(
                CLAIM_TOPIC,
                CLAIM_SCHEME,
                address(externalClaimIssuer),
                externalIssuerSig,
                externalIssuerData,
                "external"
            );

        // ============================================================
        // STEP 3: Contract Owner manages authorizers (adds external issuer to whitelist)
        // ============================================================

        // Contract owner can manage authorizers on the identity
        vm.prank(contractOwner);
        IATKContractIdentity(address(proxy)).registerClaimAuthorizationContract(address(secondaryAuthorizer));

        // Whitelist external claim issuer via primary authorizer
        trustedIssuerAuthorizer.setAuthorization(address(externalClaimIssuer), CLAIM_TOPIC, true);

        // Whitelist another claim issuer via secondary authorizer
        secondaryAuthorizer.setAuthorization(address(anotherClaimIssuer), CLAIM_TOPIC + 1, true);

        // ============================================================
        // STEP 4: Whitelisted External Claim Issuers can now add claims
        // ============================================================

        // First external issuer can add claims (whitelisted via primary authorizer)
        vm.prank(address(externalClaimIssuer));
        bytes32 externalClaimId = IATKContractIdentity(address(proxy))
            .addClaim(
                CLAIM_TOPIC,
                CLAIM_SCHEME,
                address(externalClaimIssuer),
                externalIssuerSig,
                externalIssuerData,
                "external"
            );
        assertTrue(externalClaimId != bytes32(0), "Whitelisted external issuer should add claims");

        // Second external issuer can add claims (whitelisted via secondary authorizer)
        vm.prank(address(anotherClaimIssuer));
        bytes32 anotherClaimId = IATKContractIdentity(address(proxy))
            .addClaim(
                CLAIM_TOPIC + 1,
                CLAIM_SCHEME,
                address(anotherClaimIssuer),
                anotherIssuerSig,
                anotherIssuerData,
                "another"
            );
        assertTrue(anotherClaimId != bytes32(0), "Another whitelisted issuer should add claims");

        // ============================================================
        // STEP 5: Verify all claims exist on the same identity
        // ============================================================

        (uint256 ownerTopic,, address ownerIssuer,, bytes memory ownerData, string memory ownerUri) =
            IERC735(address(proxy)).getClaim(ownerClaimId);
        (uint256 externalTopic,, address externalIssuer,, bytes memory externalData, string memory externalUri) =
            IERC735(address(proxy)).getClaim(externalClaimId);
        (uint256 anotherTopic,, address anotherIssuer,, bytes memory anotherData, string memory anotherUri) =
            IERC735(address(proxy)).getClaim(anotherClaimId);

        // Contract owner's self-attested claim
        assertEq(ownerTopic, CLAIM_TOPIC);
        assertEq(ownerIssuer, address(proxy));
        assertEq(ownerData, contractOwnerData);
        assertEq(ownerUri, "self-attested");

        // External issuer's claim
        assertEq(externalTopic, CLAIM_TOPIC);
        assertEq(externalIssuer, address(externalClaimIssuer));
        assertEq(externalData, externalIssuerData);
        assertEq(externalUri, "external");

        // Another issuer's claim
        assertEq(anotherTopic, CLAIM_TOPIC + 1);
        assertEq(anotherIssuer, address(anotherClaimIssuer));
        assertEq(anotherData, anotherIssuerData);
        assertEq(anotherUri, "another");

        // ============================================================
        // STEP 6: Contract Owner can remove authorizer access
        // ============================================================

        // Remove authorization for external claim issuer
        trustedIssuerAuthorizer.setAuthorization(address(externalClaimIssuer), CLAIM_TOPIC, false);

        // External claim issuer can no longer add claims
        vm.prank(address(externalClaimIssuer));
        vm.expectRevert(
            abi.encodeWithSelector(
                ATKContractIdentityImplementation.UnauthorizedOperation.selector, address(externalClaimIssuer)
            )
        );
        IATKContractIdentity(address(proxy))
            .addClaim(
                CLAIM_TOPIC + 2,
                CLAIM_SCHEME,
                address(externalClaimIssuer),
                externalIssuerSig,
                externalIssuerData,
                "blocked"
            );

        // But contract owner can still add claims
        vm.prank(contractOwner);
        bytes32 finalClaimId = IATKContractIdentity(address(proxy))
            .addClaim(CLAIM_TOPIC + 2, CLAIM_SCHEME, address(proxy), contractOwnerSig, contractOwnerData, "still-works");
        assertTrue(finalClaimId != bytes32(0), "Contract owner should always be able to add claims");
    }

    // ============================================================
    // AUTHORIZER MANAGEMENT TESTS
    // ============================================================

    function testContractOwnerCanManageAuthorizers() public {
        // Contract owner can register new authorizers
        vm.prank(contractOwner);
        vm.expectEmit(true, true, false, true);
        emit ClaimAuthorizationContractRegistered(contractOwner, address(secondaryAuthorizer));
        IATKContractIdentity(address(proxy)).registerClaimAuthorizationContract(address(secondaryAuthorizer));

        assertTrue(
            IATKContractIdentity(address(proxy)).isClaimAuthorizationContractRegistered(address(secondaryAuthorizer))
        );

        // Contract owner can remove authorizers
        vm.prank(contractOwner);
        vm.expectEmit(true, true, false, true);
        emit ClaimAuthorizationContractRemoved(contractOwner, address(trustedIssuerAuthorizer));
        IATKContractIdentity(address(proxy)).removeClaimAuthorizationContract(address(trustedIssuerAuthorizer));

        assertFalse(
            IATKContractIdentity(address(proxy))
                .isClaimAuthorizationContractRegistered(address(trustedIssuerAuthorizer))
        );
    }

    function testUnauthorizedUserCannotManageAuthorizers() public {
        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(ATKContractIdentityImplementation.UnauthorizedOperation.selector, unauthorizedUser)
        );
        IATKContractIdentity(address(proxy)).registerClaimAuthorizationContract(address(secondaryAuthorizer));

        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(ATKContractIdentityImplementation.UnauthorizedOperation.selector, unauthorizedUser)
        );
        IATKContractIdentity(address(proxy)).removeClaimAuthorizationContract(address(trustedIssuerAuthorizer));
    }

    function testMultipleAuthorizersWork() public {
        // Register second authorizer
        vm.prank(contractOwner);
        IATKContractIdentity(address(proxy)).registerClaimAuthorizationContract(address(secondaryAuthorizer));

        // Only authorize in the second authorizer (not the first)
        secondaryAuthorizer.setAuthorization(address(externalClaimIssuer), CLAIM_TOPIC, true);

        bytes memory claimData = abi.encode("Claim via secondary authorizer");
        bytes memory signature = abi.encodePacked(bytes32(uint256(0x1)), bytes32(uint256(0x2)), uint8(27));
        externalClaimIssuer.setClaimValid(address(proxy), CLAIM_TOPIC, signature, claimData, true);

        // Should succeed because secondary authorizer approves
        vm.prank(address(externalClaimIssuer));
        bytes32 claimId = IATKContractIdentity(address(proxy))
            .addClaim(CLAIM_TOPIC, CLAIM_SCHEME, address(externalClaimIssuer), signature, claimData, CLAIM_URI);

        assertTrue(claimId != bytes32(0), "Claim should succeed via secondary authorizer");
    }

    function testBrokenAuthorizerDoesNotBlockWorkingAuthorizers() public {
        // Register failing authorizer along with working one
        vm.prank(contractOwner);
        IATKContractIdentity(address(proxy)).registerClaimAuthorizationContract(address(failingAuthorizer));

        // Authorize in the working authorizer
        trustedIssuerAuthorizer.setAuthorization(address(externalClaimIssuer), CLAIM_TOPIC, true);

        bytes memory claimData = abi.encode("Claim despite failing authorizer");
        bytes memory signature = abi.encodePacked(bytes32(uint256(0x1)), bytes32(uint256(0x2)), uint8(27));
        externalClaimIssuer.setClaimValid(address(proxy), CLAIM_TOPIC, signature, claimData, true);

        // Should succeed despite one authorizer failing
        vm.prank(address(externalClaimIssuer));
        bytes32 claimId = IATKContractIdentity(address(proxy))
            .addClaim(CLAIM_TOPIC, CLAIM_SCHEME, address(externalClaimIssuer), signature, claimData, CLAIM_URI);

        assertTrue(claimId != bytes32(0), "Should succeed despite failing authorizer");
    }

    // ============================================================
    // CLAIM REMOVAL TESTS
    // ============================================================

    function testContractOwnerCanRemoveClaims() public {
        // Add a claim first
        vm.prank(contractOwner);
        bytes32 claimId = IATKContractIdentity(address(proxy))
            .addClaim(CLAIM_TOPIC, CLAIM_SCHEME, address(proxy), CLAIM_SIGNATURE, CLAIM_DATA, CLAIM_URI);

        // Contract owner can remove the claim
        vm.prank(contractOwner);
        vm.expectEmit(true, true, true, true);
        emit ClaimRemoved(claimId, CLAIM_TOPIC, CLAIM_SCHEME, address(proxy), CLAIM_SIGNATURE, CLAIM_DATA, CLAIM_URI);

        bool success = IATKContractIdentity(address(proxy)).removeClaim(claimId);
        assertTrue(success, "Claim removal should succeed");

        // Verify claim is removed
        vm.expectRevert(abi.encodeWithSelector(ERC735.ClaimDoesNotExist.selector, claimId));
        IERC735(address(proxy)).getClaim(claimId);
    }

    function testClaimManagerCanRemoveClaims() public {
        // Add a claim first
        vm.prank(contractOwner);
        bytes32 claimId = IATKContractIdentity(address(proxy))
            .addClaim(CLAIM_TOPIC, CLAIM_SCHEME, address(proxy), CLAIM_SIGNATURE, CLAIM_DATA, CLAIM_URI);

        // Claim manager can remove the claim
        vm.prank(claimManager);
        bool success = IATKContractIdentity(address(proxy)).removeClaim(claimId);
        assertTrue(success, "Claim manager should be able to remove claims");
    }

    function testUnauthorizedUserCannotRemoveClaims() public {
        // Add a claim first
        vm.prank(contractOwner);
        bytes32 claimId = IATKContractIdentity(address(proxy))
            .addClaim(CLAIM_TOPIC, CLAIM_SCHEME, address(proxy), CLAIM_SIGNATURE, CLAIM_DATA, CLAIM_URI);

        // Unauthorized user cannot remove the claim
        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(ATKContractIdentityImplementation.UnauthorizedOperation.selector, unauthorizedUser)
        );
        IATKContractIdentity(address(proxy)).removeClaim(claimId);
    }

    // ============================================================
    // VIEW FUNCTION TESTS
    // ============================================================

    function testContractAddress() public view {
        assertEq(IATKContractIdentity(address(proxy)).contractAddress(), address(testContract));
    }

    function testGetClaimAuthorizationContracts() public view {
        address[] memory authorizers = IATKContractIdentity(address(proxy)).getClaimAuthorizationContracts();
        assertEq(authorizers.length, 1);
        assertEq(authorizers[0], address(trustedIssuerAuthorizer));
    }

    function testGetClaimsByTopic() public {
        // Add multiple claims
        vm.startPrank(contractOwner);
        IATKContractIdentity(address(proxy))
            .addClaim(CLAIM_TOPIC, CLAIM_SCHEME, address(proxy), CLAIM_SIGNATURE, CLAIM_DATA, CLAIM_URI);
        IATKContractIdentity(address(proxy))
            .addClaim(CLAIM_TOPIC, 2, address(proxy), hex"9abc", hex"def0", "https://example.com/claim2");
        vm.stopPrank();

        bytes32[] memory claimIds = IERC735(address(proxy)).getClaimIdsByTopic(CLAIM_TOPIC);
        assertEq(claimIds.length, 1, "Should have one claim per issuer-topic combination");
    }

    // ============================================================
    // UNSUPPORTED OPERATIONS TESTS (Contract identities don't support key operations)
    // ============================================================

    function testAddKeyReverts() public {
        vm.expectRevert(ATKContractIdentityImplementation.UnsupportedKeyOperation.selector);
        IERC734(address(proxy)).addKey(bytes32(uint256(1)), 1, 1);
    }

    function testRemoveKeyReverts() public {
        vm.expectRevert(ATKContractIdentityImplementation.UnsupportedKeyOperation.selector);
        IERC734(address(proxy)).removeKey(bytes32(uint256(1)), 1);
    }

    function testApproveReverts() public {
        vm.expectRevert(ATKContractIdentityImplementation.UnsupportedExecutionOperation.selector);
        IERC734(address(proxy)).approve(1, true);
    }

    function testExecuteReverts() public {
        vm.expectRevert(ATKContractIdentityImplementation.UnsupportedExecutionOperation.selector);
        IERC734(address(proxy)).execute(address(0), 0, "");
    }

    function testGetKeyReverts() public {
        vm.expectRevert(ATKContractIdentityImplementation.UnsupportedKeyOperation.selector);
        IERC734(address(proxy)).getKey(bytes32(uint256(1)));
    }

    function testGetKeyPurposesReverts() public {
        vm.expectRevert(ATKContractIdentityImplementation.UnsupportedKeyOperation.selector);
        IERC734(address(proxy)).getKeyPurposes(bytes32(uint256(1)));
    }

    function testGetKeysByPurposeReverts() public {
        vm.expectRevert(ATKContractIdentityImplementation.UnsupportedKeyOperation.selector);
        IERC734(address(proxy)).getKeysByPurpose(1);
    }

    function testKeyHasPurposeReverts() public {
        vm.expectRevert(ATKContractIdentityImplementation.UnsupportedKeyOperation.selector);
        IERC734(address(proxy)).keyHasPurpose(bytes32(uint256(1)), 1);
    }

    // ============================================================
    // ISSUE CLAIM TO TESTS
    // ============================================================

    /// @notice Test that the associated contract can issue claims to other identities
    function testContractCanIssueClaimsToOtherIdentities() public {
        // Create a subject identity to receive the claim
        MockIdentityReceiver subjectIdentity = new MockIdentityReceiver();

        // Issue claim from the contract
        vm.prank(address(testContract));
        bytes32 claimId = IATKContractIdentity(address(proxy))
            .issueClaimTo(IIdentity(address(subjectIdentity)), CLAIM_TOPIC, CLAIM_DATA, CLAIM_URI);

        assertTrue(claimId != bytes32(0), "Should return valid claim ID");

        // Verify the claim was added to the subject identity
        MockIdentityReceiver.ClaimData memory claim = subjectIdentity.getClaimData(claimId);
        assertEq(claim.topic, CLAIM_TOPIC);
        assertEq(claim.scheme, ERC735ClaimSchemes.SCHEME_CONTRACT);
        assertEq(claim.issuer, address(proxy));
        assertEq(claim.signature, "");
        assertEq(claim.data, CLAIM_DATA);
        assertEq(claim.uri, CLAIM_URI);
    }

    /// @notice Test that only the associated contract can issue claims
    function testOnlyContractCanIssueClaims() public {
        MockIdentityReceiver subjectIdentity = new MockIdentityReceiver();

        // Contract owner cannot issue claims directly
        vm.prank(contractOwner);
        vm.expectRevert(
            abi.encodeWithSelector(OnChainContractIdentity.UnauthorizedContractOperation.selector, contractOwner)
        );
        IATKContractIdentity(address(proxy))
            .issueClaimTo(IIdentity(address(subjectIdentity)), CLAIM_TOPIC, CLAIM_DATA, CLAIM_URI);

        // Unauthorized user cannot issue claims
        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(OnChainContractIdentity.UnauthorizedContractOperation.selector, unauthorizedUser)
        );
        IATKContractIdentity(address(proxy))
            .issueClaimTo(IIdentity(address(subjectIdentity)), CLAIM_TOPIC, CLAIM_DATA, CLAIM_URI);
    }

    /// @notice Test issuing claim fails when contract address is not set
    function testIssueClaimFailsWhenContractNotSet() public {
        // Deploy a new implementation without initializing
        ATKContractIdentityImplementation uninitializedImpl = new ATKContractIdentityImplementation(trustedForwarder);
        MockIdentityReceiver subjectIdentity = new MockIdentityReceiver();

        vm.expectRevert(OnChainContractIdentity.AssociatedContractNotSet.selector);
        uninitializedImpl.issueClaimTo(IIdentity(address(subjectIdentity)), CLAIM_TOPIC, CLAIM_DATA, CLAIM_URI);
    }

    /// @notice Test that issued claims can be validated correctly
    function testIsClaimValidForContractScheme() public {
        // Create a subject identity and issue a claim to it
        MockIdentityReceiver subjectIdentity = new MockIdentityReceiver();

        vm.prank(address(testContract));
        bytes32 claimId = IATKContractIdentity(address(proxy))
            .issueClaimTo(IIdentity(address(subjectIdentity)), CLAIM_TOPIC, CLAIM_DATA, CLAIM_URI);

        // Set up the mock to return the claim
        subjectIdentity.setClaimForValidation(
            claimId, CLAIM_TOPIC, ERC735ClaimSchemes.SCHEME_CONTRACT, address(proxy), "", CLAIM_DATA, CLAIM_URI
        );

        // Validate the claim
        bool isValid = IIdentity(address(proxy))
            .isClaimValid(
                IIdentity(address(subjectIdentity)),
                CLAIM_TOPIC,
                "", // signature not used for contract scheme
                CLAIM_DATA
            );

        assertTrue(isValid, "Contract scheme claim should be valid");

        // Test with wrong data
        isValid =
            IIdentity(address(proxy)).isClaimValid(IIdentity(address(subjectIdentity)), CLAIM_TOPIC, "", hex"9999");

        assertFalse(isValid, "Claim with wrong data should be invalid");

        // Test with wrong topic
        isValid = IIdentity(address(proxy))
            .isClaimValid(IIdentity(address(subjectIdentity)), CLAIM_TOPIC + 1, "", CLAIM_DATA);

        assertFalse(isValid, "Claim with wrong topic should be invalid");
    }

    /// @notice Test issuing multiple claims to different identities
    function testIssueMultipleClaimsToDifferentIdentities() public {
        MockIdentityReceiver identity1 = new MockIdentityReceiver();
        MockIdentityReceiver identity2 = new MockIdentityReceiver();

        bytes memory data1 = abi.encode("Claim for identity 1");
        bytes memory data2 = abi.encode("Claim for identity 2");

        // Issue claims to both identities
        vm.startPrank(address(testContract));

        bytes32 claimId1 = IATKContractIdentity(address(proxy))
            .issueClaimTo(IIdentity(address(identity1)), CLAIM_TOPIC, data1, "uri1");

        bytes32 claimId2 = IATKContractIdentity(address(proxy))
            .issueClaimTo(IIdentity(address(identity2)), CLAIM_TOPIC + 1, data2, "uri2");

        vm.stopPrank();

        // Verify claims
        MockIdentityReceiver.ClaimData memory claim1 = identity1.getClaimData(claimId1);
        assertEq(claim1.data, data1);
        assertEq(claim1.uri, "uri1");

        MockIdentityReceiver.ClaimData memory claim2 = identity2.getClaimData(claimId2);
        assertEq(claim2.data, data2);
        assertEq(claim2.uri, "uri2");
    }

    // ============================================================
    // INTERFACE COMPLIANCE TESTS
    // ============================================================

    function testIsClaimValidReturnsFalseForInvalidClaims() public {
        // Test with a valid identity but no claims - should return false
        MockIdentityReceiver emptyIdentity = new MockIdentityReceiver();
        bool isValid = IIdentity(address(proxy))
            .isClaimValid(IIdentity(address(emptyIdentity)), CLAIM_TOPIC, CLAIM_SIGNATURE, CLAIM_DATA);
        assertFalse(isValid, "Should return false when no claims exist");

        // Test with wrong issuer claim - should return false
        emptyIdentity.setClaimForValidation(
            keccak256(abi.encode(address(proxy), CLAIM_TOPIC)),
            CLAIM_TOPIC,
            ERC735ClaimSchemes.SCHEME_CONTRACT,
            address(0x123), // wrong issuer
            "",
            CLAIM_DATA,
            CLAIM_URI
        );
        isValid = IIdentity(address(proxy)).isClaimValid(IIdentity(address(emptyIdentity)), CLAIM_TOPIC, "", CLAIM_DATA);
        assertFalse(isValid, "Should return false when issuer doesn't match");

        // Test with wrong scheme - should return false
        emptyIdentity.setClaimForValidation(
            keccak256(abi.encode(address(proxy), CLAIM_TOPIC)),
            CLAIM_TOPIC,
            999, // wrong scheme
            address(proxy),
            "",
            CLAIM_DATA,
            CLAIM_URI
        );
        isValid = IIdentity(address(proxy)).isClaimValid(IIdentity(address(emptyIdentity)), CLAIM_TOPIC, "", CLAIM_DATA);
        assertFalse(isValid, "Should return false when scheme is not CONTRACT");
    }

    function testSupportsInterface() public view {
        assertTrue(IERC165(address(proxy)).supportsInterface(type(IATKContractIdentity).interfaceId));
        assertTrue(IERC165(address(proxy)).supportsInterface(type(IERC735).interfaceId));
        assertTrue(IERC165(address(proxy)).supportsInterface(type(IIdentity).interfaceId));
        assertTrue(IERC165(address(proxy)).supportsInterface(type(IERC165).interfaceId));

        // Should not support IERC734 (key holder interface)
        assertFalse(IERC165(address(proxy)).supportsInterface(type(IERC734).interfaceId));
    }
}
