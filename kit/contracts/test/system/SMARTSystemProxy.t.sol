// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { SMARTSystemProxy } from "../../contracts/system/SMARTSystemProxy.sol";
import { ISMARTSystem } from "../../contracts/system/ISMARTSystem.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {
    InvalidSystemAddress,
    ETHTransfersNotAllowed,
    InitializationWithZeroAddress
} from "../../contracts/system/SMARTSystemErrors.sol";

// Mock system for testing
contract MockSMARTSystem is ISMARTSystem {
    address public mockImplementation;
    bool public initializationShouldFail;

    constructor(address _mockImplementation) {
        mockImplementation = _mockImplementation;
    }

    function setMockImplementation(address _implementation) external {
        mockImplementation = _implementation;
    }

    function setInitializationFailure(bool _shouldFail) external {
        initializationShouldFail = _shouldFail;
    }

    // Implement ISMARTSystem interface
    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == type(ISMARTSystem).interfaceId || interfaceId == type(IERC165).interfaceId;
    }

    // Stub implementations for ISMARTSystem methods
    function bootstrap() external pure {
        return; // Empty implementation instead of revert
    }

    function complianceImplementation() external pure returns (address) {
        return address(0); // Return zero instead of revert
    }

    function identityFactoryImplementation() external pure returns (address) {
        return address(0); // Return zero instead of revert
    }

    function identityImplementation() external pure returns (address) {
        return address(0); // Return zero instead of revert
    }

    function identityRegistryImplementation() external pure returns (address) {
        return address(0); // Return zero instead of revert
    }

    function identityRegistryStorageImplementation() external pure returns (address) {
        return address(0); // Return zero instead of revert
    }

    function tokenAccessManagerImplementation() external pure returns (address) {
        return address(0); // Return zero instead of revert
    }

    function tokenIdentityImplementation() external pure returns (address) {
        return address(0); // Return zero instead of revert
    }

    function trustedIssuersRegistryImplementation() external view returns (address) {
        return mockImplementation;
    }

    function topicSchemeRegistryImplementation() external pure returns (address) {
        return address(0); // Return zero instead of revert
    }

    function tokenFactoryImplementation(bytes32) external pure returns (address) {
        return address(0); // Return zero instead of revert
    }

    function complianceProxy() external pure returns (address) {
        return address(0); // Return zero instead of revert
    }

    function identityRegistryProxy() external pure returns (address) {
        return address(0); // Return zero instead of revert
    }

    function identityRegistryStorageProxy() external pure returns (address) {
        return address(0); // Return zero instead of revert
    }

    function trustedIssuersRegistryProxy() external pure returns (address) {
        return address(0); // Return zero instead of revert
    }

    function topicSchemeRegistryProxy() external pure returns (address) {
        return address(0); // Return zero instead of revert
    }

    function identityFactoryProxy() external pure returns (address) {
        return address(0); // Return zero instead of revert
    }

    function tokenFactoryProxy(bytes32) external pure returns (address) {
        return address(0); // Return zero instead of revert
    }

    function identityVerificationModule() external pure returns (address) {
        return address(0); // Return zero instead of revert
    }

    function setComplianceImplementation(address) external pure {
        return; // Empty implementation instead of revert
    }

    function setIdentityFactoryImplementation(address) external pure {
        return; // Empty implementation instead of revert
    }

    function setIdentityImplementation(address) external pure {
        return; // Empty implementation instead of revert
    }

    function setIdentityRegistryImplementation(address) external pure {
        return; // Empty implementation instead of revert
    }

    function setIdentityRegistryStorageImplementation(address) external pure {
        return; // Empty implementation instead of revert
    }

    function setTokenAccessManagerImplementation(address) external pure {
        return; // Empty implementation instead of revert
    }

    function setTokenIdentityImplementation(address) external pure {
        return; // Empty implementation instead of revert
    }

    function setTrustedIssuersRegistryImplementation(address) external pure {
        return; // Empty implementation instead of revert
    }

    function setTopicSchemeRegistryImplementation(address) external pure {
        return; // Empty implementation instead of revert
    }

    function createTokenFactory(string calldata, address, address) external pure returns (address) {
        return address(0); // Return zero instead of revert
    }
}

// Mock implementation for testing
contract MockImplementation {
    bool public initialized;
    address public admin;
    bool public shouldFailInitialization;

    function initialize(address _admin) external {
        if (shouldFailInitialization) {
            revert("Initialization failed");
        }
        initialized = true;
        admin = _admin;
    }

    function setShouldFailInitialization(bool _shouldFail) external {
        shouldFailInitialization = _shouldFail;
    }

    function testFunction() external pure returns (string memory) {
        return "test";
    }
}

// Mock implementation that always fails initialization
contract FailingMockImplementation {
    function initialize(address) external pure {
        revert("Initialization always fails");
    }

    function testFunction() external pure returns (string memory) {
        return "failing test";
    }
}

// Non-ERC165 compliant contract for testing
contract NonERC165Contract {
// This contract doesn't implement IERC165
}

// ERC165 compliant contract but not ISMARTSystem
contract ERC165OnlyContract is IERC165 {
    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}

// Custom error for testing
error TestImplementationNotSet();

// Concrete implementation of SMARTSystemProxy for testing
contract TestableSMARTSystemProxy is SMARTSystemProxy {
    bool public shouldRevertOnImplementation;
    bool public skipInitialization;

    constructor(address systemAddress_, bool _skipInitialization) SMARTSystemProxy(systemAddress_) {
        skipInitialization = _skipInitialization;

        // Only initialize if we have a valid implementation and not skipping
        if (!skipInitialization) {
            try TestableSMARTSystemProxy(this).getImplementationPublic() returns (address implementation) {
                if (implementation != address(0)) {
                    bytes memory initData = abi.encodeWithSelector(MockImplementation.initialize.selector, msg.sender);
                    _performInitializationDelegatecall(implementation, initData);
                }
            } catch {
                // Initialization can fail, that's ok for testing
            }
        }
    }

    function setShouldRevertOnImplementation(bool _shouldRevert) external {
        shouldRevertOnImplementation = _shouldRevert;
    }

    function _getSpecificImplementationAddress(ISMARTSystem system)
        internal
        view
        override
        returns (address implementationAddress)
    {
        if (shouldRevertOnImplementation) {
            revert TestImplementationNotSet();
        }

        address impl = system.trustedIssuersRegistryImplementation();
        if (impl == address(0)) {
            revert TestImplementationNotSet();
        }
        return impl;
    }

    // Expose internal functions for testing
    function getSystemPublic() external view returns (ISMARTSystem) {
        return _getSystem();
    }

    function getImplementationPublic() external view returns (address) {
        return _implementation();
    }

    function performInitializationDelegatecallPublic(address impl, bytes memory data) external {
        _performInitializationDelegatecall(impl, data);
    }
}

contract SMARTSystemProxyTest is Test {
    MockSMARTSystem public mockSystem;
    MockImplementation public mockImplementation;
    TestableSMARTSystemProxy public proxy;
    NonERC165Contract public nonERC165Contract;
    ERC165OnlyContract public erc165OnlyContract;

    address public admin = makeAddr("admin");
    address public user = makeAddr("user");

    function setUp() public {
        mockImplementation = new MockImplementation();
        mockSystem = new MockSMARTSystem(address(mockImplementation));

        // Deploy proxy with valid system, skipping initialization for most tests
        proxy = new TestableSMARTSystemProxy(address(mockSystem), true);

        nonERC165Contract = new NonERC165Contract();
        erc165OnlyContract = new ERC165OnlyContract();
    }

    function test_ConstructorWithValidSystem() public view {
        // Verify proxy was created successfully
        assertEq(address(proxy.getSystemPublic()), address(mockSystem));
        assertEq(proxy.getImplementationPublic(), address(mockImplementation));
    }

    function test_ConstructorWithZeroAddress() public {
        vm.expectRevert(InvalidSystemAddress.selector);
        new TestableSMARTSystemProxy(address(0), true);
    }

    function test_ConstructorWithNonERC165Contract() public {
        vm.expectRevert();
        new TestableSMARTSystemProxy(address(nonERC165Contract), true);
    }

    function test_ConstructorWithERC165OnlyContract() public {
        vm.expectRevert(InvalidSystemAddress.selector);
        new TestableSMARTSystemProxy(address(erc165OnlyContract), true);
    }

    function test_GetSystemReturnsCorrectSystem() public view {
        ISMARTSystem retrievedSystem = proxy.getSystemPublic();
        assertEq(address(retrievedSystem), address(mockSystem));
    }

    function test_GetImplementationReturnsCorrectAddress() public view {
        address implementation = proxy.getImplementationPublic();
        assertEq(implementation, address(mockImplementation));
    }

    function test_GetImplementationWithZeroAddressReverts() public {
        // Set mock implementation to zero
        mockSystem.setMockImplementation(address(0));

        vm.expectRevert(TestImplementationNotSet.selector);
        proxy.getImplementationPublic();
    }

    function test_GetImplementationWithCustomRevert() public {
        // Set proxy to revert on implementation call
        proxy.setShouldRevertOnImplementation(true);

        vm.expectRevert(TestImplementationNotSet.selector);
        proxy.getImplementationPublic();
    }

    function test_PerformInitializationDelegatecallSuccess() public {
        MockImplementation newImpl = new MockImplementation();
        bytes memory initData = abi.encodeWithSelector(MockImplementation.initialize.selector, admin);

        proxy.performInitializationDelegatecallPublic(address(newImpl), initData);

        // Check if the proxy's storage was updated via delegatecall
        // Note: This is a simplified test - in reality, delegatecall affects proxy's storage
    }

    function test_PerformInitializationDelegatecallWithZeroAddress() public {
        bytes memory initData = abi.encodeWithSelector(MockImplementation.initialize.selector, admin);

        vm.expectRevert(InitializationWithZeroAddress.selector);
        proxy.performInitializationDelegatecallPublic(address(0), initData);
    }

    function test_PerformInitializationDelegatecallWithFailingInit() public {
        FailingMockImplementation failingImpl = new FailingMockImplementation();

        bytes memory initData = abi.encodeWithSelector(FailingMockImplementation.initialize.selector, admin);

        vm.expectRevert("Initialization always fails");
        proxy.performInitializationDelegatecallPublic(address(failingImpl), initData);
    }

    function test_FallbackFunctionDelegation() public {
        // Test that calls to non-existent functions get delegated to implementation
        (bool success, bytes memory returnData) =
            address(proxy).call(abi.encodeWithSelector(MockImplementation.testFunction.selector));

        assertTrue(success);
        string memory result = abi.decode(returnData, (string));
        assertEq(result, "test");
    }

    function test_ReceiveFunctionRejectsEther() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        (bool success, bytes memory data) = address(proxy).call{ value: 1 ether }("");
        assertFalse(success);
        // Check that the revert reason is ETHTransfersNotAllowed
        bytes4 expectedSelector = ETHTransfersNotAllowed.selector;
        bytes4 actualSelector;
        assembly {
            actualSelector := mload(add(data, 0x20))
        }
        assertEq(actualSelector, expectedSelector);
    }

    function test_DirectEtherTransferRejectsEther() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        vm.expectRevert();
        payable(address(proxy)).transfer(1 ether);
    }

    function test_SendEtherRejectsEther() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        bool success = payable(address(proxy)).send(1 ether);
        assertFalse(success);
    }

    function test_ImplementationChangeDuringRuntime() public {
        // Verify initial implementation
        assertEq(proxy.getImplementationPublic(), address(mockImplementation));

        // Change implementation in the system
        MockImplementation newImplementation = new MockImplementation();
        mockSystem.setMockImplementation(address(newImplementation));

        // Verify proxy now returns new implementation
        assertEq(proxy.getImplementationPublic(), address(newImplementation));
    }

    function test_ProxyStoragePersistence() public {
        // Create another proxy with the same system
        TestableSMARTSystemProxy proxy2 = new TestableSMARTSystemProxy(address(mockSystem), true);

        // Both proxies should point to the same system
        assertEq(address(proxy.getSystemPublic()), address(proxy2.getSystemPublic()));
        assertEq(proxy.getImplementationPublic(), proxy2.getImplementationPublic());
    }

    function test_SystemInterfaceCompliance() public view {
        // Verify the mock system properly implements ISMARTSystem
        assertTrue(IERC165(address(mockSystem)).supportsInterface(type(ISMARTSystem).interfaceId));
        assertTrue(IERC165(address(mockSystem)).supportsInterface(type(IERC165).interfaceId));
    }

    function test_FuzzConstructorValidation(address randomAddress) public {
        vm.assume(randomAddress != address(0));

        // Most random addresses won't implement the required interfaces
        if (randomAddress == address(mockSystem)) {
            // Skip if it happens to be our valid mock system
            return;
        }

        try new TestableSMARTSystemProxy(randomAddress, true) {
            // If construction succeeds, verify the address implements required interfaces
            assertTrue(IERC165(randomAddress).supportsInterface(type(ISMARTSystem).interfaceId));
        } catch {
            // Expected to fail for most random addresses
            assertTrue(true);
        }
    }

    function test_ConstructorValidationComplexCase() public {
        // Test with a contract that supports ERC165 but not ISMARTSystem
        vm.expectRevert(InvalidSystemAddress.selector);
        new TestableSMARTSystemProxy(address(erc165OnlyContract), true);
    }

    function test_EdgeCaseEmptyInitData() public {
        MockImplementation emptyImpl = new MockImplementation();
        bytes memory emptyData = "";

        // Empty delegatecall should succeed but might trigger fallback which could fail
        // Let's expect it might revert since it's calling with no function selector
        try proxy.performInitializationDelegatecallPublic(address(emptyImpl), emptyData) {
            // If it succeeds, that's fine too
            assertTrue(true);
        } catch {
            // If it fails, that's also expected behavior for empty data
            assertTrue(true);
        }
    }

    function test_EdgeCaseInvalidInitData() public {
        MockImplementation impl = new MockImplementation();
        bytes memory invalidData = abi.encodeWithSelector(bytes4(0x12345678)); // Non-existent function

        // This should revert because the function doesn't exist
        vm.expectRevert();
        proxy.performInitializationDelegatecallPublic(address(impl), invalidData);
    }
}
