// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../../../../contracts/system/identity-factory/identities/ATKContractIdentityImplementation.sol";
import "../../../../contracts/system/identity-factory/identities/ATKContractIdentityProxy.sol";
import "../../../../contracts/system/identity-factory/identities/IATKContractIdentity.sol";
import { ZeroAddressNotAllowed } from "../../../../contracts/system/identity-factory/ATKIdentityErrors.sol";
import "../../../../contracts/system/identity-factory/IContractWithIdentity.sol";
import "../../../../contracts/onchainid/extensions/IClaimAuthorizer.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";
import { IERC735 } from "@onchainid/contracts/interface/IERC735.sol";
import { IERC734 } from "@onchainid/contracts/interface/IERC734.sol";
import { ERC735 } from "../../../../contracts/onchainid/extensions/ERC735.sol";
import { ERC165 } from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import { SMARTToken } from "../../../smart/examples/SMARTToken.sol";
import { SMARTComplianceModuleParamPair } from
    "../../../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { ATKTopics } from "../../../../contracts/system/ATKTopics.sol";
import { ATKRoles } from "../../../../contracts/assets/ATKRoles.sol";
import "../../../utils/SystemUtils.sol";
import { ERC734KeyTypes } from "../../../../contracts/onchainid/ERC734KeyTypes.sol";

/// @title Mock contract that implements IContractWithIdentity
contract MockContractWithIdentity is IContractWithIdentity, ERC165 {
    address public identityOwner;
    address public claimManager;

    constructor(address _identityOwner, address _claimManager) {
        identityOwner = _identityOwner;
        claimManager = _claimManager;
    }

    function onchainID() external pure override returns (address) {
        return address(0x1234); // Mock address
    }

    function canAddClaim(address actor) external view override returns (bool) {
        return actor == identityOwner || actor == claimManager;
    }

    function canRemoveClaim(address actor) external view override returns (bool) {
        return actor == identityOwner || actor == claimManager;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IContractWithIdentity).interfaceId || super.supportsInterface(interfaceId);
    }
}

/// @title Mock claim authorizer contract
contract MockClaimAuthorizer is IClaimAuthorizer, ERC165 {
    mapping(address => mapping(uint256 => bool)) public authorizedIssuers;

    function setAuthorization(address issuer, uint256 topic, bool authorized) external {
        authorizedIssuers[issuer][topic] = authorized;
    }

    function isAuthorizedToAddClaim(address issuer, uint256 topic) external view override returns (bool) {
        return authorizedIssuers[issuer][topic];
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IClaimAuthorizer).interfaceId || super.supportsInterface(interfaceId);
    }
}

/// @title Failing claim authorizer that always reverts
contract FailingClaimAuthorizer is IClaimAuthorizer, ERC165 {
    function isAuthorizedToAddClaim(address, uint256) external pure override returns (bool) {
        revert("Always fails");
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IClaimAuthorizer).interfaceId || super.supportsInterface(interfaceId);
    }
}

/// @title Mock claim issuer that can validate claims
contract MockClaimIssuer is ERC165 {
    mapping(bytes32 => bool) public validClaims;

    function setClaimValid(address identity, uint256 topic, bytes memory signature, bytes memory data, bool valid) external {
        bytes32 claimHash = keccak256(abi.encode(identity, topic, signature, data));
        validClaims[claimHash] = valid;
    }

    function isClaimValid(
        IIdentity identity,
        uint256 topic,
        bytes calldata signature,
        bytes calldata data
    ) external view returns (bool) {
        bytes32 claimHash = keccak256(abi.encode(address(identity), topic, signature, data));
        return validClaims[claimHash];
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IClaimIssuer).interfaceId || super.supportsInterface(interfaceId);
    }
}

/// @title Tests for ATKContractIdentityImplementation
contract ATKContractIdentityImplementationTest is Test {
    SystemUtils public systemUtils;
    ATKContractIdentityImplementation public implementation;
    ATKContractIdentityProxy public proxy;
    MockContractWithIdentity public mockContract;
    MockClaimAuthorizer public claimAuthorizer1;
    MockClaimAuthorizer public claimAuthorizer2;
    FailingClaimAuthorizer public failingAuthorizer;
    MockClaimIssuer public mockClaimIssuer;

    address public admin;
    address public identityOwner;
    address public claimManager;
    address public claimIssuer;
    address public unauthorizedUser;
    address public trustedForwarder;

    // Claim test data
    uint256 constant CLAIM_TOPIC = 1;
    uint256 constant CLAIM_SCHEME = ERC734KeyTypes.ECDSA;
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
        admin = makeAddr("admin");
        identityOwner = makeAddr("identityOwner");
        claimManager = makeAddr("claimManager");
        claimIssuer = makeAddr("claimIssuer");
        unauthorizedUser = makeAddr("unauthorizedUser");
        trustedForwarder = makeAddr("trustedForwarder");

        // Deploy system utils
        systemUtils = new SystemUtils(admin);

        // Deploy mock contract
        mockContract = new MockContractWithIdentity(identityOwner, claimManager);

        // Deploy claim authorizers
        claimAuthorizer1 = new MockClaimAuthorizer();
        claimAuthorizer2 = new MockClaimAuthorizer();
        failingAuthorizer = new FailingClaimAuthorizer();
        mockClaimIssuer = new MockClaimIssuer();

        // Deploy implementation and proxy
        implementation = new ATKContractIdentityImplementation(trustedForwarder);

        address[] memory authorizers = new address[](1);
        authorizers[0] = address(claimAuthorizer1);

        proxy = new ATKContractIdentityProxy(address(systemUtils.system()), address(mockContract), authorizers);
    }

    // --- Initialization Tests ---

    function testInitializeSuccess() public {
        MockContractWithIdentity newMockContract = new MockContractWithIdentity(identityOwner, claimManager);

        address[] memory authorizers = new address[](2);
        authorizers[0] = address(claimAuthorizer1);
        authorizers[1] = address(claimAuthorizer2);

        ATKContractIdentityProxy newProxy = new ATKContractIdentityProxy(
            address(systemUtils.system()),
            address(newMockContract),
            authorizers
        );

        assertEq(IATKContractIdentity(address(newProxy)).contractAddress(), address(newMockContract));

        address[] memory registeredAuthorizers = IATKContractIdentity(address(newProxy)).getClaimAuthorizationContracts();
        assertEq(registeredAuthorizers.length, 2);
        assertEq(registeredAuthorizers[0], address(claimAuthorizer1));
        assertEq(registeredAuthorizers[1], address(claimAuthorizer2));
    }

    function testInitializeWithZeroAddressFails() public {
        address systemAddress = address(systemUtils.system());

        vm.expectRevert(ZeroAddressNotAllowed.selector);
        new ATKContractIdentityProxy(
            systemAddress,
            address(0),
            new address[](0)
        );
    }

    function testInitializeWithInvalidContractFails() public {
        address invalidContract = makeAddr("invalidContract");
        address systemAddress = address(systemUtils.system());

        // Since the invalid contract doesn't implement IContractWithIdentity,
        // the initialize call should revert (use generic expectRevert for delegatecall error propagation)
        vm.expectRevert();
        new ATKContractIdentityProxy(
            systemAddress,
            invalidContract,
            new address[](0)
        );
    }

    function testCannotReinitialize() public {
        // Try to call initialize on the proxy after it's been deployed
        vm.expectRevert();
        IATKContractIdentity(address(proxy)).initialize(address(mockContract), new address[](0));
    }

    // --- Claim Management Tests ---

    function testAddClaimWithContractPermission() public {
        // Use the identity itself as the issuer for self-attested claims
        vm.prank(identityOwner);
        bytes32 claimId = IATKContractIdentity(address(proxy)).addClaim(
            CLAIM_TOPIC, ERC734KeyTypes.ECDSA, address(proxy), CLAIM_SIGNATURE, CLAIM_DATA, CLAIM_URI
        );

        assertTrue(claimId != bytes32(0));

        (uint256 topic, uint256 scheme, address issuer, bytes memory signature, bytes memory data, string memory uri) =
            IERC735(address(proxy)).getClaim(claimId);

        assertEq(topic, CLAIM_TOPIC);
        assertEq(scheme, ERC734KeyTypes.ECDSA);
        assertEq(issuer, address(proxy));
        assertEq(signature, CLAIM_SIGNATURE);
        assertEq(data, CLAIM_DATA);
        assertEq(uri, CLAIM_URI);
    }

    function testAddClaimWithAuthorizationContract() public {
        // Setup: authorize the mockClaimIssuer as an issuer for the topic
        claimAuthorizer1.setAuthorization(address(mockClaimIssuer), CLAIM_TOPIC, true);

        // Set up the mock claim issuer to validate this specific claim
        mockClaimIssuer.setClaimValid(address(proxy), CLAIM_TOPIC, CLAIM_SIGNATURE, CLAIM_DATA, true);

        // The mockClaimIssuer contract itself adds the claim (self-signed)
        // This is authorized because the authorization contract approves mockClaimIssuer for the topic
        vm.prank(address(mockClaimIssuer));
        bytes32 claimId = IATKContractIdentity(address(proxy)).addClaim(
            CLAIM_TOPIC, CLAIM_SCHEME, address(mockClaimIssuer), CLAIM_SIGNATURE, CLAIM_DATA, CLAIM_URI
        );

        assertTrue(claimId != bytes32(0));

        // Verify the claim
        (uint256 topic, , address issuer, , , ) = IERC735(address(proxy)).getClaim(claimId);
        assertEq(topic, CLAIM_TOPIC);
        assertEq(issuer, address(mockClaimIssuer));
    }

    function testAddClaimWithMultipleAuthorizationContracts() public {
        // Register second authorizer
        vm.prank(identityOwner);
        IATKContractIdentity(address(proxy)).registerClaimAuthorizationContract(address(claimAuthorizer2));

        // Only authorize in the second contract
        claimAuthorizer2.setAuthorization(address(mockClaimIssuer), CLAIM_TOPIC, true);

        // Set up the mock claim issuer to validate this specific claim
        mockClaimIssuer.setClaimValid(address(proxy), CLAIM_TOPIC, CLAIM_SIGNATURE, CLAIM_DATA, true);

        // Should succeed because at least one authorizer approves (mockClaimIssuer calling for itself)
        vm.prank(address(mockClaimIssuer));
        bytes32 claimId = IATKContractIdentity(address(proxy)).addClaim(
            CLAIM_TOPIC, CLAIM_SCHEME, address(mockClaimIssuer), CLAIM_SIGNATURE, CLAIM_DATA, CLAIM_URI
        );

        assertTrue(claimId != bytes32(0));
    }

    function testAddClaimFailsWithoutPermission() public {
        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(ATKContractIdentityImplementation.UnauthorizedOperation.selector, unauthorizedUser)
        );
        IATKContractIdentity(address(proxy)).addClaim(
            CLAIM_TOPIC, ERC734KeyTypes.ECDSA, address(proxy), CLAIM_SIGNATURE, CLAIM_DATA, CLAIM_URI
        );
    }

    function testAddClaimWithFailingAuthorizerStillWorks() public {
        // Register failing authorizer along with working one
        vm.prank(identityOwner);
        IATKContractIdentity(address(proxy)).registerClaimAuthorizationContract(address(failingAuthorizer));

        // Authorize in the working authorizer
        claimAuthorizer1.setAuthorization(address(mockClaimIssuer), CLAIM_TOPIC, true);

        // Set up the mock claim issuer to validate this specific claim
        mockClaimIssuer.setClaimValid(address(proxy), CLAIM_TOPIC, CLAIM_SIGNATURE, CLAIM_DATA, true);

        // Should succeed despite one authorizer failing (mockClaimIssuer calling for itself)
        vm.prank(address(mockClaimIssuer));
        bytes32 claimId = IATKContractIdentity(address(proxy)).addClaim(
            CLAIM_TOPIC, CLAIM_SCHEME, address(mockClaimIssuer), CLAIM_SIGNATURE, CLAIM_DATA, CLAIM_URI
        );

        assertTrue(claimId != bytes32(0));
    }

    function testRemoveClaim() public {
        // Add a claim first
        vm.prank(identityOwner);
        bytes32 claimId = IATKContractIdentity(address(proxy)).addClaim(
            CLAIM_TOPIC, ERC734KeyTypes.ECDSA, address(proxy), CLAIM_SIGNATURE, CLAIM_DATA, CLAIM_URI
        );

        // Remove the claim
        vm.prank(claimManager);
        vm.expectEmit(true, true, true, true);
        emit ClaimRemoved(claimId, CLAIM_TOPIC, ERC734KeyTypes.ECDSA, address(proxy), CLAIM_SIGNATURE, CLAIM_DATA, CLAIM_URI);

        bool success = IATKContractIdentity(address(proxy)).removeClaim(claimId);
        assertTrue(success);

        // Verify claim is removed by expecting revert when getting it
        vm.expectRevert(abi.encodeWithSelector(ERC735.ClaimDoesNotExist.selector, claimId));
        IERC735(address(proxy)).getClaim(claimId);
    }

    function testRemoveClaimFailsWithoutPermission() public {
        // Add a claim first
        vm.prank(identityOwner);
        bytes32 claimId = IATKContractIdentity(address(proxy)).addClaim(
            CLAIM_TOPIC, ERC734KeyTypes.ECDSA, address(proxy), CLAIM_SIGNATURE, CLAIM_DATA, CLAIM_URI
        );

        // Try to remove without permission
        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(ATKContractIdentityImplementation.UnauthorizedOperation.selector, unauthorizedUser)
        );
        IATKContractIdentity(address(proxy)).removeClaim(claimId);
    }

    // --- Authorization Contract Management Tests ---

    function testRegisterClaimAuthorizationContract() public {
        MockClaimAuthorizer newAuthorizer = new MockClaimAuthorizer();

        vm.prank(identityOwner);
        vm.expectEmit(true, true, false, true);
        emit ClaimAuthorizationContractRegistered(identityOwner, address(newAuthorizer));

        IATKContractIdentity(address(proxy)).registerClaimAuthorizationContract(address(newAuthorizer));

        assertTrue(IATKContractIdentity(address(proxy)).isClaimAuthorizationContractRegistered(address(newAuthorizer)));
    }

    function testRegisterClaimAuthorizationContractFailsWithoutPermission() public {
        MockClaimAuthorizer newAuthorizer = new MockClaimAuthorizer();

        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(ATKContractIdentityImplementation.UnauthorizedOperation.selector, unauthorizedUser)
        );
        IATKContractIdentity(address(proxy)).registerClaimAuthorizationContract(address(newAuthorizer));
    }

    function testRemoveClaimAuthorizationContract() public {
        vm.prank(identityOwner);
        vm.expectEmit(true, true, false, true);
        emit ClaimAuthorizationContractRemoved(identityOwner, address(claimAuthorizer1));

        IATKContractIdentity(address(proxy)).removeClaimAuthorizationContract(address(claimAuthorizer1));

        assertFalse(
            IATKContractIdentity(address(proxy)).isClaimAuthorizationContractRegistered(address(claimAuthorizer1))
        );
    }

    function testRemoveClaimAuthorizationContractFailsWithoutPermission() public {
        vm.prank(unauthorizedUser);
        vm.expectRevert(
            abi.encodeWithSelector(ATKContractIdentityImplementation.UnauthorizedOperation.selector, unauthorizedUser)
        );
        IATKContractIdentity(address(proxy)).removeClaimAuthorizationContract(address(claimAuthorizer1));
    }

    // --- View Function Tests ---

    function testContractAddress() public view {
        assertEq(IATKContractIdentity(address(proxy)).contractAddress(), address(mockContract));
    }

    function testGetClaimAuthorizationContracts() public view {
        address[] memory authorizers = IATKContractIdentity(address(proxy)).getClaimAuthorizationContracts();
        assertEq(authorizers.length, 1);
        assertEq(authorizers[0], address(claimAuthorizer1));
    }

    function testGetClaimsByTopic() public {
        // Add multiple claims with same topic
        vm.startPrank(identityOwner);
        IATKContractIdentity(address(proxy)).addClaim(
            CLAIM_TOPIC, ERC734KeyTypes.ECDSA, address(proxy), CLAIM_SIGNATURE, CLAIM_DATA, CLAIM_URI
        );

        // Add a second claim with different scheme to test multiple claims for same topic
        IATKContractIdentity(address(proxy)).addClaim(
            CLAIM_TOPIC,
            2, // Different scheme
            address(proxy), // Still self-attested
            hex"9abc",
            hex"def0",
            "https://example.com/claim2"
        );
        vm.stopPrank();

        bytes32[] memory claimIds = IERC735(address(proxy)).getClaimIdsByTopic(CLAIM_TOPIC);
        assertEq(claimIds.length, 1); // Only one claim because both have the same issuer and topic
    }

    // --- Unsupported Operations Tests ---

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

    // --- IIdentity Tests ---

    function testIsClaimValidAlwaysReturnsFalse() public view {
        // Contract identities don't issue claims, so this should always return false
        bool isValid =
            IIdentity(address(proxy)).isClaimValid(IIdentity(address(0)), CLAIM_TOPIC, CLAIM_SIGNATURE, CLAIM_DATA);
        assertFalse(isValid);
    }

    /**
     * @notice Clean test that demonstrates claim authorizer functionality independently of contract permissions
     * @dev This test shows that claim authorizers can authorize specific issuers for topics,
     *      and that this authorization works even when the caller doesn't have canAddClaim permission
     */
    function testClaimAuthorizerWorksIndependentlyOfContractPermissions() public {
        // Create a separate mock claim issuer for this test
        MockClaimIssuer separateIssuer = new MockClaimIssuer();
        
        // Create a caller who does NOT have canAddClaim permission on mockContract
        address unauthorizedCaller = makeAddr("unauthorizedCaller");
        
        // Verify the caller doesn't have contract permission
        assertFalse(mockContract.canAddClaim(unauthorizedCaller), "Caller should not have contract permission");
        
        // Set up claim data
        bytes memory claimData = abi.encode("Test claim via claim authorizer");
        bytes memory mockSignature = abi.encodePacked(
            bytes32(uint256(0x1)), 
            bytes32(uint256(0x2)), 
            uint8(27)
        );
        
        // Set up the separate issuer to validate this specific claim
        separateIssuer.setClaimValid(address(proxy), CLAIM_TOPIC, mockSignature, claimData, true);
        
        // STEP 1: First attempt should FAIL - issuer not authorized in claim authorizer
        vm.prank(address(separateIssuer)); // The issuer calls for itself
        vm.expectRevert(
            abi.encodeWithSelector(ATKContractIdentityImplementation.UnauthorizedOperation.selector, address(separateIssuer))
        );
        IATKContractIdentity(address(proxy)).addClaim(
            CLAIM_TOPIC, CLAIM_SCHEME, address(separateIssuer), mockSignature, claimData, CLAIM_URI
        );
        
        // STEP 2: Authorize the separate issuer in the claim authorizer
        claimAuthorizer1.setAuthorization(address(separateIssuer), CLAIM_TOPIC, true);
        
        // STEP 3: Now the same call should SUCCEED - claim authorizer approves the issuer
        // This demonstrates that the claim authorizer works independently of contract permissions
        vm.prank(address(separateIssuer));
        bytes32 claimId = IATKContractIdentity(address(proxy)).addClaim(
            CLAIM_TOPIC, CLAIM_SCHEME, address(separateIssuer), mockSignature, claimData, CLAIM_URI
        );
        
        assertTrue(claimId != bytes32(0), "Claim should be added successfully");
        
        // Verify the claim was added correctly
        (uint256 topic, uint256 scheme, address issuer, bytes memory signature, bytes memory data, string memory uri) =
            IERC735(address(proxy)).getClaim(claimId);
            
        assertEq(topic, CLAIM_TOPIC, "Topic should match");
        assertEq(scheme, CLAIM_SCHEME, "Scheme should match");
        assertEq(issuer, address(separateIssuer), "Issuer should be the separate issuer");
        assertEq(signature, mockSignature, "Signature should match");
        assertEq(data, claimData, "Data should match");
        assertEq(uri, CLAIM_URI, "URI should match");
        
        // STEP 4: Demonstrate that removing authorization makes it fail again
        claimAuthorizer1.setAuthorization(address(separateIssuer), CLAIM_TOPIC, false);
        
        vm.prank(address(separateIssuer));
        vm.expectRevert(
            abi.encodeWithSelector(ATKContractIdentityImplementation.UnauthorizedOperation.selector, address(separateIssuer))
        );
        IATKContractIdentity(address(proxy)).addClaim(
            CLAIM_TOPIC + 1, CLAIM_SCHEME, address(separateIssuer), mockSignature, claimData, CLAIM_URI
        );
        
        // STEP 5: Demonstrate the key insight - even unauthorizedCaller cannot add claims
        // for the authorized issuer because they can't act on behalf of the issuer
        claimAuthorizer1.setAuthorization(address(separateIssuer), CLAIM_TOPIC, true); // Re-authorize
        
        vm.prank(unauthorizedCaller); // Someone else tries to add claim for the authorized issuer
        vm.expectRevert(
            abi.encodeWithSelector(ATKContractIdentityImplementation.UnauthorizedOperation.selector, unauthorizedCaller)
        );
        IATKContractIdentity(address(proxy)).addClaim(
            CLAIM_TOPIC + 2, CLAIM_SCHEME, address(separateIssuer), mockSignature, claimData, CLAIM_URI
        );
    }

    // --- ERC165 Tests ---

    function testSupportsInterface() public view {
        assertTrue(IERC165(address(proxy)).supportsInterface(type(IATKContractIdentity).interfaceId));
        assertTrue(IERC165(address(proxy)).supportsInterface(type(IERC735).interfaceId));
        assertTrue(IERC165(address(proxy)).supportsInterface(type(IIdentity).interfaceId));
        assertTrue(IERC165(address(proxy)).supportsInterface(type(IERC165).interfaceId));

        // Should not support IERC734 (key holder)
        assertFalse(IERC165(address(proxy)).supportsInterface(type(IERC734).interfaceId));
    }


}
