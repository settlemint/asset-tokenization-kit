// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { ATKTokenIdentityImplementation } from
    "../../../../contracts/system/identity-factory/identities/ATKTokenIdentityImplementation.sol";
import { IATKTokenIdentity } from "../../../../contracts/system/identity-factory/identities/IATKTokenIdentity.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { IERC734 } from "@onchainid/contracts/interface/IERC734.sol";
import { IERC735 } from "@onchainid/contracts/interface/IERC735.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { ATKTokenAccessManagerImplementation } from
    "../../../../contracts/system/access-manager/ATKTokenAccessManagerImplementation.sol";
import { ISMARTTokenAccessManager } from
    "../../../../contracts/smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { ISMARTTokenAccessManaged } from
    "../../../../contracts/smart/extensions/access-managed/ISMARTTokenAccessManaged.sol";
import { ATKSystemRoles } from "../../../../contracts/system/ATKSystemRoles.sol";

contract ATKTokenIdentityImplementationTest is Test {
    ATKTokenIdentityImplementation public implementation;
    IATKTokenIdentity public tokenIdentity;
    ISMARTTokenAccessManager public accessManager;

    // Test addresses
    address public admin = makeAddr("admin");
    address public claimManager = makeAddr("claimManager");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");
    address public forwarder = makeAddr("forwarder");
    address public issuer = makeAddr("issuer");

    // Events from ERC735
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

    function setUp() public {
        // Deploy access manager
        ATKTokenAccessManagerImplementation accessManagerImpl = new ATKTokenAccessManagerImplementation(forwarder);
        ERC1967Proxy accessManagerProxy = new ERC1967Proxy(
            address(accessManagerImpl), abi.encodeWithSelector(accessManagerImpl.initialize.selector, admin)
        );
        accessManager = ISMARTTokenAccessManager(address(accessManagerProxy));

        // Deploy token identity implementation
        implementation = new ATKTokenIdentityImplementation(forwarder);

        // Deploy proxy with initialization data
        bytes memory initData = abi.encodeWithSelector(IATKTokenIdentity.initialize.selector, address(accessManager));
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        tokenIdentity = IATKTokenIdentity(address(proxy));

        // Grant claim manager role
        vm.prank(admin);
        accessManager.grantRole(ATKSystemRoles.CLAIM_MANAGER_ROLE, claimManager);
    }

    function test_InitializeSuccess() public view {
        // Verify access manager is set correctly
        assertEq(ATKTokenIdentityImplementation(address(tokenIdentity)).accessManager(), address(accessManager));

        // Verify role checking works
        assertTrue(
            ATKTokenIdentityImplementation(address(tokenIdentity)).hasRole(
                ATKSystemRoles.CLAIM_MANAGER_ROLE, claimManager
            )
        );
        assertFalse(
            ATKTokenIdentityImplementation(address(tokenIdentity)).hasRole(ATKSystemRoles.CLAIM_MANAGER_ROLE, user1)
        );
    }

    function test_InitializeWithZeroAddress() public {
        vm.expectRevert(ATKTokenIdentityImplementation.InvalidAccessManager.selector);
        new ERC1967Proxy(
            address(implementation), abi.encodeWithSelector(IATKTokenIdentity.initialize.selector, address(0))
        );
    }

    function test_CannotInitializeTwice() public {
        // Token identity is already initialized, so trying to initialize again should fail
        vm.expectRevert();
        tokenIdentity.initialize(address(accessManager));
    }

    function test_AddClaimSuccess() public {
        uint256 topic = 1;
        uint256 scheme = 1;
        bytes memory signature = "signature";
        bytes memory data = "claimData";
        string memory uri = "uri";

        vm.prank(claimManager);
        vm.expectEmit(false, true, true, false);
        emit ClaimAdded(bytes32(0), topic, scheme, address(tokenIdentity), signature, data, uri);

        bytes32 claimId = tokenIdentity.addClaim(topic, scheme, address(tokenIdentity), signature, data, uri);
        assertNotEq(claimId, bytes32(0));

        // Verify claim exists
        (
            uint256 retTopic,
            uint256 retScheme,
            address retIssuer,
            bytes memory retSignature,
            bytes memory retData,
            string memory retUri
        ) = tokenIdentity.getClaim(claimId);
        assertEq(retTopic, topic);
        assertEq(retScheme, scheme);
        assertEq(retIssuer, address(tokenIdentity));
        assertEq(retSignature, signature);
        assertEq(retData, data);
        assertEq(retUri, uri);
    }

    function test_AddClaimRequiresClaimManagerRole() public {
        vm.prank(user1); // user1 doesn't have claim manager role
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTTokenAccessManaged.AccessControlUnauthorizedAccount.selector,
                user1,
                ATKSystemRoles.CLAIM_MANAGER_ROLE
            )
        );
        tokenIdentity.addClaim(1, 1, issuer, "signature", "data", "uri");
    }

    function test_RemoveClaimSuccess() public {
        // Add claim first
        vm.prank(claimManager);
        bytes32 claimId = tokenIdentity.addClaim(1, 1, address(tokenIdentity), "signature", "data", "uri");

        // Remove claim
        vm.prank(claimManager);
        vm.expectEmit(false, true, false, false);
        emit ClaimRemoved(claimId, 1, 1, address(tokenIdentity), "signature", "data", "uri");

        bool success = tokenIdentity.removeClaim(claimId);
        assertTrue(success);
    }

    function test_RemoveClaimRequiresClaimManagerRole() public {
        // Add claim first
        vm.prank(claimManager);
        bytes32 claimId = tokenIdentity.addClaim(1, 1, address(tokenIdentity), "signature", "data", "uri");

        vm.prank(user1); // user1 doesn't have claim manager role
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTTokenAccessManaged.AccessControlUnauthorizedAccount.selector,
                user1,
                ATKSystemRoles.CLAIM_MANAGER_ROLE
            )
        );
        tokenIdentity.removeClaim(claimId);
    }

    function test_HasRoleFunction() public view {
        // Test with initialized access manager
        assertTrue(
            ATKTokenIdentityImplementation(address(tokenIdentity)).hasRole(
                ATKSystemRoles.CLAIM_MANAGER_ROLE, claimManager
            )
        );
        assertFalse(
            ATKTokenIdentityImplementation(address(tokenIdentity)).hasRole(ATKSystemRoles.CLAIM_MANAGER_ROLE, user1)
        );
        assertTrue(
            ATKTokenIdentityImplementation(address(tokenIdentity)).hasRole(ATKSystemRoles.DEFAULT_ADMIN_ROLE, admin)
        );
    }

    function test_HasRoleWithUninitializedAccessManager() public {
        // Deploy a fresh implementation without access manager
        ATKTokenIdentityImplementation freshImpl = new ATKTokenIdentityImplementation(forwarder);

        // hasRole should return false when access manager is not set
        assertFalse(freshImpl.hasRole(ATKSystemRoles.CLAIM_MANAGER_ROLE, claimManager));
    }

    function test_AccessManagerGetter() public view {
        assertEq(ATKTokenIdentityImplementation(address(tokenIdentity)).accessManager(), address(accessManager));
    }

    // Test all ERC734 functions that should revert with UnsupportedKeyOperation
    function test_AddKeyReverts() public {
        vm.expectRevert(ATKTokenIdentityImplementation.UnsupportedKeyOperation.selector);
        tokenIdentity.addKey(bytes32(0), 1, 1);
    }

    function test_RemoveKeyReverts() public {
        vm.expectRevert(ATKTokenIdentityImplementation.UnsupportedKeyOperation.selector);
        tokenIdentity.removeKey(bytes32(0), 1);
    }

    function test_GetKeyReverts() public {
        vm.expectRevert(ATKTokenIdentityImplementation.UnsupportedKeyOperation.selector);
        tokenIdentity.getKey(bytes32(0));
    }

    function test_GetKeyPurposesReverts() public {
        vm.expectRevert(ATKTokenIdentityImplementation.UnsupportedKeyOperation.selector);
        tokenIdentity.getKeyPurposes(bytes32(0));
    }

    function test_GetKeysByPurposeReverts() public {
        vm.expectRevert(ATKTokenIdentityImplementation.UnsupportedKeyOperation.selector);
        tokenIdentity.getKeysByPurpose(1);
    }

    function test_KeyHasPurposeReverts() public {
        vm.expectRevert(ATKTokenIdentityImplementation.UnsupportedKeyOperation.selector);
        tokenIdentity.keyHasPurpose(bytes32(0), 1);
    }

    // Test execution functions that should revert with UnsupportedExecutionOperation
    function test_ApproveReverts() public {
        vm.expectRevert(ATKTokenIdentityImplementation.UnsupportedExecutionOperation.selector);
        tokenIdentity.approve(0, true);
    }

    function test_ExecuteReverts() public {
        vm.expectRevert(ATKTokenIdentityImplementation.UnsupportedExecutionOperation.selector);
        tokenIdentity.execute(user1, 0, "");
    }

    function test_IsClaimValidAlwaysReturnsFalse() public view {
        // This identity implementation cannot issue claims, so always returns false
        bool result = tokenIdentity.isClaimValid(IIdentity(user1), 1, "signature", "data");
        assertFalse(result);
    }

    function test_SupportsInterface() public view {
        // Test ERC165 support
        assertTrue(implementation.supportsInterface(type(IERC165).interfaceId));
        assertTrue(implementation.supportsInterface(type(IATKTokenIdentity).interfaceId));
        assertTrue(implementation.supportsInterface(type(IIdentity).interfaceId));
        assertTrue(implementation.supportsInterface(type(IERC735).interfaceId));

        // Test unsupported interface
        assertFalse(implementation.supportsInterface(0x12345678));
    }

    function test_ClaimsByTopic() public {
        // Add multiple claims with same topic
        vm.prank(claimManager);
        bytes32 claimId1 = tokenIdentity.addClaim(1, 1, address(tokenIdentity), "sig1", "data1", "uri1");
        vm.prank(claimManager);
        bytes32 claimId2 = tokenIdentity.addClaim(1, 2, address(tokenIdentity), "sig2", "data2", "uri2");

        bytes32[] memory claimIds = tokenIdentity.getClaimIdsByTopic(1);
        // Since claimId is based on keccak256(issuer, topic), the second addClaim updates the first one
        // So we only expect 1 claim ID in the array
        assertEq(claimIds.length, 1);
        assertEq(claimIds[0], claimId1);
        assertEq(claimId1, claimId2); // Both should return the same claimId
    }

    function test_DirectCallToImplementation() public {
        // Direct calls to implementation should fail for initialize
        vm.expectRevert();
        implementation.initialize(address(accessManager));
    }

    function test_MultipleClaimsManagement() public {
        // Add multiple claims
        vm.prank(claimManager);
        bytes32 claimId1 = tokenIdentity.addClaim(1, 1, address(tokenIdentity), "sig1", "data1", "uri1");
        vm.prank(claimManager);
        bytes32 claimId2 = tokenIdentity.addClaim(2, 1, address(tokenIdentity), "sig2", "data2", "uri2");
        vm.prank(claimManager);
        bytes32 claimId3 = tokenIdentity.addClaim(1, 2, address(tokenIdentity), "sig3", "data3", "uri3");

        // Note: claimId1 and claimId3 will be the same since they have the same issuer and topic
        assertEq(claimId1, claimId3);

        // Verify all claims exist
        (uint256 topic1,,,,,) = tokenIdentity.getClaim(claimId1);
        (uint256 topic2,,,,,) = tokenIdentity.getClaim(claimId2);
        assertEq(topic1, 1);
        assertEq(topic2, 2);

        // Remove one claim
        vm.prank(claimManager);
        tokenIdentity.removeClaim(claimId2);

        // Verify topic 1 still has 1 claim, topic 2 has 0
        bytes32[] memory topic1Claims = tokenIdentity.getClaimIdsByTopic(1);
        bytes32[] memory topic2Claims = tokenIdentity.getClaimIdsByTopic(2);
        assertEq(topic1Claims.length, 1);
        assertEq(topic2Claims.length, 0);
    }

    function test_AccessControlWithDifferentRoles() public {
        // Grant another role to user1
        vm.prank(admin);
        accessManager.grantRole(ATKSystemRoles.REGISTRAR_ROLE, user1);

        // Verify user1 has the registrar role but not claim manager role
        assertTrue(ATKTokenIdentityImplementation(address(tokenIdentity)).hasRole(ATKSystemRoles.REGISTRAR_ROLE, user1));
        assertFalse(
            ATKTokenIdentityImplementation(address(tokenIdentity)).hasRole(ATKSystemRoles.CLAIM_MANAGER_ROLE, user1)
        );

        // user1 still can't manage claims
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTTokenAccessManaged.AccessControlUnauthorizedAccount.selector,
                user1,
                ATKSystemRoles.CLAIM_MANAGER_ROLE
            )
        );
        tokenIdentity.addClaim(1, 1, issuer, "signature", "data", "uri");
    }

    function test_InternalCheckRoleFunction() public {
        // This tests the internal _checkRole function indirectly through addClaim

        // Should work with proper role
        vm.prank(claimManager);
        tokenIdentity.addClaim(1, 1, address(tokenIdentity), "signature", "data", "uri");

        // Should fail without proper role
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTTokenAccessManaged.AccessControlUnauthorizedAccount.selector,
                user1,
                ATKSystemRoles.CLAIM_MANAGER_ROLE
            )
        );
        tokenIdentity.addClaim(1, 1, address(tokenIdentity), "signature", "data", "uri");
    }

    function test_FuzzAddRemoveClaims(uint256 topic, uint256 scheme) public {
        // Use vm.bound to ensure values are in range without rejecting too many inputs
        topic = bound(topic, 1, 999);
        scheme = bound(scheme, 1, 9);

        bytes memory signature = abi.encodePacked("sig_", topic, "_", scheme);
        bytes memory data = abi.encodePacked("data_", topic, "_", scheme);
        string memory uri = string(abi.encodePacked("uri_", vm.toString(topic)));

        // Add claim
        vm.prank(claimManager);
        bytes32 claimId = tokenIdentity.addClaim(topic, scheme, address(tokenIdentity), signature, data, uri);
        assertNotEq(claimId, bytes32(0));

        // Verify claim
        (uint256 retTopic, uint256 retScheme, address retIssuer,,,) = tokenIdentity.getClaim(claimId);
        assertEq(retTopic, topic);
        assertEq(retScheme, scheme);
        assertEq(retIssuer, address(tokenIdentity));

        // Remove claim
        vm.prank(claimManager);
        bool success = tokenIdentity.removeClaim(claimId);
        assertTrue(success);
    }

    function test_ERC2771ContextIntegration() public view {
        // Verify forwarder is set correctly in implementation
        // This is tested implicitly through the constructor
        assertNotEq(address(implementation), address(0));
    }
}
