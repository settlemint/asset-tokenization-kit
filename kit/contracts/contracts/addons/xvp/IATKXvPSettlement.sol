// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @title IATKXvPSettlement - Interface for cross-value proposition settlements
/// @author SettleMint
/// @notice Interface for contracts that facilitate atomic swaps between parties with multiple token flows
/// @custom:security-contact support@settlemint.com
interface IATKXvPSettlement is IERC165 {
    /// @notice A struct representing a token flow in the settlement
    /// @dev Each flow represents a transfer from one address to another of a specific token amount
    // solhint-disable-next-line gas-struct-packing
    struct Flow {
        address asset; // The token contract address (local or external reference)
        address from; // The sender's address
        address to; // The recipient's address
        uint256 amount; // The amount to transfer
        uint64 externalChainId; // 0 for local flows, foreign chain id for external flows
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
    /// @param sender The address of the party that approved the settlement
    event XvPSettlementApproved(address indexed sender);

    /// @notice Event emitted when an XvP settlement approval is revoked
    /// @param sender The address of the party that revoked their approval
    event XvPSettlementApprovalRevoked(address indexed sender);

    /// @notice Event emitted when an XvP settlement is executed
    /// @param sender The address that executed the settlement
    event XvPSettlementExecuted(address indexed sender);

    /// @notice Event emitted when an XvP settlement is cancelled
    /// @param sender The address that cancelled the settlement
    event XvPSettlementCancelled(address indexed sender);

    /// @notice Event emitted when the settlement hashlock secret is revealed
    /// @param revealer The address that submitted the valid secret
    /// @param secret The raw secret that unlocked the settlement
    event XvPSettlementSecretRevealed(address indexed revealer, bytes secret);
    /// @notice Event emitted when a cancel vote is cast by a participant
    /// @param voter The address of the participant casting the cancel vote
    event XvPSettlementCancelVoteCast(address indexed voter);
    /// @notice Event emitted when a cancel vote is withdrawn by a participant
    /// @param voter The address of the participant withdrawing the cancel vote
    event XvPSettlementCancelVoteWithdrawn(address indexed voter);

    // Custom errors
    /// @notice Error thrown when attempting to execute an already executed settlement
    error XvPSettlementAlreadyExecuted();
    /// @notice Error thrown when attempting to execute an already cancelled settlement
    error XvPSettlementAlreadyCancelled();
    /// @notice Error thrown when attempting to execute an expired settlement
    error XvPSettlementExpired();
    /// @notice Error thrown when attempting an operation that requires the settlement to be expired
    error XvPSettlementNotExpired();
    /// @notice Error thrown when a flow amount is zero
    error ZeroAmount();
    /// @notice Error thrown when an address is the zero address
    error ZeroAddress();
    /// @notice Error thrown when no flows are provided
    error EmptyFlows();
    /// @notice Error thrown when the cutoff date is invalid
    error InvalidCutoffDate();
    /// @notice Error thrown when a token address is invalid
    error InvalidToken();
    /// @notice Error thrown when the sender is not involved in the settlement
    error SenderNotInvolvedInSettlement();
    /// @notice Error thrown when the sender has already approved the settlement
    error SenderAlreadyApprovedSettlement();
    /// @notice Error thrown when the sender has not approved the settlement
    error SenderNotApprovedSettlement();
    /// @notice Error thrown when the settlement is not fully approved by all parties
    error XvPSettlementNotApproved();
    /// @notice Error thrown when there is insufficient token allowance
    /// @param token The token address
    /// @param owner The token owner address
    /// @param spender The spender address
    /// @param required The required allowance amount
    /// @param allowed The current allowance amount
    error InsufficientAllowance(address token, address owner, address spender, uint256 required, uint256 allowed);
    /// @notice Error thrown when an external flow specifies the current chain id
    /// @param externalChainId The invalid external chain identifier
    error InvalidExternalChainId(uint64 externalChainId);
    /// @notice Error thrown when a hashlock is required but missing
    error HashlockRequired();
    /// @notice Error thrown when attempting to reveal a secret without a hashlock gate
    error HashlockRevealNotRequired();
    /// @notice Error thrown when attempting to reveal a secret more than once
    error SecretAlreadyRevealed();
    /// @notice Error thrown when the provided secret does not match the hashlock
    error InvalidSecret();
    /// @notice Error thrown when attempting to execute before the secret is revealed
    error SecretNotRevealed();
    /// @notice Error thrown when a function requires a local sender but caller is not one
    error SenderNotLocal();
    /// @notice Error thrown when cancellation is not allowed in the current settlement state
    error CancelNotAllowed();
    /// @notice Error thrown when a cancel vote already exists for the caller
    /// @param voter The voter that already cast a cancel vote
    error CancelVoteAlreadyCast(address voter);
    /// @notice Error thrown when attempting to withdraw a non-existent cancel vote
    /// @param voter The voter without a recorded cancel vote
    error CancelVoteNotCast(address voter);
    /// @notice Error thrown when attempting to revoke after all local approvals are in place for an external settlement
    error RevocationNotAllowedAfterCommit();

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

    /// @notice Returns the hashlock associated with the settlement
    /// @return The keccak256 hashlock value
    function hashlock() external view returns (bytes32);

    /// @notice Returns whether any external flows exist
    /// @return True if at least one flow targets an external chain
    function hasExternalFlows() external view returns (bool);

    /// @notice Returns whether the reveal secret has been provided
    /// @return True if the secret has been revealed
    function secretRevealed() external view returns (bool);

    /// @notice Returns whether the settlement is in the armed state
    /// @return True if the settlement is armed (waiting for secret reveal)
    function isArmed() external view returns (bool);

    /// @notice Returns whether the settlement is ready to execute
    /// @return True if execution conditions are satisfied
    function readyToExecute() external view returns (bool);

    /// @notice Returns whether the settlement has been cancelled
    /// @return True if the settlement has been cancelled
    function cancelled() external view returns (bool);

    /// @notice Returns whether an account has an active cancel vote
    /// @param account The account to check cancel votes for
    /// @return True if the account has an active cancel vote
    function cancelVotes(address account) external view returns (bool);

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

    /// @notice Records a cancel vote for a settlement requiring unanimous consent
    /// @return True if the vote was recorded successfully
    function proposeCancel() external returns (bool);

    /// @notice Withdraws a previously cast cancel vote
    /// @return True if the vote was withdrawn successfully
    function withdrawCancelProposal() external returns (bool);

    /// @notice Reveals the HTLC secret to unlock execution of local flows
    /// @param secret The preimage whose keccak256 hash must match the settlement hashlock
    /// @return True if the secret was accepted
    function revealSecret(bytes calldata secret) external returns (bool);
}
