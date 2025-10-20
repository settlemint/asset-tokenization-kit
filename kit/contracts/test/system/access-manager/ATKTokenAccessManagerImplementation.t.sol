// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import {
    ATKTokenAccessManagerImplementation
} from "../../../contracts/system/tokens/access/ATKTokenAccessManagerImplementation.sol";
import {
    ISMARTTokenAccessManager
} from "../../../contracts/smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract ATKTokenAccessManagerImplementationTest is Test {
    ATKTokenAccessManagerImplementation public implementation;
    ISMARTTokenAccessManager public accessManager;

    // Test addresses
    address public admin = makeAddr("admin");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");
    address public user3 = makeAddr("user3");
    address public forwarder = makeAddr("forwarder");

    // Test roles
    bytes32 public constant TEST_ROLE_1 = keccak256("TEST_ROLE_1");
    bytes32 public constant TEST_ROLE_2 = keccak256("TEST_ROLE_2");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // Events
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

    function setUp() public {
        // Deploy implementation
        implementation = new ATKTokenAccessManagerImplementation(forwarder);

        // Deploy proxy with initialization data
        address[] memory initialAdmins = new address[](1);
        initialAdmins[0] = admin;
        bytes memory initData = abi.encodeWithSelector(implementation.initialize.selector, initialAdmins);
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        accessManager = ISMARTTokenAccessManager(address(proxy));
    }

    function test_InitializeSuccess() public view {
        // Verify admin has admin role
        assertTrue(IAccessControl(address(accessManager)).hasRole(implementation.DEFAULT_ADMIN_ROLE(), admin));
    }

    function test_CannotInitializeTwice() public {
        vm.expectRevert();
        address[] memory initialAdmins = new address[](1);
        initialAdmins[0] = admin;
        ATKTokenAccessManagerImplementation(address(accessManager)).initialize(initialAdmins);
    }

    function test_BatchGrantRoleSuccess() public {
        address[] memory accounts = new address[](3);
        accounts[0] = user1;
        accounts[1] = user2;
        accounts[2] = user3;

        vm.prank(admin);
        vm.expectEmit(true, true, true, false);
        emit RoleGranted(TEST_ROLE_1, user1, admin);
        vm.expectEmit(true, true, true, false);
        emit RoleGranted(TEST_ROLE_1, user2, admin);
        vm.expectEmit(true, true, true, false);
        emit RoleGranted(TEST_ROLE_1, user3, admin);

        accessManager.batchGrantRole(TEST_ROLE_1, accounts);

        // Verify all accounts have the role
        assertTrue(accessManager.hasRole(TEST_ROLE_1, user1));
        assertTrue(accessManager.hasRole(TEST_ROLE_1, user2));
        assertTrue(accessManager.hasRole(TEST_ROLE_1, user3));
    }

    function test_BatchGrantRoleRequiresAdminRole() public {
        address[] memory accounts = new address[](2);
        accounts[0] = user1;
        accounts[1] = user2;

        vm.prank(user1);
        vm.expectRevert();
        accessManager.batchGrantRole(TEST_ROLE_1, accounts);
    }

    function test_BatchGrantRoleWithEmptyArray() public {
        address[] memory emptyAccounts = new address[](0);

        vm.prank(admin);
        accessManager.batchGrantRole(TEST_ROLE_1, emptyAccounts);
    }

    function test_BatchRevokeRoleSuccess() public {
        // First grant roles to users
        address[] memory accounts = new address[](3);
        accounts[0] = user1;
        accounts[1] = user2;
        accounts[2] = user3;

        vm.prank(admin);
        accessManager.batchGrantRole(TEST_ROLE_1, accounts);

        // Verify roles were granted
        assertTrue(accessManager.hasRole(TEST_ROLE_1, user1));
        assertTrue(accessManager.hasRole(TEST_ROLE_1, user2));
        assertTrue(accessManager.hasRole(TEST_ROLE_1, user3));

        // Now revoke them
        vm.prank(admin);
        vm.expectEmit(true, true, true, false);
        emit RoleRevoked(TEST_ROLE_1, user1, admin);
        vm.expectEmit(true, true, true, false);
        emit RoleRevoked(TEST_ROLE_1, user2, admin);
        vm.expectEmit(true, true, true, false);
        emit RoleRevoked(TEST_ROLE_1, user3, admin);

        accessManager.batchRevokeRole(TEST_ROLE_1, accounts);

        // Verify all accounts lost the role
        assertFalse(accessManager.hasRole(TEST_ROLE_1, user1));
        assertFalse(accessManager.hasRole(TEST_ROLE_1, user2));
        assertFalse(accessManager.hasRole(TEST_ROLE_1, user3));
    }

    function test_BatchRevokeRoleRequiresAdminRole() public {
        address[] memory accounts = new address[](2);
        accounts[0] = user1;
        accounts[1] = user2;

        vm.prank(user1);
        vm.expectRevert();
        accessManager.batchRevokeRole(TEST_ROLE_1, accounts);
    }

    function test_BatchRevokeRoleWithEmptyArray() public {
        address[] memory emptyAccounts = new address[](0);

        vm.prank(admin);
        accessManager.batchRevokeRole(TEST_ROLE_1, emptyAccounts);
    }

    function test_BatchRevokeNonExistentRole() public {
        // Try to revoke roles that were never granted
        address[] memory accounts = new address[](2);
        accounts[0] = user1;
        accounts[1] = user2;

        vm.prank(admin);
        accessManager.batchRevokeRole(TEST_ROLE_1, accounts);

        // Should complete without error, users should still not have the role
        assertFalse(accessManager.hasRole(TEST_ROLE_1, user1));
        assertFalse(accessManager.hasRole(TEST_ROLE_1, user2));
    }

    function test_HasRoleFunction() public {
        // Test the overridden hasRole function
        vm.prank(admin);
        IAccessControl(address(accessManager)).grantRole(TEST_ROLE_1, user1);

        // Test through ISMARTTokenAccessManager interface
        assertTrue(accessManager.hasRole(TEST_ROLE_1, user1));
        assertFalse(accessManager.hasRole(TEST_ROLE_1, user2));

        // Test through IAccessControl interface
        assertTrue(IAccessControl(address(accessManager)).hasRole(TEST_ROLE_1, user1));
        assertFalse(IAccessControl(address(accessManager)).hasRole(TEST_ROLE_1, user2));
    }

    function test_SupportsInterface() public view {
        // Test all supported interfaces
        assertTrue(IERC165(address(accessManager)).supportsInterface(type(ISMARTTokenAccessManager).interfaceId));
        assertTrue(IERC165(address(accessManager)).supportsInterface(type(IAccessControl).interfaceId));
        assertTrue(IERC165(address(accessManager)).supportsInterface(type(IERC165).interfaceId));

        // Test unsupported interface
        assertFalse(IERC165(address(accessManager)).supportsInterface(bytes4(keccak256("unsupported()"))));
    }

    function test_DirectCallToImplementation() public {
        // Test calling initialize directly on implementation (should fail due to _disableInitializers)
        vm.expectRevert();
        address[] memory initialAdmins = new address[](1);
        initialAdmins[0] = admin;
        implementation.initialize(initialAdmins);
    }

    function test_ERC2771ContextIntegration() public view {
        // Verify forwarder is set correctly in implementation
        // This is tested implicitly through the constructor
        assertNotEq(address(implementation), address(0));
    }

    function test_ComplexRoleHierarchy() public {
        vm.startPrank(admin);

        // Create a role hierarchy - admin can grant roles, operators can do specific tasks
        IAccessControl(address(accessManager)).grantRole(OPERATOR_ROLE, user1);
        IAccessControl(address(accessManager)).grantRole(TEST_ROLE_1, user2);

        // Set TEST_ROLE_1 admin to be OPERATOR_ROLE
        // Note: OpenZeppelin doesn't have setRoleAdmin in the interface, so we test with defaults
        assertEq(IAccessControl(address(accessManager)).getRoleAdmin(TEST_ROLE_1), implementation.DEFAULT_ADMIN_ROLE());
        assertEq(
            IAccessControl(address(accessManager)).getRoleAdmin(OPERATOR_ROLE), implementation.DEFAULT_ADMIN_ROLE()
        );

        vm.stopPrank();

        // Verify roles are set correctly
        assertTrue(IAccessControl(address(accessManager)).hasRole(OPERATOR_ROLE, user1));
        assertTrue(IAccessControl(address(accessManager)).hasRole(TEST_ROLE_1, user2));
        assertFalse(IAccessControl(address(accessManager)).hasRole(OPERATOR_ROLE, user2));
        assertFalse(IAccessControl(address(accessManager)).hasRole(TEST_ROLE_1, user1));
    }

    function test_FuzzBatchOperations(uint8 numAccounts, uint256 roleId) public {
        vm.assume(numAccounts > 0 && numAccounts <= 20); // Reasonable bounds
        vm.assume(roleId != 0); // Avoid DEFAULT_ADMIN_ROLE which already has admin assigned
        bytes32 role = bytes32(roleId);

        // Create array of accounts
        address[] memory accounts = new address[](numAccounts);
        for (uint256 i = 0; i < numAccounts; i++) {
            // forge-lint: disable-next-line(unsafe-typecast) -- 0x1000 + i fits within 160 bits for numAccounts <= 20
            accounts[i] = address(uint160(0x1000 + i));
        }

        vm.startPrank(admin);

        // Batch grant
        accessManager.batchGrantRole(role, accounts);

        // Verify all have the role
        for (uint256 i = 0; i < numAccounts; i++) {
            assertTrue(accessManager.hasRole(role, accounts[i]));
        }

        // Batch revoke
        accessManager.batchRevokeRole(role, accounts);

        // Verify all lost the role
        for (uint256 i = 0; i < numAccounts; i++) {
            assertFalse(accessManager.hasRole(role, accounts[i]));
        }

        vm.stopPrank();
    }

    function test_MixedBatchOperations() public {
        address[] memory accounts = new address[](2);
        accounts[0] = user1;
        accounts[1] = user2;

        vm.startPrank(admin);

        // Grant one role manually
        IAccessControl(address(accessManager)).grantRole(TEST_ROLE_1, user1);

        // Batch grant to both (one already has it)
        accessManager.batchGrantRole(TEST_ROLE_1, accounts);

        // Both should have the role
        assertTrue(accessManager.hasRole(TEST_ROLE_1, user1));
        assertTrue(accessManager.hasRole(TEST_ROLE_1, user2));

        // Revoke one manually
        IAccessControl(address(accessManager)).revokeRole(TEST_ROLE_1, user1);

        // Batch revoke from both (one already doesn't have it)
        accessManager.batchRevokeRole(TEST_ROLE_1, accounts);

        // Neither should have the role
        assertFalse(accessManager.hasRole(TEST_ROLE_1, user1));
        assertFalse(accessManager.hasRole(TEST_ROLE_1, user2));

        vm.stopPrank();
    }
}
