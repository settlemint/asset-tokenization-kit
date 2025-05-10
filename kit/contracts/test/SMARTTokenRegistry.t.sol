// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test, console2 } from "forge-std/Test.sol";
import { SMARTTokenRegistry } from "../contracts/SMARTTokenRegistry.sol";
// No need to import AccessControl just for the error if we declare it locally for testing

contract SMARTTokenRegistryTest is Test {
    SMARTTokenRegistry registry;
    address admin; // Changed from owner to admin for clarity
    address user1;
    address user2; // Added for role management tests
    address mockToken;
    address mockForwarder;

    // Declare external error for testing
    error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);

    function setUp() public {
        admin = makeAddr("admin");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        mockToken = makeAddr("mockToken");
        mockForwarder = makeAddr("mockForwarder");

        vm.prank(admin); // Deployer is admin
        registry = new SMARTTokenRegistry(mockForwarder, admin);
    }

    // --- Test Constructor ---

    function test_Constructor_SetsInitialRolesCorrectly() public view {
        assertTrue(registry.hasRole(registry.DEFAULT_ADMIN_ROLE(), admin), "Admin should have DEFAULT_ADMIN_ROLE");
        assertTrue(registry.hasRole(registry.REGISTRAR_ROLE(), admin), "Admin should have REGISTRAR_ROLE");
    }

    // --- Test registerToken ---

    function test_RegisterToken_Success() public {
        vm.prank(admin); // Admin has REGISTRAR_ROLE by default
        vm.expectEmit(true, true, true, true, address(registry));
        emit SMARTTokenRegistry.TokenRegistered(admin, mockToken); // Emit with initiator
        registry.registerToken(mockToken);
        assertTrue(registry.isTokenRegistered(mockToken), "Token should be registered");
    }

    function test_RegisterToken_Fail_NotRegistrar() public {
        vm.startPrank(user1); // user1 does not have REGISTRAR_ROLE
        vm.expectRevert(
            abi.encodeWithSelector(AccessControlUnauthorizedAccount.selector, user1, registry.REGISTRAR_ROLE())
        );
        registry.registerToken(mockToken);
        vm.stopPrank();
    }

    function test_RegisterToken_Fail_InvalidTokenAddress() public {
        vm.prank(admin);
        vm.expectRevert(SMARTTokenRegistry.InvalidTokenAddress.selector);
        registry.registerToken(address(0));
    }

    function test_RegisterToken_Fail_TokenAlreadyRegistered() public {
        vm.prank(admin);
        registry.registerToken(mockToken); // First registration

        vm.prank(admin);
        vm.expectRevert(abi.encodeWithSelector(SMARTTokenRegistry.TokenAlreadyRegistered.selector, mockToken));
        registry.registerToken(mockToken); // Attempt to register again
    }

    // --- Test unregisterToken ---

    function test_UnregisterToken_Success() public {
        vm.prank(admin);
        registry.registerToken(mockToken);
        assertTrue(registry.isTokenRegistered(mockToken), "Token should be registered initially");

        vm.prank(admin);
        vm.expectEmit(true, true, true, true, address(registry));
        emit SMARTTokenRegistry.TokenUnregistered(admin, mockToken); // Emit with initiator
        registry.unregisterToken(mockToken);
        assertFalse(registry.isTokenRegistered(mockToken), "Token should be unregistered");
    }

    function test_UnregisterToken_Fail_NotRegistrar() public {
        vm.prank(admin);
        registry.registerToken(mockToken);

        vm.startPrank(user1); // user1 does not have REGISTRAR_ROLE
        vm.expectRevert(
            abi.encodeWithSelector(AccessControlUnauthorizedAccount.selector, user1, registry.REGISTRAR_ROLE())
        );
        registry.unregisterToken(mockToken);
        vm.stopPrank();
    }

    function test_UnregisterToken_Fail_InvalidTokenAddress() public {
        vm.prank(admin);
        vm.expectRevert(SMARTTokenRegistry.InvalidTokenAddress.selector);
        registry.unregisterToken(address(0));
    }

    function test_UnregisterToken_Fail_TokenNotRegistered() public {
        vm.prank(admin);
        vm.expectRevert(abi.encodeWithSelector(SMARTTokenRegistry.TokenNotRegistered.selector, mockToken));
        registry.unregisterToken(mockToken);
    }

    // --- Test Role Management (grantRegistrarRole) ---

    function test_GrantRegistrarRole_Success_ByAdmin() public {
        vm.prank(admin); // Admin has DEFAULT_ADMIN_ROLE
        registry.grantRegistrarRole(user1);
        assertTrue(registry.hasRole(registry.REGISTRAR_ROLE(), user1), "user1 should have REGISTRAR_ROLE after grant");
    }

    function test_GrantRegistrarRole_Fail_ByNonAdmin() public {
        vm.startPrank(user1); // user1 does not have DEFAULT_ADMIN_ROLE
        vm.expectRevert(
            abi.encodeWithSelector(AccessControlUnauthorizedAccount.selector, user1, registry.DEFAULT_ADMIN_ROLE())
        );
        registry.grantRegistrarRole(user2);
        vm.stopPrank();
    }

    function test_GrantRegistrarRole_Fail_ByRegistrarNotAdmin() public {
        // Grant user1 REGISTRAR_ROLE but not ADMIN_ROLE
        vm.prank(admin);
        registry.grantRegistrarRole(user1);
        // Revoke admin role from user1 if it had it (though it doesn't by default setup for user1)
        // This step is more for robust testing in complex scenarios; here admin is distinct.

        vm.startPrank(user1); // user1 has REGISTRAR_ROLE, but not DEFAULT_ADMIN_ROLE
        vm.expectRevert(
            abi.encodeWithSelector(AccessControlUnauthorizedAccount.selector, user1, registry.DEFAULT_ADMIN_ROLE())
        );
        registry.grantRegistrarRole(user2);
        vm.stopPrank();
    }

    // --- Test Role Management (revokeRegistrarRole) ---

    function test_RevokeRegistrarRole_Success_ByAdmin() public {
        // Grant role first
        vm.prank(admin);
        registry.grantRegistrarRole(user1);
        assertTrue(registry.hasRole(registry.REGISTRAR_ROLE(), user1), "user1 should have REGISTRAR_ROLE initially");

        // Revoke role
        vm.prank(admin);
        registry.revokeRegistrarRole(user1);
        assertFalse(
            registry.hasRole(registry.REGISTRAR_ROLE(), user1), "user1 should not have REGISTRAR_ROLE after revoke"
        );
    }

    function test_RevokeRegistrarRole_Fail_ByNonAdmin() public {
        // Grant role first by admin
        vm.prank(admin);
        registry.grantRegistrarRole(user1);

        vm.startPrank(user2); // user2 does not have DEFAULT_ADMIN_ROLE
        vm.expectRevert(
            abi.encodeWithSelector(AccessControlUnauthorizedAccount.selector, user2, registry.DEFAULT_ADMIN_ROLE())
        );
        registry.revokeRegistrarRole(user1);
        vm.stopPrank();
    }

    function test_RevokeRegistrarRole_Fail_ByRegistrarNotAdmin() public {
        // Grant user1 REGISTRAR_ROLE
        vm.prank(admin);
        registry.grantRegistrarRole(user1);

        // user1 (Registrar, not Admin) tries to revoke from user2 (who doesn't have it, but action should fail on auth)
        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(AccessControlUnauthorizedAccount.selector, user1, registry.DEFAULT_ADMIN_ROLE())
        );
        registry.revokeRegistrarRole(user2); // Attempting to revoke from another user
        vm.stopPrank();
    }

    // --- Test ERC2771Context Overrides ---
    // Basic check to ensure internal _msgSender usage doesn't break.
    // Thorough testing of ERC2771 requires a mock forwarder.

    function test_Internal_MsgSender_WorksForRegistrar() public {
        // Grant user1 REGISTRAR_ROLE
        vm.prank(admin);
        registry.grantRegistrarRole(user1);

        vm.prank(user1); // user1 is now a registrar
        vm.expectEmit(true, true, true, true, address(registry));
        emit SMARTTokenRegistry.TokenRegistered(user1, mockToken);
        registry.registerToken(mockToken);
        assertTrue(registry.isTokenRegistered(mockToken), "Token registration by new registrar should succeed");
    }
}
