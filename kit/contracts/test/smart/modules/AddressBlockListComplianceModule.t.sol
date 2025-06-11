// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ComplianceModuleTest } from "./ComplianceModuleTest.t.sol";
import { AddressBlockListComplianceModule } from "../../../contracts/smart/modules/AddressBlockListComplianceModule.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";

contract AddressBlockListComplianceModuleTest is ComplianceModuleTest {
    AddressBlockListComplianceModule internal module;

    function setUp() public override {
        super.setUp();
        module = new AddressBlockListComplianceModule(address(0));
        module.grantRole(GLOBAL_LIST_MANAGER_ROLE, address(this));
    }

    function test_InitialState() public virtual {
        assertEq(module.name(), "Address BlockList Compliance Module");
    }

    function test_SetGlobalBlockedAddresses() public {
        address[] memory addressesToBlock = new address[](2);
        addressesToBlock[0] = user1;
        addressesToBlock[1] = user2;

        module.setGlobalBlockedAddresses(addressesToBlock, true);

        assertTrue(module.isGloballyBlocked(user1));
        assertTrue(module.isGloballyBlocked(user2));

        address[] memory blockedAddresses = module.getGlobalBlockedAddresses();
        assertEq(blockedAddresses.length, 2);
        assertEq(blockedAddresses[0], user1);
        assertEq(blockedAddresses[1], user2);
    }

    function test_UnsetGlobalBlockedAddresses() public {
        address[] memory addressesToBlock = new address[](1);
        addressesToBlock[0] = user1;

        module.setGlobalBlockedAddresses(addressesToBlock, true);
        assertTrue(module.isGloballyBlocked(user1));

        module.setGlobalBlockedAddresses(addressesToBlock, false);
        assertFalse(module.isGloballyBlocked(user1));
    }

    function testRevert_CanTransfer_GloballyBlocked() public {
        address[] memory addressesToBlock = new address[](1);
        addressesToBlock[0] = user1;
        module.setGlobalBlockedAddresses(addressesToBlock, true);

        bytes memory params = abi.encode(new address[](0));
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver address globally blocked"
            )
        );
        module.canTransfer(address(smartToken), address(this), user1, 100, params);
    }

    function testRevert_CanTransfer_TokenBlocked() public {
        address[] memory additionalBlocked = new address[](1);
        additionalBlocked[0] = user2;
        bytes memory params = abi.encode(additionalBlocked);

        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver address blocked for token"
            )
        );
        module.canTransfer(address(smartToken), address(this), user2, 100, params);
    }

    function test_CanTransfer_NotBlocked() public virtual {
        bytes memory params = abi.encode(new address[](0));
        module.canTransfer(address(smartToken), address(this), user3, 100, params);
        // Should not revert
    }

    function test_Integration_TokenTransfer_GloballyBlocked() public {
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
}
