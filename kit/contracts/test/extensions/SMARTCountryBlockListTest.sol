// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { ISMARTComplianceModule } from "../../contracts/interface/ISMARTComplianceModule.sol";

import { TestConstants } from "../Constants.sol";

import { SystemUtils } from "../utils/SystemUtils.sol";
import { AbstractSMARTTest } from "./AbstractSMARTTest.sol";

import { CountryBlockListComplianceModule } from
    "../../contracts/system/compliance/modules/CountryBlockListComplianceModule.sol";

abstract contract SMARTCountryBlockListTest is AbstractSMARTTest {
    // Module-specific variables
    CountryBlockListComplianceModule public blockModule;
    uint16[] public blockedCountries;

    // Test constants
    uint256 private constant TRANSFER_AMOUNT_BE_TO_JP = 10 ether;
    uint256 private constant TRANSFER_AMOUNT_JP_TO_BE = 5 ether;
    uint256 private constant TRANSFER_AMOUNT_TO_BLOCKED = 10 ether;

    // Internal setup function, follows pattern of other test classes
    function _setUpCountryBlockList() internal {
        super.setUp();

        // Setup token with default collateral claim
        _setupDefaultCollateralClaim();
        // Don't call _mintInitialBalances() here since we're minting in the test

        // Setup CountryBlockListComplianceModule
        blockModule = systemUtils.countryBlockListComplianceModule();

        // Configure blocked countries (US only)
        blockedCountries = new uint16[](1);
        blockedCountries[0] = TestConstants.COUNTRY_CODE_US;

        // Set blocked countries in the module (globally)
        vm.prank(platformAdmin);
        blockModule.setGlobalBlockedCountries(blockedCountries, true);
    }

    // =====================================================================
    //                      COUNTRY COMPLIANCE TESTS
    // =====================================================================

    function test_CountryBlockListCompliance() public {
        // Call setup explicitly
        _setUpCountryBlockList();

        // Add the CountryBlockListComplianceModule to the token
        // Use tokenIssuer since they have COMPLIANCE_ADMIN_ROLE
        vm.prank(tokenIssuer);
        token.addComplianceModule(
            address(blockModule),
            abi.encode(blockedCountries) // Pass US directly in the params
        );

        // Mint tokens to non-blocked countries (BE and JP)
        vm.startPrank(tokenIssuer);
        token.mint(clientBE, INITIAL_MINT_AMOUNT);
        token.mint(clientJP, INITIAL_MINT_AMOUNT);
        vm.stopPrank();

        // Test transfer between non-blocked countries (BE to JP)
        vm.prank(clientBE);
        token.transfer(clientJP, TRANSFER_AMOUNT_BE_TO_JP);

        // Test transfer between non-blocked countries (JP to BE)
        vm.prank(clientJP);
        token.transfer(clientBE, TRANSFER_AMOUNT_JP_TO_BE);

        // Try to mint to a client from US (blocked country) - should fail
        vm.startPrank(tokenIssuer);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country globally blocked"
            )
        );
        token.mint(clientUS, INITIAL_MINT_AMOUNT);
        vm.stopPrank();

        // Verify balances to confirm transfers worked as expected
        assertEq(
            token.balanceOf(clientBE),
            INITIAL_MINT_AMOUNT - TRANSFER_AMOUNT_BE_TO_JP + TRANSFER_AMOUNT_JP_TO_BE,
            "BE balance incorrect"
        );
        assertEq(
            token.balanceOf(clientJP),
            INITIAL_MINT_AMOUNT + TRANSFER_AMOUNT_BE_TO_JP - TRANSFER_AMOUNT_JP_TO_BE,
            "JP balance incorrect"
        );
        assertEq(token.balanceOf(clientUS), 0, "US balance should be zero");
    }

    function test_CountryBlockList_TransferToBlockedCountry_Reverts() public {
        // Call setup explicitly
        _setUpCountryBlockList();

        // Add the CountryBlockListComplianceModule to the token
        vm.startPrank(tokenIssuer);
        token.addComplianceModule(address(blockModule), abi.encode(blockedCountries));

        // Mint tokens to a non-blocked country
        token.mint(clientBE, INITIAL_MINT_AMOUNT);
        vm.stopPrank();

        // Try to transfer to a client from US (blocked country) - should fail
        vm.prank(clientBE);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country globally blocked"
            )
        );
        token.transfer(clientUS, INITIAL_MINT_AMOUNT);

        // Verify balances remain unchanged
        assertEq(token.balanceOf(clientBE), INITIAL_MINT_AMOUNT, "BE balance should be unchanged");
        assertEq(token.balanceOf(clientUS), 0, "US balance should remain zero");
    }

    function test_CountryBlockList_TokenSpecificBlocking() public {
        // Call setup explicitly
        _setUpCountryBlockList();

        // Create a token-specific block list that includes JP (different from global)
        uint16[] memory tokenSpecificBlockList = new uint16[](1);
        tokenSpecificBlockList[0] = TestConstants.COUNTRY_CODE_JP;

        // Add the CountryBlockListComplianceModule to the token with JP-specific blocking
        vm.startPrank(tokenIssuer);
        token.addComplianceModule(address(blockModule), abi.encode(tokenSpecificBlockList));

        // Mint tokens to a non-blocked country
        token.mint(clientBE, INITIAL_MINT_AMOUNT);
        vm.stopPrank();

        // Transfer to US should fail (globally blocked)
        vm.prank(clientBE);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country globally blocked"
            )
        );
        token.transfer(clientUS, INITIAL_MINT_AMOUNT);

        // Transfer to JP should fail (token-specifically blocked)
        vm.prank(clientBE);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country blocked for token"
            )
        );
        token.transfer(clientJP, TRANSFER_AMOUNT_TO_BLOCKED);

        // Verify balances remain unchanged
        assertEq(token.balanceOf(clientBE), INITIAL_MINT_AMOUNT, "BE balance should be unchanged");
        assertEq(token.balanceOf(clientJP), 0, "JP balance should remain zero");
        assertEq(token.balanceOf(clientUS), 0, "US balance should remain zero");
    }
}
