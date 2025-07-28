// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { AbstractComplianceModule } from "../../../../contracts/smart/modules/AbstractComplianceModule.sol";
import { ISMARTComplianceModule } from "../../../../contracts/smart/interface/ISMARTComplianceModule.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract TestComplianceModule is AbstractComplianceModule {
    bytes32 public constant override typeId = keccak256("TestComplianceModule");

    string private _moduleName;
    bool private _allowTransfers;
    bool private _shouldRevertOnValidation;

    constructor(string memory moduleName) AbstractComplianceModule(address(0)) {
        _moduleName = moduleName;
        _allowTransfers = true;
        _shouldRevertOnValidation = false;
    }

    function setAllowTransfers(bool allow) external {
        _allowTransfers = allow;
    }

    function setShouldRevertOnValidation(bool shouldRevert) external {
        _shouldRevertOnValidation = shouldRevert;
    }

    function canTransfer(address, address, address, uint256, bytes calldata) external view override {
        if (!_allowTransfers) {
            revert("Transfer not allowed");
        }
    }

    function validateParameters(bytes calldata) external view override {
        if (_shouldRevertOnValidation) {
            revert("Invalid parameters");
        }
    }

    function name() external pure override returns (string memory) {
        return "Test Module";
    }
}

contract AbstractComplianceModuleTest is Test {
    TestComplianceModule public module;
    address public admin;
    address public user1;
    address public user2;
    address public tokenContract;

    function setUp() public {
        admin = makeAddr("admin");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        tokenContract = makeAddr("tokenContract");

        vm.prank(admin);
        module = new TestComplianceModule("Test Module");
    }

    function test_Constructor() public view {
        assertTrue(module.hasRole(module.DEFAULT_ADMIN_ROLE(), admin));
    }

    function test_ConstructorWithDifferentDeployer() public {
        vm.prank(user1);
        TestComplianceModule newModule = new TestComplianceModule("Another Module");

        assertTrue(newModule.hasRole(newModule.DEFAULT_ADMIN_ROLE(), user1));
        assertFalse(newModule.hasRole(newModule.DEFAULT_ADMIN_ROLE(), admin));
    }

    function test_Name() public view {
        assertEq(module.name(), "Test Module");
    }

    function test_CanTransfer_Allowed() public {
        vm.prank(admin);
        module.setAllowTransfers(true);

        module.canTransfer(tokenContract, user1, user2, 100, "");
    }

    function test_CanTransfer_NotAllowed() public {
        vm.prank(admin);
        module.setAllowTransfers(false);

        vm.expectRevert("Transfer not allowed");
        module.canTransfer(tokenContract, user1, user2, 100, "");
    }

    function test_ValidateParameters_Valid() public {
        vm.prank(admin);
        module.setShouldRevertOnValidation(false);

        module.validateParameters("");
    }

    function test_ValidateParameters_Invalid() public {
        vm.prank(admin);
        module.setShouldRevertOnValidation(true);

        vm.expectRevert("Invalid parameters");
        module.validateParameters("");
    }

    function test_Transferred_Hook() public {
        module.transferred(tokenContract, user1, user2, 100, "");
    }

    function test_Created_Hook() public {
        module.created(tokenContract, user1, 100, "");
    }

    function test_Destroyed_Hook() public {
        module.destroyed(tokenContract, user1, 100, "");
    }

    function test_SupportsInterface() public view {
        assertTrue(module.supportsInterface(type(ISMARTComplianceModule).interfaceId));
        assertTrue(module.supportsInterface(type(IAccessControl).interfaceId));
        assertTrue(module.supportsInterface(type(IERC165).interfaceId));
        assertFalse(module.supportsInterface(bytes4(0x12345678)));
    }

    function test_AccessControl_GrantRole() public {
        bytes32 newRole = keccak256("NEW_ROLE");

        vm.prank(admin);
        module.grantRole(newRole, user1);

        assertTrue(module.hasRole(newRole, user1));
    }

    function test_AccessControl_RevokeRole() public {
        bytes32 newRole = keccak256("NEW_ROLE");

        vm.startPrank(admin);
        module.grantRole(newRole, user1);
        assertTrue(module.hasRole(newRole, user1));

        module.revokeRole(newRole, user1);
        assertFalse(module.hasRole(newRole, user1));
        vm.stopPrank();
    }

    function test_AccessControl_OnlyAdminCanGrantRole() public {
        bytes32 newRole = keccak256("NEW_ROLE");

        vm.prank(user1);
        vm.expectRevert();
        module.grantRole(newRole, user2);
    }

    function test_AccessControl_RenounceRole() public {
        bytes32 newRole = keccak256("NEW_ROLE");

        vm.prank(admin);
        module.grantRole(newRole, user1);

        vm.prank(user1);
        module.renounceRole(newRole, user1);

        assertFalse(module.hasRole(newRole, user1));
    }

    function test_GetRoleAdmin() public view {
        bytes32 newRole = keccak256("NEW_ROLE");
        assertEq(module.getRoleAdmin(newRole), module.DEFAULT_ADMIN_ROLE());
    }

    function test_HooksWithParameters() public {
        bytes memory params = abi.encode(uint256(123), "test");

        module.transferred(tokenContract, user1, user2, 100, params);
        module.created(tokenContract, user1, 100, params);
        module.destroyed(tokenContract, user1, 100, params);
    }

    function test_CanTransferWithParameters() public {
        bytes memory params = abi.encode(uint256(456), address(user1));

        vm.prank(admin);
        module.setAllowTransfers(true);

        module.canTransfer(tokenContract, user1, user2, 100, params);
    }

    function test_ValidateParametersWithData() public {
        bytes memory params = abi.encode(uint256(789), "validation_data");

        vm.prank(admin);
        module.setShouldRevertOnValidation(false);

        module.validateParameters(params);
    }

    function test_MultipleModulesIndependentRoles() public {
        vm.prank(user1);
        TestComplianceModule module2 = new TestComplianceModule("Second Module");

        assertTrue(module.hasRole(module.DEFAULT_ADMIN_ROLE(), admin));
        assertFalse(module.hasRole(module.DEFAULT_ADMIN_ROLE(), user1));

        assertTrue(module2.hasRole(module2.DEFAULT_ADMIN_ROLE(), user1));
        assertFalse(module2.hasRole(module2.DEFAULT_ADMIN_ROLE(), admin));
    }

    function test_MultipleRoles() public {
        bytes32 role1 = keccak256("ROLE_1");
        bytes32 role2 = keccak256("ROLE_2");

        vm.startPrank(admin);
        module.grantRole(role1, user1);
        module.grantRole(role2, user1);
        vm.stopPrank();

        assertTrue(module.hasRole(role1, user1));
        assertTrue(module.hasRole(role2, user1));
        assertFalse(module.hasRole(role1, user2));
        assertFalse(module.hasRole(role2, user2));
    }

    function test_Fuzz_CanTransfer(
        address token,
        address from,
        address to,
        uint256 value,
        bytes calldata params
    )
        public
    {
        vm.prank(admin);
        module.setAllowTransfers(true);

        module.canTransfer(token, from, to, value, params);
    }

    function test_Fuzz_Hooks(address token, address addr, uint256 value, bytes calldata params) public {
        module.transferred(token, addr, addr, value, params);
        module.created(token, addr, value, params);
        module.destroyed(token, addr, value, params);
    }

    function test_EdgeCase_ZeroValues() public {
        module.transferred(address(0), address(0), address(0), 0, "");
        module.created(address(0), address(0), 0, "");
        module.destroyed(address(0), address(0), 0, "");

        vm.prank(admin);
        module.setAllowTransfers(true);
        module.canTransfer(address(0), address(0), address(0), 0, "");
    }

    function test_EdgeCase_LargeValues() public {
        uint256 maxValue = type(uint256).max;

        module.transferred(tokenContract, user1, user2, maxValue, "");
        module.created(tokenContract, user1, maxValue, "");
        module.destroyed(tokenContract, user1, maxValue, "");

        vm.prank(admin);
        module.setAllowTransfers(true);
        module.canTransfer(tokenContract, user1, user2, maxValue, "");
    }
}
