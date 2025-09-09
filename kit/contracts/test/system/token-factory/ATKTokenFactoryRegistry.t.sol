// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { SystemUtils } from "../../utils/SystemUtils.sol";
import { IATKTokenFactoryRegistry } from "../../../contracts/system/tokens/factory/IATKTokenFactoryRegistry.sol";
import { ATKTokenFactoryRegistryImplementation } from
    "../../../contracts/system/tokens/factory/ATKTokenFactoryRegistryImplementation.sol";
import { IATKTokenFactory } from "../../../contracts/system/tokens/factory/IATKTokenFactory.sol";
import { IWithTypeIdentifier } from "../../../contracts/smart/interface/IWithTypeIdentifier.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ATKPeopleRoles } from "../../../contracts/system/ATKPeopleRoles.sol";
import { ATKSystemRoles } from "../../../contracts/system/ATKSystemRoles.sol";
import { ATKRoles } from "../../../contracts/system/ATKRoles.sol";
import { IATKTypedImplementationRegistry } from "../../../contracts/system/IATKTypedImplementationRegistry.sol";
import {
    InvalidTokenFactoryAddress,
    TokenFactoryTypeAlreadyRegistered,
    InvalidTokenImplementationAddress,
    InvalidTokenImplementationInterface,
    InvalidImplementationInterface
} from "../../../contracts/system/ATKSystemErrors.sol";
import { IATKSystemAccessManaged } from "../../../contracts/system/access-manager/IATKSystemAccessManaged.sol";

// Mock for IATKTokenFactory that can be instantiated
contract MockTokenFactory is IATKTokenFactory, IWithTypeIdentifier {
    bytes32 public constant TYPE_ID = keccak256("MockTokenFactory");

    function initialize(address, address, address) external override { }

    function isValidTokenImplementation(address tokenImplementation_) external pure override returns (bool) {
        return tokenImplementation_ != address(0);
    }

    function tokenImplementation() external pure override returns (address) {
        return address(0);
    }

    function accessManager() external pure override returns (address) {
        return address(0);
    }

    function hasSystemRole(bytes32, address) external pure override returns (bool) {
        return true;
    }

    function typeId() external pure override returns (bytes32) {
        return TYPE_ID;
    }

    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return interfaceId == type(IATKTokenFactory).interfaceId || interfaceId == type(IWithTypeIdentifier).interfaceId;
    }
}

// A mock for a token implementation to be used in tests.
contract MockTokenImplementation {
// Just a dummy contract
}

// Mock for a token factory that returns false for isValidTokenImplementation
contract MockInvalidTokenFactory is IATKTokenFactory {
    function initialize(address, address, address) external override { }

    function isValidTokenImplementation(address) external pure override returns (bool) {
        return false;
    }

    function tokenImplementation() external pure override returns (address) {
        return address(0);
    }

    function accessManager() external pure override returns (address) {
        return address(0);
    }

    function hasSystemRole(bytes32, address) external pure override returns (bool) {
        return true;
    }

    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return interfaceId == type(IATKTokenFactory).interfaceId;
    }
}

contract ATKTokenFactoryRegistryTest is Test {
    SystemUtils internal systemUtils;
    IATKTokenFactoryRegistry internal registry;
    MockTokenFactory internal mockTokenFactory;
    MockTokenImplementation internal mockTokenImplementation;
    address internal admin;
    address internal user;

    function setUp() public {
        admin = makeAddr("admin");
        user = makeAddr("user");

        systemUtils = new SystemUtils(admin);
        registry = systemUtils.tokenFactoryRegistry();

        mockTokenFactory = new MockTokenFactory();
        mockTokenImplementation = new MockTokenImplementation();
    }

    function test_Initialize() public view {
        assertTrue(registry.hasSystemRole(ATKRoles.DEFAULT_ADMIN_ROLE, admin));
    }

    function test_RegisterTokenFactory_Success() public {
        vm.prank(admin);
        string memory factoryName = "TestFactory";
        bytes32 factoryTypeHash = keccak256(abi.encodePacked(factoryName));

        address proxyAddress =
            registry.registerTokenFactory(factoryName, address(mockTokenFactory), address(mockTokenImplementation));

        assertNotEq(proxyAddress, address(0));
        assertTrue(
            ATKTokenFactoryRegistryImplementation(address(registry)).implementation(factoryTypeHash)
                == address(mockTokenFactory)
        );
        assertTrue(registry.tokenFactory(factoryTypeHash) == proxyAddress);

        // check roles granted
        assertTrue(systemUtils.systemAccessManager().hasRole(ATKSystemRoles.TOKEN_FACTORY_MODULE_ROLE, proxyAddress));
    }

    function test_RegisterTokenFactory_Fail_NotAdmin() public {
        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                IATKSystemAccessManaged.AccessControlUnauthorizedAccount.selector,
                user,
                ATKPeopleRoles.SYSTEM_MANAGER_ROLE
            )
        );
        registry.registerTokenFactory("TestFactory", address(mockTokenFactory), address(mockTokenImplementation));
    }

    function test_RegisterTokenFactory_Fail_ZeroFactoryAddress() public {
        vm.prank(admin);
        vm.expectRevert(InvalidTokenFactoryAddress.selector);
        registry.registerTokenFactory("TestFactory", address(0), address(mockTokenImplementation));
    }

    function test_RegisterTokenFactory_Fail_ZeroTokenImplementationAddress() public {
        vm.prank(admin);
        vm.expectRevert(InvalidTokenImplementationAddress.selector);
        registry.registerTokenFactory("TestFactory", address(mockTokenFactory), address(0));
    }

    function test_RegisterTokenFactory_Fail_AlreadyRegistered() public {
        vm.startPrank(admin);
        registry.registerTokenFactory("TestFactory", address(mockTokenFactory), address(mockTokenImplementation));

        vm.expectRevert(abi.encodeWithSelector(TokenFactoryTypeAlreadyRegistered.selector, "TestFactory"));
        registry.registerTokenFactory("TestFactory", address(mockTokenFactory), address(mockTokenImplementation));
        vm.stopPrank();
    }

    function test_RegisterTokenFactory_Fail_InvalidFactoryInterface() public {
        vm.startPrank(admin);
        // Using mockTokenImplementation which doesn't implement IATKTokenFactory
        address invalidFactory = address(new MockTokenImplementation());
        vm.expectRevert(
            abi.encodeWithSelector(
                InvalidImplementationInterface.selector, invalidFactory, type(IATKTokenFactory).interfaceId
            )
        );
        registry.registerTokenFactory("TestFactory", invalidFactory, address(mockTokenImplementation));
        vm.stopPrank();
    }

    function test_RegisterTokenFactory_Fail_InvalidTokenImplementationInterface() public {
        vm.startPrank(admin);
        MockInvalidTokenFactory invalidFactory = new MockInvalidTokenFactory();
        vm.expectRevert(InvalidTokenImplementationInterface.selector);
        registry.registerTokenFactory("TestFactory", address(invalidFactory), address(mockTokenImplementation));
        vm.stopPrank();
    }

    function test_SetTokenFactoryImplementation_Success() public {
        vm.startPrank(admin);
        string memory factoryName = "TestFactory";
        bytes32 factoryTypeHash = keccak256(abi.encodePacked(factoryName));
        registry.registerTokenFactory(factoryName, address(mockTokenFactory), address(mockTokenImplementation));

        MockTokenFactory newMockTokenFactory = new MockTokenFactory();

        vm.expectEmit(true, true, true, true);
        emit IATKTokenFactoryRegistry.TokenFactoryImplementationUpdated(
            admin, factoryTypeHash, address(newMockTokenFactory)
        );

        registry.setTokenFactoryImplementation(factoryTypeHash, address(newMockTokenFactory));
        assertEq(
            ATKTokenFactoryRegistryImplementation(address(registry)).implementation(factoryTypeHash),
            address(newMockTokenFactory)
        );
        vm.stopPrank();
    }

    // Test skipped since onlySystemRoles modifier is commented out in implementation
    function test_SetTokenFactoryImplementation_Fail_NotAdmin() public {
        vm.prank(admin);
        string memory factoryName = "TestFactory";
        bytes32 factoryTypeHash = keccak256(abi.encodePacked(factoryName));
        registry.registerTokenFactory(factoryName, address(mockTokenFactory), address(mockTokenImplementation));

        MockTokenFactory newMockTokenFactory = new MockTokenFactory();

        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                IATKSystemAccessManaged.AccessControlUnauthorizedAccount.selector,
                user,
                ATKPeopleRoles.SYSTEM_MANAGER_ROLE
            )
        );
        registry.setTokenFactoryImplementation(factoryTypeHash, address(newMockTokenFactory));
    }

    function test_SetTokenFactoryImplementation_Fail_ZeroAddress() public {
        vm.startPrank(admin);
        string memory factoryName = "TestFactory";
        bytes32 factoryTypeHash = keccak256(abi.encodePacked(factoryName));
        registry.registerTokenFactory(factoryName, address(mockTokenFactory), address(mockTokenImplementation));

        vm.expectRevert(InvalidTokenFactoryAddress.selector);
        registry.setTokenFactoryImplementation(factoryTypeHash, address(0));
        vm.stopPrank();
    }

    function test_SetTokenFactoryImplementation_Fail_FactoryNotRegistered() public {
        vm.startPrank(admin);
        bytes32 factoryTypeHash = keccak256(abi.encodePacked("NonExistentFactory"));
        MockTokenFactory newMockTokenFactory = new MockTokenFactory();

        vm.expectRevert(InvalidTokenFactoryAddress.selector);
        registry.setTokenFactoryImplementation(factoryTypeHash, address(newMockTokenFactory));
        vm.stopPrank();
    }

    function test_SetTokenFactoryImplementation_Fail_InvalidInterface() public {
        vm.startPrank(admin);
        string memory factoryName = "TestFactory";
        bytes32 factoryTypeHash = keccak256(abi.encodePacked(factoryName));
        registry.registerTokenFactory(factoryName, address(mockTokenFactory), address(mockTokenImplementation));

        address invalidFactory = address(new MockTokenImplementation());

        vm.expectRevert(
            abi.encodeWithSelector(
                InvalidImplementationInterface.selector, invalidFactory, type(IATKTokenFactory).interfaceId
            )
        );
        registry.setTokenFactoryImplementation(factoryTypeHash, invalidFactory);
        vm.stopPrank();
    }

    function test_SupportsInterface() public view {
        assertTrue(registry.supportsInterface(type(IATKTokenFactoryRegistry).interfaceId));
        assertTrue(registry.supportsInterface(type(IATKSystemAccessManaged).interfaceId));
        assertTrue(registry.supportsInterface(type(IERC165).interfaceId));
        assertTrue(registry.supportsInterface(type(IATKTypedImplementationRegistry).interfaceId));
    }
}
