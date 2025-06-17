// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @title IATKXvPSettlement - Interface for cross-value proposition settlements
/// @notice Interface for contracts that facilitate atomic swaps between parties with multiple token flows
/// @custom:security-contact support@settlemint.com
interface IATKXvPSettlement is IERC165 {
    /// @notice A struct representing a token flow in the settlement
    /// @dev Each flow represents a transfer from one address to another of a specific token amount
    struct Flow {
        address asset; // The token contract address
        address from; // The sender's address
        address to; // The recipient's address
        uint256 amount; // The amount to transfer
    }

    /// @notice The current status of the settlement
    enum SettlementStatus {
        ACTIVE, // Settlement is active and awaiting approvals
        EXECUTED, // Settlement has been successfully executed
        CANCELLED, // Settlement was cancelled by a party
        EXPIRED // Settlement expired before execution

    }

    // Events
    /// @notice Emitted when a flow is approved by its sender
    /// @param flowIndex The index of the approved flow
    /// @param approver The address that approved the flow
    event FlowApproved(uint256 indexed flowIndex, address indexed approver);

    /// @notice Emitted when a flow approval is revoked by its sender
    /// @param flowIndex The index of the flow whose approval was revoked
    /// @param revoker The address that revoked the approval
    event FlowApprovalRevoked(uint256 indexed flowIndex, address indexed revoker);

    /// @notice Emitted when the settlement is successfully executed
    /// @param executor The address that triggered the execution
    event SettlementExecuted(address indexed executor);

    /// @notice Emitted when the settlement is cancelled
    /// @param canceller The address that cancelled the settlement
    event SettlementCancelled(address indexed canceller);

    /// @notice Emitted when the settlement expires
    event SettlementExpired();

    // Custom errors
    error SettlementExpiredError();
    error SettlementNotActive();
    error FlowNotApproved();
    error NotInvolved();
    error EmptyFlows();
    error InvalidToken();
    error ZeroAddress();
    error SameAddress();
    error AlreadyApproved();
    error NotApproved();
    error ZeroAmount();
    error AllFlowsNotApproved();
    error TokenValidationFailed();
    error InsufficientAllowance(address token, address owner, address spender, uint256 required, uint256 allowed);

    // View functions
    /// @notice Returns the cutoff date after which the settlement expires
    /// @return The cutoff date timestamp
    function cutoffDate() external view returns (uint256);

    /// @notice Returns whether the settlement should auto-execute when all approvals are received
    /// @return True if auto-execute is enabled
    function autoExecute() external view returns (bool);

    /// @notice Returns whether the settlement has been executed
    /// @return True if the settlement has been executed
    function executed() external view returns (bool);

    /// @notice Returns whether the settlement has been cancelled
    /// @return True if the settlement has been cancelled
    function cancelled() external view returns (bool);

    /// @notice Returns all flows in the settlement
    /// @return Array of all flows
    function flows() external view returns (Flow[] memory);

    /// @notice Returns whether an account has approved their flows
    /// @param account The account to check approvals for
    /// @return True if the account has approved their flows
    function approvals(address account) external view returns (bool);

    /// @notice Returns the timestamp when the settlement was created
    /// @return The creation timestamp
    function createdAt() external view returns (uint256);

    /// @notice Checks if all flows are approved
    /// @return True if all flows are approved
    function isFullyApproved() external view returns (bool);

    // State-changing functions
    /// @notice Approves a flow for execution
    /// @param flowIndex The index of the flow to approve
    /// @return True if the approval was successful
    function approve(uint256 flowIndex) external returns (bool);

    /// @notice Executes the settlement if all approvals are in place
    /// @return True if execution was successful
    function execute() external returns (bool);

    /// @notice Revokes approval for a flow
    /// @param flowIndex The index of the flow to revoke approval for
    /// @return True if the revocation was successful
    function revokeApproval(uint256 flowIndex) external returns (bool);

    /// @notice Cancels the settlement
    /// @return True if the cancellation was successful
    function cancel() external returns (bool);
}
