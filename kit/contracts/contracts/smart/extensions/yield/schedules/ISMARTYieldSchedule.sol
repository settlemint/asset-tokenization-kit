// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title Interface for a generic SMART Yield Schedule contract
/// @author SettleMint
/// @notice This interface defines the most basic function that any yield schedule contract,
/// associated with a SMART
/// token's yield extension, must implement.
/// It primarily ensures that the associated SMART token (e.g., via `_SMARTYieldLogic`) can query the start date of the
/// yield schedule.
/// @dev Yield schedule contracts are external contracts that dictate the rules, timing, and calculations for yield
/// distribution.
/// This interface is often extended by more specific schedule interfaces (like `ISMARTFixedYieldSchedule`) that define
/// more complex functionalities.
/// The `startDate()` function is crucial for logic that might depend on whether the yield distribution period has begun
/// (e.g., restricting minting after the start date).
interface ISMARTYieldSchedule {
    /// @notice Returns the timestamp representing the start date and time of the yield schedule.
    /// @dev This function provides the point in time (as a Unix timestamp, seconds since epoch) from which the yield
    /// schedule
    /// is considered active or when yield calculations/distributions commence.
    /// This is a `view` function, meaning it does not modify the contract's state and can be called without gas cost if
    /// called externally (not from another contract transaction).
    /// @return startDateTimestamp The Unix timestamp indicating when the yield schedule begins.
    function startDate() external view returns (uint256 startDateTimestamp);
}
