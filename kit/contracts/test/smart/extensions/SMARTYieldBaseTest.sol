// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { AbstractSMARTTest } from "./AbstractSMARTTest.sol";
import { SMARTYieldHelpers, MockERC20 } from "./../../utils/SMARTYieldHelpers.sol";
import { ATKFixedYieldScheduleFactory } from "../../../contracts/system/yield/ATKFixedYieldScheduleFactory.sol";
import { ATKSystemRoles } from "../../../contracts/system/ATKSystemRoles.sol";

/// @title Base test contract for SMART Yield functionality
/// @notice Provides shared state and setup for yield tests
abstract contract SMARTYieldBaseTest is AbstractSMARTTest, SMARTYieldHelpers {
    ATKFixedYieldScheduleFactory internal yieldScheduleFactory;
    address internal yieldPaymentToken;

    function _setUpYieldTest() internal virtual {
        super.setUp();
        _setupDefaultCollateralClaim();

        // Deploy yield payment token (using a simple ERC20 mock for testing)
        if (yieldPaymentToken == address(0)) {
            yieldPaymentToken = address(new MockERC20("Yield Token", "YIELD"));
        }

        // Deploy yield schedule factory
        vm.startPrank(platformAdmin);
        yieldScheduleFactory = new ATKFixedYieldScheduleFactory(address(systemUtils.system()), address(0));
        vm.label(address(yieldScheduleFactory), "Yield Schedule Factory");

        IAccessControl(yieldScheduleFactory).grantRole(ATKSystemRoles.DEPLOYER_ROLE, tokenIssuer);

        // Grant bypass list manager role to yield schedule factory
        IAccessControl(address(systemUtils.compliance())).grantRole(
            ATKSystemRoles.BYPASS_LIST_MANAGER_ROLE, address(yieldScheduleFactory)
        );
        vm.stopPrank();

        // Start at a high block number that can accommodate timestamps as block numbers
        _ensureBlockAlignment();
    }
}
