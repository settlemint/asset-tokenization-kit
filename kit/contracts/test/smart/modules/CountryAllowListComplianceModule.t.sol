// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { AbstractComplianceModuleTest } from "./AbstractComplianceModuleTest.t.sol";
import {
    CountryAllowListComplianceModule
} from "../../../contracts/smart/modules/CountryAllowListComplianceModule.sol";
import { TestConstants } from "../../Constants.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";

contract CountryAllowListComplianceModuleTest is AbstractComplianceModuleTest {
    CountryAllowListComplianceModule internal module;

    function setUp() public override {
        super.setUp();
        module = new CountryAllowListComplianceModule(address(0));

        // Issue claims to users for country testing
        claimUtils.issueAllClaims(user1);
        claimUtils.issueAllClaims(user2);
    }

    function test_CountryAllowList_InitialState() public view {
        assertEq(module.name(), "Country AllowList Compliance Module");
        assertEq(module.typeId(), keccak256("CountryAllowListComplianceModule"));
    }

    function test_CountryAllowList_ValidateParameters_EmptyArray() public view {
        bytes memory params = abi.encode(new uint16[](0));
        module.validateParameters(params);
    }

    function test_CountryAllowList_ValidateParameters_WithCountries() public view {
        uint16[] memory allowedCountries = new uint16[](2);
        allowedCountries[0] = TestConstants.COUNTRY_CODE_US;
        allowedCountries[1] = TestConstants.COUNTRY_CODE_JP;
        bytes memory params = abi.encode(allowedCountries);
        module.validateParameters(params);
    }

    function test_CountryAllowList_RevertWhen_InvalidParameters() public {
        bytes memory invalidParams = abi.encode("invalid");
        vm.expectRevert();
        module.validateParameters(invalidParams);
    }

    function test_CountryAllowList_RevertWhen_NoIdentity() public {
        // A transfer to an address with no identity should revert.
        bytes memory params = abi.encode(new uint16[](0));
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity unknown")
        );
        module.canTransfer(address(smartToken), user1, user3, 100, params);
    }

    function test_CountryAllowList_RevertWhen_EmptyAllowListAndNoIdentity() public {
        // Empty allow list means no countries are allowed, and users without identity are also blocked
        bytes memory params = abi.encode(new uint16[](0));
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity unknown")
        );
        module.canTransfer(address(smartToken), tokenIssuer, user3, 100, params); // user3 has no identity
    }

    function test_CountryAllowList_RevertWhen_TransferToNotAllowedCountry() public {
        // user1 is from US, but US is not in the empty allow list
        bytes memory params = abi.encode(new uint16[](0));
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country not in allowlist"
            )
        );
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);
    }

    function test_CountryAllowList_CanTransfer_AllowedCountry() public view {
        // user1 is from US, allow US in the parameters
        uint16[] memory allowedCountries = new uint16[](1);
        allowedCountries[0] = TestConstants.COUNTRY_CODE_US;
        bytes memory params = abi.encode(allowedCountries);

        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);
    }

    function test_CountryAllowList_CanTransfer_MultipleAllowedCountries() public view {
        // Allow both US and Belgium
        uint16[] memory allowedCountries = new uint16[](2);
        allowedCountries[0] = TestConstants.COUNTRY_CODE_US; // user1
        allowedCountries[1] = TestConstants.COUNTRY_CODE_BE; // user2
        bytes memory params = abi.encode(allowedCountries);

        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);
        module.canTransfer(address(smartToken), tokenIssuer, user2, 100, params);
    }

    function test_CountryAllowList_RevertWhen_CountryNotInList() public {
        // Only allow Japan, but user1 is from US
        uint16[] memory allowedCountries = new uint16[](1);
        allowedCountries[0] = TestConstants.COUNTRY_CODE_JP;
        bytes memory params = abi.encode(allowedCountries);

        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country not in allowlist"
            )
        );
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);
    }

    function test_CountryAllowList_Integration_TokenTransfer() public {
        // Add module to token with only Belgium allowed
        uint16[] memory allowedCountries = new uint16[](1);
        allowedCountries[0] = TestConstants.COUNTRY_CODE_BE; // user2 is from Belgium
        bytes memory params = abi.encode(allowedCountries);

        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), params);
        smartToken.mint(tokenIssuer, 1000);
        vm.stopPrank();

        // Transfer to user1 (US) should fail
        vm.prank(tokenIssuer);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country not in allowlist"
            )
        );
        bool result = smartToken.transfer(user1, 100);
        result; // Explicitly unused - we expect this to revert

        // Transfer to user2 (Belgium) should succeed
        vm.prank(tokenIssuer);
        assertTrue(smartToken.transfer(user2, 100), "Transfer failed");
        assertEq(smartToken.balanceOf(user2), 100);

        // Transfer to user3 (no identity) should fail
        vm.prank(tokenIssuer);
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity unknown")
        );
        bool result2 = smartToken.transfer(user3, 100);
        result2; // Explicitly unused - we expect this to revert
    }

    function test_CountryAllowList_SupportsInterface() public view {
        assertTrue(module.supportsInterface(type(ISMARTComplianceModule).interfaceId));
    }

    function test_CountryAllowList_Lifecycle_Functions() public {
        bytes memory params = abi.encode(new uint16[](0));

        // These functions should not revert for stateless modules
        vm.startPrank(address(smartToken));
        module.transferred(address(smartToken), tokenIssuer, user1, 100, params);
        module.created(address(smartToken), user1, 100, params);
        module.destroyed(address(smartToken), user1, 100, params);
        vm.stopPrank();
    }
}
