// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { SMARTFixedYieldScheduleLogic } from "./internal/SMARTFixedYieldScheduleLogic.sol";

/// @title SMART Fixed Yield Schedule Contract (Non-Upgradeable)
/// @author SettleMint
/// @notice This abstract contract provides a fixed yield schedule implementation for SMART tokens
abstract contract SMARTFixedYieldSchedule is SMARTFixedYieldScheduleLogic {
    /// @notice Constructor to deploy a new `SMARTFixedYieldSchedule` contract.
    /// @dev If not a logic contract, initializes all parameters. Otherwise, defers to `initialize()`.
    /// @param tokenAddress_ Address of the `ISMARTYield` token.
    /// @param startDate_ Start date of the yield schedule.
    /// @param endDate_ End date of the yield schedule.
    /// @param rate_ Yield rate in basis points.
    /// @param interval_ Duration of each yield interval.
    constructor(address tokenAddress_, uint256 startDate_, uint256 endDate_, uint256 rate_, uint256 interval_) {
        __SMARTFixedYieldSchedule_init_unchained(tokenAddress_, startDate_, endDate_, rate_, interval_);
    }
}
