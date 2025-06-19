// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { ATKTypedImplementationProxy } from "../../contracts/system/ATKTypedImplementationProxy.sol";
import { IATKTypedImplementationRegistry } from "../../contracts/system/IATKTypedImplementationRegistry.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ETHTransfersNotAllowed, InitializationWithZeroAddress } from "../../contracts/system/ATKSystemErrors.sol";

// --- Mock Contracts ---

// A mock implementation registry.
contract MockRegistry is IATKTypedImplementationRegistry {
    mapping(bytes32 => address) public implementations;

    function setImplementation(bytes32 typeHash, address implementationAddress) external {
        implementations[typeHash] = implementationAddress;
    }

    function implementation(bytes32 typeHash) external view override returns (address) {
        return implementations[typeHash];
    }

    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return
            interfaceId == type(IATKTypedImplementationRegistry).interfaceId || interfaceId == type(IERC165).interfaceId;
    }
}

// A mock implementation contract for the proxy to delegate to.
contract MockImplementation {
    uint256 public value;
    address public initializer;

    event Initialized(address indexed sender, uint256 value);

    function initialize(uint256 initialValue) external {
        value = initialValue;
        initializer = msg.sender;
        emit Initialized(msg.sender, initialValue);
    }

    function getValue() external view returns (uint256) {
        return value;
    }

    function setValue(uint256 newValue) external {
        value = newValue;
    }
}

// A contract that does not support the required interface.
contract InvalidRegistry is IERC165 {
    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}

// --- Test Suite ---

contract ATKTypedImplementationProxyTest is Test {
    MockRegistry internal registry;
    MockImplementation internal implementation;
    bytes32 internal typeHash;
    address internal user;

    function setUp() public {
        user = makeAddr("user");
        registry = new MockRegistry();
        implementation = new MockImplementation();
        typeHash = keccak256("MockImplementation");

        // Pre-register the implementation in the mock registry
        registry.setImplementation(typeHash, address(implementation));
    }

    function test_Constructor_Success() public {
        uint256 initialValue = 123;
        bytes memory initData = abi.encodeWithSignature("initialize(uint256)", initialValue);

        vm.expectEmit(true, true, true, true);
        emit MockImplementation.Initialized(address(this), initialValue);

        ATKTypedImplementationProxy proxy = new ATKTypedImplementationProxy(address(registry), typeHash, initData);

        // Verify state of implementation contract through the proxy
        assertEq(MockImplementation(address(proxy)).getValue(), initialValue);
        assertEq(MockImplementation(address(proxy)).initializer(), address(this));
    }

    function test_Constructor_Fail_InvalidRegistry_ZeroAddress() public {
        bytes memory initData = abi.encodeWithSignature("initialize(uint256)", 123);

        vm.expectRevert(ATKTypedImplementationProxy.InvalidRegistryAddress.selector);
        new ATKTypedImplementationProxy(address(0), typeHash, initData);
    }

    function test_Constructor_Fail_InvalidRegistry_NoInterfaceSupport() public {
        InvalidRegistry invalidReg = new InvalidRegistry();
        bytes memory initData = abi.encodeWithSignature("initialize(uint256)", 123);

        vm.expectRevert(ATKTypedImplementationProxy.InvalidRegistryAddress.selector);
        new ATKTypedImplementationProxy(address(invalidReg), typeHash, initData);
    }

    function test_Constructor_Fail_ImplementationNotSet() public {
        bytes32 unsetTypeHash = keccak256("UnsetImplementation");
        bytes memory initData = abi.encodeWithSignature("initialize(uint256)", 123);

        vm.expectRevert(InitializationWithZeroAddress.selector);
        new ATKTypedImplementationProxy(address(registry), unsetTypeHash, initData);
    }

    function test_Fallback_RejectsEther() public {
        bytes memory initData = abi.encodeWithSignature("initialize(uint256)", 123);
        ATKTypedImplementationProxy proxy = new ATKTypedImplementationProxy(address(registry), typeHash, initData);

        vm.expectRevert(ETHTransfersNotAllowed.selector);
        // The call is expected to revert. If it doesn't, vm.expectRevert will fail the test.
        // No return value check is needed.
        address(proxy).call{ value: 1 ether }("");
    }

    function test_ProxyFunctionCall_Success() public {
        bytes memory initData = abi.encodeWithSignature("initialize(uint256)", 123);
        ATKTypedImplementationProxy proxy = new ATKTypedImplementationProxy(address(registry), typeHash, initData);

        MockImplementation proxyAsImpl = MockImplementation(address(proxy));

        uint256 newValue = 456;
        proxyAsImpl.setValue(newValue);

        assertEq(proxyAsImpl.getValue(), newValue);
    }
}
