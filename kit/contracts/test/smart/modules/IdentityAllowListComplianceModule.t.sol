// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { AbstractComplianceModuleTest } from "./AbstractComplianceModuleTest.t.sol";
import {
    IdentityAllowListComplianceModule
} from "../../../contracts/smart/modules/IdentityAllowListComplianceModule.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";

contract IdentityAllowListComplianceModuleTest is AbstractComplianceModuleTest {
    IdentityAllowListComplianceModule internal module;

    function setUp() public override {
        super.setUp();
        module = new IdentityAllowListComplianceModule(address(0));

        // Issue claims to users for identity testing
        claimUtils.issueAllClaims(user1);
        claimUtils.issueAllClaims(user2);
    }

    function test_IdentityAllowList_InitialState() public view {
        assertEq(module.name(), "Identity AllowList Compliance Module");
        assertEq(module.typeId(), keccak256("IdentityAllowListComplianceModule"));
    }

    function test_IdentityAllowList_ValidateParameters_EmptyArray() public view {
        bytes memory params = abi.encode(new address[](0));
        module.validateParameters(params);
    }

    function test_IdentityAllowList_ValidateParameters_WithIdentities() public view {
        address[] memory allowedIdentities = new address[](2);
        allowedIdentities[0] = address(identity1);
        allowedIdentities[1] = address(identity2);
        bytes memory params = abi.encode(allowedIdentities);
        module.validateParameters(params);
    }

    function test_IdentityAllowList_RevertWhen_InvalidParameters() public {
        bytes memory invalidParams = abi.encode("invalid");
        vm.expectRevert();
        module.validateParameters(invalidParams);
    }

    function test_IdentityAllowList_RevertWhen_NoIdentity() public {
        // A transfer to an address with no identity should fail for identity-based modules
        bytes memory params = abi.encode(new address[](0));
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity unknown")
        );
        module.canTransfer(address(smartToken), user1, user3, 100, params);
    }

    function test_IdentityAllowList_RevertWhen_EmptyAllowListNoIdentity() public {
        // Empty allow list and no identity should fail
        bytes memory params = abi.encode(new address[](0));
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity unknown")
        );
        module.canTransfer(address(smartToken), tokenIssuer, user3, 100, params); // user3 has no identity
    }

    function test_IdentityAllowList_RevertWhen_TransferToNotAllowedIdentity() public {
        // user1 has identity1, but identity1 is not in the empty allow list
        bytes memory params = abi.encode(new address[](0));
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity not in allowlist"
            )
        );
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);
    }

    function test_IdentityAllowList_CanTransfer_AllowedIdentity() public view {
        // user1 has identity1, allow identity1 in the parameters
        address[] memory allowedIdentities = new address[](1);
        allowedIdentities[0] = address(identity1);
        bytes memory params = abi.encode(allowedIdentities);

        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);
    }

    function test_IdentityAllowList_CanTransfer_MultipleAllowedIdentities() public view {
        // Allow both identity1 and identity2
        address[] memory allowedIdentities = new address[](2);
        allowedIdentities[0] = address(identity1); // user1
        allowedIdentities[1] = address(identity2); // user2
        bytes memory params = abi.encode(allowedIdentities);

        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);
        module.canTransfer(address(smartToken), tokenIssuer, user2, 100, params);
    }

    function test_IdentityAllowList_RevertWhen_IdentityNotInList() public {
        // Only allow identity2, but user1 has identity1
        address[] memory allowedIdentities = new address[](1);
        allowedIdentities[0] = address(identity2);
        bytes memory params = abi.encode(allowedIdentities);

        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity not in allowlist"
            )
        );
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);
    }

    function test_IdentityAllowList_Integration_TokenTransfer() public {
        // Add module to token with only identity2 allowed
        address[] memory allowedIdentities = new address[](1);
        allowedIdentities[0] = address(identity2); // user2 has identity2
        bytes memory params = abi.encode(allowedIdentities);

        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), params);
        smartToken.mint(tokenIssuer, 1000);
        vm.stopPrank();

        // Transfer to user1 (identity1) should fail
        vm.prank(tokenIssuer);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity not in allowlist"
            )
        );
        bool result = smartToken.transfer(user1, 100);
        result; // Explicitly unused - we expect this to revert

        // Transfer to user2 (identity2) should succeed
        vm.prank(tokenIssuer);
        assertTrue(smartToken.transfer(user2, 100), "Transfer failed");
        assertEq(smartToken.balanceOf(user2), 100);
    }

    function test_IdentityAllowList_SupportsInterface() public view {
        assertTrue(module.supportsInterface(type(ISMARTComplianceModule).interfaceId));
    }

    function test_IdentityAllowList_Lifecycle_Functions() public {
        bytes memory params = abi.encode(new address[](0));

        // These functions should not revert for stateless modules
        vm.startPrank(address(smartToken));
        module.transferred(address(smartToken), tokenIssuer, user1, 100, params);
        module.created(address(smartToken), user1, 100, params);
        module.destroyed(address(smartToken), user1, 100, params);
        vm.stopPrank();
    }
}
