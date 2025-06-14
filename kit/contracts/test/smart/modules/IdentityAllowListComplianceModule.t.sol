// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { AbstractComplianceModuleTest } from "./AbstractComplianceModuleTest.t.sol";
import { IdentityAllowListComplianceModule } from
    "../../../contracts/smart/modules/IdentityAllowListComplianceModule.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

contract IdentityAllowListComplianceModuleTest is AbstractComplianceModuleTest {
    IdentityAllowListComplianceModule internal module;

    function setUp() public override {
        super.setUp();
        module = new IdentityAllowListComplianceModule(address(0));
        module.grantRole(module.GLOBAL_LIST_MANAGER_ROLE(), address(this));

        // Issue claims to users
        claimUtils.issueAllClaims(user1);
        claimUtils.issueAllClaims(user2);
    }

    function test_IdentityAllowList_InitialState() public view {
        assertEq(module.name(), "Identity AllowList Compliance Module");
    }

    function test_IdentityAllowList_SetGlobalAllowedIdentities() public {
        address[] memory identitiesToAllow = new address[](2);
        identitiesToAllow[0] = address(identity1);
        identitiesToAllow[1] = address(identity2);

        module.setGlobalAllowedIdentities(identitiesToAllow, true);

        assertTrue(module.isGloballyAllowed(address(identity1)));
        assertTrue(module.isGloballyAllowed(address(identity2)));

        module.setGlobalAllowedIdentities(identitiesToAllow, false);

        assertFalse(module.isGloballyAllowed(address(identity1)));
        assertFalse(module.isGloballyAllowed(address(identity2)));
    }

    function test_IdentityAllowList_RevertWhen_TransferToNotAllowedIdentity() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity not in allowlist"
            )
        );
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, abi.encode(new address[](0)));
    }

    function test_IdentityAllowList_CanTransfer_GloballyAllowed() public {
        address[] memory identitiesToAllow = new address[](1);
        identitiesToAllow[0] = address(identity1);
        module.setGlobalAllowedIdentities(identitiesToAllow, true);

        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, abi.encode(new address[](0)));
    }

    function test_IdentityAllowList_CanTransfer_TokenAllowed() public view {
        address[] memory additionalAllowed = new address[](1);
        additionalAllowed[0] = address(identity1);
        bytes memory params = abi.encode(additionalAllowed);

        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);
    }

    function test_IdentityAllowList_RevertWhen_Integration_TokenTransferToNotAllowed() public {
        // Add the module to the token's compliance settings
        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), abi.encode(new address[](0)));
        vm.stopPrank();

        // mint is not working because tokenIssuer is not in the allowlist

        // Mint some tokens to the token issuer to have a balance to transfer from
        vm.prank(tokenIssuer);
        smartToken.mint(tokenIssuer, 1000);

        // Attempt to transfer to user1 (who has an identity that is not on the allowlist)
        vm.prank(tokenIssuer);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity not in allowlist"
            )
        );
        smartToken.transfer(user1, 100);
    }

    function test_IdentityAllowList_FailWhen_SetGlobalAllowedIdentitiesFromNonAdmin() public {
        vm.startPrank(user1);
        address[] memory identitiesToAllow = new address[](1);
        identitiesToAllow[0] = address(identity1);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user1, module.GLOBAL_LIST_MANAGER_ROLE()
            )
        );
        module.setGlobalAllowedIdentities(identitiesToAllow, true);
        vm.stopPrank();
    }
}
