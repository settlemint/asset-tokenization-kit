// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { SystemUtils } from "../../utils/SystemUtils.sol";
import { IATKComplianceModuleRegistry } from "../../../contracts/system/compliance/IATKComplianceModuleRegistry.sol";
import { ATKComplianceModuleRegistryImplementation } from
    "../../../contracts/system/compliance/ATKComplianceModuleRegistryImplementation.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";
import { IWithTypeIdentifier } from "../../../contracts/smart/interface/IWithTypeIdentifier.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ATKPeopleRoles } from "../../../contracts/system/ATKPeopleRoles.sol";
import { ATKRoles } from "../../../contracts/system/ATKRoles.sol";

import {
    InvalidComplianceModuleAddress,
    ComplianceModuleAlreadyRegistered,
    InvalidImplementationInterface
} from "../../../contracts/system/ATKSystemErrors.sol";
import { IATKSystemAccessManaged } from "../../../contracts/system/access-manager/IATKSystemAccessManaged.sol";

// Mock for a compliance module
contract MockComplianceModule is ISMARTComplianceModule {
    function canTransfer(address, address, address, uint256, bytes calldata) external view override { }
    function transferred(address, address, address, uint256, bytes calldata) external override { }
    function created(address, address, uint256, bytes calldata) external override { }
    function destroyed(address, address, uint256, bytes calldata) external override { }
    function validateParameters(bytes calldata) external view override { }

    function name() external pure override returns (string memory) {
        return "MockComplianceModule";
    }

    function typeId() external pure override returns (bytes32) {
        return keccak256("MockComplianceModule");
    }

    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return interfaceId == type(ISMARTComplianceModule).interfaceId
            || interfaceId == type(IWithTypeIdentifier).interfaceId || interfaceId == type(IERC165).interfaceId;
    }
}

contract NotAComplianceModule { }

contract ATKComplianceModuleRegistryTest is Test {
    SystemUtils internal systemUtils;
    IATKComplianceModuleRegistry internal registry;
    MockComplianceModule internal mockModule;
    address internal admin;
    address internal user;

    function setUp() public {
        admin = makeAddr("admin");
        user = makeAddr("user");

        systemUtils = new SystemUtils(admin);
        registry = systemUtils.complianceModuleRegistry();

        mockModule = new MockComplianceModule();
    }

    function test_Initialize() public view {
        assertTrue(systemUtils.systemAccessManager().hasRole(ATKRoles.DEFAULT_ADMIN_ROLE, admin));
    }

    function test_RegisterComplianceModule_Success() public {
        vm.startPrank(admin);

        vm.expectEmit(true, true, true, true);
        emit IATKComplianceModuleRegistry.ComplianceModuleRegistered(
            admin, "MockComplianceModule", keccak256("MockComplianceModule"), address(mockModule), block.timestamp
        );

        registry.registerComplianceModule(address(mockModule));

        bytes32 moduleTypeHash = mockModule.typeId();
        assertEq(registry.complianceModule(moduleTypeHash), address(mockModule));
        vm.stopPrank();
    }

    function test_RegisterComplianceModule_Fail_NotAdmin() public {
        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                IATKSystemAccessManaged.AccessControlUnauthorizedAccount.selector,
                user,
                ATKPeopleRoles.SYSTEM_MANAGER_ROLE
            )
        );
        registry.registerComplianceModule(address(mockModule));
    }

    function test_RegisterComplianceModule_Fail_ZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert(InvalidComplianceModuleAddress.selector);
        registry.registerComplianceModule(address(0));
    }

    function test_RegisterComplianceModule_Fail_AlreadyRegistered() public {
        vm.startPrank(admin);
        registry.registerComplianceModule(address(mockModule));

        vm.expectRevert(abi.encodeWithSelector(ComplianceModuleAlreadyRegistered.selector, "MockComplianceModule"));
        registry.registerComplianceModule(address(mockModule));
        vm.stopPrank();
    }

    function test_RegisterComplianceModule_Fail_InvalidInterface() public {
        vm.startPrank(admin);
        NotAComplianceModule notAModule = new NotAComplianceModule();
        vm.expectRevert(
            abi.encodeWithSelector(
                InvalidImplementationInterface.selector, address(notAModule), type(ISMARTComplianceModule).interfaceId
            )
        );
        registry.registerComplianceModule(address(notAModule));
        vm.stopPrank();
    }

    function test_SupportsInterface() public view {
        assertTrue(
            ATKComplianceModuleRegistryImplementation(address(registry)).supportsInterface(
                type(IATKComplianceModuleRegistry).interfaceId
            )
        );
        assertTrue(
            ATKComplianceModuleRegistryImplementation(address(registry)).supportsInterface(
                type(IATKSystemAccessManaged).interfaceId
            )
        );
        assertTrue(
            ATKComplianceModuleRegistryImplementation(address(registry)).supportsInterface(type(IERC165).interfaceId)
        );
    }
}
