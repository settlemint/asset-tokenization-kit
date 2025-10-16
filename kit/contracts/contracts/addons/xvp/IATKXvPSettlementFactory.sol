// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IATKXvPSettlement } from "./IATKXvPSettlement.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @title IATKXvPSettlementFactory - Interface for the XvP Settlement Factory contract
/// @author SettleMint
/// @notice Interface for the XvP Settlement Factory contract
/// @dev Defines the core functionality that must be implemented by the XvP Settlement Factory
interface IATKXvPSettlementFactory is IERC165 {
    /// @notice Emitted when a new XvPSettlement contract is created
    /// @param settlement The address of the newly created settlement contract
    /// @param creator The address that created the settlement contract
    event ATKXvPSettlementCreated(address indexed settlement, address indexed creator);

    /// @notice Returns a unique identifier for the type of this contract
    /// @return The unique type identifier as a bytes32 hash
    function typeId() external pure returns (bytes32);

    /// @notice Returns the address of the current XvPSettlement implementation contract
    /// @return The address of the XvPSettlement logic contract
    function xvpSettlementImplementation() external view returns (address);

    /// @notice Initializes the factory with access manager and system address
    /// @param accessManager The address of the access manager.
    /// @param systemAddress The address of the `IATKSystem` contract.
    function initialize(address accessManager, address systemAddress) external;

    /// @notice Creates a new XvPSettlement contract
    /// @param name The name of the settlement
    /// @param flows The array of token flows to include in the settlement
    /// @param cutoffDate Timestamp after which the settlement expires
    /// @param autoExecute If true, settlement executes automatically when all approvals are received
    /// @param hashlock The optional HTLC hashlock (required if external flows are present)
    /// @return contractAddress The address of the newly created settlement contract
    function create(
        string memory name,
        IATKXvPSettlement.Flow[] memory flows,
        uint256 cutoffDate,
        bool autoExecute,
        bytes32 hashlock
    )
        external
        returns (address contractAddress);

    /// @notice Predicts the address where a XvPSettlement contract would be deployed
    /// @param name The name of the settlement
    /// @param flows The array of token flows that will be used in deployment
    /// @param cutoffDate Timestamp after which the settlement expires
    /// @param autoExecute If true, settlement executes automatically when all approvals are received
    /// @param hashlock The optional HTLC hashlock (required if external flows are present)
    /// @return predicted The address where the settlement contract would be deployed
    function predictAddress(
        string memory name,
        IATKXvPSettlement.Flow[] memory flows,
        uint256 cutoffDate,
        bool autoExecute,
        bytes32 hashlock
    )
        external
        view
        returns (address predicted);

    /// @notice Checks if an address was deployed by this factory
    /// @param settlement The address to check
    /// @return True if the address was created by this factory, false otherwise
    function isAddressDeployed(address settlement) external view returns (bool);
}
