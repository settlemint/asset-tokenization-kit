// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { AbstractComplianceModuleTest } from "./AbstractComplianceModuleTest.t.sol";
import { CountryAllowListComplianceModule } from "../../../contracts/smart/modules/CountryAllowListComplianceModule.sol";
import { TestConstants } from "../../Constants.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

contract CountryAllowListComplianceModuleTest is AbstractComplianceModuleTest {
    CountryAllowListComplianceModule internal module;

    function setUp() public override {
        super.setUp();
        module = new CountryAllowListComplianceModule(address(0));
        module.grantRole(module.GLOBAL_LIST_MANAGER_ROLE(), address(this));

        // Issue claims to users
        claimUtils.issueAllClaims(user1);
        claimUtils.issueAllClaims(user2);
    }

    function test_CountryAllowList_InitialState() public view {
        assertEq(module.name(), "Country AllowList Compliance Module");
    }

    function test_CountryAllowList_SetGlobalAllowedCountries() public {
        uint16[] memory countriesToAllow = new uint16[](2);
        countriesToAllow[0] = TestConstants.COUNTRY_CODE_US;
        countriesToAllow[1] = TestConstants.COUNTRY_CODE_JP;

        module.setGlobalAllowedCountries(countriesToAllow, true);

        assertTrue(module.isGloballyAllowed(TestConstants.COUNTRY_CODE_US));
        assertTrue(module.isGloballyAllowed(TestConstants.COUNTRY_CODE_JP));

        module.setGlobalAllowedCountries(countriesToAllow, false);

        assertFalse(module.isGloballyAllowed(TestConstants.COUNTRY_CODE_US));
        assertFalse(module.isGloballyAllowed(TestConstants.COUNTRY_CODE_JP));
    }

    function test_CountryAllowList_CanTransfer_NoIdentity() public view {
        // A transfer to an address with no identity should be allowed by this module.
        module.canTransfer(address(smartToken), user1, user3, 100, abi.encode(new uint16[](0)));
    }

    function test_CountryAllowList_RevertWhen_TransferToNotAllowedCountry() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country not in allowlist"
            )
        );
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, abi.encode(new uint16[](0)));
    }

    function test_CountryAllowList_CanTransfer_GloballyAllowed() public {
        uint16[] memory countriesToAllow = new uint16[](1);
        countriesToAllow[0] = TestConstants.COUNTRY_CODE_US; // user1 is from US
        module.setGlobalAllowedCountries(countriesToAllow, true);

        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, abi.encode(new uint16[](0)));
    }

    function test_CountryAllowList_CanTransfer_TokenAllowed() public view {
        uint16[] memory additionalAllowed = new uint16[](1);
        additionalAllowed[0] = TestConstants.COUNTRY_CODE_BE; // user2 is from Belgium
        bytes memory params = abi.encode(additionalAllowed);
        module.canTransfer(address(smartToken), tokenIssuer, user2, 100, params);
    }

    function test_CountryAllowList_RevertWhen_Integration_TokenTransferToNotAllowed() public {
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

    function test_CountryAllowList_FailWhen_SetGlobalAllowedCountriesFromNonAdmin() public {
        vm.startPrank(user1);
        uint16[] memory countriesToAllow = new uint16[](1);
        countriesToAllow[0] = TestConstants.COUNTRY_CODE_US;
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user1, module.GLOBAL_LIST_MANAGER_ROLE()
            )
        );
        module.setGlobalAllowedCountries(countriesToAllow, true);
        vm.stopPrank();
    }
}
