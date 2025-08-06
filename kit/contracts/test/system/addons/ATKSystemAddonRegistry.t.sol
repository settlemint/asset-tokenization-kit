// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test, Vm } from "forge-std/Test.sol";
import { SystemUtils } from "../../utils/SystemUtils.sol";
import { IATKSystemAddonRegistry } from "../../../contracts/system/addons/IATKSystemAddonRegistry.sol";
import { ATKSystemAddonRegistryImplementation } from
    "../../../contracts/system/addons/ATKSystemAddonRegistryImplementation.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IWithTypeIdentifier } from "../../../contracts/smart/interface/IWithTypeIdentifier.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ATKPeopleRoles } from "../../../contracts/system/ATKPeopleRoles.sol";
import { ATKSystemRoles } from "../../../contracts/system/ATKSystemRoles.sol";
import { ATKRoles } from "../../../contracts/system/ATKRoles.sol";
import { IATKTypedImplementationRegistry } from "../../../contracts/system/IATKTypedImplementationRegistry.sol";
import {
    InvalidAddonAddress,
    SystemAddonTypeAlreadyRegistered,
    SystemAddonImplementationNotSet
} from "../../../contracts/system/ATKSystemErrors.sol";
import { IATKSystemAccessManaged } from "../../../contracts/system/access-manager/IATKSystemAccessManaged.sol";

// Mock for an addon implementation
contract MockAddon is IWithTypeIdentifier {
    bytes32 public constant TYPE_ID = keccak256("MockAddon");
    bool public initialized = false;
    address public system;

    function initialize(address _system) external {
        initialized = true;
        system = _system;
    }

    function typeId() external pure returns (bytes32) {
        return TYPE_ID;
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == type(IWithTypeIdentifier).interfaceId;
    }
}

// Mock for an addon implementation without a typeId
contract MockAddonWithoutTypeId {
    bool public initialized = false;
    address public system;

    function initialize(address _system) external {
        initialized = true;
        system = _system;
    }
}

contract ATKSystemAddonRegistryTest is Test {
    SystemUtils internal systemUtils;
    IATKSystemAddonRegistry internal registry;
    MockAddon internal mockAddon;
    MockAddonWithoutTypeId internal mockAddonWithoutTypeId;
    address internal admin;
    address internal user;

    function setUp() public {
        admin = makeAddr("admin");
        user = makeAddr("user");

        systemUtils = new SystemUtils(admin);
        registry = systemUtils.systemAddonRegistry();

        mockAddon = new MockAddon();
        mockAddonWithoutTypeId = new MockAddonWithoutTypeId();
    }

    function test_Initialize() public view {
        assertTrue(systemUtils.systemAccessManager().hasRole(ATKRoles.DEFAULT_ADMIN_ROLE, admin));
    }

    function test_RegisterSystemAddon_Success() public {
        vm.startPrank(admin);
        string memory addonName = "TestAddon";
        bytes32 addonTypeHash = keccak256(abi.encodePacked(addonName));
        bytes memory initData = abi.encodeWithSelector(mockAddon.initialize.selector, address(systemUtils.system()));

        address proxyAddress = registry.registerSystemAddon(addonName, address(mockAddon), initData);

        assertNotEq(proxyAddress, address(0));
        assertEq(
            ATKSystemAddonRegistryImplementation(address(registry)).implementation(addonTypeHash), address(mockAddon)
        );
        assertEq(registry.addon(addonTypeHash), proxyAddress);

        // check roles granted
        assertTrue(systemUtils.systemAccessManager().hasRole(ATKSystemRoles.ADDON_FACTORY_MODULE_ROLE, proxyAddress));

        // check if addon was initialized
        assertTrue(MockAddon(proxyAddress).initialized());
        assertEq(MockAddon(proxyAddress).system(), address(systemUtils.system()));
        vm.stopPrank();
    }

    function test_RegisterSystemAddon_Success_NoTypeId() public {
        vm.startPrank(admin);
        string memory addonName = "TestAddonNoTypeId";
        bytes memory initData =
            abi.encodeWithSelector(mockAddonWithoutTypeId.initialize.selector, address(systemUtils.system()));

        vm.recordLogs();
        address proxyAddress = registry.registerSystemAddon(addonName, address(mockAddonWithoutTypeId), initData);
        Vm.Log[] memory logs = vm.getRecordedLogs();

        assertEq(logs.length, 2);

        // Manual check of event
        bytes32 eventSignature =
            keccak256("SystemAddonRegistered(address,string,bytes32,address,address,bytes,uint256)");
        assertEq(logs[1].topics[0], eventSignature);
        assertEq(logs[1].topics.length, 4); // 3 indexed topics
        assertEq(address(uint160(uint256(logs[1].topics[1]))), admin);
        assertEq(address(uint160(uint256(logs[1].topics[2]))), proxyAddress);
        assertEq(address(uint160(uint256(logs[1].topics[3]))), address(mockAddonWithoutTypeId));

        (string memory name, bytes32 typeId, bytes memory data, uint256 timestamp) =
            abi.decode(logs[1].data, (string, bytes32, bytes, uint256));

        assertEq(name, addonName);
        assertEq(typeId, bytes32(0));
        assertEq(data, initData);
        assertTrue(timestamp > 0);

        vm.stopPrank();
    }

    function test_RegisterSystemAddon_Fail_NotAdmin() public {
        vm.startPrank(user);
        bytes memory initData = abi.encodeWithSelector(mockAddon.initialize.selector, address(systemUtils.system()));
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user, ATKPeopleRoles.SYSTEM_MANAGER_ROLE
            )
        );
        registry.registerSystemAddon("TestAddon", address(mockAddon), initData);
        vm.stopPrank();
    }

    function test_RegisterSystemAddon_Fail_ZeroAddress() public {
        vm.prank(admin);
        bytes memory initData;
        vm.expectRevert(InvalidAddonAddress.selector);
        registry.registerSystemAddon("TestAddon", address(0), initData);
    }

    function test_RegisterSystemAddon_Fail_AlreadyRegistered() public {
        vm.startPrank(admin);
        string memory addonName = "TestAddon";
        bytes memory initData = abi.encodeWithSelector(mockAddon.initialize.selector, address(systemUtils.system()));
        registry.registerSystemAddon(addonName, address(mockAddon), initData);

        vm.expectRevert(abi.encodeWithSelector(SystemAddonTypeAlreadyRegistered.selector, addonName));
        registry.registerSystemAddon(addonName, address(mockAddon), initData);
        vm.stopPrank();
    }

    function test_SetAddonImplementation_Success() public {
        vm.startPrank(admin);
        string memory addonName = "TestAddon";
        bytes32 addonTypeHash = keccak256(abi.encodePacked(addonName));
        bytes memory initData = abi.encodeWithSelector(mockAddon.initialize.selector, address(systemUtils.system()));
        registry.registerSystemAddon(addonName, address(mockAddon), initData);

        MockAddon newMockAddon = new MockAddon();

        vm.expectEmit(true, true, true, true);
        emit IATKSystemAddonRegistry.AddonImplementationUpdated(admin, addonTypeHash, address(newMockAddon));

        registry.setAddonImplementation(addonTypeHash, address(newMockAddon));
        assertEq(
            ATKSystemAddonRegistryImplementation(address(registry)).implementation(addonTypeHash), address(newMockAddon)
        );
        vm.stopPrank();
    }

    function test_SetAddonImplementation_Fail_NotAdmin() public {
        vm.startPrank(admin);
        string memory addonName = "TestAddon";
        bytes32 addonTypeHash = keccak256(abi.encodePacked(addonName));
        bytes memory initData = abi.encodeWithSelector(mockAddon.initialize.selector, address(systemUtils.system()));
        registry.registerSystemAddon(addonName, address(mockAddon), initData);
        vm.stopPrank();

        MockAddon newMockAddon = new MockAddon();

        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user, ATKPeopleRoles.SYSTEM_MANAGER_ROLE
            )
        );
        registry.setAddonImplementation(addonTypeHash, address(newMockAddon));
    }

    function test_SetAddonImplementation_Fail_ZeroAddress() public {
        vm.startPrank(admin);
        string memory addonName = "TestAddon";
        bytes32 addonTypeHash = keccak256(abi.encodePacked(addonName));
        bytes memory initData = abi.encodeWithSelector(mockAddon.initialize.selector, address(systemUtils.system()));
        registry.registerSystemAddon(addonName, address(mockAddon), initData);

        vm.expectRevert(InvalidAddonAddress.selector);
        registry.setAddonImplementation(addonTypeHash, address(0));
        vm.stopPrank();
    }

    function test_SetAddonImplementation_Fail_NotRegistered() public {
        vm.startPrank(admin);
        bytes32 addonTypeHash = keccak256(abi.encodePacked("NonExistentAddon"));
        MockAddon newMockAddon = new MockAddon();

        vm.expectRevert(abi.encodeWithSelector(SystemAddonImplementationNotSet.selector, addonTypeHash));
        registry.setAddonImplementation(addonTypeHash, address(newMockAddon));
        vm.stopPrank();
    }

    function test_SupportsInterface() public view {
        assertTrue(
            ATKSystemAddonRegistryImplementation(address(registry)).supportsInterface(
                type(IATKSystemAddonRegistry).interfaceId
            )
        );
        assertTrue(
            ATKSystemAddonRegistryImplementation(address(registry)).supportsInterface(
                type(IATKSystemAccessManaged).interfaceId
            )
        );
        assertTrue(ATKSystemAddonRegistryImplementation(address(registry)).supportsInterface(type(IERC165).interfaceId));
        assertTrue(
            ATKSystemAddonRegistryImplementation(address(registry)).supportsInterface(
                type(IATKTypedImplementationRegistry).interfaceId
            )
        );
    }
}
