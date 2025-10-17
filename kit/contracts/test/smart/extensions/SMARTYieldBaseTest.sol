// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { AbstractSMARTTest } from "./AbstractSMARTTest.sol";
import { SMARTYieldHelpers, MockERC20 } from "./../../utils/SMARTYieldHelpers.sol";
import { IATKFixedYieldScheduleFactory } from "../../../contracts/addons/yield/IATKFixedYieldScheduleFactory.sol";
import {
    ATKFixedYieldScheduleFactoryImplementation
} from "../../../contracts/addons/yield/ATKFixedYieldScheduleFactoryImplementation.sol";
import { ATKPeopleRoles } from "../../../contracts/system/ATKPeopleRoles.sol";

/// @title Base test contract for SMART Yield functionality
/// @notice Provides shared state and setup for yield tests
abstract contract SMARTYieldBaseTest is AbstractSMARTTest, SMARTYieldHelpers {
    IATKFixedYieldScheduleFactory internal yieldScheduleFactory;
    address internal yieldPaymentToken;

    function _setUpYieldTest() internal virtual {
        super.setUp();
        _setupDefaultCollateralClaim();

        // Deploy yield payment token (using a simple ERC20 mock for testing)
        if (yieldPaymentToken == address(0)) {
            yieldPaymentToken = address(new MockERC20("Yield Token", "YIELD", 6));
        }

        // Deploy yield schedule factory
        vm.startPrank(platformAdmin);
        ATKFixedYieldScheduleFactoryImplementation fixedYieldScheduleFactoryImpl =
            new ATKFixedYieldScheduleFactoryImplementation(address(address(0)));

        yieldScheduleFactory = IATKFixedYieldScheduleFactory(
            systemUtils.systemAddonRegistry()
                .registerSystemAddon(
                    "fixed-yield-schedule-factory",
                    address(fixedYieldScheduleFactoryImpl),
                    abi.encodeWithSelector(
                        ATKFixedYieldScheduleFactoryImplementation.initialize.selector,
                        address(systemUtils.systemAccessManager()),
                        address(systemUtils.system())
                    )
                )
        );
        vm.label(address(yieldScheduleFactory), "Yield Schedule Factory");

        systemUtils.systemAccessManager().grantRole(ATKPeopleRoles.ADDON_MANAGER_ROLE, tokenIssuer);

        vm.stopPrank();

        // Start at a high block number that can accommodate timestamps as block numbers
        _ensureBlockAlignment();
    }
}
