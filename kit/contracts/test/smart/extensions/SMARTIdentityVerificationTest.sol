// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";
// ISMARTIdentityRegistry is not directly used for adding claims here, but good for context.
// import { ISMARTIdentityRegistry } from "../../../contracts/smart/interface/ISMARTIdentityRegistry.sol";
import { SMARTIdentityVerificationComplianceModule } from
    "../../../contracts/smart/modules/SMARTIdentityVerificationComplianceModule.sol";
import { ATKTopics } from "../../../contracts/system/ATKTopics.sol"; // Import ATKTopics
import { TestConstants } from "../../Constants.sol"; // Keep if used, e.g. INITIAL_MINT_AMOUNT
import { SystemUtils } from "../../utils/SystemUtils.sol"; // Keep for systemUtils access
import { AbstractSMARTTest } from "./AbstractSMARTTest.sol";

abstract contract SMARTIdentityVerificationTest is AbstractSMARTTest {
    // Module-specific variables
    SMARTIdentityVerificationComplianceModule internal verificationModule;

    // Represents the default KYC & AML topics the module is configured with via AbstractSMARTTest
    uint256[] internal emptyRequiredClaimTopics;

    // Test constants for transfers
    uint256 internal constant TRANSFER_AMOUNT_1 = 10 ether;
    uint256 internal constant TRANSFER_AMOUNT_2 = 5 ether;

    // Internal setup function
    function _setUpIdentityVerification() internal {
        super.setUp(); // This calls _setupIdentities() which issues claims via ClaimUtils

        _setupDefaultCollateralClaim();

        verificationModule = systemUtils.identityVerificationModule(); // This is the already active module

        emptyRequiredClaimTopics = new uint256[](0);
    }

    // =====================================================================
    //                 IDENTITY VERIFICATION COMPLIANCE TESTS
    // =====================================================================

    function test_IdentityVerification_FullComplianceFlow_WithDefaultParams() public {
        _setUpIdentityVerification();
        // Module is already added with requiredKYCAndAMLTopics by default in AbstractSMARTTest setUp

        vm.startPrank(tokenIssuer);
        token.mint(clientBE, INITIAL_MINT_AMOUNT);
        token.mint(clientJP, INITIAL_MINT_AMOUNT);
        token.mint(clientUS, INITIAL_MINT_AMOUNT);
        vm.stopPrank();

        vm.prank(clientBE);
        token.transfer(clientJP, TRANSFER_AMOUNT_1);

        vm.prank(clientJP);
        token.transfer(clientUS, TRANSFER_AMOUNT_2);

        vm.prank(clientUS);
        token.transfer(clientBE, TRANSFER_AMOUNT_1 / 2);

        vm.startPrank(tokenIssuer);
        vm.expectRevert(SMARTIdentityVerificationComplianceModule.RecipientNotVerified.selector);
        token.mint(clientUnverified, INITIAL_MINT_AMOUNT);
        vm.stopPrank();

        assertEq(
            token.balanceOf(clientBE),
            INITIAL_MINT_AMOUNT - TRANSFER_AMOUNT_1 + (TRANSFER_AMOUNT_1 / 2),
            "BE balance incorrect"
        );
        assertEq(
            token.balanceOf(clientJP),
            INITIAL_MINT_AMOUNT + TRANSFER_AMOUNT_1 - TRANSFER_AMOUNT_2,
            "JP balance incorrect"
        );
        assertEq(
            token.balanceOf(clientUS),
            INITIAL_MINT_AMOUNT + TRANSFER_AMOUNT_2 - (TRANSFER_AMOUNT_1 / 2),
            "US balance incorrect"
        );
        assertEq(token.balanceOf(clientUnverified), 0, "Unverified client balance should be zero");
    }

    function test_IdentityVerification_TransferToPartiallyVerified_Reverts_WithDefaultParams() public {
        _setUpIdentityVerification();
        // Module is already added with requiredKYCAndAMLTopics by default

        vm.prank(tokenIssuer);
        token.mint(clientBE, INITIAL_MINT_AMOUNT);
        vm.stopPrank();

        vm.prank(clientBE);
        vm.expectRevert(SMARTIdentityVerificationComplianceModule.RecipientNotVerified.selector);
        token.transfer(clientUnverified, INITIAL_MINT_AMOUNT / 2);

        assertEq(token.balanceOf(clientBE), INITIAL_MINT_AMOUNT, "BE balance should be unchanged");
        assertEq(token.balanceOf(clientUnverified), 0, "Unverified client balance should remain zero");
    }

    function test_IdentityVerification_MintToPartiallyVerified_Reverts_WithDefaultParams() public {
        _setUpIdentityVerification();
        // Module is already added with requiredKYCAndAMLTopics by default

        vm.startPrank(tokenIssuer);
        vm.expectRevert(SMARTIdentityVerificationComplianceModule.RecipientNotVerified.selector);
        token.mint(clientUnverified, INITIAL_MINT_AMOUNT);
        vm.stopPrank();
        assertEq(token.balanceOf(clientUnverified), 0, "Unverified client balance should be zero after failed mint");
    }

    function test_IdentityVerification_OperationsWithNoClaimsRequiredByModule() public {
        _setUpIdentityVerification();

        // Update parameters for the existing module to require no claims for this test
        vm.prank(tokenIssuer); // Assuming tokenIssuer has role to set parameters
        token.setParametersForComplianceModule(address(verificationModule), abi.encode(emptyRequiredClaimTopics));

        // Store original parameters if we wanted to reset, but for isolated tests, this is fine.
        // bytes memory originalParams = abi.encode(requiredKYCAndAMLTopics);

        vm.startPrank(tokenIssuer);
        token.mint(clientBE, INITIAL_MINT_AMOUNT);
        token.mint(clientUS, INITIAL_MINT_AMOUNT);
        token.mint(clientUnverified, INITIAL_MINT_AMOUNT); // Should pass as no claims required by module for this test
        vm.stopPrank();

        vm.prank(clientBE);
        token.transfer(clientUS, TRANSFER_AMOUNT_1);

        vm.prank(clientUS);
        token.transfer(clientUnverified, TRANSFER_AMOUNT_1 / 2);

        assertEq(token.balanceOf(clientBE), INITIAL_MINT_AMOUNT - TRANSFER_AMOUNT_1, "BE balance incorrect");
        assertEq(
            token.balanceOf(clientUS),
            INITIAL_MINT_AMOUNT + TRANSFER_AMOUNT_1 - (TRANSFER_AMOUNT_1 / 2),
            "US balance incorrect"
        );
        assertEq(
            token.balanceOf(clientUnverified),
            INITIAL_MINT_AMOUNT + (TRANSFER_AMOUNT_1 / 2),
            "Unverified balance incorrect"
        );

        // Optional: Reset parameters if necessary for subsequent tests in a non-isolated environment
        // vm.prank(tokenIssuer);
        // token.setParametersForComplianceModule(address(verificationModule), originalParams);
    }
}
