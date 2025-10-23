// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { AbstractComplianceModule } from "../../../../contracts/smart/modules/AbstractComplianceModule.sol";
import { ISMARTComplianceModule } from "../../../../contracts/smart/interface/ISMARTComplianceModule.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract TestComplianceModule is AbstractComplianceModule {
    bytes32 public constant override typeId = keccak256("TestComplianceModule");

    bool private _allowTransfers;
    bool private _shouldRevertOnValidation;

    constructor(string memory) AbstractComplianceModule(address(0)) {
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
            revert ComplianceCheckFailed("Transfer not allowed");
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
    address public user1;
    address public user2;
    address public tokenContract;

    function setUp() public {
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        tokenContract = makeAddr("tokenContract");

        module = new TestComplianceModule("");
    }

    function test_Constructor() public view {
        // Since modules are now stateless, just check that construction succeeded
        assertEq(module.name(), "Test Module");
        assertEq(module.typeId(), keccak256("TestComplianceModule"));
    }

    function test_Name() public view {
        assertEq(module.name(), "Test Module");
    }

    function test_TypeId() public view {
        assertEq(module.typeId(), keccak256("TestComplianceModule"));
    }

    function test_CanTransfer_Allowed() public {
        module.setAllowTransfers(true);
        module.canTransfer(tokenContract, user1, user2, 100, "");
    }

    function test_CanTransfer_NotAllowed() public {
        module.setAllowTransfers(false);

        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Transfer not allowed")
        );
        module.canTransfer(tokenContract, user1, user2, 100, "");
    }

    function test_ValidateParameters_Valid() public {
        module.setShouldRevertOnValidation(false);
        module.validateParameters("");
    }

    function test_ValidateParameters_Invalid() public {
        module.setShouldRevertOnValidation(true);

        vm.expectRevert("Invalid parameters");
        module.validateParameters("");
    }

    function test_Transferred_Hook() public {
        vm.startPrank(tokenContract);
        module.transferred(tokenContract, user1, user2, 100, "");
        vm.stopPrank();
    }

    function test_Created_Hook() public {
        vm.startPrank(tokenContract);
        module.created(tokenContract, user1, 100, "");
        vm.stopPrank();
    }

    function test_Destroyed_Hook() public {
        vm.startPrank(tokenContract);
        module.destroyed(tokenContract, user1, 100, "");
        vm.stopPrank();
    }

    function test_SupportsInterface() public view {
        assertTrue(module.supportsInterface(type(ISMARTComplianceModule).interfaceId));
        assertTrue(module.supportsInterface(type(IERC165).interfaceId));
        assertFalse(module.supportsInterface(bytes4(0x12345678)));
    }

    function test_HooksWithParameters() public {
        bytes memory params = abi.encode(uint256(123), "test");

        vm.startPrank(tokenContract);
        module.transferred(tokenContract, user1, user2, 100, params);
        module.created(tokenContract, user1, 100, params);
        module.destroyed(tokenContract, user1, 100, params);
        vm.stopPrank();
    }

    function test_CanTransferWithParameters() public {
        bytes memory params = abi.encode(uint256(456), address(user1));

        module.setAllowTransfers(true);
        module.canTransfer(tokenContract, user1, user2, 100, params);
    }

    function test_ValidateParametersWithData() public {
        bytes memory params = abi.encode(uint256(789), "validation_data");

        module.setShouldRevertOnValidation(false);
        module.validateParameters(params);
    }

    function test_MultipleModulesIndependent() public {
        TestComplianceModule module2 = new TestComplianceModule("");

        assertEq(module.name(), "Test Module");
        assertEq(module2.name(), "Test Module");

        // Both modules should have same type IDs since they're the same class
        assertEq(module.typeId(), module2.typeId());
    }

    function test_StatelessBehavior() public {
        // Test that the module behaves consistently regardless of order of operations
        module.setAllowTransfers(true);

        module.canTransfer(tokenContract, user1, user2, 100, "");
        module.canTransfer(tokenContract, user2, user1, 200, "");

        // State changes should not affect other calls since modules are stateless
        vm.startPrank(tokenContract);
        module.transferred(tokenContract, user1, user2, 100, "");
        module.canTransfer(tokenContract, user1, user2, 300, "");
        vm.stopPrank();
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
        module.setAllowTransfers(true);
        module.canTransfer(token, from, to, value, params);
    }

    function test_Fuzz_Hooks(address token, address addr, uint256 value, bytes calldata params) public {
        vm.startPrank(token);
        module.transferred(token, addr, addr, value, params);
        module.created(token, addr, value, params);
        module.destroyed(token, addr, value, params);
        vm.stopPrank();
    }

    function test_EdgeCase_ZeroValues() public {
        vm.startPrank(address(0));
        module.transferred(address(0), address(0), address(0), 0, "");
        module.created(address(0), address(0), 0, "");
        module.destroyed(address(0), address(0), 0, "");
        vm.stopPrank();

        module.setAllowTransfers(true);
        module.canTransfer(address(0), address(0), address(0), 0, "");
    }

    function test_EdgeCase_LargeValues() public {
        uint256 maxValue = type(uint256).max;

        vm.startPrank(tokenContract);
        module.transferred(tokenContract, user1, user2, maxValue, "");
        module.created(tokenContract, user1, maxValue, "");
        module.destroyed(tokenContract, user1, maxValue, "");
        vm.stopPrank();

        module.setAllowTransfers(true);
        module.canTransfer(tokenContract, user1, user2, maxValue, "");
    }

    function test_ERC2771Context() public view {
        // Test that the module correctly extends ERC2771Context
        // The _msgSender() and _msgData() functions should be available (they're internal)
        // We can't test them directly, but we can verify the module was constructed properly
        assertEq(module.name(), "Test Module");
    }

    function test_ParameterValidation_EmptyParams() public {
        module.setShouldRevertOnValidation(false);
        module.validateParameters("");
        module.validateParameters(hex"");
    }

    function test_LifecycleFunctions_DoNotRevert() public {
        // All lifecycle functions should not revert for stateless modules by default
        bytes memory params = abi.encode("test");

        vm.startPrank(tokenContract);
        module.transferred(tokenContract, user1, user2, 100, params);
        module.created(tokenContract, user1, 100, params);
        module.destroyed(tokenContract, user1, 100, params);
        vm.stopPrank();
    }
}
