// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { AbstractSMARTTest } from "./AbstractSMARTTest.sol";
import { SMARTYieldHelpers, MockERC20 } from "./../utils/SMARTYieldHelpers.sol";
import { SMARTFixedYieldScheduleFactory } from
    "../../contracts/extensions/yield/schedules/fixed/SMARTFixedYieldScheduleFactory.sol";

/// @title Base test contract for SMART Yield functionality
/// @notice Provides shared state and setup for yield tests
abstract contract SMARTYieldBaseTest is AbstractSMARTTest, SMARTYieldHelpers {
    SMARTFixedYieldScheduleFactory internal yieldScheduleFactory;
    address internal yieldPaymentToken;

    function _setUpYieldTest() internal virtual {
        super.setUp();
        _setupDefaultCollateralClaim();

        // Deploy yield payment token (using a simple ERC20 mock for testing)
        if (yieldPaymentToken == address(0)) {
            yieldPaymentToken = address(new MockERC20("Yield Token", "YIELD"));
        }

        // Deploy yield schedule factory
        yieldScheduleFactory = new SMARTFixedYieldScheduleFactory(address(0));

        // Start at a high block number that can accommodate timestamps as block numbers
        _ensureBlockAlignment();
    }
}
