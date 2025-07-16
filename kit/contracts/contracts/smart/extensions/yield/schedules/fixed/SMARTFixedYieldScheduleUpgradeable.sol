// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { SMARTFixedYieldScheduleLogic } from "./internal/SMARTFixedYieldScheduleLogic.sol";
import { ISMARTFixedYieldSchedule } from "./ISMARTFixedYieldSchedule.sol";

abstract contract SMARTFixedYieldScheduleUpgradeable is SMARTFixedYieldScheduleLogic {
    /// @notice Initializes the SMART Fixed Yield Schedule logic.
    /// @dev This function should be called by the implementing contract's initializer.
    /// @param tokenAddress_ Address of the `ISMARTYield` token.
    /// @param startDate_ Start date of the yield schedule.
    /// @param endDate_ End date of the yield schedule.
    /// @param rate_ Yield rate in basis points.
    /// @param interval_ Duration of each yield interval.
    function __SMARTFixedYieldSchedule_init(
        address tokenAddress_,
        uint256 startDate_,
        uint256 endDate_,
        uint256 rate_,
        uint256 interval_
    )
        internal
        virtual
    {
        __SMARTFixedYieldSchedule_init_unchained(tokenAddress_, startDate_, endDate_, rate_, interval_);
    }
}
