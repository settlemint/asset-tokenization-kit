// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ComplianceModuleTest } from "./ComplianceModuleTest.t.sol";
import { CountryAllowListComplianceModule } from "../../../contracts/smart/modules/CountryAllowListComplianceModule.sol";
import { TestConstants } from "../../Constants.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";

contract CountryAllowListComplianceModuleTest is ComplianceModuleTest {
    CountryAllowListComplianceModule internal module;

    function setUp() public override {
        super.setUp();
        module = new CountryAllowListComplianceModule(address(0));
        module.grantRole(GLOBAL_LIST_MANAGER_ROLE, address(this));
    }

    function test_InitialState() public virtual {
        assertEq(module.name(), "Country AllowList Compliance Module");
    }

    function test_SetGlobalAllowedCountries() public {
        uint16[] memory countriesToAllow = new uint16[](2);
        countriesToAllow[0] = TestConstants.COUNTRY_CODE_US;
        countriesToAllow[1] = TestConstants.COUNTRY_CODE_JP;

        module.setGlobalAllowedCountries(countriesToAllow, true);

        assertTrue(module.isGloballyAllowed(TestConstants.COUNTRY_CODE_US));
        assertTrue(module.isGloballyAllowed(TestConstants.COUNTRY_CODE_JP));

        uint16[] memory allowedCountries = module.getGlobalAllowedCountries();
        assertEq(allowedCountries.length, 2);
    }

    function test_CanTransfer_NoIdentity() public virtual {
        bytes memory params = abi.encode(new uint16[](0));
        module.canTransfer(address(smartToken), user1, user3, 100, params);
        // Should not revert, as country cannot be determined.
    }

    function testRevert_CanTransfer_NotAllowed() public {
        bytes memory params = abi.encode(new uint16[](0));
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country not in allowlist"
            )
        );
        module.canTransfer(address(smartToken), address(this), user1, 100, params);
    }

    function test_CanTransfer_GloballyAllowed() public {
        uint16[] memory countriesToAllow = new uint16[](1);
        countriesToAllow[0] = TestConstants.COUNTRY_CODE_US; // user1 is from US
        module.setGlobalAllowedCountries(countriesToAllow, true);

        bytes memory params = abi.encode(new uint16[](0));
        module.canTransfer(address(smartToken), address(this), user1, 100, params);
        // Should not revert
    }

    function test_CanTransfer_TokenAllowed() public virtual {
        uint16[] memory additionalAllowed = new uint16[](1);
        additionalAllowed[0] = TestConstants.COUNTRY_CODE_BE; // user2 is from Belgium
        bytes memory params = abi.encode(additionalAllowed);
        module.canTransfer(address(smartToken), address(this), user2, 100, params);
        // Should not revert
    }

    function test_Integration_TokenTransfer_Allowed() public {
        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), "");
        vm.stopPrank();

        uint16[] memory countriesToAllow = new uint16[](1);
        countriesToAllow[0] = TestConstants.COUNTRY_CODE_US; // user1
        module.setGlobalAllowedCountries(countriesToAllow, true);

        vm.prank(tokenIssuer);
        smartToken.mint(tokenIssuer, 1000);

        vm.prank(tokenIssuer);
        smartToken.transfer(user1, 100);
        // Should not revert
    }

    function testRevert_Integration_TokenTransfer_NotAllowed() public {
        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), abi.encode(new uint16[](0)));
        vm.stopPrank();

        vm.prank(tokenIssuer);
        smartToken.mint(tokenIssuer, 1000);

        vm.prank(tokenIssuer);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country not in allowlist"
            )
        );
        smartToken.transfer(user2, 100); // user2 is from Belgium, which is not in the allowlist
    }
}
