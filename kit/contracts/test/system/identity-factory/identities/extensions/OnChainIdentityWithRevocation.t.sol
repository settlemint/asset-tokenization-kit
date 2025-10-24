// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import {
    OnChainIdentityWithRevocation
} from "../../../../../contracts/onchainid/extensions/OnChainIdentityWithRevocation.sol";
import { OnChainIdentity } from "../../../../../contracts/onchainid/extensions/OnChainIdentity.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { IERC734 } from "@onchainid/contracts/interface/IERC734.sol";
import { ERC734 } from "../../../../../contracts/onchainid/extensions/ERC734.sol";
import { IERC735 } from "@onchainid/contracts/interface/IERC735.sol";
import { ERC735 } from "../../../../../contracts/onchainid/extensions/ERC735.sol";
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";
import { ERC734KeyPurposes } from "../../../../../contracts/onchainid/ERC734KeyPurposes.sol";
import { ERC734KeyTypes } from "../../../../../contracts/onchainid/ERC734KeyTypes.sol";

// Concrete implementation for testing the abstract contract
contract TestableOnChainIdentityWithRevocation is ERC734, ERC735, OnChainIdentityWithRevocation {
    // --- State Variables ---
    bool private _smartIdentityInitialized;

    // --- Custom Errors for ATKIdentityImplementation ---
    error AlreadyInitialized();
    error SenderLacksManagementKey();
    error SenderLacksActionKey();

    // Errors for checks that might be redundant if ERC734.sol handles them robustly
    error ReplicatedExecutionIdDoesNotExist(uint256 executionId);
    error ReplicatedExecutionAlreadyPerformed(uint256 executionId);

    // --- Modifiers for Access Control ---
    modifier onlyManager() {
        if (!(msg.sender == address(this)
                    || keyHasPurpose(keccak256(abi.encode(msg.sender)), ERC734KeyPurposes.MANAGEMENT_KEY))) {
            revert SenderLacksManagementKey();
        }
        _;
    }

    modifier onlyActionKey() {
        if (!(msg.sender == address(this)
                    || keyHasPurpose(keccak256(abi.encode(msg.sender)), ERC734KeyPurposes.ACTION_KEY))) {
            revert SenderLacksActionKey();
        }
        _;
    }

    /// @notice Constructor for the `ATKIdentityImplementation`.
    /// @dev Initializes ERC2771 context with the provided forwarder.
    ///      The main identity initialization (setting the first management key) is done via `initializeATKIdentity`.
    constructor(address initialManagementKey) ERC734(initialManagementKey, false) { }

    // --- OnchainIdentityWithRevocation Functions ---
    /// @dev Revokes a claim by its signature
    /// @param signature The signature of the claim to revoke
    function revokeClaimBySignature(bytes calldata signature) external virtual override onlyManager {
        _revokeClaimBySignature(signature);
    }

    /// @dev Revokes a claim by its ID
    /// @param _claimId The ID of the claim to revoke
    function revokeClaim(bytes32 _claimId, address _identity) external virtual override onlyManager returns (bool) {
        return _revokeClaim(_claimId, _identity);
    }

    // --- ERC734 (Key Holder) Functions - Overridden for Access Control & Specific Logic ---

    /// @inheritdoc IERC734
    /// @dev Adds a key with a specific purpose and type. Requires MANAGEMENT_KEY purpose.
    function addKey(
        bytes32 _key,
        uint256 _purpose,
        uint256 _keyType
    )
        public
        virtual
        override(ERC734, IERC734) // Overrides ERC734's implementation and fulfills IERC734
        onlyManager
        returns (bool success)
    {
        return ERC734.addKey(_key, _purpose, _keyType);
    }

    /// @inheritdoc IERC734
    /// @dev Removes a purpose from a key. If it's the last purpose, the key is removed. Requires MANAGEMENT_KEY
    /// purpose.
    function removeKey(
        bytes32 _key,
        uint256 _purpose
    )
        public
        virtual
        override(ERC734, IERC734)
        onlyManager
        returns (bool success)
    {
        return ERC734.removeKey(_key, _purpose);
    }

    /// @inheritdoc IERC734
    /// @dev Approves or disapproves an execution.
    ///      Requires MANAGEMENT_KEY if the execution targets the identity itself.
    ///      Requires ACTION_KEY if the execution targets an external contract.
    function approve(uint256 _id, bool _toApprove) public virtual override(ERC734, IERC734) returns (bool success) {
        Execution storage executionToApprove = _executions[_id];
        if (_id >= _executionNonce) revert ReplicatedExecutionIdDoesNotExist({ executionId: _id });
        if (executionToApprove.executed) revert ReplicatedExecutionAlreadyPerformed({ executionId: _id });

        bytes32 senderKeyHash = keccak256(abi.encode(msg.sender));
        if (executionToApprove.to == address(this)) {
            if (!keyHasPurpose(senderKeyHash, ERC734KeyPurposes.MANAGEMENT_KEY)) {
                revert SenderLacksManagementKey();
            }
        } else {
            if (!keyHasPurpose(senderKeyHash, ERC734KeyPurposes.ACTION_KEY)) {
                revert SenderLacksActionKey();
            }
        }
        return ERC734.approve(_id, _toApprove);
    }

    /// @inheritdoc IERC734
    /// @dev Initiates an execution. If the sender has MANAGEMENT_KEY, or ACTION_KEY (for external calls),
    ///      the execution is auto-approved.
    function execute(
        address _to,
        uint256 _value,
        bytes calldata _data
    )
        public
        payable
        virtual
        override(ERC734, IERC734)
        returns (uint256 executionId)
    {
        executionId = ERC734.execute(_to, _value, _data);

        bytes32 senderKeyHash = keccak256(abi.encode(msg.sender));
        bool autoApproved = false;

        if (keyHasPurpose(senderKeyHash, ERC734KeyPurposes.MANAGEMENT_KEY)) {
            autoApproved = true;
        } else if (_to != address(this) && keyHasPurpose(senderKeyHash, ERC734KeyPurposes.ACTION_KEY)) {
            autoApproved = true;
        }

        if (autoApproved) {
            this.approve(executionId, true);
        }

        return executionId;
    }

    function keyHasPurpose(
        bytes32 _key,
        uint256 _purpose
    )
        public
        view
        virtual
        override(ERC734, OnChainIdentity, IERC734)
        returns (bool exists)
    {
        return ERC734.keyHasPurpose(_key, _purpose);
    }

    // --- ERC735 (Claim Holder) Functions - Overridden for Access Control ---

    /// @inheritdoc IERC735
    /// @dev Adds or updates a claim. Requires CLAIM_SIGNER_KEY purpose from the sender.
    function addClaim(
        uint256 _topic,
        uint256 _scheme,
        address _issuer,
        bytes memory _signature,
        bytes memory _data,
        string memory _uri
    )
        public
        virtual
        override(ERC735, IERC735) // Overrides ERC735's implementation and fulfills IERC735
        onlyActionKey
        returns (bytes32 claimId)
    {
        return ERC735.addClaim(_topic, _scheme, _issuer, _signature, _data, _uri);
    }

    /// @inheritdoc IERC735
    /// @dev Removes a claim. Requires CLAIM_SIGNER_KEY purpose from the sender.
    function removeClaim(bytes32 _claimId) public virtual override(ERC735, IERC735) returns (bool success) {
        return ERC735.removeClaim(_claimId);
    }

    function getClaim(bytes32 _claimId)
        public
        view
        virtual
        override(ERC735, OnChainIdentityWithRevocation)
        returns (uint256, uint256, address, bytes memory, bytes memory, string memory)
    {
        return ERC735.getClaim(_claimId);
    }
}

contract OnChainIdentityWithRevocationTest is Test {
    TestableOnChainIdentityWithRevocation public identity;

    // Test addresses
    address public admin = makeAddr("admin");
    address public user = makeAddr("user");
    address public signer;

    uint256 internal signerPrivateKey = 0x12345;

    // Test data
    bytes32 public TEST_CLAIM_ID;
    uint256 public constant CLAIM_TOPIC = 1;
    uint256 public constant CLAIM_SCHEME = 1;
    bytes public testSignature;
    string public testDataString = "test claim data";
    bytes public testData;
    string public testUri = "https://example.com/claim";

    function setUp() public {
        identity = new TestableOnChainIdentityWithRevocation(admin);
        signer = vm.addr(signerPrivateKey);

        // The identity needs to have the signer's key registered for this.
        vm.prank(admin);
        identity.addKey(keccak256(abi.encode(signer)), ERC734KeyPurposes.CLAIM_SIGNER_KEY, ERC734KeyTypes.ECDSA);

        // Add the initial test claim
        (TEST_CLAIM_ID, testSignature) = _addTestClaim(testDataString);
        testData = abi.encode(testDataString);
    }

    /// @notice Utility function to create, sign, and add a test claim.
    function _addTestClaim(string memory _testDataString) internal returns (bytes32 claimId, bytes memory signature) {
        bytes memory _testData = abi.encode(_testDataString);
        bytes32 dataHash = keccak256(abi.encode(address(identity), CLAIM_TOPIC, _testData));
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", dataHash));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, prefixedHash);
        signature = abi.encodePacked(r, s, v);

        vm.prank(admin);
        claimId = identity.addClaim(CLAIM_TOPIC, CLAIM_SCHEME, address(identity), signature, _testData, testUri);
    }

    function test_InitialState() public view {
        // Initially, no claims should be revoked
        assertFalse(identity.isClaimRevoked(testSignature));
        assertFalse(identity.revokedClaims(keccak256(testSignature)));
    }

    function test_RevokeClaimBySignatureSuccess() public {
        vm.prank(admin);
        vm.expectEmit(true, false, false, false);
        emit IClaimIssuer.ClaimRevoked(testSignature);

        identity.revokeClaimBySignature(testSignature);

        // Verify claim is now revoked
        assertTrue(identity.isClaimRevoked(testSignature));
        assertTrue(identity.revokedClaims(keccak256(testSignature)));
    }

    function test_RevokeClaimBySignatureAlreadyRevoked() public {
        // First revocation should succeed
        vm.prank(admin);
        identity.revokeClaimBySignature(testSignature);

        // Second revocation should fail
        vm.prank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(OnChainIdentityWithRevocation.ClaimAlreadyRevoked.selector, keccak256(testSignature))
        );
        identity.revokeClaimBySignature(testSignature);
    }

    function test_RevokeClaimBySignatureOnlyAdmin() public {
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(TestableOnChainIdentityWithRevocation.SenderLacksManagementKey.selector));
        identity.revokeClaimBySignature(testSignature);
    }

    function test_RevokeClaimByIdSuccess() public {
        vm.prank(admin);
        vm.expectEmit(true, false, false, false);
        emit IClaimIssuer.ClaimRevoked(testSignature);

        bool result = identity.revokeClaim(TEST_CLAIM_ID, address(identity));

        assertTrue(result);
        assertTrue(identity.isClaimRevoked(testSignature));
        assertTrue(identity.revokedClaims(keccak256(testSignature)));
    }

    function test_RevokeClaimByIdNonExistentClaim() public {
        bytes32 nonExistentClaimId = keccak256("non_existent_claim");

        vm.prank(admin);
        vm.expectRevert(abi.encodeWithSelector(ERC735.ClaimDoesNotExist.selector, nonExistentClaimId));
        identity.revokeClaim(nonExistentClaimId, address(identity));
    }

    function test_RevokeClaimByIdOnlyAdmin() public {
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(TestableOnChainIdentityWithRevocation.SenderLacksManagementKey.selector));
        identity.revokeClaim(TEST_CLAIM_ID, address(identity));
    }

    function test_IsClaimValidWithValidKeyAndNonRevokedClaim() public view {
        // Create test identity
        IIdentity testIdentity = IIdentity(address(identity));

        // The mock signature is invalid, so isClaimValid will revert
        // This is expected behavior with invalid signatures
        assertTrue(identity.isClaimValid(testIdentity, CLAIM_TOPIC, testSignature, testData));
    }

    function test_IsClaimValidWithRevokedClaim() public {
        // Revoke the claim
        vm.prank(admin);
        identity.revokeClaimBySignature(testSignature);

        // Create test identity
        IIdentity testIdentity = IIdentity(address(identity));

        // The mock signature is invalid, so isClaimValid will revert
        // even before checking if the claim is revoked
        assertFalse(identity.isClaimValid(testIdentity, CLAIM_TOPIC, testSignature, testData));
    }

    function test_IsClaimRevokedFalseForNonRevokedClaim() public view {
        assertFalse(identity.isClaimRevoked(testSignature));
    }

    function test_IsClaimRevokedTrueForRevokedClaim() public {
        vm.prank(admin);
        identity.revokeClaimBySignature(testSignature);

        assertTrue(identity.isClaimRevoked(testSignature));
    }

    function test_GetRecoveredAddressValidSignature() public view {
        bytes32 dataHash = keccak256(bytes("test data"));
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", dataHash));

        // Sign with a known private key
        uint256 privateKey = signerPrivateKey;
        address expectedSigner = vm.addr(privateKey);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, prefixedHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        address recovered = identity.getRecoveredAddress(signature, prefixedHash);
        assertEq(recovered, expectedSigner);
    }

    function test_GetRecoveredAddressInvalidSignatureLength() public {
        bytes32 dataHash = keccak256("test data");
        bytes memory invalidSignature = hex"1234"; // Too short

        // ECDSA.recover reverts on invalid signature length
        vm.expectRevert(abi.encodeWithSelector(ECDSA.ECDSAInvalidSignatureLength.selector, 2));
        identity.getRecoveredAddress(invalidSignature, dataHash);
    }

    function test_GetRecoveredAddressWithDifferentVValues() public {
        bytes32 dataHash = keccak256("test data");

        // Test with invalid signature (v = 27) but correct length
        bytes memory signature27 =
            hex"111111111111111111111111111111111111111111111111111111111111111122222222222222222222222222222222222222222222222222222222222222221b";

        // ECDSA.recover reverts on invalid signature
        vm.expectRevert(ECDSA.ECDSAInvalidSignature.selector);
        identity.getRecoveredAddress(signature27, dataHash);

        // Test with invalid signature (v = 28) but correct length
        bytes memory signature28 =
            hex"111111111111111111111111111111111111111111111111111111111111111122222222222222222222222222222222222222222222222222222222222222221c";

        // ECDSA.recover reverts on invalid signature
        vm.expectRevert(ECDSA.ECDSAInvalidSignature.selector);
        identity.getRecoveredAddress(signature28, dataHash);
    }

    function test_MultipleClaimRevocations() public {
        // Add and sign claim 2
        (, bytes memory signature2) = _addTestClaim("test claim data 2");

        // Add and sign claim 3
        (, bytes memory signature3) = _addTestClaim("test claim data 3");

        // Revoke multiple claims
        vm.startPrank(admin);

        vm.expectEmit(true, false, false, false);
        emit IClaimIssuer.ClaimRevoked(testSignature);
        identity.revokeClaimBySignature(testSignature);

        vm.expectEmit(true, false, false, false);
        emit IClaimIssuer.ClaimRevoked(signature2);
        identity.revokeClaimBySignature(signature2);

        vm.expectEmit(true, false, false, false);
        emit IClaimIssuer.ClaimRevoked(signature3);
        identity.revokeClaimBySignature(signature3);

        vm.stopPrank();

        // Verify all are revoked
        assertTrue(identity.isClaimRevoked(testSignature));
        assertTrue(identity.isClaimRevoked(signature2));
        assertTrue(identity.isClaimRevoked(signature3));
    }

    function test_FuzzRevokeClaimBySignature(string calldata randomDataString) public {
        vm.assume(bytes(randomDataString).length > 0);
        // to avoid collision with the claim from setUp
        vm.assume(keccak256(bytes(randomDataString)) != keccak256(bytes(testDataString)));

        // Create and add a new claim with random data
        (, bytes memory randomSignature) = _addTestClaim(randomDataString);

        // --- Test revocation ---
        // Should not be revoked initially
        assertFalse(identity.isClaimRevoked(randomSignature));

        // Revoke the claim
        vm.prank(admin);
        identity.revokeClaimBySignature(randomSignature);

        // Should be revoked now
        assertTrue(identity.isClaimRevoked(randomSignature));

        // Trying to revoke again should fail
        vm.prank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(
                OnChainIdentityWithRevocation.ClaimAlreadyRevoked.selector, keccak256(randomSignature)
            )
        );
        identity.revokeClaimBySignature(randomSignature);
    }

    function test_ClaimRevocationMapping() public {
        bytes32 signatureHash = keccak256(testSignature);

        // Initially false
        assertFalse(identity.revokedClaims(signatureHash));

        // Revoke claim
        vm.prank(admin);
        identity.revokeClaimBySignature(testSignature);

        // Now true
        assertTrue(identity.revokedClaims(signatureHash));
    }

    function test_GetClaimFunctionality() public view {
        (uint256 topic, uint256 scheme, address issuer, bytes memory signature, bytes memory data, string memory uri) =
            identity.getClaim(TEST_CLAIM_ID);

        assertEq(topic, CLAIM_TOPIC);
        assertEq(scheme, CLAIM_SCHEME);
        assertEq(issuer, address(identity));
        assertEq(signature, testSignature);
        assertEq(data, testData);
        assertEq(uri, testUri);
    }

    function test_RevokeClaimByIdInternalLogic() public {
        // Test the complete flow: getClaim -> extract signature -> revoke by signature
        vm.prank(admin);
        bool result = identity.revokeClaim(TEST_CLAIM_ID, address(identity));

        assertTrue(result);
        assertTrue(identity.isClaimRevoked(testSignature));
    }

    function test_KeyManagementFunctionality() public {
        bytes32 testKey = keccak256("test_key");
        uint256 purpose = 3;

        // Initially false
        assertFalse(identity.keyHasPurpose(testKey, purpose));

        // Add key using helper function
        vm.prank(admin);
        identity.addKey(testKey, purpose, 1);
        assertTrue(identity.keyHasPurpose(testKey, purpose));

        // Remove key using helper function
        vm.prank(admin);
        identity.removeKey(testKey, purpose);
        assertFalse(identity.keyHasPurpose(testKey, purpose));
    }
}
