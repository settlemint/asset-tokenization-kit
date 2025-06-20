// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { AbstractComplianceModuleTest } from "./AbstractComplianceModuleTest.t.sol";
import { AddressBlockListComplianceModule } from "../../../contracts/smart/modules/AddressBlockListComplianceModule.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

contract AddressBlockListComplianceModuleTest is AbstractComplianceModuleTest {
    AddressBlockListComplianceModule internal module;

    function setUp() public override {
        super.setUp();
        module = new AddressBlockListComplianceModule(address(0));
        module.grantRole(module.GLOBAL_LIST_MANAGER_ROLE(), address(this));
    }

    function test_AddressBlockList_InitialState() public view {
        assertEq(module.name(), "Address BlockList Compliance Module");
    }

    function test_AddressBlockList_SetGlobalBlockedAddresses() public {
        address[] memory addressesToBlock = new address[](2);
        addressesToBlock[0] = user1;
        addressesToBlock[1] = user2;

        module.setGlobalBlockedAddresses(addressesToBlock, true);

        assertTrue(module.isGloballyBlocked(user1));
        assertTrue(module.isGloballyBlocked(user2));

        module.setGlobalBlockedAddresses(addressesToBlock, false);

        assertFalse(module.isGloballyBlocked(user1));
        assertFalse(module.isGloballyBlocked(user2));
    }

    function test_AddressBlockList_RevertWhen_TransferToGloballyBlocked() public {
        address[] memory addressesToBlock = new address[](1);
        addressesToBlock[0] = user1;
        module.setGlobalBlockedAddresses(addressesToBlock, true);

        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver address globally blocked"
            )
        );
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, abi.encode(new address[](0)));
    }

    function test_AddressBlockList_RevertWhen_TransferToTokenBlocked() public {
        address[] memory additionalBlocked = new address[](1);
        additionalBlocked[0] = user2;
        bytes memory params = abi.encode(additionalBlocked);

        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver address blocked for token"
            )
        );
        module.canTransfer(address(smartToken), tokenIssuer, user2, 100, params);
    }

    function test_AddressBlockList_CanTransfer_NotBlocked() public view {
        module.canTransfer(address(smartToken), tokenIssuer, user3, 100, abi.encode(new address[](0)));
    }

    function test_AddressBlockList_Integration_TokenTransfer_GloballyBlocked() public {
        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), abi.encode(new address[](0)));
        vm.stopPrank();

        address[] memory addressesToBlock = new address[](1);
        addressesToBlock[0] = user1;
        module.setGlobalBlockedAddresses(addressesToBlock, true);

        vm.prank(tokenIssuer);
        smartToken.mint(tokenIssuer, 1000);

        vm.prank(tokenIssuer);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver address globally blocked"
            )
        );
        smartToken.transfer(user1, 100);
    }

    function test_AddressBlockList_FailWhen_SetGlobalBlockedAddressesFromNonAdmin() public {
        vm.startPrank(user1);
        address[] memory addressesToBlock = new address[](1);
        addressesToBlock[0] = user1;
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user1, module.GLOBAL_LIST_MANAGER_ROLE()
            )
        );
        module.setGlobalBlockedAddresses(addressesToBlock, true);
        vm.stopPrank();
    }
}
