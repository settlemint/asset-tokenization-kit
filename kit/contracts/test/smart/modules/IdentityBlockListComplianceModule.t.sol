// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { AbstractComplianceModuleTest } from "./AbstractComplianceModuleTest.t.sol";
import { IdentityBlockListComplianceModule } from
    "../../../contracts/smart/modules/IdentityBlockListComplianceModule.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

contract IdentityBlockListComplianceModuleTest is AbstractComplianceModuleTest {
    IdentityBlockListComplianceModule internal module;

    function setUp() public override {
        super.setUp();
        module = new IdentityBlockListComplianceModule(address(0));
        module.grantRole(module.GLOBAL_LIST_MANAGER_ROLE(), address(this));

        // Issue claims to users
        claimUtils.issueAllClaims(user1);
        claimUtils.issueAllClaims(user2);
    }

    function test_IdentityBlockList_InitialState() public view {
        assertEq(module.name(), "Identity BlockList Compliance Module");
    }

    function test_IdentityBlockList_SetGlobalBlockedIdentities() public {
        address[] memory identitiesToBlock = new address[](2);
        identitiesToBlock[0] = address(identity1);
        identitiesToBlock[1] = address(identity2);

        module.setGlobalBlockedIdentities(identitiesToBlock, true);

        assertTrue(module.isGloballyBlocked(address(identity1)));
        assertTrue(module.isGloballyBlocked(address(identity2)));

        module.setGlobalBlockedIdentities(identitiesToBlock, false);

        assertFalse(module.isGloballyBlocked(address(identity1)));
        assertFalse(module.isGloballyBlocked(address(identity2)));
    }

    function test_IdentityBlockList_FailWhen_SetGlobalBlockedIdentitiesFromNonAdmin() public {
        vm.startPrank(user1);
        address[] memory identitiesToBlock = new address[](1);
        identitiesToBlock[0] = address(identity1);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user1, module.GLOBAL_LIST_MANAGER_ROLE()
            )
        );
        module.setGlobalBlockedIdentities(identitiesToBlock, true);
        vm.stopPrank();
    }

    function test_IdentityBlockList_CanTransfer_NoIdentity() public view {
        module.canTransfer(address(smartToken), user1, user3, 100, abi.encode(new address[](0)));
    }

    function test_IdentityBlockList_CanTransfer_NotBlocked() public view {
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, abi.encode(new address[](0)));
    }

    function test_IdentityBlockList_RevertWhen_TransferToGloballyBlockedIdentity() public {
        address[] memory identitiesToBlock = new address[](1);
        identitiesToBlock[0] = address(identity1);
        module.setGlobalBlockedIdentities(identitiesToBlock, true);

        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity globally blocked"
            )
        );
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, abi.encode(new address[](0)));
    }

    function test_IdentityBlockList_RevertWhen_TransferToTokenBlockedIdentity() public {
        address[] memory additionalBlocked = new address[](1);
        additionalBlocked[0] = address(identity2);
        bytes memory params = abi.encode(additionalBlocked);

        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity blocked for token"
            )
        );
        module.canTransfer(address(smartToken), tokenIssuer, user2, 100, params);
    }

    function test_IdentityBlockList_Integration_TokenTransfer_GloballyBlocked() public {
        // Add the module to the token's compliance settings
        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), abi.encode(new address[](0)));
        vm.stopPrank();

        // Block identity1
        address[] memory identitiesToBlock = new address[](1);
        identitiesToBlock[0] = address(identity1);
        module.setGlobalBlockedIdentities(identitiesToBlock, true);

        // Mint some tokens to the issuer to be able to transfer
        vm.prank(tokenIssuer);
        smartToken.mint(tokenIssuer, 1000);

        // Attempt to transfer to user1 (who has blocked identity1)
        vm.prank(tokenIssuer);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity globally blocked"
            )
        );
        smartToken.transfer(user1, 100);
    }

    function test_IdentityBlockList_Integration_TokenTransfer_TokenBlocked() public {
        // Add the module to the token's compliance settings with token-specific blocked identities
        address[] memory additionalBlocked = new address[](1);
        additionalBlocked[0] = address(identity2);
        bytes memory params = abi.encode(additionalBlocked);

        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), params);
        vm.stopPrank();

        // Mint some tokens to the issuer to be able to transfer
        vm.prank(tokenIssuer);
        smartToken.mint(tokenIssuer, 1000);

        // Attempt to transfer to user2 (who has token-blocked identity2)
        vm.prank(tokenIssuer);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity blocked for token"
            )
        );
        smartToken.transfer(user2, 100);
    }
}
