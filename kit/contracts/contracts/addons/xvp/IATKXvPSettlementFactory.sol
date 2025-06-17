// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { IATKXvPSettlement } from "./IATKXvPSettlement.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @title IATKXvPSettlementFactory Interface
/// @notice Interface for the XvP Settlement Factory contract
/// @dev Defines the core functionality that must be implemented by the XvP Settlement Factory
interface IATKXvPSettlementFactory is IERC165 {
    /// @notice Returns a unique identifier for the type of this contract.
    function typeId() external pure returns (bytes32);

    /// @notice Returns the address of the current XvPSettlement implementation contract
    /// @return The address of the XvPSettlement logic contract
    function xvpSettlementImplementation() external view returns (address);

    /// @notice Initializes the factory with a trusted forwarder and an admin address
    /// @param forwarder The address of the trusted forwarder
    /// @param initialAdmin The address that will be granted admin role
    function initialize(address forwarder, address initialAdmin) external;

    /// @notice Creates a new XvPSettlement contract
    /// @param flows The array of token flows to include in the settlement
    /// @param cutoffDate Timestamp after which the settlement expires
    /// @param autoExecute If true, settlement executes automatically when all approvals are received
    /// @return contractAddress The address of the newly created settlement contract
    function create(
        IATKXvPSettlement.Flow[] memory flows,
        uint256 cutoffDate,
        bool autoExecute
    )
        external
        returns (address contractAddress);

    /// @notice Predicts the address where a XvPSettlement contract would be deployed
    /// @param flows The array of token flows that will be used in deployment
    /// @param cutoffDate Timestamp after which the settlement expires
    /// @param autoExecute If true, settlement executes automatically when all approvals are received
    /// @return predicted The address where the settlement contract would be deployed
    function predictAddress(
        IATKXvPSettlement.Flow[] memory flows,
        uint256 cutoffDate,
        bool autoExecute
    )
        external
        view
        returns (address predicted);

    /// @notice Checks if an address was deployed by this factory
    /// @param settlement The address to check
    /// @return True if the address was created by this factory, false otherwise
    function isAddressDeployed(address settlement) external view returns (bool);
}
