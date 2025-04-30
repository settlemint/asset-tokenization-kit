// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";

/// @title XvPSettlement - A contract for atomic settlements between ERC20 tokens
/// @notice This contract enables X vs Payment (DvP, PvP, etc.) settlement between digital securities and digital cash
/// using a multi-flow approval system for atomic execution.
/// @dev Inherits from multiple OpenZeppelin contracts to provide comprehensive security features,
/// meta-transactions support, and role-based access control.
/// @custom:security-contact support@settlemint.com
contract XvPSettlement is ReentrancyGuard, Pausable, AccessControl, ERC2771Context {
    using SafeERC20 for IERC20;
    using Address for address payable;

    /// @notice Flow represents a single token transfer between two parties
    struct Flow {
        address asset; // Address of ERC-20 token
        address from; // Party sending address
        address to; // Party receiving address
        uint256 amount; // Amount of tokens
    }

    /// @notice XvP settlement data structure
    /// @dev Stores all information about an XvP settlement
    struct XvPSettlementData {
        uint256 id; // Human-readable identifier for the settlement
        address creator; // Address that created the settlement
        uint256 createdAt; // Timestamp when settlement was created
        uint256 cutoffDate; // Timestamp after which the settlement expires
        bool autoExecute; // Whether to auto-execute after all approvals
        bool claimed; // Whether the settlement has been claimed
        bool cancelled; // Whether the settlement has been refunded
        Flow[] flows; // Array of token flows
        mapping(address => bool) approvals; // Maps addresses to their approval status
    }

    /// @notice Custom errors for the XvPSettlement contract
    /// @dev These errors provide more gas-efficient and descriptive error handling
    error XvPSettlementNotFound();
    error XvPSettlementAlreadyClaimed();
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

    /// @notice Maps XvP settlement ID to settlement details
    /// @dev Stores all settlements by their unique ID
    mapping(uint256 => XvPSettlementData) private _settlements;

    /// @notice Last XvP settlement ID counter
    uint256 public idCounter;

    /// @notice Event emitted when a new XvP settlement is created
    /// @param id Unique identifier for the settlement
    /// @param creator Address that created the settlement
    /// @param cutoffDate Timestamp after which the settlement expires
    event XvPSettlementCreated(uint256 indexed id, address indexed creator, uint256 cutoffDate);

    /// @notice Event emitted when an XvP settlement is approved by a party
    /// @param id Unique identifier for the settlement
    /// @param party Address that approved the settlement
    event XvPSettlementApproved(uint256 indexed id, address indexed party);

    /// @notice Event emitted when an XvP settlement approval is revoked
    /// @param id Unique identifier for the settlement
    /// @param party Address that revoked approval
    event XvPSettlementApprovalRevoked(uint256 indexed id, address indexed party);

    /// @notice Event emitted when an XvP settlement is executed
    /// @param id Unique identifier for the settlement
    /// @param executor Address that executed the settlement
    event XvPSettlementExecuted(uint256 indexed id, address indexed executor);

    /// @notice Event emitted when auto-execution fails
    /// @param id Unique identifier for the swap
    /// @param executor Address that triggered the auto-execution
    /// @param reason Reason for the failure
    event XvPSettlementAutoExecutionFailed(uint256 indexed id, address indexed executor, string reason);

    /// @notice Event emitted when an XvP settlement is cancelled
    /// @param id Unique identifier for the settlement
    /// @param executor Address to whom the funds were cancelled
    event XvPSettlementCancelled(uint256 indexed id, address indexed executor);

    /// @notice Deploys a new XvPSettlement contract
    /// @dev Sets up the contract with admin role and initializes meta-transaction support
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    constructor(address forwarder) ERC2771Context(forwarder) {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    /// @notice Returns the message sender in the context of meta-transactions
    /// @dev Overrides both Context and ERC2771Context to support meta-transactions
    /// @return The address of the message sender
    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return super._msgSender();
    }

    /// @notice Returns the message data in the context of meta-transactions
    /// @dev Overrides both Context and ERC2771Context to support meta-transactions
    /// @return The message data
    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return super._msgData();
    }

    /// @notice Returns the length of the context suffix for meta-transactions
    /// @dev Overrides both Context and ERC2771Context to support meta-transactions
    /// @return The length of the context suffix
    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return super._contextSuffixLength();
    }

    /// @notice Pauses all swap operations
    /// @dev Only callable by addresses with DEFAULT_ADMIN_ROLE
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @notice Unpauses swap operations
    /// @dev Only callable by addresses with DEFAULT_ADMIN_ROLE
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /// @notice Creates a new XvP settlement with specified token flows
    /// @dev Creates a settlement with at least one flow, setting the cutoff date and auto-execution flag
    /// @param flows The array of token flows to include in the settlement
    /// @param cutoffDate Timestamp after which the settlement expires
    /// @param autoExecute If true, settlement executes automatically when all approvals are received
    /// @return id Unique identifier for the created settlement
    function create(
        Flow[] memory flows,
        uint256 cutoffDate,
        bool autoExecute
    )
        external
        nonReentrant
        whenNotPaused
        returns (uint256 id)
    {
        if (cutoffDate <= block.timestamp) revert InvalidCutoffDate();
        if (flows.length == 0) revert EmptyFlows();

        id = idCounter++;

        XvPSettlementData storage settlement = _settlements[id];
        settlement.id = id;
        settlement.creator = _msgSender();
        settlement.cutoffDate = cutoffDate;
        settlement.createdAt = block.timestamp;
        settlement.autoExecute = autoExecute;

        for (uint256 i = 0; i < flows.length; i++) {
            Flow memory flow = flows[i];
            if (flow.asset == address(0)) revert InvalidToken();
            if (flow.from == address(0)) revert ZeroAddress();
            if (flow.to == address(0)) revert ZeroAddress();
            if (flow.amount == 0) revert ZeroAmount();

            // Validate ERC20 token by checking if it has decimals() function
            (bool success, bytes memory result) = flow.asset.staticcall(abi.encodeWithSelector(bytes4(0x313ce567)));
            if (!success || result.length != 32) revert InvalidToken();

            settlement.flows.push(flow);
        }

        emit XvPSettlementCreated(id, _msgSender(), cutoffDate);
        return id;
    }

    /// @notice Approves a XvP settlement for execution
    /// @dev The caller must be a party in the settlement's flows
    /// @param id Unique identifier of the settlement
    /// @return success True if the approval was successful
    function approve(uint256 id)
        external
        nonReentrant
        whenNotPaused
        onlyOpen(id)
        onlyInvolvedSender(id)
        returns (bool success)
    {
        XvPSettlementData storage settlement = _settlements[id];

        if (settlement.approvals[_msgSender()]) revert SenderAlreadyApprovedSettlement();

        uint256 flowsLength = settlement.flows.length;
        for (uint256 i = 0; i < flowsLength; i++) {
            Flow storage flow = settlement.flows[i];
            if (flow.from == _msgSender()) {
                uint256 currentAllowance = IERC20(flow.asset).allowance(_msgSender(), address(this));
                if (currentAllowance < flow.amount) {
                    revert InsufficientAllowance(flow.asset, _msgSender(), address(this), flow.amount, currentAllowance);
                }
            }
        }

        // Mark as approved
        settlement.approvals[_msgSender()] = true;
        emit XvPSettlementApproved(id, _msgSender());

        // If auto-execution and all parties approved, execute swap directly
        if (settlement.autoExecute && isFullyApproved(id)) {
            _executeSettlement(id, _msgSender());
        }

        return true;
    }

    /// @notice Executes the flows if all approvals are in place
    /// @param id Unique identifier of the settlement
    /// @return success True if execution was successful
    function execute(uint256 id) external nonReentrant whenNotPaused onlyOpen(id) returns (bool) {
        return _executeSettlement(id, _msgSender());
    }

    /// @notice Internal function to execute settlement
    /// @param id Unique identifier of the settlement
    /// @param executor Address that is executing the settlement
    /// @return success True if execution was successful
    function _executeSettlement(uint256 id, address executor) private returns (bool) {
        XvPSettlementData storage settlement = _settlements[id];

        if (!isFullyApproved(id)) revert XvPSettlementNotApproved();

        for (uint256 i = 0; i < settlement.flows.length; i++) {
            Flow storage flow = settlement.flows[i];
            IERC20(flow.asset).safeTransferFrom(flow.from, flow.to, flow.amount);
        }

        settlement.claimed = true;
        emit XvPSettlementExecuted(id, executor);

        return true;
    }

    /// @notice Revokes approval for a XvP settlement
    /// @dev The caller must have previously approved the settlement
    /// @param id Unique identifier of the settlement
    /// @return success True if the revocation was successful
    function revokeApproval(uint256 id) external nonReentrant whenNotPaused onlyInvolvedSender(id) returns (bool) {
        XvPSettlementData storage settlement = _settlements[id];

        if (!settlement.approvals[_msgSender()]) revert SenderNotApprovedSettlement();

        settlement.approvals[_msgSender()] = false;
        emit XvPSettlementApprovalRevoked(id, _msgSender());

        return true;
    }

    function cancel(uint256 id)
        external
        nonReentrant
        whenNotPaused
        onlyUnclaimed(id)
        onlyInvolvedSender(id)
        returns (bool)
    {
        XvPSettlementData storage settlement = _settlements[id];
        settlement.cancelled = true;

        emit XvPSettlementCancelled(id, _msgSender());
        return true;
    }

    /// @notice Checks if all parties have approved the settlement
    /// @param id Unique identifier of the settlement
    /// @return approved True if all parties have approved
    function isFullyApproved(uint256 id) public view onlyExists(id) returns (bool) {
        XvPSettlementData storage settlement = _settlements[id];

        // Check all unique "from" addresses for approval
        for (uint256 i = 0; i < settlement.flows.length; i++) {
            address from = settlement.flows[i].from;
            if (!settlement.approvals[from]) {
                return false;
            }
        }

        return true;
    }

    modifier onlyExists(uint256 id) {
        if (_settlements[id].creator == address(0)) revert XvPSettlementNotFound();
        _;
    }

    modifier onlyOpen(uint256 id) {
        XvPSettlementData storage settlement = _settlements[id];
        if (settlement.creator == address(0)) revert XvPSettlementNotFound();
        if (settlement.claimed) revert XvPSettlementAlreadyClaimed();
        if (settlement.cancelled) revert XvPSettlementAlreadyCancelled();
        if (block.timestamp >= settlement.cutoffDate) revert XvPSettlementExpired();
        _;
    }

    modifier onlyUnclaimed(uint256 id) {
        if (_settlements[id].claimed) revert XvPSettlementAlreadyClaimed();
        _;
    }

    modifier onlyInvolvedSender(uint256 id) {
        XvPSettlementData storage settlement = _settlements[id];
        bool involved = false;
        for (uint256 i = 0; i < settlement.flows.length; i++) {
            if (settlement.flows[i].from == _msgSender()) {
                involved = true;
                break;
            }
        }
        if (!involved) revert SenderNotInvolvedInSettlement();
        _;
    }
}
