// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { AbstractSMARTTest } from "./AbstractSMARTTest.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ISMARTCapped } from "../../../contracts/smart/extensions/capped/ISMARTCapped.sol";
import { SMARTToken } from "../examples/SMARTToken.sol";

abstract contract SMARTCappedTest is AbstractSMARTTest {
    uint256 internal constant DEFAULT_CAP = 1_000_000 ether;
    uint256 internal constant LARGE_MINT = 500_000 ether;
    uint256 internal constant SMALL_MINT = 100 ether;

    // This will be overridden in the concrete test implementation

    function _setUpCappedTest() internal /* override */ {
        super.setUp();
        _setupDefaultCollateralClaim();
        // Note: Don't mint initial balances as we need to test cap functionality from zero supply
    }

    // --- Initialization Tests ---

    function test_Capped_ValidCap_Success() public {
        _setUpCappedTest();

        // Verify the cap is set correctly
        uint256 expectedCap = DEFAULT_CAP;
        uint256 actualCap = ISMARTCapped(address(token)).cap();

        assertEq(actualCap, expectedCap, "Cap should match the value set during deployment");
        assertTrue(actualCap > 0, "Cap should be greater than zero");
    }

    function test_Capped_InitialState() public {
        _setUpCappedTest();

        // Verify initial state
        assertEq(token.totalSupply(), 0, "Initial total supply should be zero");
        assertEq(ISMARTCapped(address(token)).cap(), DEFAULT_CAP, "Cap should be set to default value");
        assertTrue(ISMARTCapped(address(token)).cap() > token.totalSupply(), "Cap should be greater than total supply");
    }

    // --- Minting Under Cap Tests ---

    function test_Capped_MintUnderCap_Success() public {
        _setUpCappedTest();

        uint256 mintAmount = SMALL_MINT;
        uint256 capValue = ISMARTCapped(address(token)).cap();

        // Ensure we're testing under cap
        require(mintAmount < capValue, "Test setup error: mint amount should be less than cap");

        uint256 initialBalance = token.balanceOf(clientBE);
        uint256 initialSupply = token.totalSupply();

        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, mintAmount);

        assertEq(token.balanceOf(clientBE), initialBalance + mintAmount, "Balance should increase by mint amount");
        assertEq(token.totalSupply(), initialSupply + mintAmount, "Total supply should increase by mint amount");
        assertTrue(token.totalSupply() <= capValue, "Total supply should remain under or at cap");
    }

    function test_Capped_MultipleMints_UnderCap_Success() public {
        _setUpCappedTest();

        uint256 mintAmount = SMALL_MINT;
        uint256 capValue = ISMARTCapped(address(token)).cap();
        uint256 numberOfMints = 5;
        uint256 totalMintAmount = mintAmount * numberOfMints;

        // Ensure we stay under cap
        require(totalMintAmount < capValue, "Test setup error: total mint amount should be less than cap");

        uint256 initialSupply = token.totalSupply();

        // Perform multiple mints
        for (uint256 i = 0; i < numberOfMints; i++) {
            tokenUtils.mintToken(address(token), tokenIssuer, clientBE, mintAmount);
        }

        assertEq(token.totalSupply(), initialSupply + totalMintAmount, "Total supply should equal sum of all mints");
        assertTrue(token.totalSupply() <= capValue, "Total supply should remain under cap after multiple mints");
    }

    // --- Minting At Cap Tests ---

    function test_Capped_MintExactlyAtCap_Success() public {
        _setUpCappedTest();

        uint256 capValue = ISMARTCapped(address(token)).cap();
        uint256 initialSupply = token.totalSupply();
        uint256 remainingCapacity = capValue - initialSupply;

        uint256 initialBalance = token.balanceOf(clientBE);

        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, remainingCapacity);

        assertEq(
            token.balanceOf(clientBE),
            initialBalance + remainingCapacity,
            "Balance should increase by remaining capacity"
        );
        assertEq(token.totalSupply(), capValue, "Total supply should equal cap after minting to capacity");
    }

    function test_Capped_MintToCapInSteps_Success() public {
        _setUpCappedTest();

        uint256 capValue = ISMARTCapped(address(token)).cap();
        uint256 stepAmount = capValue / 4; // Mint in 4 steps

        // Mint in steps approaching the cap
        for (uint256 i = 0; i < 3; i++) {
            tokenUtils.mintToken(address(token), tokenIssuer, clientBE, stepAmount);
            assertTrue(token.totalSupply() <= capValue, "Total supply should not exceed cap during step minting");
        }

        // Final mint to reach exactly the cap
        uint256 finalAmount = capValue - token.totalSupply();
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, finalAmount);

        assertEq(token.totalSupply(), capValue, "Total supply should equal cap after step minting");
    }

    // --- Minting Over Cap Tests ---

    function test_Capped_MintOverCap_Reverts() public {
        _setUpCappedTest();

        uint256 capValue = ISMARTCapped(address(token)).cap();
        uint256 overCapAmount = capValue + 1 ether;
        uint256 currentSupply = token.totalSupply();
        uint256 expectedNewSupply = currentSupply + overCapAmount;

        vm.expectRevert(abi.encodeWithSelector(ISMARTCapped.ExceededCap.selector, expectedNewSupply, capValue));
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, overCapAmount);
    }

    function test_Capped_MintAtCapThenMore_Reverts() public {
        _setUpCappedTest();

        uint256 capValue = ISMARTCapped(address(token)).cap();

        // First, mint exactly to the cap
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, capValue);
        assertEq(token.totalSupply(), capValue, "Should reach cap after first mint");

        // Then try to mint more
        uint256 additionalAmount = 1 ether;
        uint256 expectedNewSupply = capValue + additionalAmount;

        vm.expectRevert(abi.encodeWithSelector(ISMARTCapped.ExceededCap.selector, expectedNewSupply, capValue));
        tokenUtils.mintToken(address(token), tokenIssuer, clientJP, additionalAmount);
    }

    function test_Capped_LargeMintOverCap_Reverts() public {
        _setUpCappedTest();

        uint256 capValue = ISMARTCapped(address(token)).cap();
        uint256 largeMintAmount = capValue * 2; // Significantly over cap
        uint256 currentSupply = token.totalSupply();
        uint256 expectedNewSupply = currentSupply + largeMintAmount;

        vm.expectRevert(abi.encodeWithSelector(ISMARTCapped.ExceededCap.selector, expectedNewSupply, capValue));
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, largeMintAmount);
    }

    // --- Edge Cases ---

    function test_Capped_MintZeroAmount_Success() public {
        _setUpCappedTest();

        uint256 initialSupply = token.totalSupply();
        uint256 initialBalance = token.balanceOf(clientBE);

        // Minting zero should not affect cap logic
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, 0);

        assertEq(token.totalSupply(), initialSupply, "Total supply should not change when minting zero");
        assertEq(token.balanceOf(clientBE), initialBalance, "Balance should not change when minting zero");
    }

    function test_Capped_RemainingCapacity() public {
        _setUpCappedTest();

        uint256 capValue = ISMARTCapped(address(token)).cap();
        uint256 mintAmount = LARGE_MINT;

        // Mint some tokens
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, mintAmount);

        uint256 currentSupply = token.totalSupply();
        uint256 remainingCapacity = capValue - currentSupply;

        assertEq(currentSupply, mintAmount, "Current supply should equal mint amount");
        assertEq(remainingCapacity, capValue - mintAmount, "Remaining capacity calculation should be correct");
        assertTrue(remainingCapacity > 0, "Should have remaining capacity after partial mint");

        // Mint exactly the remaining capacity
        tokenUtils.mintToken(address(token), tokenIssuer, clientJP, remainingCapacity);

        assertEq(token.totalSupply(), capValue, "Should reach cap after minting remaining capacity");
    }

    function test_Capped_BoundaryValues() public {
        _setUpCappedTest();

        uint256 capValue = ISMARTCapped(address(token)).cap();

        // Test minting exactly (cap - 1)
        uint256 almostCapAmount = capValue - 1;
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, almostCapAmount);

        assertEq(token.totalSupply(), almostCapAmount, "Should mint almost to cap");

        // Test minting the final 1 wei
        tokenUtils.mintToken(address(token), tokenIssuer, clientJP, 1);

        assertEq(token.totalSupply(), capValue, "Should reach exact cap");

        // Test that minting even 1 wei more fails
        vm.expectRevert(abi.encodeWithSelector(ISMARTCapped.ExceededCap.selector, capValue + 1, capValue));
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, 1);
    }

    // --- Interface Support Tests ---

    function test_Capped_SupportsInterface() public {
        _setUpCappedTest();

        // Test ISMARTCapped interface support
        bytes4 cappedInterfaceId = type(ISMARTCapped).interfaceId;
        assertTrue(
            IERC165(address(token)).supportsInterface(cappedInterfaceId), "Should support ISMARTCapped interface"
        );

        // Test ERC165 interface support
        bytes4 erc165InterfaceId = type(IERC165).interfaceId;
        assertTrue(IERC165(address(token)).supportsInterface(erc165InterfaceId), "Should support ERC165 interface");
    }

    // --- Access Control Tests ---

    function test_Capped_MintAccessControl_Reverts() public {
        _setUpCappedTest();

        uint256 mintAmount = SMALL_MINT;

        // Try to mint without proper role
        vm.startPrank(clientBE); // Non-minter
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                clientBE,
                SMARTToken(address(token)).MINTER_ROLE()
            )
        );
        ISMARTCapped(address(token)); // Just to silence compiler about unused import
        token.mint(clientBE, mintAmount);
        vm.stopPrank();
    }

    // --- Integration with Other Extensions ---

    function test_Capped_WithBurnAndRemint_Success() public {
        _setUpCappedTest();

        uint256 capValue = ISMARTCapped(address(token)).cap();
        uint256 mintAmount = LARGE_MINT;
        uint256 burnAmount = SMALL_MINT;

        // Mint tokens
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, mintAmount);
        assertEq(token.totalSupply(), mintAmount, "Should mint initial amount");

        // Burn some tokens
        tokenUtils.burnToken(address(token), tokenIssuer, clientBE, burnAmount);
        assertEq(token.totalSupply(), mintAmount - burnAmount, "Should burn tokens and reduce supply");

        // Should be able to mint again within the cap
        uint256 remainingCapacity = capValue - token.totalSupply();
        tokenUtils.mintToken(address(token), tokenIssuer, clientJP, remainingCapacity);

        assertEq(token.totalSupply(), capValue, "Should reach cap after burn and remint");
    }

    // --- Cap Query Tests ---

    function test_Capped_CapView_Consistency() public {
        _setUpCappedTest();

        uint256 capValue = ISMARTCapped(address(token)).cap();

        // Cap should remain constant regardless of supply changes
        assertEq(capValue, DEFAULT_CAP, "Cap should equal deployment value");

        // Mint some tokens
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, SMALL_MINT);

        // Cap should remain the same
        uint256 capAfterMint = ISMARTCapped(address(token)).cap();
        assertEq(capAfterMint, capValue, "Cap should remain constant after minting");

        // Burn some tokens
        tokenUtils.burnToken(address(token), tokenIssuer, clientBE, SMALL_MINT / 2);

        // Cap should still remain the same
        uint256 capAfterBurn = ISMARTCapped(address(token)).cap();
        assertEq(capAfterBurn, capValue, "Cap should remain constant after burning");
    }

    // --- Complex Scenarios ---

    function test_Capped_MultipleUsers_AtCapacity() public {
        _setUpCappedTest();

        uint256 capValue = ISMARTCapped(address(token)).cap();
        uint256 amountPerUser = capValue / 3; // Distribute among 3 users

        // Mint to first user
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, amountPerUser);

        // Mint to second user
        tokenUtils.mintToken(address(token), tokenIssuer, clientJP, amountPerUser);

        // Mint remaining to third user (might be slightly different due to division)
        uint256 remainingAmount = capValue - token.totalSupply();
        tokenUtils.mintToken(address(token), tokenIssuer, clientUS, remainingAmount);

        assertEq(token.totalSupply(), capValue, "Should reach exact cap with multiple users");

        // Verify individual balances
        assertEq(token.balanceOf(clientBE), amountPerUser, "First user should have correct balance");
        assertEq(token.balanceOf(clientJP), amountPerUser, "Second user should have correct balance");
        assertEq(token.balanceOf(clientUS), remainingAmount, "Third user should have remaining amount");

        // No more minting should be possible
        vm.expectRevert(abi.encodeWithSelector(ISMARTCapped.ExceededCap.selector, capValue + 1, capValue));
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, 1);
    }

    // --- Set Cap Tests ---

    function test_SetCap_AsManager_Success() public {
        _setUpCappedTest();
        uint256 newCap = DEFAULT_CAP * 2;

        vm.startPrank(tokenIssuer);
        vm.expectEmit(true, true, true, true);
        emit ISMARTCapped.CapSet(tokenIssuer, newCap);
        SMARTToken(address(token)).setCap(newCap);
        vm.stopPrank();

        assertEq(ISMARTCapped(address(token)).cap(), newCap, "Cap should be updated to the new value");
    }

    function test_SetCap_LowerCap_Valid_Success() public {
        _setUpCappedTest();
        uint256 mintAmount = 100_000 ether;
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, mintAmount);

        uint256 newCap = mintAmount + 50_000 ether; // Lower than default, but higher than supply
        require(newCap < DEFAULT_CAP, "Test setup error: new cap should be lower than default");
        require(newCap > token.totalSupply(), "Test setup error: new cap must be > total supply");

        vm.startPrank(tokenIssuer);
        SMARTToken(address(token)).setCap(newCap);
        vm.stopPrank();

        assertEq(ISMARTCapped(address(token)).cap(), newCap, "Cap should be lowered");

        // Minting up to the new cap should succeed
        uint256 remaining = newCap - token.totalSupply();
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, remaining);
        assertEq(token.totalSupply(), newCap, "Total supply should equal the new cap");

        // Minting over the new cap should fail
        vm.expectRevert(abi.encodeWithSelector(ISMARTCapped.ExceededCap.selector, newCap + 1, newCap));
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, 1);
    }

    function test_SetCap_AsNonManager_Reverts() public {
        _setUpCappedTest();
        uint256 newCap = DEFAULT_CAP * 2;

        vm.startPrank(clientBE); // Unauthorized user
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                clientBE,
                SMARTToken(address(token)).CAP_MANAGEMENT_ROLE()
            )
        );
        SMARTToken(address(token)).setCap(newCap);
        vm.stopPrank();
    }

    function test_SetCap_BelowTotalSupply_Reverts() public {
        _setUpCappedTest();
        uint256 mintAmount = 500_000 ether;
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, mintAmount);

        uint256 newCap = mintAmount - 1; // Set cap just below total supply

        vm.startPrank(tokenIssuer);
        vm.expectRevert(abi.encodeWithSelector(ISMARTCapped.InvalidCap.selector, newCap));
        SMARTToken(address(token)).setCap(newCap);
        vm.stopPrank();
    }

    function test_SetCap_ToZero_Reverts() public {
        _setUpCappedTest();

        vm.startPrank(tokenIssuer);
        vm.expectRevert(abi.encodeWithSelector(ISMARTCapped.InvalidCap.selector, 0));
        SMARTToken(address(token)).setCap(0);
        vm.stopPrank();
    }
}
