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
    /// @notice Event emitted when an XvP settlement is approved by a party
    event XvPSettlementApproved(address indexed sender);

    /// @notice Event emitted when an XvP settlement approval is revoked
    event XvPSettlementApprovalRevoked(address indexed sender);

    /// @notice Event emitted when an XvP settlement is executed
    event XvPSettlementExecuted(address indexed sender);

    /// @notice Event emitted when an XvP settlement is cancelled
    event XvPSettlementCancelled(address indexed sender);

    // Custom errors
    error XvPSettlementAlreadyExecuted();
    error XvPSettlementAlreadyCancelled();
    error XvPSettlementExpired();
    error XvPSettlementNotExpired();
    error ZeroAmount();
    error ZeroAddress();
    error EmptyFlows();
    error InvalidCutoffDate();
    error InvalidToken();
    error SenderNotInvolvedInSettlement();
    error SenderAlreadyApprovedSettlement();
    error SenderNotApprovedSettlement();
    error XvPSettlementNotApproved();
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

    /// @notice Returns whether an account has approved the settlement
    /// @param account The account to check approvals for
    /// @return True if the account has approved the settlement
    function approvals(address account) external view returns (bool);

    /// @notice Returns the timestamp when the settlement was created
    /// @return The creation timestamp
    function createdAt() external view returns (uint256);

    /// @notice Returns the name of the settlement
    /// @return The settlement name
    function name() external view returns (string memory);

    /// @notice Checks if all parties have approved the settlement
    /// @return True if all parties have approved
    function isFullyApproved() external view returns (bool);

    // State-changing functions
    /// @notice Approves a XvP settlement for execution
    /// @dev The caller must be a party in the settlement's flows
    /// @return True if the approval was successful
    function approve() external returns (bool);

    /// @notice Executes the settlement if all approvals are in place
    /// @return True if execution was successful
    function execute() external returns (bool);

    /// @notice Revokes approval for a XvP settlement
    /// @dev The caller must have previously approved the settlement
    /// @return True if the revocation was successful
    function revokeApproval() external returns (bool);

    /// @notice Cancels the settlement
    /// @return True if the cancellation was successful
    function cancel() external returns (bool);
}
