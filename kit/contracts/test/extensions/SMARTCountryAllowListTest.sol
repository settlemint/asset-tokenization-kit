// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Adjust import path assuming SMARTInfrastructureSetup will be in ./utils/
import { Test } from "forge-std/Test.sol";
import { ISMARTComplianceModule } from "../../contracts/interface/ISMARTComplianceModule.sol";

import { TestConstants } from "../Constants.sol";

import { SystemUtils } from "../utils/SystemUtils.sol";
import { AbstractSMARTTest } from "./AbstractSMARTTest.sol";

import { CountryAllowListComplianceModule } from
    "../../contracts/system/compliance/modules/CountryAllowListComplianceModule.sol";

abstract contract SMARTCountryAllowListTest is AbstractSMARTTest {
    // Module-specific variables
    CountryAllowListComplianceModule public allowModule;

    // Test constants
    uint256 private constant TRANSFER_AMOUNT_BE_TO_JP = 10 ether;
    uint256 private constant TRANSFER_AMOUNT_JP_TO_BE = 5 ether;

    // Internal setup function, follows pattern of other test classes
    function _setUpCountryAllowList() internal {
        super.setUp();

        // Setup token with default collateral claim
        _setupDefaultCollateralClaim();
        // Don't call _mintInitialBalances() here since we're minting in the test

        // Setup CountryAllowListComplianceModule
        allowModule = systemUtils.countryAllowListComplianceModule();

        // Set allowed countries in the module (globally) - using allowedCountries from SMARTTest
        vm.prank(platformAdmin);
        allowModule.setGlobalAllowedCountries(allowedCountries, true);
    }

    // =====================================================================
    //                      COUNTRY COMPLIANCE TESTS
    // =====================================================================

    function test_CountryAllowListCompliance() public {
        // Call setup explicitly
        _setUpCountryAllowList();

        // Add the CountryAllowListComplianceModule to the token
        // Use tokenIssuer since they have COMPLIANCE_ADMIN_ROLE
        vm.prank(tokenIssuer);
        token.addComplianceModule(
            address(allowModule),
            abi.encode(allowedCountries) // Use allowedCountries from SMARTTest
        );

        // Mint tokens only to allowed countries (BE and JP)
        vm.startPrank(tokenIssuer);
        token.mint(clientBE, INITIAL_MINT_AMOUNT);
        token.mint(clientJP, INITIAL_MINT_AMOUNT);
        vm.stopPrank();

        // Test transfer between allowed countries (BE to JP)
        vm.prank(clientBE);
        token.transfer(clientJP, TRANSFER_AMOUNT_BE_TO_JP);

        // Test transfer between allowed countries (JP to BE)
        vm.prank(clientJP);
        token.transfer(clientBE, TRANSFER_AMOUNT_JP_TO_BE);

        // Try to mint to a client from US (not allowed country) - should fail
        vm.startPrank(tokenIssuer);
        vm.expectRevert(); // Should revert as US is not in the allowed countries list
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

    function test_CountryAllowList_TransferToDisallowedCountry_Reverts() public {
        // Call setup explicitly
        _setUpCountryAllowList();

        // Add the CountryAllowListComplianceModule to the token
        vm.startPrank(tokenIssuer);
        token.addComplianceModule(address(allowModule), abi.encode(allowedCountries));

        // Mint tokens to an allowed country
        token.mint(clientBE, INITIAL_MINT_AMOUNT);
        vm.stopPrank();
        // Try to transfer to a client from US (not allowed country) - should fail
        vm.prank(clientBE);
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTComplianceModule.ComplianceCheckFailed.selector, "Receiver country not in allowlist"
            )
        );
        token.transfer(clientUS, INITIAL_MINT_AMOUNT);

        // Verify balances remain unchanged
        assertEq(token.balanceOf(clientBE), INITIAL_MINT_AMOUNT, "BE balance should be unchanged");
        assertEq(token.balanceOf(clientUS), 0, "US balance should remain zero");
    }
}
