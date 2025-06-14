// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { AbstractComplianceModuleTest } from "./AbstractComplianceModuleTest.t.sol";
import { CountryBlockListComplianceModule } from "../../../contracts/smart/modules/CountryBlockListComplianceModule.sol";
import { TestConstants } from "../../Constants.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

contract CountryBlockListComplianceModuleTest is AbstractComplianceModuleTest {
    CountryBlockListComplianceModule internal module;

    function setUp() public override {
        super.setUp();
        module = new CountryBlockListComplianceModule(address(0));
        module.grantRole(module.GLOBAL_LIST_MANAGER_ROLE(), address(this));

        // Issue claims to users
        claimUtils.issueAllClaims(user1);
        claimUtils.issueAllClaims(user2);
    }

    function test_CountryBlockList_InitialState() public view {
        assertEq(module.name(), "Country BlockList Compliance Module");
    }

    function test_CountryBlockList_SetGlobalBlockedCountries() public {
        uint16[] memory countriesToBlock = new uint16[](2);
        countriesToBlock[0] = TestConstants.COUNTRY_CODE_US;
        countriesToBlock[1] = TestConstants.COUNTRY_CODE_JP;

        module.setGlobalBlockedCountries(countriesToBlock, true);

        assertTrue(module.isGloballyBlocked(TestConstants.COUNTRY_CODE_US));
        assertTrue(module.isGloballyBlocked(TestConstants.COUNTRY_CODE_JP));

        module.setGlobalBlockedCountries(countriesToBlock, false);

        assertFalse(module.isGloballyBlocked(TestConstants.COUNTRY_CODE_US));
        assertFalse(module.isGloballyBlocked(TestConstants.COUNTRY_CODE_JP));
    }

    function test_CountryBlockList_FailWhen_SetGlobalBlockedCountriesFromNonAdmin() public {
        vm.startPrank(user1);
        uint16[] memory countriesToBlock = new uint16[](1);
        countriesToBlock[0] = TestConstants.COUNTRY_CODE_US;
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user1, module.GLOBAL_LIST_MANAGER_ROLE()
            )
        );
        module.setGlobalBlockedCountries(countriesToBlock, true);
        vm.stopPrank();
    }

    function test_CountryBlockList_CanTransfer_NoIdentity() public view {
        module.canTransfer(address(smartToken), user1, user3, 100, abi.encode(new uint16[](0)));
    }

    function test_CountryBlockList_CanTransfer_NotBlocked() public view {
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, abi.encode(new uint16[](0)));
    }

    function test_CountryBlockList_RevertWhen_TransferToGloballyBlockedCountry() public {
        uint16[] memory countriesToBlock = new uint16[](1);
        countriesToBlock[0] = TestConstants.COUNTRY_CODE_US; // user1 is from US
        module.setGlobalBlockedCountries(countriesToBlock, true);

        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country globally blocked"
            )
        );
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, abi.encode(new uint16[](0)));
    }

    function test_CountryBlockList_RevertWhen_TransferToTokenBlockedCountry() public {
        uint16[] memory additionalBlocked = new uint16[](1);
        additionalBlocked[0] = TestConstants.COUNTRY_CODE_BE; // user2 is from Belgium
        bytes memory params = abi.encode(additionalBlocked);

        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country blocked for token"
            )
        );
        module.canTransfer(address(smartToken), tokenIssuer, user2, 100, params);
    }

    function test_CountryBlockList_Integration_TokenTransfer_GloballyBlocked() public {
        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), abi.encode(new uint16[](0)));
        vm.stopPrank();

        uint16[] memory countriesToBlock = new uint16[](1);
        countriesToBlock[0] = TestConstants.COUNTRY_CODE_US; // user1
        module.setGlobalBlockedCountries(countriesToBlock, true);

        vm.prank(tokenIssuer);
        smartToken.mint(tokenIssuer, 1000);

        vm.prank(tokenIssuer);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country globally blocked"
            )
        );
        smartToken.transfer(user1, 100);
    }
}
