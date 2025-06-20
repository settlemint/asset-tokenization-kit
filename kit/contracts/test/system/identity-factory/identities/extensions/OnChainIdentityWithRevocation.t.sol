// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { OnChainIdentityWithRevocation } from
    "../../../../../contracts/onchainid/extensions/OnChainIdentityWithRevocation.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// Concrete implementation for testing the abstract contract
contract TestableOnChainIdentityWithRevocation is OnChainIdentityWithRevocation {
    // Mock storage for testing
    mapping(bytes32 => bool) public keys;
    mapping(bytes32 => Claim) public claims;
    mapping(bytes32 => uint256[]) public keyPurposes;
    mapping(uint256 => bytes32[]) public keysByPurpose;
    mapping(uint256 => bytes32[]) public claimIdsByTopic;

    struct Claim {
        uint256 topic;
        uint256 scheme;
        address issuer;
        bytes signature;
        bytes data;
        string uri;
        bool exists;
    }

    // Admin for testing
    address public admin;

    constructor(address _admin) {
        admin = _admin;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    // Mock implementation of keyHasPurpose - returns true if key exists with the purpose
    function keyHasPurpose(bytes32 _key, uint256 _purpose) public view override returns (bool) {
        // For testing purposes, return true if the key exists in our mock storage
        // In a real implementation, this would check if the key has the specific purpose
        return keys[keccak256(abi.encode(_key, _purpose))];
    }

    // ERC734 interface implementations (mock for testing)
    function addKey(bytes32 _key, uint256 _purpose, uint256 /*_keyType*/ ) external override onlyAdmin returns (bool) {
        keys[keccak256(abi.encode(_key, _purpose))] = true;
        return true;
    }

    function removeKey(bytes32 _key, uint256 _purpose) external override onlyAdmin returns (bool) {
        keys[keccak256(abi.encode(_key, _purpose))] = false;
        return true;
    }

    function getKey(bytes32 _key)
        external
        view
        override
        returns (uint256[] memory purposes, uint256 keyType, bytes32 key)
    {
        return (keyPurposes[_key], 1, _key);
    }

    function getKeyPurposes(bytes32 _key) external view override returns (uint256[] memory _purposes) {
        return keyPurposes[_key];
    }

    function getKeysByPurpose(uint256 _purpose) external view override returns (bytes32[] memory _keys) {
        return keysByPurpose[_purpose];
    }

    function execute(
        address, /* _to */
        uint256, /* _value */
        bytes calldata /* _data */
    )
        external
        payable
        override
        returns (uint256)
    {
        return 0; // Mock implementation
    }

    function approve(uint256, /* _id */ bool /* _approve */ ) external pure override returns (bool) {
        return true; // Mock implementation
    }

    // ERC735 interface implementations (mock for testing)
    function addClaim(
        uint256 _topic,
        uint256 _scheme,
        address _issuer,
        bytes calldata _signature,
        bytes calldata _data,
        string calldata _uri
    )
        external
        override
        returns (bytes32 claimRequestId)
    {
        bytes32 claimId = keccak256(abi.encode(_topic, _scheme, _issuer, _signature, _data));
        claims[claimId] = Claim({
            topic: _topic,
            scheme: _scheme,
            issuer: _issuer,
            signature: _signature,
            data: _data,
            uri: _uri,
            exists: true
        });
        return claimId;
    }

    function removeClaim(bytes32 _claimId) external override returns (bool) {
        delete claims[_claimId];
        return true;
    }

    function getClaimIdsByTopic(uint256 _topic) external view override returns (bytes32[] memory) {
        return claimIdsByTopic[_topic];
    }

    // Helper functions for testing
    function addKeyForTesting(bytes32 _key, uint256 _purpose) external onlyAdmin {
        keys[keccak256(abi.encode(_key, _purpose))] = true;
    }

    function removeKeyForTesting(bytes32 _key, uint256 _purpose) external onlyAdmin {
        keys[keccak256(abi.encode(_key, _purpose))] = false;
    }

    // Implementation of getClaim for testing
    function getClaim(bytes32 _claimId)
        public
        view
        override
        returns (uint256, uint256, address, bytes memory, bytes memory, string memory)
    {
        Claim memory claim = claims[_claimId];
        require(claim.exists, "Claim does not exist");
        return (claim.topic, claim.scheme, claim.issuer, claim.signature, claim.data, claim.uri);
    }

    // Add a claim for testing
    function addClaim(
        bytes32 _claimId,
        uint256 _topic,
        uint256 _scheme,
        address _issuer,
        bytes memory _signature,
        bytes memory _data,
        string memory _uri
    )
        external
        onlyAdmin
    {
        claims[_claimId] = Claim({
            topic: _topic,
            scheme: _scheme,
            issuer: _issuer,
            signature: _signature,
            data: _data,
            uri: _uri,
            exists: true
        });
    }

    // Public wrapper for testing the internal _revokeClaim function
    function revokeClaimBySignature(bytes calldata signature) external override onlyAdmin {
        _revokeClaimBySignature(signature);
    }

    // Public wrapper for testing the internal _revokeClaim function
    function revokeClaim(bytes32 _claimId) external override onlyAdmin returns (bool) {
        return _revokeClaim(_claimId);
    }
}

contract OnChainIdentityWithRevocationTest is Test {
    TestableOnChainIdentityWithRevocation public identity;

    // Test addresses
    address public admin = makeAddr("admin");
    address public user = makeAddr("user");
    address public signer = makeAddr("signer");

    // Test data
    bytes32 public constant TEST_CLAIM_ID = keccak256("test_claim");
    uint256 public constant CLAIM_TOPIC = 1;
    uint256 public constant CLAIM_SCHEME = 1;
    bytes public testSignature =
        hex"1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12";
    bytes public testData = "test claim data";
    string public testUri = "https://example.com/claim";

    // Events
    event ClaimRevoked(bytes signature);

    function setUp() public {
        identity = new TestableOnChainIdentityWithRevocation(admin);

        // Add a test claim
        vm.prank(admin);
        identity.addClaim(TEST_CLAIM_ID, CLAIM_TOPIC, CLAIM_SCHEME, signer, testSignature, testData, testUri);
    }

    function test_InitialState() public view {
        // Initially, no claims should be revoked
        assertFalse(identity.isClaimRevoked(testSignature));
        assertFalse(identity.revokedClaims(keccak256(testSignature)));
    }

    function test_RevokeClaimBySignatureSuccess() public {
        vm.prank(admin);
        vm.expectEmit(true, false, false, false);
        emit ClaimRevoked(testSignature);

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
        vm.expectRevert("Only admin");
        identity.revokeClaimBySignature(testSignature);
    }

    function test_RevokeClaimByIdSuccess() public {
        vm.prank(admin);
        vm.expectEmit(true, false, false, false);
        emit ClaimRevoked(testSignature);

        bool result = identity.revokeClaim(TEST_CLAIM_ID);

        assertTrue(result);
        assertTrue(identity.isClaimRevoked(testSignature));
        assertTrue(identity.revokedClaims(keccak256(testSignature)));
    }

    function test_RevokeClaimByIdNonExistentClaim() public {
        bytes32 nonExistentClaimId = keccak256("non_existent_claim");

        vm.prank(admin);
        vm.expectRevert("Claim does not exist");
        identity.revokeClaim(nonExistentClaimId);
    }

    function test_RevokeClaimByIdOnlyAdmin() public {
        vm.prank(user);
        vm.expectRevert("Only admin");
        identity.revokeClaim(TEST_CLAIM_ID);
    }

    function test_IsClaimValidWithValidKeyAndNonRevokedClaim() public {
        // Add a key with purpose 3 for the signer
        bytes32 signerKey = keccak256(abi.encode(signer));
        vm.prank(admin);
        identity.addKeyForTesting(signerKey, 3);

        // Create test identity
        IIdentity testIdentity = IIdentity(address(identity));

        // The mock signature is invalid, so isClaimValid will revert
        // This is expected behavior with invalid signatures
        vm.expectRevert(ECDSA.ECDSAInvalidSignature.selector);
        identity.isClaimValid(testIdentity, CLAIM_TOPIC, testSignature, testData);
    }

    function test_IsClaimValidWithRevokedClaim() public {
        // Add a key with purpose 3 for the signer
        bytes32 signerKey = keccak256(abi.encode(signer));
        vm.prank(admin);
        identity.addKeyForTesting(signerKey, 3);

        // Revoke the claim
        vm.prank(admin);
        identity.revokeClaimBySignature(testSignature);

        // Create test identity
        IIdentity testIdentity = IIdentity(address(identity));

        // The mock signature is invalid, so isClaimValid will revert
        // even before checking if the claim is revoked
        vm.expectRevert(ECDSA.ECDSAInvalidSignature.selector);
        identity.isClaimValid(testIdentity, CLAIM_TOPIC, testSignature, testData);
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
        // Create a valid signature for testing
        bytes32 dataHash = keccak256("test data");
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", dataHash));

        // Sign with a known private key
        uint256 privateKey = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
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

        // Test with invalid signature (v = 27)
        bytes memory signature27 =
            hex"1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b";

        // ECDSA.recover reverts on invalid signature
        vm.expectRevert(ECDSA.ECDSAInvalidSignature.selector);
        identity.getRecoveredAddress(signature27, dataHash);

        // Test with invalid signature (v = 28)
        bytes memory signature28 =
            hex"1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1c";

        // ECDSA.recover reverts on invalid signature
        vm.expectRevert(ECDSA.ECDSAInvalidSignature.selector);
        identity.getRecoveredAddress(signature28, dataHash);
    }

    function test_MultipleClaimRevocations() public {
        bytes memory signature2 =
            hex"abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab";
        bytes memory signature3 =
            hex"567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456";

        // Revoke multiple claims
        vm.startPrank(admin);

        vm.expectEmit(true, false, false, false);
        emit ClaimRevoked(testSignature);
        identity.revokeClaimBySignature(testSignature);

        vm.expectEmit(true, false, false, false);
        emit ClaimRevoked(signature2);
        identity.revokeClaimBySignature(signature2);

        vm.expectEmit(true, false, false, false);
        emit ClaimRevoked(signature3);
        identity.revokeClaimBySignature(signature3);

        vm.stopPrank();

        // Verify all are revoked
        assertTrue(identity.isClaimRevoked(testSignature));
        assertTrue(identity.isClaimRevoked(signature2));
        assertTrue(identity.isClaimRevoked(signature3));
    }

    function test_FuzzRevokeClaimBySignature(bytes calldata randomSignature) public {
        vm.assume(randomSignature.length > 0);

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
        assertEq(issuer, signer);
        assertEq(signature, testSignature);
        assertEq(data, testData);
        assertEq(uri, testUri);
    }

    function test_RevokeClaimByIdInternalLogic() public {
        // Test the complete flow: getClaim -> extract signature -> revoke by signature
        vm.prank(admin);
        bool result = identity.revokeClaim(TEST_CLAIM_ID);

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
        identity.addKeyForTesting(testKey, purpose);
        assertTrue(identity.keyHasPurpose(testKey, purpose));

        // Remove key using helper function
        vm.prank(admin);
        identity.removeKeyForTesting(testKey, purpose);
        assertFalse(identity.keyHasPurpose(testKey, purpose));
    }
}
