// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { AbstractSMARTTest } from "./AbstractSMARTTest.sol";
import { IERC20Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ISMARTBurnable } from "../../../contracts/smart/extensions/burnable/ISMARTBurnable.sol";
import { SMARTToken } from "../examples/SMARTToken.sol";

abstract contract SMARTBurnableTest is AbstractSMARTTest {
    function _setUpBurnableTest() internal /* override */ {
        super.setUp();
        // Ensure token has default collateral set up for burn tests
        _setupDefaultCollateralClaim();
        _mintInitialBalances();
    }

    function test_Burn_Success() public {
        _setUpBurnableTest();
        uint256 burnAmount = 100 ether;
        uint256 balBESnap = token.balanceOf(clientBE);
        uint256 hookCountSnap = mockComplianceModule.destroyedCallCount();

        tokenUtils.burnToken(address(token), tokenIssuer, clientBE, burnAmount);

        assertEq(token.balanceOf(clientBE), balBESnap - burnAmount, "Balance wrong after burn");
        assertEq(mockComplianceModule.destroyedCallCount(), hookCountSnap + 1, "Hook count wrong after burn");
    }

    function test_Burn_InsufficientBalance_Reverts() public {
        _setUpBurnableTest();
        uint256 senderBalance = token.balanceOf(clientBE);
        uint256 burnAmount = senderBalance + 1 ether;

        vm.expectRevert(
            abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, clientBE, senderBalance, burnAmount)
        );
        tokenUtils.burnToken(address(token), tokenIssuer, clientBE, burnAmount);
    }

    function test_Burn_AccessControl_Reverts() public {
        _setUpBurnableTest();
        vm.startPrank(clientBE); // Non-owner
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector,
                clientBE,
                SMARTToken(address(token)).BURNER_ROLE()
            )
        );
        tokenUtils.burnTokenAsExecutor(address(token), clientBE, clientBE, 10 ether);
        vm.stopPrank();
    }

    function test_SupportsInterface_Burnable() public {
        _setUpBurnableTest();
        assertTrue(
            IERC165(address(token)).supportsInterface(type(ISMARTBurnable).interfaceId),
            "Token does not support ISMARTBurnable interface"
        );
    }
}
