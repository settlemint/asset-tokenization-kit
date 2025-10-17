// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { AbstractSMARTTest } from "./AbstractSMARTTest.sol";
import { IERC20Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { ISMARTComplianceModule } from "../../../contracts/smart/interface/ISMARTComplianceModule.sol";
import { ISMART } from "../../../contracts/smart/interface/ISMART.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { MockedERC20Token } from "../../utils/mocks/MockedERC20Token.sol";
import { SMARTToken } from "../examples/SMARTToken.sol";
import { TestConstants } from "../../Constants.sol";
import {
    SMARTIdentityVerificationComplianceModule
} from "../../../contracts/smart/modules/SMARTIdentityVerificationComplianceModule.sol";

abstract contract SMARTCoreTest is AbstractSMARTTest {
    using SafeERC20 for IERC20;

    MockedERC20Token internal mockForeignToken;
    uint256 internal constant FOREIGN_TOKEN_SENT_AMOUNT = 500 ether;

    function _setUpCoreTest() internal virtual /* override */  {
        super.setUp();
        // Ensure token has default collateral set up for core tests
        _setupDefaultCollateralClaim();

        // Deploy and setup mock foreign ERC20 token
        mockForeignToken = new MockedERC20Token("Mock Foreign", "MFT", 6);
        vm.prank(tokenIssuer);
        mockForeignToken.mint(tokenIssuer, 1_000_000 ether);

        // Send some foreign tokens to the main token contract address
        vm.prank(tokenIssuer);
        IERC20(address(mockForeignToken)).safeTransfer(address(token), FOREIGN_TOKEN_SENT_AMOUNT);
        assertEq(mockForeignToken.balanceOf(address(token)), FOREIGN_TOKEN_SENT_AMOUNT, "Foreign token setup failed");
    }

    function test_Core_Mint_Success() public {
        _setUpCoreTest();
        // manual mint, because _mintInitialBalances resets the compliance counter
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, INITIAL_MINT_AMOUNT);
        tokenUtils.mintToken(address(token), tokenIssuer, clientJP, INITIAL_MINT_AMOUNT);
        tokenUtils.mintToken(address(token), tokenIssuer, clientUS, INITIAL_MINT_AMOUNT);

        assertEq(token.balanceOf(clientBE), INITIAL_MINT_AMOUNT, "Initial mint failed");
        assertEq(mockComplianceModule.createdCallCount(), 3, "Mock created hook count incorrect after initial mints");
    }

    function test_Core_Mint_AccessControl_Reverts() public {
        _setUpCoreTest();
        vm.startPrank(clientBE); // Non-owner
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                clientBE,
                SMARTToken(address(token)).MINTER_ROLE()
            )
        );
        token.mint(clientBE, 100 ether);
        vm.stopPrank();
    }

    function test_Core_Transfer_Success() public {
        _setUpCoreTest();
        _mintInitialBalances();
        uint256 transferAmount = 100 ether;
        uint256 balBESnap = token.balanceOf(clientBE);
        uint256 balJPSnap = token.balanceOf(clientJP);
        uint256 hookCountSnap = mockComplianceModule.transferredCallCount();

        tokenUtils.transferToken(address(token), clientBE, clientJP, transferAmount);

        assertEq(token.balanceOf(clientJP), balJPSnap + transferAmount, "Receiver balance wrong");
        assertEq(token.balanceOf(clientBE), balBESnap - transferAmount, "Sender balance wrong");
        assertEq(mockComplianceModule.transferredCallCount(), hookCountSnap + 1, "Hook count wrong");
    }

    function test_Core_Transfer_InsufficientBalance_Reverts() public {
        _setUpCoreTest();
        _mintInitialBalances();
        uint256 senderBalance = token.balanceOf(clientBE);
        uint256 transferAmount = senderBalance + 1 ether;

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientBalance.selector, clientBE, senderBalance, transferAmount
            )
        );
        tokenUtils.transferToken(address(token), clientBE, clientJP, transferAmount);
    }

    function test_Core_Transfer_ToUnverified_Reverts() public {
        _setUpCoreTest();
        _mintInitialBalances();
        uint256 transferAmount = 100 ether;
        uint256 hookCountSnap = mockComplianceModule.transferredCallCount();

        vm.expectRevert(abi.encodeWithSelector(SMARTIdentityVerificationComplianceModule.RecipientNotVerified.selector));
        tokenUtils.transferToken(address(token), clientBE, clientUnverified, transferAmount);
        assertEq(mockComplianceModule.transferredCallCount(), hookCountSnap, "Hook count changed on verification fail");
    }

    function test_Core_Transfer_MockComplianceBlocked_Reverts() public {
        _setUpCoreTest();
        _mintInitialBalances();
        uint256 transferAmount = 100 ether;
        uint256 balBESnap = token.balanceOf(clientBE);
        uint256 balUSSnap = token.balanceOf(clientUS);

        mockComplianceModule.setNextTransferShouldFail(true);
        vm.expectRevert(
            abi.encodeWithSelector(ISMARTComplianceModule.ComplianceCheckFailed.selector, "Mocked compliance failure")
        );
        tokenUtils.transferToken(address(token), clientBE, clientUS, transferAmount);
        mockComplianceModule.setNextTransferShouldFail(false);

        assertEq(token.balanceOf(clientUS), balUSSnap, "Receiver balance changed on blocked transfer");
        assertEq(token.balanceOf(clientBE), balBESnap, "Sender balance changed on blocked transfer");
    }

    // ==========================================
    //          recoverERC20 Tests
    // ==========================================

    function test_Core_RecoverERC20_Success() public {
        _setUpCoreTest();
        uint256 amountToRecover = FOREIGN_TOKEN_SENT_AMOUNT / 2;
        address recipient = clientBE;
        uint256 initialContractBalance = mockForeignToken.balanceOf(address(token));
        uint256 initialRecipientBalance = mockForeignToken.balanceOf(recipient);

        tokenUtils.recoverERC20Token(address(token), tokenIssuer, address(mockForeignToken), recipient, amountToRecover);

        assertEq(
            mockForeignToken.balanceOf(address(token)),
            initialContractBalance - amountToRecover,
            "Contract balance after recovery incorrect"
        );
        assertEq(
            mockForeignToken.balanceOf(recipient),
            initialRecipientBalance + amountToRecover,
            "Recipient balance after recovery incorrect"
        );
    }

    function test_Core_RecoverERC20_Unauthorized_Reverts() public {
        _setUpCoreTest();
        uint256 amountToRecover = 100 ether;

        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                clientJP,
                SMARTToken(address(token)).TOKEN_ADMIN_ROLE()
            )
        );
        tokenUtils.recoverERC20Token(address(token), clientJP, address(mockForeignToken), clientBE, amountToRecover);
    }

    function test_Core_RecoverERC20_RecoverSelf_Reverts() public {
        _setUpCoreTest();
        uint256 amountToRecover = 100 ether;

        vm.expectRevert(abi.encodeWithSelector(ISMART.CannotRecoverSelf.selector));
        tokenUtils.recoverERC20Token(address(token), tokenIssuer, address(token), clientBE, amountToRecover); // Attempt
            // to recover self
    }

    function test_Core_RecoverERC20_ZeroAddressToken_Reverts() public {
        _setUpCoreTest();
        uint256 amountToRecover = 100 ether;

        vm.expectRevert(abi.encodeWithSelector(ISMART.ZeroAddressNotAllowed.selector));
        tokenUtils.recoverERC20Token(address(token), tokenIssuer, address(0), clientBE, amountToRecover);
    }

    function test_Core_RecoverERC20_ZeroAddressRecipient_Reverts() public {
        _setUpCoreTest();
        uint256 amountToRecover = 100 ether;

        vm.expectRevert(abi.encodeWithSelector(ISMART.ZeroAddressNotAllowed.selector));
        tokenUtils.recoverERC20Token(
            address(token), tokenIssuer, address(mockForeignToken), address(0), amountToRecover
        );
    }

    function test_Core_RecoverERC20_InsufficientBalance_Reverts() public {
        _setUpCoreTest();
        uint256 amountToRecover = FOREIGN_TOKEN_SENT_AMOUNT + 1 ether; // More than available

        vm.expectRevert(abi.encodeWithSelector(ISMART.InsufficientTokenBalance.selector));
        tokenUtils.recoverERC20Token(address(token), tokenIssuer, address(mockForeignToken), clientBE, amountToRecover);
    }

    function test_SupportsInterface_CoreSMART() public {
        _setUpCoreTest(); // Use the specific setup for core tests
        assertTrue(
            IERC165(address(token)).supportsInterface(type(ISMART).interfaceId),
            "Token does not support ISMART interface"
        );
    }

    // ==========================================
    //          recoverTokens Tests
    // ==========================================

    function test_Core_RecoverTokens_Success() public {
        _setUpCoreTest();
        _mintInitialBalances();

        address lostWallet = clientBE;
        address newWallet = makeAddr("NewWalletForBE");
        uint256 initialBalance = token.balanceOf(lostWallet);

        // Create identity for new wallet but don't mark the lost wallet as lost
        address newIdentity = identityUtils.createIdentity(newWallet);
        claimUtils.issueAllClaims(newWallet);

        // Mark the old wallet as lost and recover to new wallet
        identityUtils.recoverIdentity(lostWallet, newWallet, newIdentity);

        // Verify the wallet is marked as lost
        assertTrue(systemUtils.identityRegistry().isWalletLost(lostWallet));

        // Perform the token recovery
        vm.expectEmit(true, true, true, true);
        emit ISMART.TokensRecovered(newWallet, lostWallet, newWallet, initialBalance);

        vm.prank(newWallet);
        token.recoverTokens(lostWallet);

        // Verify balances after recovery
        assertEq(token.balanceOf(lostWallet), 0, "Lost wallet should have zero balance");
        assertEq(token.balanceOf(newWallet), initialBalance, "New wallet should have recovered balance");
    }

    function test_Core_RecoverTokens_ZeroAddressLostWallet_Reverts() public {
        _setUpCoreTest();
        _mintInitialBalances();

        vm.expectRevert(abi.encodeWithSelector(ISMART.ZeroAddressNotAllowed.selector));
        vm.prank(clientBE);
        token.recoverTokens(address(0));
    }

    function test_Core_RecoverTokens_CannotRecoverSelf_Reverts() public {
        _setUpCoreTest();
        _mintInitialBalances();

        vm.expectRevert(abi.encodeWithSelector(ISMART.CannotRecoverSelf.selector));
        vm.prank(clientBE);
        token.recoverTokens(address(token));
    }

    function test_Core_RecoverTokens_NoTokensToRecover_Reverts() public {
        _setUpCoreTest();
        _mintInitialBalances();

        address lostWallet = clientBE;
        address newWallet = makeAddr("NewWalletForBE");

        // Burn all tokens from the lost wallet
        uint256 currentBalance = token.balanceOf(lostWallet);
        tokenUtils.burnToken(address(token), tokenIssuer, lostWallet, currentBalance);
        assertEq(token.balanceOf(lostWallet), 0, "Lost wallet should have zero balance");

        // Create identity for new wallet but don't mark the lost wallet as lost
        address newIdentity = identityUtils.createIdentity(newWallet);
        claimUtils.issueAllClaims(newWallet);

        identityUtils.recoverIdentity(lostWallet, newWallet, newIdentity);

        vm.expectRevert(abi.encodeWithSelector(ISMART.NoTokensToRecover.selector));
        vm.prank(newWallet);
        token.recoverTokens(lostWallet);
    }

    function test_Core_RecoverTokens_InvalidLostWallet_Reverts() public {
        _setUpCoreTest();
        _mintInitialBalances();

        address lostWallet = clientBE;
        address newWallet = makeAddr("NewWalletForBE");

        // Create identity for new wallet but don't mark the lost wallet as lost
        identityUtils.createIdentity(newWallet);
        claimUtils.issueAllClaims(newWallet);

        // Try to recover without marking the wallet as lost in identity registry
        vm.expectRevert(abi.encodeWithSelector(ISMART.InvalidLostWallet.selector));
        vm.prank(newWallet);
        token.recoverTokens(lostWallet);
    }

    function test_Core_RecoverTokens_WalletNotLostForThisIdentity_Reverts() public {
        _setUpCoreTest();
        _mintInitialBalances();

        address lostWallet = clientBE;
        address newWallet = makeAddr("NewWalletForBE");
        address differentWallet = makeAddr("DifferentWallet");

        // Create identities for both wallets
        address newIdentity = identityUtils.createClientIdentity(newWallet, TestConstants.COUNTRY_CODE_BE);
        claimUtils.issueAllClaims(newWallet);

        identityUtils.createClientIdentity(differentWallet, TestConstants.COUNTRY_CODE_JP);
        claimUtils.issueAllClaims(differentWallet);

        // Mark a different wallet as lost for a different identity
        identityUtils.recoverIdentity(differentWallet, newWallet, newIdentity);

        // Try to recover the BE wallet's tokens (which is not marked as lost for any identity)
        vm.expectRevert(abi.encodeWithSelector(ISMART.InvalidLostWallet.selector));
        vm.prank(newWallet);
        token.recoverTokens(lostWallet);
    }

    function test_Core_RecoverTokens_MultipleRecoveries_Success() public {
        _setUpCoreTest();
        _mintInitialBalances();

        // First recovery: clientBE -> newWallet1
        address lostWallet1 = clientBE;
        address newWallet1 = makeAddr("NewWallet1");
        uint256 balance1 = token.balanceOf(lostWallet1);

        // Create identity for new wallet but don't mark the lost wallet as lost
        address newIdentity = identityUtils.createIdentity(newWallet1);
        claimUtils.issueAllClaims(newWallet1);

        identityUtils.recoverIdentity(lostWallet1, newWallet1, newIdentity);

        vm.prank(newWallet1);
        token.recoverTokens(lostWallet1);

        assertEq(token.balanceOf(lostWallet1), 0, "First lost wallet should have zero balance");
        assertEq(token.balanceOf(newWallet1), balance1, "First new wallet should have recovered balance");

        // Second recovery: clientJP -> newWallet2
        address lostWallet2 = clientJP;
        address newWallet2 = makeAddr("NewWallet2");
        uint256 balance2 = token.balanceOf(lostWallet2);

        // Create identity for new wallet but don't mark the lost wallet as lost
        address newIdentity2 = identityUtils.createIdentity(newWallet2);
        claimUtils.issueAllClaims(newWallet2);

        identityUtils.recoverIdentity(lostWallet2, newWallet2, newIdentity2);

        vm.prank(newWallet2);
        token.recoverTokens(lostWallet2);

        assertEq(token.balanceOf(lostWallet2), 0, "Second lost wallet should have zero balance");
        assertEq(token.balanceOf(newWallet2), balance2, "Second new wallet should have recovered balance");

        // Verify both old wallets are marked as lost
        assertTrue(systemUtils.identityRegistry().isWalletLost(lostWallet1), "First wallet should be marked as lost");
        assertTrue(systemUtils.identityRegistry().isWalletLost(lostWallet2), "Second wallet should be marked as lost");
    }

    function test_Core_RecoverTokens_PartialBalance_Success() public {
        _setUpCoreTest();
        _mintInitialBalances();

        address lostWallet = clientBE;
        address newWallet = makeAddr("NewWalletForBE");
        uint256 initialBalance = token.balanceOf(lostWallet);

        // Transfer some tokens away first, leaving a partial balance
        uint256 transferAmount = initialBalance / 3;
        tokenUtils.transferToken(address(token), lostWallet, clientJP, transferAmount);

        uint256 remainingBalance = token.balanceOf(lostWallet);
        assertEq(remainingBalance, initialBalance - transferAmount, "Remaining balance incorrect");

        // Create identity for new wallet but don't mark the lost wallet as lost
        address newIdentity = identityUtils.createIdentity(newWallet);
        claimUtils.issueAllClaims(newWallet);

        identityUtils.recoverIdentity(lostWallet, newWallet, newIdentity);

        // Recover the remaining tokens
        vm.prank(newWallet);
        token.recoverTokens(lostWallet);

        assertEq(token.balanceOf(lostWallet), 0, "Lost wallet should have zero balance");
        assertEq(token.balanceOf(newWallet), remainingBalance, "New wallet should have recovered remaining balance");
    }

    function test_Core_RecoverTokens_NewWalletHasExistingBalance_Success() public {
        _setUpCoreTest();
        _mintInitialBalances();

        address lostWallet = clientBE;
        address newWallet = makeAddr("NewWalletForBE");
        uint256 lostWalletBalance = token.balanceOf(lostWallet);

        // Set up new wallet with existing identity and tokens
        address newIdentity = identityUtils.createClientIdentity(newWallet, TestConstants.COUNTRY_CODE_BE);
        claimUtils.issueAllClaims(newWallet);

        // Mint some tokens to the new wallet first
        uint256 existingBalance = 500 ether;
        tokenUtils.mintToken(address(token), tokenIssuer, newWallet, existingBalance);

        // Set up recovery
        identityUtils.recoverIdentity(lostWallet, newWallet, newIdentity);

        // Recover tokens
        vm.prank(newWallet);
        token.recoverTokens(lostWallet);

        assertEq(token.balanceOf(lostWallet), 0, "Lost wallet should have zero balance");
        assertEq(
            token.balanceOf(newWallet),
            existingBalance + lostWalletBalance,
            "New wallet should have existing plus recovered balance"
        );
    }
}
