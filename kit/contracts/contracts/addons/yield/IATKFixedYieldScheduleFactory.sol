// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ISMARTYield } from "../../smart/extensions/yield/ISMARTYield.sol";

/// @title IATKFixedYieldScheduleFactory
/// @author SettleMint
/// @notice Interface for the ATKFixedYieldScheduleFactory contract
/// @dev This interface defines the functions and events for creating and managing
/// ATKFixedYieldSchedule proxy contracts. The factory deploys proxies that delegate
/// to a shared implementation contract, which can be updated by authorized roles.
interface IATKFixedYieldScheduleFactory {
    /// @notice Emitted when the `atkFixedYieldScheduleImplementation` is updated.
    /// @param oldImplementation The address of the previous implementation contract.
    /// @param newImplementation The address of the new implementation contract.
    event ImplementationUpdated(address indexed oldImplementation, address indexed newImplementation);

    /// @notice Emitted when a new `ATKFixedYieldSchedule` proxy contract is successfully created and deployed.
    /// @param schedule The address of the newly deployed `ATKFixedYieldProxy` contract.
    /// @param creator The address that initiated the creation of the yield schedule proxy.
    event ATKFixedYieldScheduleCreated(address indexed schedule, address indexed creator);

    /// @notice Custom error for invalid address parameter.
    error InvalidAddress();
    /// @notice Custom error when attempting to set the same address.
    error SameAddress();
    /// @notice Custom error for invalid implementation address.
    error InvalidImplementation();

    /// @notice Returns the address of the current ATKFixedYieldSchedule logic contract (implementation).
    /// @dev This function is expected to be available on the factory contract.
    /// It's typically created automatically if the factory has a public state variable
    /// named `atkFixedYieldScheduleImplementation`.
    /// @return The address of the current implementation contract
    function atkFixedYieldScheduleImplementation() external view returns (address);

    /// @notice Creates a new ATKFixedYieldSchedule proxy contract.
    /// @dev This function deploys a new proxy contract that delegates to the current implementation.
    /// The proxy is deployed using CREATE2 for deterministic addresses.
    /// @param token The `ISMARTYield`-compliant token for which the yield schedule is being created
    /// @param startTime The Unix timestamp for the schedule start
    /// @param endTime The Unix timestamp for the schedule end
    /// @param rate The yield rate in basis points
    /// @param interval The interval for yield distributions in seconds
    /// @param country Country code for compliance purposes
    /// @return scheduleProxyAddress The address of the newly created `ATKFixedYieldProxy` contract
    function create(
        ISMARTYield token,
        uint256 startTime,
        uint256 endTime,
        uint256 rate,
        uint256 interval,
        uint16 country
    )
        external
        returns (address scheduleProxyAddress);
}
