// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { AbstractSMARTTest } from "./AbstractSMARTTest.sol"; // Inherit from the logic base
import { IERC20Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import { TestConstants } from "../../Constants.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { ISMARTCustodian } from "../../../contracts/smart/extensions/custodian/ISMARTCustodian.sol";
import { ISMART } from "../../../contracts/smart/interface/ISMART.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { SMARTToken } from "../examples/SMARTToken.sol";

abstract contract SMARTCustodianTest is AbstractSMARTTest {
    // Renamed from setUp, removed override
    function _setUpCustodianTest() internal /* override */ {
        super.setUp();
        // Ensure token has default collateral set up for custodian tests
        _setupDefaultCollateralClaim();
        _mintInitialBalances();
    }

    // =====================================================================
    //                         ADDRESS FREEZE TESTS
    // =====================================================================

    function test_Custodian_FreezeAddress_SetAndCheck() public {
        _setUpCustodianTest(); // Call setup explicitly
        assertFalse(tokenUtils.isFrozen(address(token), clientBE), "Should not be frozen initially");
        tokenUtils.setAddressFrozen(address(token), tokenIssuer, clientBE, true);
        assertTrue(tokenUtils.isFrozen(address(token), clientBE), "Should be frozen");
    }

    function test_Custodian_FreezeAddress_TransferFromFrozen_Reverts() public {
        _setUpCustodianTest(); // Call setup explicitly
        tokenUtils.setAddressFrozen(address(token), tokenIssuer, clientBE, true);
        vm.expectRevert(abi.encodeWithSelector(ISMARTCustodian.SenderAddressFrozen.selector));
        tokenUtils.transferToken(address(token), clientBE, clientJP, 1 ether);
    }

    function test_Custodian_FreezeAddress_TransferToFrozen_Reverts() public {
        _setUpCustodianTest(); // Call setup explicitly
        tokenUtils.setAddressFrozen(address(token), tokenIssuer, clientJP, true);
        vm.expectRevert(abi.encodeWithSelector(ISMARTCustodian.RecipientAddressFrozen.selector));
        tokenUtils.transferToken(address(token), clientBE, clientJP, 1 ether);
    }

    function test_Custodian_FreezeAddress_MintToFrozen_Reverts() public {
        _setUpCustodianTest(); // Call setup explicitly
        tokenUtils.setAddressFrozen(address(token), tokenIssuer, clientBE, true);
        vm.expectRevert(abi.encodeWithSelector(ISMARTCustodian.RecipientAddressFrozen.selector));
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, 1 ether);
    }

    function test_Custodian_FreezeAddress_RedeemFromFrozen_Reverts() public {
        _setUpCustodianTest(); // Call setup explicitly
        tokenUtils.setAddressFrozen(address(token), tokenIssuer, clientBE, true);
        vm.expectRevert(abi.encodeWithSelector(ISMARTCustodian.SenderAddressFrozen.selector));
        tokenUtils.redeemToken(address(token), clientBE, 1 ether);
    }

    function test_Custodian_FreezeAddress_UnfreezeAndCheck() public {
        _setUpCustodianTest(); // Call setup explicitly
        tokenUtils.setAddressFrozen(address(token), tokenIssuer, clientBE, true);
        assertTrue(tokenUtils.isFrozen(address(token), clientBE), "Should be frozen before unfreeze");
        tokenUtils.setAddressFrozen(address(token), tokenIssuer, clientBE, false);
        assertFalse(tokenUtils.isFrozen(address(token), clientBE), "Should be unfrozen");
    }

    function test_Custodian_FreezeAddress_OperationsAfterUnfreeze_Succeed() public {
        _setUpCustodianTest(); // Call setup explicitly
        tokenUtils.setAddressFrozen(address(token), tokenIssuer, clientBE, true);
        tokenUtils.setAddressFrozen(address(token), tokenIssuer, clientBE, false);

        // Mint should work
        uint256 mintAmount = 1 ether;
        uint256 balBESnapMint = token.balanceOf(clientBE);
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, mintAmount);
        assertEq(token.balanceOf(clientBE), balBESnapMint + mintAmount, "Mint after unfreeze failed");

        // Transfer should work
        uint256 transferAmount = 1 ether;
        uint256 balBESnapTransfer = token.balanceOf(clientBE);
        uint256 balJPSnapTransfer = token.balanceOf(clientJP);
        tokenUtils.transferToken(address(token), clientBE, clientJP, transferAmount);
        assertEq(
            token.balanceOf(clientBE), balBESnapTransfer - transferAmount, "Transfer after unfreeze failed (sender)"
        );
        assertEq(
            token.balanceOf(clientJP), balJPSnapTransfer + transferAmount, "Transfer after unfreeze failed (receiver)"
        );

        // Redeem should work - USE TOKEN UTILS
        uint256 redeemAmount = 1 ether;
        uint256 balBESnapRedeem = token.balanceOf(clientBE);
        // Use tokenUtils which handles prank and casting
        tokenUtils.redeemToken(address(token), clientBE, redeemAmount);
        assertEq(token.balanceOf(clientBE), balBESnapRedeem - redeemAmount, "Redeem after unfreeze failed");
    }

    function test_Custodian_FreezeAddress_AccessControl_Reverts() public {
        _setUpCustodianTest(); // Call setup explicitly
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                clientBE,
                SMARTToken(address(token)).FREEZER_ROLE()
            )
        );
        tokenUtils.setAddressFrozenAsExecutor(address(token), clientBE, clientBE, true);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                clientBE,
                SMARTToken(address(token)).FREEZER_ROLE()
            )
        );
        tokenUtils.setAddressFrozenAsExecutor(address(token), clientBE, clientBE, false);
    }

    // =====================================================================
    //                     PARTIAL TOKEN FREEZE TESTS
    // =====================================================================

    function test_Custodian_PartialFreeze_FreezeAndCheck() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 freezeAmount = 100 ether;
        assertEq(tokenUtils.getFrozenTokens(address(token), clientBE), 0, "Should have 0 frozen initially");
        tokenUtils.freezePartialTokens(address(token), tokenIssuer, clientBE, freezeAmount);
        assertEq(tokenUtils.getFrozenTokens(address(token), clientBE), freezeAmount, "Frozen amount incorrect");
    }

    function test_Custodian_PartialFreeze_FreezeMoreThanAvailable_Reverts() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 currentBalance = token.balanceOf(clientBE);
        uint256 freezeAmount = currentBalance + 1 ether;
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTCustodian.FreezeAmountExceedsAvailableBalance.selector,
                currentBalance, // Available balance (no frozen tokens yet)
                freezeAmount
            )
        );
        tokenUtils.freezePartialTokens(address(token), tokenIssuer, clientBE, freezeAmount);
    }

    function test_Custodian_PartialFreeze_UnfreezeAndCheck() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 freezeAmount = 100 ether;
        tokenUtils.freezePartialTokens(address(token), tokenIssuer, clientBE, freezeAmount);
        assertEq(
            tokenUtils.getFrozenTokens(address(token), clientBE),
            freezeAmount,
            "Frozen amount incorrect before unfreeze"
        );

        uint256 unfreezeAmount = 50 ether;
        tokenUtils.unfreezePartialTokens(address(token), tokenIssuer, clientBE, unfreezeAmount);
        assertEq(
            tokenUtils.getFrozenTokens(address(token), clientBE),
            freezeAmount - unfreezeAmount,
            "Frozen amount incorrect after unfreeze"
        );
    }

    function test_Custodian_PartialFreeze_UnfreezeMoreThanFrozen_Reverts() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 freezeAmount = 100 ether;
        tokenUtils.freezePartialTokens(address(token), tokenIssuer, clientBE, freezeAmount);

        uint256 unfreezeAmount = freezeAmount + 1 ether;
        vm.expectRevert(
            abi.encodeWithSelector(
                ISMARTCustodian.InsufficientFrozenTokens.selector,
                freezeAmount, // Currently frozen
                unfreezeAmount
            )
        );
        tokenUtils.unfreezePartialTokens(address(token), tokenIssuer, clientBE, unfreezeAmount);
    }

    function test_Custodian_PartialFreeze_TransferLessThanUnfrozen_Succeeds() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 freezeAmount = token.balanceOf(clientBE) / 2;
        tokenUtils.freezePartialTokens(address(token), tokenIssuer, clientBE, freezeAmount);

        uint256 unfrozenBalance = token.balanceOf(clientBE) - freezeAmount;
        uint256 transferAmount = unfrozenBalance / 2;

        uint256 balBESnap = token.balanceOf(clientBE);
        uint256 balJPSnap = token.balanceOf(clientJP);
        uint256 frozenSnap = tokenUtils.getFrozenTokens(address(token), clientBE);

        tokenUtils.transferToken(address(token), clientBE, clientJP, transferAmount);

        assertEq(token.balanceOf(clientBE), balBESnap - transferAmount, "Sender balance wrong");
        assertEq(token.balanceOf(clientJP), balJPSnap + transferAmount, "Receiver balance wrong");
        assertEq(tokenUtils.getFrozenTokens(address(token), clientBE), frozenSnap, "Frozen amount changed");
    }

    function test_Custodian_PartialFreeze_TransferExactlyUnfrozen_Succeeds() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 freezeAmount = token.balanceOf(clientBE) / 2;
        tokenUtils.freezePartialTokens(address(token), tokenIssuer, clientBE, freezeAmount);

        uint256 unfrozenBalance = token.balanceOf(clientBE) - freezeAmount;
        uint256 transferAmount = unfrozenBalance;

        uint256 balBESnap = token.balanceOf(clientBE);
        uint256 balJPSnap = token.balanceOf(clientJP);
        uint256 frozenSnap = tokenUtils.getFrozenTokens(address(token), clientBE);

        tokenUtils.transferToken(address(token), clientBE, clientJP, transferAmount);

        assertEq(token.balanceOf(clientBE), balBESnap - transferAmount, "Sender balance wrong");
        assertEq(token.balanceOf(clientJP), balJPSnap + transferAmount, "Receiver balance wrong");
        assertEq(tokenUtils.getFrozenTokens(address(token), clientBE), frozenSnap, "Frozen amount changed");
    }

    function test_Custodian_PartialFreeze_TransferMoreThanUnfrozen_Reverts() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 freezeAmount = token.balanceOf(clientBE) / 2;
        tokenUtils.freezePartialTokens(address(token), tokenIssuer, clientBE, freezeAmount);

        uint256 unfrozenBalance = token.balanceOf(clientBE) - freezeAmount;
        uint256 transferAmount = unfrozenBalance + 1 ether;

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientBalance.selector, clientBE, unfrozenBalance, transferAmount
            )
        );
        tokenUtils.transferToken(address(token), clientBE, clientJP, transferAmount);
    }

    function test_Custodian_PartialFreeze_BurnLessThanUnfrozen_Succeeds() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 freezeAmount = token.balanceOf(clientBE) / 2;
        tokenUtils.freezePartialTokens(address(token), tokenIssuer, clientBE, freezeAmount);

        uint256 unfrozenBalance = token.balanceOf(clientBE) - freezeAmount;
        uint256 burnAmount = unfrozenBalance / 2;

        uint256 balBESnap = token.balanceOf(clientBE);
        uint256 frozenSnap = tokenUtils.getFrozenTokens(address(token), clientBE);

        tokenUtils.burnToken(address(token), tokenIssuer, clientBE, burnAmount);

        assertEq(token.balanceOf(clientBE), balBESnap - burnAmount, "Balance wrong after burn");
        assertEq(tokenUtils.getFrozenTokens(address(token), clientBE), frozenSnap, "Frozen amount changed on burn");
    }

    function test_Custodian_PartialFreeze_BurnExactlyUnfrozen_Succeeds() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 freezeAmount = token.balanceOf(clientBE) / 2;
        tokenUtils.freezePartialTokens(address(token), tokenIssuer, clientBE, freezeAmount);

        uint256 unfrozenBalance = token.balanceOf(clientBE) - freezeAmount;
        uint256 burnAmount = unfrozenBalance;

        uint256 balBESnap = token.balanceOf(clientBE);
        uint256 frozenSnap = tokenUtils.getFrozenTokens(address(token), clientBE);

        tokenUtils.burnToken(address(token), tokenIssuer, clientBE, burnAmount);

        assertEq(token.balanceOf(clientBE), balBESnap - burnAmount, "Balance wrong after burn");
        assertEq(tokenUtils.getFrozenTokens(address(token), clientBE), frozenSnap, "Frozen amount changed on burn");
    }

    function test_Custodian_PartialFreeze_BurnMoreThanUnfrozen_SucceedsAndUnfreezes() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 totalBalance = token.balanceOf(clientBE);
        uint256 freezeAmount = totalBalance / 2;
        tokenUtils.freezePartialTokens(address(token), tokenIssuer, clientBE, freezeAmount);

        uint256 unfrozenBalance = totalBalance - freezeAmount;
        uint256 burnAmount = unfrozenBalance + (freezeAmount / 2); // Burn into frozen tokens
        uint256 expectedUnfreezeAmount = burnAmount - unfrozenBalance;

        uint256 balBESnap = token.balanceOf(clientBE);
        uint256 frozenSnap = tokenUtils.getFrozenTokens(address(token), clientBE);

        tokenUtils.burnToken(address(token), tokenIssuer, clientBE, burnAmount);

        assertEq(token.balanceOf(clientBE), balBESnap - burnAmount, "Balance wrong after burn");
        assertEq(
            tokenUtils.getFrozenTokens(address(token), clientBE),
            frozenSnap - expectedUnfreezeAmount,
            "Frozen amount wrong after burn"
        );
    }

    function test_Custodian_PartialFreeze_BurnMoreThanTotal_Reverts() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 totalBalance = token.balanceOf(clientBE);
        uint256 freezeAmount = totalBalance / 2;
        tokenUtils.freezePartialTokens(address(token), tokenIssuer, clientBE, freezeAmount);

        uint256 burnAmount = totalBalance + 1 ether;

        // Should revert based on total balance check before attempting unfreeze logic
        vm.expectRevert(
            abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, clientBE, totalBalance, burnAmount)
        );
        tokenUtils.burnToken(address(token), tokenIssuer, clientBE, burnAmount);
    }

    function test_Custodian_PartialFreeze_RedeemLessThanUnfrozen_Succeeds() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 freezeAmount = token.balanceOf(clientBE) / 2;
        tokenUtils.freezePartialTokens(address(token), tokenIssuer, clientBE, freezeAmount);

        uint256 unfrozenBalance = token.balanceOf(clientBE) - freezeAmount;
        uint256 redeemAmount = unfrozenBalance / 2;

        uint256 balBESnap = token.balanceOf(clientBE);
        uint256 frozenSnap = tokenUtils.getFrozenTokens(address(token), clientBE);

        // USE TOKEN UTILS for success case
        tokenUtils.redeemToken(address(token), clientBE, redeemAmount);

        assertEq(token.balanceOf(clientBE), balBESnap - redeemAmount, "Balance wrong after redeem");
        assertEq(tokenUtils.getFrozenTokens(address(token), clientBE), frozenSnap, "Frozen amount changed on redeem");
    }

    function test_Custodian_PartialFreeze_RedeemMoreThanUnfrozen_Reverts() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 freezeAmount = token.balanceOf(clientBE) / 2;
        tokenUtils.freezePartialTokens(address(token), tokenIssuer, clientBE, freezeAmount);

        uint256 unfrozenBalance = token.balanceOf(clientBE) - freezeAmount;
        uint256 redeemAmount = unfrozenBalance + 1 ether;

        // Redeem checks available *unfrozen* balance - direct call needed for revert test
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientBalance.selector, clientBE, unfrozenBalance, redeemAmount
            )
        );
        tokenUtils.redeemToken(address(token), clientBE, redeemAmount);
    }

    function test_Custodian_PartialFreeze_AccessControl_Reverts() public {
        _setUpCustodianTest(); // Call setup explicitly
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                clientBE,
                SMARTToken(address(token)).FREEZER_ROLE()
            )
        );
        tokenUtils.freezePartialTokensAsExecutor(address(token), clientBE, clientBE, 1 ether);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                clientBE,
                SMARTToken(address(token)).FREEZER_ROLE()
            )
        );
        tokenUtils.unfreezePartialTokensAsExecutor(address(token), clientBE, clientBE, 1 ether);
        vm.stopPrank();
    }

    // =====================================================================
    //                      FORCED TRANSFER TESTS
    // =====================================================================

    function test_Custodian_ForcedTransfer_Success() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 transferAmount = 100 ether;
        uint256 balBESnap = token.balanceOf(clientBE);
        uint256 balJPSnap = token.balanceOf(clientJP);

        tokenUtils.forcedTransfer(address(token), tokenIssuer, clientBE, clientJP, transferAmount);

        assertEq(token.balanceOf(clientBE), balBESnap - transferAmount, "Sender balance wrong");
        assertEq(token.balanceOf(clientJP), balJPSnap + transferAmount, "Receiver balance wrong");
    }

    function test_Custodian_ForcedTransfer_InsufficientTotalBalance_Reverts() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 currentSenderBalance = token.balanceOf(clientBE);
        uint256 excessiveAmount = currentSenderBalance + 1 wei;

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientBalance.selector, clientBE, currentSenderBalance, excessiveAmount
            )
        );
        tokenUtils.forcedTransfer(address(token), tokenIssuer, clientBE, clientJP, excessiveAmount);
    }

    function test_Custodian_ForcedTransfer_FromFrozenSender_Succeeds() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 transferAmount = 10 ether;
        tokenUtils.setAddressFrozen(address(token), tokenIssuer, clientBE, true);
        assertTrue(tokenUtils.isFrozen(address(token), clientBE), "Sender should be frozen");

        uint256 balBESnap = token.balanceOf(clientBE);
        uint256 balJPSnap = token.balanceOf(clientJP);

        tokenUtils.forcedTransfer(address(token), tokenIssuer, clientBE, clientJP, transferAmount);

        assertEq(token.balanceOf(clientBE), balBESnap - transferAmount, "Sender balance wrong");
        assertEq(token.balanceOf(clientJP), balJPSnap + transferAmount, "Receiver balance wrong");
        assertTrue(tokenUtils.isFrozen(address(token), clientBE), "Sender should still be frozen");
    }

    function test_Custodian_ForcedTransfer_ToFrozenReceiver_Succeeds() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 transferAmount = 10 ether;
        tokenUtils.setAddressFrozen(address(token), tokenIssuer, clientJP, true);
        assertTrue(tokenUtils.isFrozen(address(token), clientJP), "Receiver should be frozen");

        uint256 balBESnap = token.balanceOf(clientBE);
        uint256 balJPSnap = token.balanceOf(clientJP);

        tokenUtils.forcedTransfer(address(token), tokenIssuer, clientBE, clientJP, transferAmount);

        assertEq(token.balanceOf(clientBE), balBESnap - transferAmount, "Sender balance wrong");
        assertEq(token.balanceOf(clientJP), balJPSnap + transferAmount, "Receiver balance wrong");
        assertTrue(tokenUtils.isFrozen(address(token), clientJP), "Receiver should still be frozen");
    }

    // --- Forced Transfer with Partial Freeze Scenarios ---

    function test_Custodian_ForcedTransfer_PartialFreeze_LessThanUnfrozen_Succeeds() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 freezeAmount = token.balanceOf(clientBE) / 2;
        tokenUtils.freezePartialTokens(address(token), tokenIssuer, clientBE, freezeAmount);

        uint256 currentFrozen = tokenUtils.getFrozenTokens(address(token), clientBE);
        uint256 currentUnfrozen = token.balanceOf(clientBE) - currentFrozen;
        uint256 transferAmount = currentUnfrozen / 2;

        uint256 balBESnap = token.balanceOf(clientBE);
        uint256 balJPSnap = token.balanceOf(clientJP);

        tokenUtils.forcedTransfer(address(token), tokenIssuer, clientBE, clientJP, transferAmount);

        assertEq(token.balanceOf(clientBE), balBESnap - transferAmount, "Sender balance wrong");
        assertEq(token.balanceOf(clientJP), balJPSnap + transferAmount, "Receiver balance wrong");
        assertEq(tokenUtils.getFrozenTokens(address(token), clientBE), currentFrozen, "Frozen amount changed");
    }

    function test_Custodian_ForcedTransfer_PartialFreeze_ExactlyUnfrozen_Succeeds() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 freezeAmount = token.balanceOf(clientBE) / 2;
        tokenUtils.freezePartialTokens(address(token), tokenIssuer, clientBE, freezeAmount);

        uint256 currentFrozen = tokenUtils.getFrozenTokens(address(token), clientBE);
        uint256 currentUnfrozen = token.balanceOf(clientBE) - currentFrozen;
        uint256 transferAmount = currentUnfrozen;

        uint256 balBESnap = token.balanceOf(clientBE);
        uint256 balJPSnap = token.balanceOf(clientJP);

        tokenUtils.forcedTransfer(address(token), tokenIssuer, clientBE, clientJP, transferAmount);

        assertEq(token.balanceOf(clientBE), balBESnap - transferAmount, "Sender balance wrong");
        assertEq(token.balanceOf(clientJP), balJPSnap + transferAmount, "Receiver balance wrong");
        assertEq(tokenUtils.getFrozenTokens(address(token), clientBE), currentFrozen, "Frozen amount changed");
    }

    function test_Custodian_ForcedTransfer_PartialFreeze_MoreThanUnfrozen_SucceedsAndUnfreezes() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 freezeAmount = token.balanceOf(clientBE) / 2;
        tokenUtils.freezePartialTokens(address(token), tokenIssuer, clientBE, freezeAmount);

        uint256 currentFrozen = tokenUtils.getFrozenTokens(address(token), clientBE);
        uint256 currentUnfrozen = token.balanceOf(clientBE) - currentFrozen;
        uint256 transferAmount = currentUnfrozen + (currentFrozen / 2); // Transfer into frozen
        uint256 expectedUnfreezeAmount = transferAmount - currentUnfrozen;

        uint256 balBESnap = token.balanceOf(clientBE);
        uint256 balJPSnap = token.balanceOf(clientJP);
        uint256 frozenSnap = tokenUtils.getFrozenTokens(address(token), clientBE);

        tokenUtils.forcedTransfer(address(token), tokenIssuer, clientBE, clientJP, transferAmount);

        assertEq(token.balanceOf(clientBE), balBESnap - transferAmount, "Sender balance wrong");
        assertEq(token.balanceOf(clientJP), balJPSnap + transferAmount, "Receiver balance wrong");
        assertEq(
            tokenUtils.getFrozenTokens(address(token), clientBE),
            frozenSnap - expectedUnfreezeAmount,
            "Frozen amount wrong"
        );
    }

    function test_Custodian_ForcedTransfer_PartialFreeze_ExactlyRemainingBalance_SucceedsAndUnfreezes() public {
        _setUpCustodianTest(); // Call setup explicitly
        uint256 freezeAmount = token.balanceOf(clientBE) / 2;
        tokenUtils.freezePartialTokens(address(token), tokenIssuer, clientBE, freezeAmount);

        // Perform a small transfer first to make remaining balance different from initial frozen
        uint256 initialUnfrozen = token.balanceOf(clientBE) - freezeAmount;
        if (initialUnfrozen > 0) {
            tokenUtils.forcedTransfer(address(token), tokenIssuer, clientBE, clientJP, initialUnfrozen / 2);
        }

        uint256 remainingBalance = token.balanceOf(clientBE);
        uint256 frozenBeforeFinal = tokenUtils.getFrozenTokens(address(token), clientBE);
        require(remainingBalance >= frozenBeforeFinal, "Invariant broken: balance less than frozen");
        // This test covers the case where the transfer amount equals the total remaining balance,
        // which might require unfreezing part or all of the frozen amount.
        uint256 transferAmount = remainingBalance;
        uint256 expectedUnfreezeAmount = 0;
        uint256 unfrozenBeforeFinal = remainingBalance - frozenBeforeFinal;
        if (transferAmount > unfrozenBeforeFinal) {
            expectedUnfreezeAmount = transferAmount - unfrozenBeforeFinal;
        }

        uint256 balJPSnap = token.balanceOf(clientJP);

        tokenUtils.forcedTransfer(address(token), tokenIssuer, clientBE, clientJP, transferAmount);

        assertEq(token.balanceOf(clientBE), 0, "Sender balance should be 0");
        assertEq(token.balanceOf(clientJP), balJPSnap + transferAmount, "Receiver balance wrong");
        assertEq(
            tokenUtils.getFrozenTokens(address(token), clientBE),
            frozenBeforeFinal - expectedUnfreezeAmount,
            "Frozen amount wrong"
        );
    }

    function test_Custodian_ForcedTransfer_AccessControl_Reverts() public {
        _setUpCustodianTest(); // Call setup explicitly
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                clientBE,
                SMARTToken(address(token)).FORCED_TRANSFER_ROLE()
            )
        );
        tokenUtils.forcedTransferAsExecutor(address(token), clientBE, clientBE, clientJP, 1 ether);
    }

    // =====================================================================
    //                       ADDRESS RECOVERY TESTS
    // =====================================================================

    function test_Custodian_ForcedRecoverTokens_Success() public {
        _setUpCustodianTest();
        _mintInitialBalances();

        address lostWallet = clientBE;
        address newWallet = makeAddr("NewWalletForBE");
        uint256 initialBalance = token.balanceOf(lostWallet);
        require(initialBalance > 0, "Lost wallet has no balance");

        // Create identity for new wallet and set up recovery
        address newIdentity = identityUtils.createIdentity(newWallet);
        claimUtils.issueAllClaims(newWallet);
        identityUtils.recoverIdentity(lostWallet, newWallet, newIdentity);

        // Verify the wallet is marked as lost
        assertTrue(systemUtils.identityRegistry().isWalletLost(lostWallet), "Lost wallet should be marked as lost");

        // Perform forced recovery via custodian - expects TokensRecovered event (not RecoverySuccess)
        vm.expectEmit(true, true, true, true);
        emit ISMART.TokensRecovered(tokenIssuer, lostWallet, newWallet, initialBalance);

        vm.startPrank(tokenIssuer);
        ISMARTCustodian(address(token)).forcedRecoverTokens(lostWallet, newWallet);
        vm.stopPrank();

        // Post-checks
        assertEq(token.balanceOf(lostWallet), 0, "Lost wallet balance not zero");
        assertEq(token.balanceOf(newWallet), initialBalance, "New wallet balance wrong");
        assertTrue(
            systemUtils.identityRegistry().isVerified(newWallet, _topicsToExpressionNodes(requiredClaimTopics)),
            "New wallet not verified after recovery"
        );
        assertEq(
            systemUtils.identityRegistry().investorCountry(newWallet),
            TestConstants.COUNTRY_CODE_BE,
            "Country code wrong"
        );
    }

    function test_Custodian_ForcedRecoverTokens_WithFrozenState_Success() public {
        _setUpCustodianTest();
        _mintInitialBalances();

        address lostWallet = clientJP;
        address newWallet = makeAddr("NewWalletForJP");
        uint256 initialBalance = token.balanceOf(lostWallet);
        require(initialBalance > 0, "Lost wallet has no balance");

        // Freeze the lost wallet address and some tokens
        uint256 freezeAmount = initialBalance / 3;
        tokenUtils.setAddressFrozen(address(token), tokenIssuer, lostWallet, true);
        tokenUtils.freezePartialTokens(address(token), tokenIssuer, lostWallet, freezeAmount);
        assertTrue(tokenUtils.isFrozen(address(token), lostWallet), "Lost wallet not frozen before recovery");
        assertEq(
            tokenUtils.getFrozenTokens(address(token), lostWallet), freezeAmount, "Lost wallet frozen tokens wrong"
        );

        // Create identity for new wallet and set up recovery
        address newIdentity = identityUtils.createIdentity(newWallet);
        claimUtils.issueAllClaims(newWallet);
        identityUtils.recoverIdentity(lostWallet, newWallet, newIdentity);

        // Expect freeze state migration events
        vm.expectEmit(true, true, false, true);
        emit ISMARTCustodian.TokensUnfrozen(tokenIssuer, lostWallet, freezeAmount);
        vm.expectEmit(true, true, false, true);
        emit ISMARTCustodian.TokensFrozen(tokenIssuer, newWallet, freezeAmount);
        vm.expectEmit(true, true, true, false);
        emit ISMARTCustodian.AddressFrozen(tokenIssuer, newWallet, true);
        vm.expectEmit(true, true, true, false);
        emit ISMARTCustodian.AddressFrozen(tokenIssuer, lostWallet, false);

        vm.startPrank(tokenIssuer);
        ISMARTCustodian(address(token)).forcedRecoverTokens(lostWallet, newWallet);
        vm.stopPrank();

        // Post-checks: verify freeze state migration
        assertEq(token.balanceOf(lostWallet), 0, "Lost wallet balance not zero");
        assertEq(token.balanceOf(newWallet), initialBalance, "New wallet balance wrong");
        assertTrue(tokenUtils.isFrozen(address(token), newWallet), "New wallet not frozen after recovery");
        assertFalse(tokenUtils.isFrozen(address(token), lostWallet), "Lost wallet still frozen after recovery");
        assertEq(tokenUtils.getFrozenTokens(address(token), newWallet), freezeAmount, "New wallet frozen tokens wrong");
        assertEq(tokenUtils.getFrozenTokens(address(token), lostWallet), 0, "Lost wallet frozen tokens not zero");
        assertTrue(
            systemUtils.identityRegistry().isVerified(newWallet, _topicsToExpressionNodes(requiredClaimTopics)),
            "New wallet not verified"
        );
    }

    function test_Custodian_ForcedRecoverTokens_WithPartialFreezeOnly_Success() public {
        _setUpCustodianTest();
        _mintInitialBalances();

        address lostWallet = clientUS;
        address newWallet = makeAddr("NewWalletForUS");
        uint256 initialBalance = token.balanceOf(lostWallet);
        require(initialBalance > 0, "Lost wallet has no balance");

        // Only freeze partial tokens (not the entire address)
        uint256 freezeAmount = initialBalance / 2;
        tokenUtils.freezePartialTokens(address(token), tokenIssuer, lostWallet, freezeAmount);
        assertFalse(tokenUtils.isFrozen(address(token), lostWallet), "Lost wallet should not be fully frozen");
        assertEq(
            tokenUtils.getFrozenTokens(address(token), lostWallet), freezeAmount, "Lost wallet frozen tokens wrong"
        );

        // Create identity for new wallet and set up recovery
        address newIdentity = identityUtils.createIdentity(newWallet);
        claimUtils.issueAllClaims(newWallet);
        identityUtils.recoverIdentity(lostWallet, newWallet, newIdentity);

        // Expect only partial freeze migration events (no address freeze events)
        vm.expectEmit(true, true, false, true);
        emit ISMARTCustodian.TokensUnfrozen(tokenIssuer, lostWallet, freezeAmount);
        vm.expectEmit(true, true, false, true);
        emit ISMARTCustodian.TokensFrozen(tokenIssuer, newWallet, freezeAmount);

        vm.startPrank(tokenIssuer);
        ISMARTCustodian(address(token)).forcedRecoverTokens(lostWallet, newWallet);
        vm.stopPrank();

        // Post-checks: verify only partial freeze state migration
        assertEq(token.balanceOf(lostWallet), 0, "Lost wallet balance not zero");
        assertEq(token.balanceOf(newWallet), initialBalance, "New wallet balance wrong");
        assertFalse(tokenUtils.isFrozen(address(token), newWallet), "New wallet should not be fully frozen");
        assertFalse(tokenUtils.isFrozen(address(token), lostWallet), "Lost wallet should not be fully frozen");
        assertEq(tokenUtils.getFrozenTokens(address(token), newWallet), freezeAmount, "New wallet frozen tokens wrong");
        assertEq(tokenUtils.getFrozenTokens(address(token), lostWallet), 0, "Lost wallet frozen tokens not zero");
    }

    function test_Custodian_ForcedRecoverTokens_NewWalletPreFrozen_Success() public {
        _setUpCustodianTest();
        _mintInitialBalances();

        address lostWallet = clientBE;
        address newWallet = makeAddr("NewWalletForBE");
        uint256 initialBalance = token.balanceOf(lostWallet);

        // Create identity for new wallet and set up recovery
        address newIdentity = identityUtils.createIdentity(newWallet);
        claimUtils.issueAllClaims(newWallet);

        // Pre-freeze the new wallet (edge case)
        tokenUtils.setAddressFrozen(address(token), tokenIssuer, newWallet, true);
        assertTrue(tokenUtils.isFrozen(address(token), newWallet), "New wallet should be pre-frozen");

        identityUtils.recoverIdentity(lostWallet, newWallet, newIdentity);

        // Expect new wallet to be unfrozen during recovery (defensive behavior)
        vm.expectEmit(true, true, true, false);
        emit ISMARTCustodian.AddressFrozen(tokenIssuer, newWallet, false);

        vm.startPrank(tokenIssuer);
        ISMARTCustodian(address(token)).forcedRecoverTokens(lostWallet, newWallet);
        vm.stopPrank();

        // Post-checks: new wallet should be unfrozen
        assertEq(token.balanceOf(lostWallet), 0, "Lost wallet balance not zero");
        assertEq(token.balanceOf(newWallet), initialBalance, "New wallet balance wrong");
        assertFalse(tokenUtils.isFrozen(address(token), newWallet), "New wallet should be unfrozen after recovery");
        assertFalse(tokenUtils.isFrozen(address(token), lostWallet), "Lost wallet should be unfrozen");
    }

    function test_Custodian_ForcedRecoverTokens_NoBalance_Reverts() public {
        _setUpCustodianTest();
        _mintInitialBalances();

        address lostWallet = clientBE;
        address newWallet = makeAddr("NewWalletForBE");

        // Burn all balance from lost wallet
        uint256 currentBalance = token.balanceOf(lostWallet);
        tokenUtils.burnToken(address(token), tokenIssuer, lostWallet, currentBalance);
        assertEq(token.balanceOf(lostWallet), 0, "Failed to burn balance for test setup");

        // Create identity for new wallet and set up recovery
        address newIdentity = identityUtils.createIdentity(newWallet);
        claimUtils.issueAllClaims(newWallet);
        identityUtils.recoverIdentity(lostWallet, newWallet, newIdentity);

        vm.expectRevert(abi.encodeWithSelector(ISMART.NoTokensToRecover.selector));

        vm.startPrank(tokenIssuer);
        ISMARTCustodian(address(token)).forcedRecoverTokens(lostWallet, newWallet);
        vm.stopPrank();
    }

    function test_Custodian_ForcedRecoverTokens_NewWalletHasExistingBalance_Success() public {
        _setUpCustodianTest();
        _mintInitialBalances();

        address lostWallet = clientBE;
        address newWallet = makeAddr("NewWalletForBE");
        uint256 lostBalance = token.balanceOf(lostWallet);

        // Create identity for new wallet and mint some tokens to it
        address newIdentity = identityUtils.createClientIdentity(newWallet, TestConstants.COUNTRY_CODE_BE);
        claimUtils.issueAllClaims(newWallet);

        uint256 existingBalance = 500 ether;
        tokenUtils.mintToken(address(token), tokenIssuer, newWallet, existingBalance);

        identityUtils.recoverIdentity(lostWallet, newWallet, newIdentity);

        vm.startPrank(tokenIssuer);
        ISMARTCustodian(address(token)).forcedRecoverTokens(lostWallet, newWallet);
        vm.stopPrank();

        // Post-checks: new wallet should have existing + recovered balance
        assertEq(token.balanceOf(lostWallet), 0, "Lost wallet balance not zero");
        assertEq(
            token.balanceOf(newWallet),
            existingBalance + lostBalance,
            "New wallet should have existing plus recovered balance"
        );
    }

    function test_Custodian_ForcedRecoverTokens_MultipleRecoveries_Success() public {
        _setUpCustodianTest();
        _mintInitialBalances();

        // First recovery: clientBE -> newWallet1
        address lostWallet1 = clientBE;
        address newWallet1 = makeAddr("NewWallet1");
        uint256 balance1 = token.balanceOf(lostWallet1);

        address newIdentity1 = identityUtils.createIdentity(newWallet1);
        claimUtils.issueAllClaims(newWallet1);
        identityUtils.recoverIdentity(lostWallet1, newWallet1, newIdentity1);

        vm.startPrank(tokenIssuer);
        ISMARTCustodian(address(token)).forcedRecoverTokens(lostWallet1, newWallet1);
        vm.stopPrank();

        assertEq(token.balanceOf(lostWallet1), 0, "First lost wallet should have zero balance");
        assertEq(token.balanceOf(newWallet1), balance1, "First new wallet should have recovered balance");

        // Second recovery: clientJP -> newWallet2
        address lostWallet2 = clientJP;
        address newWallet2 = makeAddr("NewWallet2");
        uint256 balance2 = token.balanceOf(lostWallet2);

        address newIdentity2 = identityUtils.createIdentity(newWallet2);
        claimUtils.issueAllClaims(newWallet2);
        identityUtils.recoverIdentity(lostWallet2, newWallet2, newIdentity2);

        vm.startPrank(tokenIssuer);
        ISMARTCustodian(address(token)).forcedRecoverTokens(lostWallet2, newWallet2);
        vm.stopPrank();

        assertEq(token.balanceOf(lostWallet2), 0, "Second lost wallet should have zero balance");
        assertEq(token.balanceOf(newWallet2), balance2, "Second new wallet should have recovered balance");

        // Verify both old wallets are marked as lost
        assertTrue(systemUtils.identityRegistry().isWalletLost(lostWallet1), "First wallet should be marked as lost");
        assertTrue(systemUtils.identityRegistry().isWalletLost(lostWallet2), "Second wallet should be marked as lost");
    }

    function test_Custodian_ForcedRecoverTokens_AccessControl_Reverts() public {
        _setUpCustodianTest();
        _mintInitialBalances();

        address lostWallet = clientBE;
        address newWallet = makeAddr("NewWalletForBE");

        // Create identity for new wallet and set up recovery
        address newIdentity = identityUtils.createIdentity(newWallet);
        claimUtils.issueAllClaims(newWallet);
        identityUtils.recoverIdentity(lostWallet, newWallet, newIdentity);

        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                clientJP,
                SMARTToken(address(token)).RECOVERY_ROLE()
            )
        );
        vm.startPrank(clientJP);
        ISMARTCustodian(address(token)).forcedRecoverTokens(lostWallet, newWallet);
        vm.stopPrank();
    }

    function test_SupportsInterface_Custodian() public {
        _setUpCustodianTest(); // Use the specific setup for custodian tests
        assertTrue(
            IERC165(address(token)).supportsInterface(type(ISMARTCustodian).interfaceId),
            "Token does not support ISMARTCustodian interface"
        );
    }
}
