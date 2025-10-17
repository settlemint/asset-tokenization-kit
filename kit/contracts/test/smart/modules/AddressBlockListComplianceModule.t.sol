// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { AbstractComplianceModuleTest } from "./AbstractComplianceModuleTest.t.sol";
import { AddressBlockListComplianceModule } from "../../../contracts/smart/modules/AddressBlockListComplianceModule.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";

contract AddressBlockListComplianceModuleTest is AbstractComplianceModuleTest {
    AddressBlockListComplianceModule internal module;

    function setUp() public override {
        super.setUp();
        module = new AddressBlockListComplianceModule(address(0));
    }

    function test_AddressBlockList_InitialState() public view {
        assertEq(module.name(), "Address BlockList Compliance Module");
        assertEq(module.typeId(), keccak256("AddressBlockListComplianceModule"));
    }

    function test_AddressBlockList_ValidateParameters_EmptyArray() public view {
        bytes memory params = abi.encode(new address[](0));
        module.validateParameters(params);
    }

    function test_AddressBlockList_ValidateParameters_WithAddresses() public view {
        address[] memory blockedAddresses = new address[](2);
        blockedAddresses[0] = user1;
        blockedAddresses[1] = user2;
        bytes memory params = abi.encode(blockedAddresses);
        module.validateParameters(params);
    }

    function test_AddressBlockList_RevertWhen_InvalidParameters() public {
        bytes memory invalidParams = abi.encode("invalid");
        vm.expectRevert();
        module.validateParameters(invalidParams);
    }

    function test_AddressBlockList_CanTransfer_EmptyBlockList() public view {
        bytes memory params = abi.encode(new address[](0));
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);
        module.canTransfer(address(smartToken), tokenIssuer, user2, 100, params);
        module.canTransfer(address(smartToken), tokenIssuer, user3, 100, params);
    }

    function test_AddressBlockList_RevertWhen_TransferToBlockedAddress() public {
        address[] memory blockedAddresses = new address[](2);
        blockedAddresses[0] = user1;
        blockedAddresses[1] = user2;
        bytes memory params = abi.encode(blockedAddresses);

        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver address blocked")
        );
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);
    }

    function test_AddressBlockList_RevertWhen_TransferToSecondBlockedAddress() public {
        address[] memory blockedAddresses = new address[](2);
        blockedAddresses[0] = user1;
        blockedAddresses[1] = user2;
        bytes memory params = abi.encode(blockedAddresses);

        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver address blocked")
        );
        module.canTransfer(address(smartToken), tokenIssuer, user2, 100, params);
    }

    function test_AddressBlockList_CanTransfer_NotBlocked() public view {
        address[] memory blockedAddresses = new address[](2);
        blockedAddresses[0] = user1;
        blockedAddresses[1] = user2;
        bytes memory params = abi.encode(blockedAddresses);

        // user3 is not in the blocked list, so transfer should be allowed
        module.canTransfer(address(smartToken), tokenIssuer, user3, 100, params);
    }

    function test_AddressBlockList_Integration_TokenTransfer() public {
        // Add module to token with user1 blocked
        address[] memory blockedAddresses = new address[](1);
        blockedAddresses[0] = user1;
        bytes memory params = abi.encode(blockedAddresses);

        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), params);
        smartToken.mint(tokenIssuer, 1000);
        vm.stopPrank();

        // Transfer to user1 should fail (blocked)
        vm.prank(tokenIssuer);
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver address blocked")
        );
        bool result = smartToken.transfer(user1, 100);
        result; // Explicitly unused - we expect this to revert

        // Transfer to user2 should succeed (not blocked)
        vm.prank(tokenIssuer);
        assertTrue(smartToken.transfer(user2, 100), "Transfer failed");
        assertEq(smartToken.balanceOf(user2), 100);
    }

    function test_AddressBlockList_SupportsInterface() public view {
        assertTrue(module.supportsInterface(type(ISMARTComplianceModule).interfaceId));
    }

    function test_AddressBlockList_Lifecycle_Functions() public {
        bytes memory params = abi.encode(new address[](0));

        vm.startPrank(address(smartToken));
        // These functions should not revert for stateless modules
        module.transferred(address(smartToken), tokenIssuer, user1, 100, params);
        module.created(address(smartToken), user1, 100, params);
        module.destroyed(address(smartToken), user1, 100, params);
        vm.stopPrank();
    }
}
