// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { SystemUtils } from "../utils/SystemUtils.sol";
import { ISMARTTokenAccessManager } from "../../contracts/smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { ATKTokenAccessManagerImplementation } from
    "../../contracts/system/tokens/access/ATKTokenAccessManagerImplementation.sol";
import { ATKTokenAccessManagerProxy } from "../../contracts/system/tokens/access/ATKTokenAccessManagerProxy.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract ATKTokenAccessManagerTest is Test {
    SystemUtils public systemUtils;
    ISMARTTokenAccessManager public accessManager;
    ATKTokenAccessManagerImplementation public implementation;

    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

    address public admin = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public operator = address(0x4);
    address public forwarder = address(0x5);

    function setUp() public {
        systemUtils = new SystemUtils(admin);

        // Create a fresh access manager for testing
        accessManager = systemUtils.createTokenAccessManager(admin);

        // Get the implementation for direct testing
        implementation = new ATKTokenAccessManagerImplementation(forwarder);
    }

    function test_InitialState() public view {
        // Check that admin has the required roles
        assertTrue(IAccessControl(address(accessManager)).hasRole(DEFAULT_ADMIN_ROLE, admin));
    }

    function test_SupportsInterface() public view {
        // Cast to IERC165 to access supportsInterface
        assertTrue(IERC165(address(accessManager)).supportsInterface(type(ISMARTTokenAccessManager).interfaceId));
        assertTrue(IERC165(address(accessManager)).supportsInterface(type(IAccessControl).interfaceId));
        // Check for IERC165 itself
        assertTrue(IERC165(address(accessManager)).supportsInterface(type(IERC165).interfaceId));
    }

    function test_GrantRole() public {
        bytes32 testRole = keccak256("TEST_ROLE");

        vm.prank(admin);
        IAccessControl(address(accessManager)).grantRole(testRole, user1);

        assertTrue(IAccessControl(address(accessManager)).hasRole(testRole, user1));
    }

    function test_GrantRole_OnlyAdmin() public {
        bytes32 testRole = keccak256("TEST_ROLE");

        vm.prank(user1);
        vm.expectRevert();
        IAccessControl(address(accessManager)).grantRole(testRole, user2);
    }

    function test_RevokeRole() public {
        bytes32 testRole = keccak256("TEST_ROLE");

        // First grant the role
        vm.prank(admin);
        IAccessControl(address(accessManager)).grantRole(testRole, user1);
        assertTrue(IAccessControl(address(accessManager)).hasRole(testRole, user1));

        // Then revoke it
        vm.prank(admin);
        IAccessControl(address(accessManager)).revokeRole(testRole, user1);
        assertFalse(IAccessControl(address(accessManager)).hasRole(testRole, user1));
    }

    function test_RenounceRole() public {
        bytes32 testRole = keccak256("TEST_ROLE");

        // Grant role first
        vm.prank(admin);
        IAccessControl(address(accessManager)).grantRole(testRole, user1);
        assertTrue(IAccessControl(address(accessManager)).hasRole(testRole, user1));

        // User renounces their own role
        vm.prank(user1);
        IAccessControl(address(accessManager)).renounceRole(testRole, user1);
        assertFalse(IAccessControl(address(accessManager)).hasRole(testRole, user1));
    }

    function test_GetRoleAdmin() public view {
        bytes32 testRole = keccak256("TEST_ROLE");

        // By default, DEFAULT_ADMIN_ROLE is the admin of all roles
        assertEq(IAccessControl(address(accessManager)).getRoleAdmin(testRole), DEFAULT_ADMIN_ROLE);
    }

    function test_AccessManagerFunctionality() public {
        // Test basic access manager functionality
        vm.startPrank(admin);

        // Test role-based operations
        bytes32 operatorRole = keccak256("OPERATOR_ROLE");
        IAccessControl(address(accessManager)).grantRole(operatorRole, operator);

        assertTrue(IAccessControl(address(accessManager)).hasRole(operatorRole, operator));

        // Verify the role was granted successfully
        assertTrue(IAccessControl(address(accessManager)).hasRole(operatorRole, operator));

        vm.stopPrank();
    }

    function test_ProxyFunctionality() public {
        // Test that the proxy correctly delegates to implementation
        address[] memory initialAdmins = new address[](1);
        initialAdmins[0] = admin;
        ATKTokenAccessManagerProxy proxy = new ATKTokenAccessManagerProxy(address(systemUtils.system()), initialAdmins);

        // Verify it's a proxy by checking it has no direct code for the interface
        assertTrue(address(proxy) != address(0));

        // The proxy should support the required interfaces through delegation
        assertTrue(IERC165(address(proxy)).supportsInterface(type(ISMARTTokenAccessManager).interfaceId));
    }

    function test_ImplementationDirect() public view {
        // Test the implementation contract directly (not through proxy)
        assertTrue(implementation.supportsInterface(type(ISMARTTokenAccessManager).interfaceId));
        assertTrue(implementation.supportsInterface(type(IAccessControl).interfaceId));
    }

    function test_RoleConstants() public view {
        // Test that common role constants work correctly
        bytes32 defaultAdminRole = DEFAULT_ADMIN_ROLE;

        // Admin should have the default admin role
        assertTrue(IAccessControl(address(accessManager)).hasRole(defaultAdminRole, admin));
    }

    function test_BatchRoleOperations() public {
        bytes32[] memory roles = new bytes32[](3);
        roles[0] = keccak256("ROLE_1");
        roles[1] = keccak256("ROLE_2");
        roles[2] = keccak256("ROLE_3");

        vm.startPrank(admin);

        // Grant multiple roles to the same user
        for (uint256 i = 0; i < roles.length; i++) {
            IAccessControl(address(accessManager)).grantRole(roles[i], user1);
        }

        // Verify all roles were granted
        for (uint256 i = 0; i < roles.length; i++) {
            assertTrue(IAccessControl(address(accessManager)).hasRole(roles[i], user1));
        }

        // Revoke all roles
        for (uint256 i = 0; i < roles.length; i++) {
            IAccessControl(address(accessManager)).revokeRole(roles[i], user1);
        }

        // Verify all roles were revoked
        for (uint256 i = 0; i < roles.length; i++) {
            assertFalse(IAccessControl(address(accessManager)).hasRole(roles[i], user1));
        }

        vm.stopPrank();
    }

    function test_RoleEvents() public {
        bytes32 testRole = keccak256("TEST_ROLE");

        vm.prank(admin);
        vm.expectEmit(true, true, true, false);
        emit IAccessControl.RoleGranted(testRole, user1, admin);
        IAccessControl(address(accessManager)).grantRole(testRole, user1);

        vm.prank(admin);
        vm.expectEmit(true, true, true, false);
        emit IAccessControl.RoleRevoked(testRole, user1, admin);
        IAccessControl(address(accessManager)).revokeRole(testRole, user1);
    }

    function test_InvalidRoleOperations() public {
        bytes32 testRole = keccak256("TEST_ROLE");

        // Try to revoke a role that was never granted
        vm.prank(admin);
        IAccessControl(address(accessManager)).revokeRole(testRole, user1); // Should not revert

        // Verify the user still doesn't have the role
        assertFalse(IAccessControl(address(accessManager)).hasRole(testRole, user1));
    }
}
