// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { AbstractComplianceModuleTest } from "./AbstractComplianceModuleTest.t.sol";
import {
    IdentityBlockListComplianceModule
} from "../../../contracts/smart/modules/IdentityBlockListComplianceModule.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";

contract IdentityBlockListComplianceModuleTest is AbstractComplianceModuleTest {
    IdentityBlockListComplianceModule internal module;

    function setUp() public override {
        super.setUp();
        module = new IdentityBlockListComplianceModule(address(0));

        // Issue claims to users for identity testing
        claimUtils.issueAllClaims(user1);
        claimUtils.issueAllClaims(user2);
    }

    function test_IdentityBlockList_InitialState() public view {
        assertEq(module.name(), "Identity BlockList Compliance Module");
        assertEq(module.typeId(), keccak256("IdentityBlockListComplianceModule"));
    }

    function test_IdentityBlockList_ValidateParameters_EmptyArray() public view {
        bytes memory params = abi.encode(new address[](0));
        module.validateParameters(params);
    }

    function test_IdentityBlockList_ValidateParameters_WithIdentities() public view {
        address[] memory blockedIdentities = new address[](2);
        blockedIdentities[0] = address(identity1);
        blockedIdentities[1] = address(identity2);
        bytes memory params = abi.encode(blockedIdentities);
        module.validateParameters(params);
    }

    function test_IdentityBlockList_RevertWhen_InvalidParameters() public {
        bytes memory invalidParams = abi.encode("invalid");
        vm.expectRevert();
        module.validateParameters(invalidParams);
    }

    function test_IdentityBlockList_CanTransfer_NoIdentity() public view {
        // A transfer to an address with no identity should be allowed by this module.
        bytes memory params = abi.encode(new address[](0));
        module.canTransfer(address(smartToken), user1, user3, 100, params);
    }

    function test_IdentityBlockList_CanTransfer_EmptyBlockList() public view {
        // Empty block list means no identities are blocked
        bytes memory params = abi.encode(new address[](0));
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);
        module.canTransfer(address(smartToken), tokenIssuer, user2, 100, params);
        module.canTransfer(address(smartToken), tokenIssuer, user3, 100, params);
    }

    function test_IdentityBlockList_CanTransfer_NotBlockedIdentity() public view {
        // Block identity2, but user1 has identity1
        address[] memory blockedIdentities = new address[](1);
        blockedIdentities[0] = address(identity2);
        bytes memory params = abi.encode(blockedIdentities);

        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params); // identity1 user
        module.canTransfer(address(smartToken), tokenIssuer, user3, 100, params); // no identity user
    }

    function test_IdentityBlockList_RevertWhen_TransferToBlockedIdentity() public {
        // Block identity1, user1 has identity1
        address[] memory blockedIdentities = new address[](1);
        blockedIdentities[0] = address(identity1);
        bytes memory params = abi.encode(blockedIdentities);

        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity blocked")
        );
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);
    }

    function test_IdentityBlockList_RevertWhen_TransferToSecondBlockedIdentity() public {
        // Block both identity1 and identity2
        address[] memory blockedIdentities = new address[](2);
        blockedIdentities[0] = address(identity1); // user1
        blockedIdentities[1] = address(identity2); // user2
        bytes memory params = abi.encode(blockedIdentities);

        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity blocked")
        );
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);

        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity blocked")
        );
        module.canTransfer(address(smartToken), tokenIssuer, user2, 100, params);
    }

    function test_IdentityBlockList_Integration_TokenTransfer() public {
        // Add module to token with identity1 blocked
        address[] memory blockedIdentities = new address[](1);
        blockedIdentities[0] = address(identity1); // user1 has identity1
        bytes memory params = abi.encode(blockedIdentities);

        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), params);
        smartToken.mint(tokenIssuer, 1000);
        vm.stopPrank();

        // Transfer to user1 (identity1) should fail
        vm.prank(tokenIssuer);
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity blocked")
        );
        bool result = smartToken.transfer(user1, 100);
        result; // Explicitly unused - we expect this to revert

        // Transfer to user2 (identity2) should succeed
        vm.prank(tokenIssuer);
        assertTrue(smartToken.transfer(user2, 100), "Transfer failed");
        assertEq(smartToken.balanceOf(user2), 100);
    }

    function test_IdentityBlockList_SupportsInterface() public view {
        assertTrue(module.supportsInterface(type(ISMARTComplianceModule).interfaceId));
    }

    function test_IdentityBlockList_Lifecycle_Functions() public {
        bytes memory params = abi.encode(new address[](0));

        // These functions should not revert for stateless modules
        vm.startPrank(address(smartToken));
        module.transferred(address(smartToken), tokenIssuer, user1, 100, params);
        module.created(address(smartToken), user1, 100, params);
        module.destroyed(address(smartToken), user1, 100, params);
        vm.stopPrank();
    }
}
