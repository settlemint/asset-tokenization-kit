// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ComplianceModuleTest } from "./ComplianceModuleTest.t.sol";
import { IdentityAllowListComplianceModule } from
    "../../../contracts/smart/modules/IdentityAllowListComplianceModule.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";

contract IdentityAllowListComplianceModuleTest is ComplianceModuleTest {
    IdentityAllowListComplianceModule internal module;

    function setUp() public override {
        super.setUp();
        module = new IdentityAllowListComplianceModule(address(0));
        module.grantRole(GLOBAL_LIST_MANAGER_ROLE, address(this));
    }

    function test_InitialState() public virtual {
        assertEq(module.name(), "Identity AllowList Compliance Module");
    }

    function test_SetGlobalAllowedIdentities() public {
        address[] memory identitiesToAllow = new address[](2);
        identitiesToAllow[0] = address(identity1);
        identitiesToAllow[1] = address(identity2);

        module.setGlobalAllowedIdentities(identitiesToAllow, true);

        assertTrue(module.isGloballyAllowed(address(identity1)));
        assertTrue(module.isGloballyAllowed(address(identity2)));

        address[] memory allowedIdentities = module.getGlobalAllowedIdentities();
        assertEq(allowedIdentities.length, 2);
        assertEq(allowedIdentities[0], address(identity1));
        assertEq(allowedIdentities[1], address(identity2));
    }

    function test_UnsetGlobalAllowedIdentities() public {
        address[] memory identitiesToAllow = new address[](1);
        identitiesToAllow[0] = address(identity1);

        module.setGlobalAllowedIdentities(identitiesToAllow, true);
        assertTrue(module.isGloballyAllowed(address(identity1)));

        module.setGlobalAllowedIdentities(identitiesToAllow, false);
        assertFalse(module.isGloballyAllowed(address(identity1)));
    }

    function testFail_SetGlobalAllowedIdentities_NotAdmin() public {
        vm.prank(user1);
        address[] memory identitiesToAllow = new address[](1);
        identitiesToAllow[0] = address(identity1);
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("AccessControlUnauthorizedAccount(address,bytes32)")), user1, GLOBAL_LIST_MANAGER_ROLE
            )
        );
        module.setGlobalAllowedIdentities(identitiesToAllow, true);
    }

    function testRevert_CanTransfer_NoIdentity() public {
        bytes memory params = abi.encode(new address[](0));
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity unknown")
        );
        module.canTransfer(address(smartToken), user1, user3, 100, params);
    }

    function testRevert_CanTransfer_NotAllowed() public {
        bytes memory params = abi.encode(new address[](0));
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity not in allowlist"
            )
        );
        module.canTransfer(address(smartToken), address(this), user1, 100, params);
    }

    function test_CanTransfer_GloballyAllowed() public {
        address[] memory identitiesToAllow = new address[](1);
        identitiesToAllow[0] = address(identity1);
        module.setGlobalAllowedIdentities(identitiesToAllow, true);

        bytes memory params = abi.encode(new address[](0));
        module.canTransfer(address(smartToken), address(this), user1, 100, params);
        // Should not revert
    }

    function test_CanTransfer_TokenAllowed() public virtual {
        address[] memory additionalAllowed = new address[](1);
        additionalAllowed[0] = address(identity2);
        bytes memory params = abi.encode(additionalAllowed);

        module.canTransfer(address(smartToken), address(this), user2, 100, params);
        // Should not revert
    }

    function test_Integration_TokenTransfer_GloballyAllowed() public {
        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), "");
        vm.stopPrank();

        address[] memory identitiesToAllow = new address[](1);
        identitiesToAllow[0] = address(identity1);
        module.setGlobalAllowedIdentities(identitiesToAllow, true);

        vm.prank(tokenIssuer);
        smartToken.mint(tokenIssuer, 1000);

        vm.prank(tokenIssuer);
        smartToken.transfer(user1, 100);
    }

    function test_Integration_TokenTransfer_TokenAllowed() public {
        address[] memory additionalAllowed = new address[](1);
        additionalAllowed[0] = address(identity2);
        bytes memory params = abi.encode(additionalAllowed);

        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), params);
        vm.stopPrank();

        vm.prank(tokenIssuer);
        smartToken.mint(tokenIssuer, 1000);

        vm.prank(tokenIssuer);
        smartToken.transfer(user2, 100);
    }

    function testRevert_Integration_TokenTransfer_NotAllowed() public {
        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), abi.encode(new address[](0)));
        vm.stopPrank();

        vm.prank(tokenIssuer);
        smartToken.mint(tokenIssuer, 1000);

        vm.prank(tokenIssuer);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity not in allowlist"
            )
        );
        smartToken.transfer(user1, 100);
    }
}
