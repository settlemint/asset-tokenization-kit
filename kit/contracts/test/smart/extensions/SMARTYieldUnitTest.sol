// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { SMARTYieldBaseTest } from "./SMARTYieldBaseTest.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ISMARTYield } from "../../../contracts/smart/extensions/yield/ISMARTYield.sol";
import { ISMART } from "../../../contracts/smart/interface/ISMART.sol";
import { SMARTYieldToken } from "../examples/SMARTYieldToken.sol";

/// @title Unit tests for SMART Yield core functionality
/// @notice Tests basic yield schedule management, configuration, and validation
abstract contract SMARTYieldUnitTest is SMARTYieldBaseTest {
    // --- Core Extension Tests ---

    function test_Yield_SupportsInterface() public {
        _setUpYieldTest();

        // Test ISMARTYield interface support
        bytes4 yieldInterfaceId = type(ISMARTYield).interfaceId;
        assertTrue(IERC165(address(token)).supportsInterface(yieldInterfaceId), "Should support ISMARTYield interface");

        // Test ERC165 interface support
        bytes4 erc165InterfaceId = type(IERC165).interfaceId;
        assertTrue(IERC165(address(token)).supportsInterface(erc165InterfaceId), "Should support ERC165 interface");
    }

    function test_Yield_InitialState() public {
        _setUpYieldTest();

        // Verify initial state
        assertEq(
            ISMARTYield(address(token)).yieldSchedule(), address(0), "Initial yield schedule should be zero address"
        );
        assertEq(
            ISMARTYield(address(token)).yieldBasisPerUnit(clientBE),
            DEFAULT_YIELD_BASIS,
            "Yield basis should be set to default"
        );
        assertEq(
            address(ISMARTYield(address(token)).yieldToken()), yieldPaymentToken, "Yield token should be set correctly"
        );
    }

    // --- Yield Schedule Management Tests ---

    function test_Yield_SetYieldSchedule_Success() public {
        _setUpYieldTest();

        address scheduleAddress = _createYieldSchedule(yieldScheduleFactory, ISMARTYield(address(token)), tokenIssuer);

        vm.expectEmit(true, true, false, true);
        emit ISMARTYield.YieldScheduleSet(tokenIssuer, scheduleAddress);

        vm.prank(tokenIssuer);
        ISMARTYield(address(token)).setYieldSchedule(scheduleAddress);

        assertEq(ISMARTYield(address(token)).yieldSchedule(), scheduleAddress, "Yield schedule should be set correctly");
    }

    function test_Yield_SetYieldSchedule_ZeroAddress_Reverts() public {
        _setUpYieldTest();

        vm.expectRevert(abi.encodeWithSelector(ISMART.ZeroAddressNotAllowed.selector));
        vm.prank(tokenIssuer);
        ISMARTYield(address(token)).setYieldSchedule(address(0));
    }

    function test_Yield_SetYieldSchedule_AlreadySet_Reverts() public {
        _setUpYieldTest();

        address scheduleAddress = _createYieldSchedule(yieldScheduleFactory, ISMARTYield(address(token)), tokenIssuer);

        // Set schedule first time
        vm.prank(tokenIssuer);
        ISMARTYield(address(token)).setYieldSchedule(scheduleAddress);

        // Try to set again with different parameters to avoid CREATE2 collision
        address anotherSchedule = _createYieldSchedule(
            yieldScheduleFactory, ISMARTYield(address(token)), tokenIssuer, block.timestamp + 2 days
        );
        vm.expectRevert(abi.encodeWithSelector(ISMARTYield.YieldScheduleAlreadySet.selector));
        vm.prank(tokenIssuer);
        ISMARTYield(address(token)).setYieldSchedule(anotherSchedule);
    }

    function test_Yield_SetYieldSchedule_AccessControl_Reverts() public {
        _setUpYieldTest();

        address scheduleAddress = _createYieldSchedule(yieldScheduleFactory, ISMARTYield(address(token)), tokenIssuer);

        // Try to set schedule without proper role
        vm.startPrank(clientBE);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                clientBE,
                SMARTYieldToken(address(token)).TOKEN_ADMIN_ROLE()
            )
        );
        ISMARTYield(address(token)).setYieldSchedule(scheduleAddress);
        vm.stopPrank();
    }

    // --- Minting Restriction Tests ---

    function test_Yield_MintBeforeScheduleStarts_Success() public {
        _setUpYieldTest();

        uint256 futureStartDate = block.timestamp + 7 days;
        address scheduleAddress =
            _createYieldSchedule(yieldScheduleFactory, ISMARTYield(address(token)), tokenIssuer, futureStartDate);

        // Set yield schedule
        vm.prank(tokenIssuer);
        ISMARTYield(address(token)).setYieldSchedule(scheduleAddress);

        // Minting should work before schedule starts
        uint256 mintAmount = 1000 ether;
        uint256 initialBalance = token.balanceOf(clientBE);

        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, mintAmount);

        assertEq(
            token.balanceOf(clientBE), initialBalance + mintAmount, "Minting should succeed before schedule starts"
        );
    }

    function test_Yield_MintAfterScheduleStarts_Reverts() public {
        _setUpYieldTest();

        // Create a schedule that starts in the future
        uint256 futureStartDate = block.timestamp + 1 days;
        address scheduleAddress =
            _createYieldSchedule(yieldScheduleFactory, ISMARTYield(address(token)), tokenIssuer, futureStartDate);

        // Set yield schedule
        vm.prank(tokenIssuer);
        ISMARTYield(address(token)).setYieldSchedule(scheduleAddress);

        // Move time to after schedule starts
        _advanceTimeAndBlock(futureStartDate + 1);

        // Minting should fail after schedule starts
        uint256 mintAmount = 1000 ether;

        vm.expectRevert(abi.encodeWithSelector(ISMARTYield.YieldScheduleActive.selector));
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, mintAmount);
    }

    function test_Yield_MintWithoutSchedule_Success() public {
        _setUpYieldTest();

        // Minting should work without any schedule set
        uint256 mintAmount = 1000 ether;
        uint256 initialBalance = token.balanceOf(clientBE);

        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, mintAmount);

        assertEq(token.balanceOf(clientBE), initialBalance + mintAmount, "Minting should succeed without schedule");
    }

    function test_Yield_MintAtScheduleStartTime_Reverts() public {
        _setUpYieldTest();

        // Use a future start date, then warp to that time
        uint256 startDate = block.timestamp + 1 days;
        address scheduleAddress =
            _createYieldSchedule(yieldScheduleFactory, ISMARTYield(address(token)), tokenIssuer, startDate);

        // Set yield schedule
        vm.prank(tokenIssuer);
        ISMARTYield(address(token)).setYieldSchedule(scheduleAddress);

        // Warp to exactly the start time
        vm.warp(startDate);

        // Minting should fail at exactly the start time
        uint256 mintAmount = 1000 ether;

        vm.expectRevert(abi.encodeWithSelector(ISMARTYield.YieldScheduleActive.selector));
        tokenUtils.mintToken(address(token), tokenIssuer, clientBE, mintAmount);
    }

    // --- Yield Basis Configuration Tests ---

    function test_Yield_YieldBasisPerUnit_Consistency() public {
        _setUpYieldTest();

        // Yield basis should be consistent for all holders (using default implementation)
        uint256 basisBE = ISMARTYield(address(token)).yieldBasisPerUnit(clientBE);
        uint256 basisJP = ISMARTYield(address(token)).yieldBasisPerUnit(clientJP);
        uint256 basisUS = ISMARTYield(address(token)).yieldBasisPerUnit(clientUS);

        assertEq(basisBE, DEFAULT_YIELD_BASIS, "Yield basis for clientBE should match default");
        assertEq(basisJP, DEFAULT_YIELD_BASIS, "Yield basis for clientJP should match default");
        assertEq(basisUS, DEFAULT_YIELD_BASIS, "Yield basis for clientUS should match default");
        assertEq(basisBE, basisJP, "Yield basis should be consistent across holders");
        assertEq(basisJP, basisUS, "Yield basis should be consistent across holders");
    }

    function test_Yield_YieldBasisPerUnit_NonZero() public {
        _setUpYieldTest();

        uint256 basis = ISMARTYield(address(token)).yieldBasisPerUnit(clientBE);
        assertTrue(basis > 0, "Yield basis should be greater than zero");
    }

    // --- Yield Token Configuration Tests ---

    function test_Yield_YieldToken_Correct() public {
        _setUpYieldTest();

        IERC20 configuredYieldToken = ISMARTYield(address(token)).yieldToken();
        assertEq(address(configuredYieldToken), yieldPaymentToken, "Yield token should match configured payment token");
    }

    function test_Yield_YieldToken_NotZeroAddress() public {
        _setUpYieldTest();

        IERC20 configuredYieldToken = ISMARTYield(address(token)).yieldToken();
        assertTrue(address(configuredYieldToken) != address(0), "Yield token should not be zero address");
    }

    // --- Edge Cases and Error Conditions ---

    function test_Yield_ScheduleNotSet_Queries() public {
        _setUpYieldTest();

        // Queries should work even without schedule set
        assertEq(ISMARTYield(address(token)).yieldSchedule(), address(0), "Yield schedule should be zero address");
        assertEq(
            ISMARTYield(address(token)).yieldBasisPerUnit(clientBE),
            DEFAULT_YIELD_BASIS,
            "Yield basis should work without schedule"
        );
        assertEq(
            address(ISMARTYield(address(token)).yieldToken()),
            yieldPaymentToken,
            "Yield token should work without schedule"
        );
    }
}
