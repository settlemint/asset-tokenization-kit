// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ComplianceModuleTest } from "./ComplianceModuleTest.t.sol";
import { IdentityBlockListComplianceModule } from
    "../../../contracts/smart/modules/IdentityBlockListComplianceModule.sol";
import { ISMARTCompliance } from "../../../contracts/smart/interface/ISMARTCompliance.sol";
import { SMARTComplianceModuleParamPair } from
    "../../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";

contract IdentityBlockListComplianceModuleTest is ComplianceModuleTest {
    IdentityBlockListComplianceModule internal module;

    function setUp() public override {
        super.setUp();
        module = new IdentityBlockListComplianceModule(address(0));
        module.grantRole(GLOBAL_LIST_MANAGER_ROLE, address(this));
    }

    function test_InitialState() public virtual {
        assertEq(module.name(), "Identity BlockList Compliance Module");
    }

    function test_SetGlobalBlockedIdentities() public {
        address[] memory identitiesToBlock = new address[](2);
        identitiesToBlock[0] = address(identity1);
        identitiesToBlock[1] = address(identity2);

        module.setGlobalBlockedIdentities(identitiesToBlock, true);

        assertTrue(module.isGloballyBlocked(address(identity1)));
        assertTrue(module.isGloballyBlocked(address(identity2)));

        address[] memory blockedIdentities = module.getGlobalBlockedIdentities();
        assertEq(blockedIdentities.length, 2);
        assertEq(blockedIdentities[0], address(identity1));
        assertEq(blockedIdentities[1], address(identity2));
    }

    function test_UnsetGlobalBlockedIdentities() public {
        address[] memory identitiesToBlock = new address[](1);
        identitiesToBlock[0] = address(identity1);

        module.setGlobalBlockedIdentities(identitiesToBlock, true);
        assertTrue(module.isGloballyBlocked(address(identity1)));

        module.setGlobalBlockedIdentities(identitiesToBlock, false);
        assertFalse(module.isGloballyBlocked(address(identity1)));
    }

    function testFail_SetGlobalBlockedIdentities_NotAdmin() public {
        vm.prank(user1);
        address[] memory identitiesToBlock = new address[](1);
        identitiesToBlock[0] = address(identity1);
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("AccessControlUnauthorizedAccount(address,bytes32)")), user1, GLOBAL_LIST_MANAGER_ROLE
            )
        );
        module.setGlobalBlockedIdentities(identitiesToBlock, true);
    }

    function test_CanTransfer_NoIdentity() public virtual {
        bytes memory params = abi.encode(new address[](0));
        // This call is to the module directly, not via the compliance contract.
        // It checks the logic within the module itself.
        module.canTransfer(address(smartToken), user1, user3, 100, params);
        // Should not revert
    }

    function test_CanTransfer_NotBlocked() public virtual {
        bytes memory params = abi.encode(new address[](0));
        module.canTransfer(address(smartToken), address(this), user1, 100, params);
        // Should not revert
    }

    function testRevert_CanTransfer_GloballyBlocked() public {
        address[] memory identitiesToBlock = new address[](1);
        identitiesToBlock[0] = address(identity1);
        module.setGlobalBlockedIdentities(identitiesToBlock, true);

        bytes memory params = abi.encode(new address[](0));
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity globally blocked"
            )
        );
        module.canTransfer(address(smartToken), address(this), user1, 100, params);
    }

    function testRevert_CanTransfer_TokenBlocked() public {
        address[] memory additionalBlocked = new address[](1);
        additionalBlocked[0] = address(identity2);
        bytes memory params = abi.encode(additionalBlocked);

        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity blocked for token"
            )
        );
        module.canTransfer(address(smartToken), address(this), user2, 100, params);
    }

    function test_CanTransfer_AllowedAfterUnblocking() public {
        address[] memory identitiesToBlock = new address[](1);
        identitiesToBlock[0] = address(identity1);
        module.setGlobalBlockedIdentities(identitiesToBlock, true);

        bytes memory params = abi.encode(new address[](0));
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity globally blocked"
            )
        );
        module.canTransfer(address(smartToken), address(this), user1, 100, params);

        module.setGlobalBlockedIdentities(identitiesToBlock, false);
        module.canTransfer(address(smartToken), address(this), user1, 100, params);
        // Should not revert
    }

    function test_Integration_TokenTransfer_GloballyBlocked() public {
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

    function test_Integration_TokenTransfer_TokenBlocked() public {
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
