// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { AbstractComplianceModuleTest } from "./AbstractComplianceModuleTest.t.sol";
import {
    CountryBlockListComplianceModule
} from "../../../contracts/smart/modules/CountryBlockListComplianceModule.sol";
import { TestConstants } from "../../Constants.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";

contract CountryBlockListComplianceModuleTest is AbstractComplianceModuleTest {
    CountryBlockListComplianceModule internal module;

    function setUp() public override {
        super.setUp();
        module = new CountryBlockListComplianceModule(address(0));

        // Issue claims to users for country testing
        claimUtils.issueAllClaims(user1);
        claimUtils.issueAllClaims(user2);
    }

    function test_CountryBlockList_InitialState() public view {
        assertEq(module.name(), "Country BlockList Compliance Module");
        assertEq(module.typeId(), keccak256("CountryBlockListComplianceModule"));
    }

    function test_CountryBlockList_ValidateParameters_EmptyArray() public view {
        bytes memory params = abi.encode(new uint16[](0));
        module.validateParameters(params);
    }

    function test_CountryBlockList_ValidateParameters_WithCountries() public view {
        uint16[] memory blockedCountries = new uint16[](2);
        blockedCountries[0] = TestConstants.COUNTRY_CODE_US;
        blockedCountries[1] = TestConstants.COUNTRY_CODE_JP;
        bytes memory params = abi.encode(blockedCountries);
        module.validateParameters(params);
    }

    function test_CountryBlockList_RevertWhen_InvalidParameters() public {
        bytes memory invalidParams = abi.encode("invalid");
        vm.expectRevert();
        module.validateParameters(invalidParams);
    }

    function test_CountryBlockList_RevertWhen_NoIdentity() public {
        // A transfer to an address with no identity should revert.
        bytes memory params = abi.encode(new uint16[](0));
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity unknown")
        );
        module.canTransfer(address(smartToken), user1, user3, 100, params);
    }

    function test_CountryBlockList_CanTransfer_EmptyBlockList() public view {
        // Empty block list means no countries are blocked for users with identity
        bytes memory params = abi.encode(new uint16[](0));
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);
        module.canTransfer(address(smartToken), tokenIssuer, user2, 100, params);
    }

    function test_CountryBlockList_RevertWhen_EmptyBlockListButNoIdentity() public {
        // Even with empty block list, users without identity are blocked
        bytes memory params = abi.encode(new uint16[](0));
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver identity unknown")
        );
        module.canTransfer(address(smartToken), tokenIssuer, user3, 100, params);
    }

    function test_CountryBlockList_CanTransfer_NotBlockedCountry() public view {
        // Block Japan, but users are from US and Belgium
        uint16[] memory blockedCountries = new uint16[](1);
        blockedCountries[0] = TestConstants.COUNTRY_CODE_JP;
        bytes memory params = abi.encode(blockedCountries);

        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params); // US user
        module.canTransfer(address(smartToken), tokenIssuer, user2, 100, params); // Belgium user
    }

    function test_CountryBlockList_RevertWhen_TransferToBlockedCountry() public {
        // Block US, user1 is from US
        uint16[] memory blockedCountries = new uint16[](1);
        blockedCountries[0] = TestConstants.COUNTRY_CODE_US;
        bytes memory params = abi.encode(blockedCountries);

        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country blocked")
        );
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);
    }

    function test_CountryBlockList_RevertWhen_TransferToSecondBlockedCountry() public {
        // Block both US and Belgium
        uint16[] memory blockedCountries = new uint16[](2);
        blockedCountries[0] = TestConstants.COUNTRY_CODE_US; // user1
        blockedCountries[1] = TestConstants.COUNTRY_CODE_BE; // user2
        bytes memory params = abi.encode(blockedCountries);

        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country blocked")
        );
        module.canTransfer(address(smartToken), tokenIssuer, user1, 100, params);

        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country blocked")
        );
        module.canTransfer(address(smartToken), tokenIssuer, user2, 100, params);
    }

    function test_CountryBlockList_Integration_TokenTransfer() public {
        // Add module to token with US blocked
        uint16[] memory blockedCountries = new uint16[](1);
        blockedCountries[0] = TestConstants.COUNTRY_CODE_US; // user1 is from US
        bytes memory params = abi.encode(blockedCountries);

        vm.startPrank(tokenIssuer);
        smartToken.addComplianceModule(address(module), params);
        smartToken.mint(tokenIssuer, 1000);
        vm.stopPrank();

        // Transfer to user1 (US) should fail
        vm.prank(tokenIssuer);
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country blocked")
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

    function test_CountryBlockList_SupportsInterface() public view {
        assertTrue(module.supportsInterface(type(ISMARTComplianceModule).interfaceId));
    }

    function test_CountryBlockList_Lifecycle_Functions() public {
        bytes memory params = abi.encode(new uint16[](0));

        // These functions should not revert for stateless modules
        vm.startPrank(address(smartToken));
        module.transferred(address(smartToken), tokenIssuer, user1, 100, params);
        module.created(address(smartToken), user1, 100, params);
        module.destroyed(address(smartToken), user1, 100, params);
        vm.stopPrank();
    }
}
