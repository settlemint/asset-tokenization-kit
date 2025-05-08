// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

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
contract XvPSettlement is ReentrancyGuard, ERC2771Context {
    using SafeERC20 for IERC20;
    using Address for address payable;

    /// @notice Flow represents a single token transfer between two parties
    struct Flow {
        address asset; // Address of ERC-20 token
        address from; // Party sending address
        address to; // Party receiving address
        uint256 amount; // Amount of tokens
    }

    uint256 private _cutoffDate; // Timestamp after which the settlement expires
    bool private _autoExecute; // Whether to auto-execute after all approvals
    bool private _claimed; // Whether the settlement has been claimed
    bool private _cancelled; // Whether the settlement has been cancelled
    Flow[] private _flows; // Array of token flows
    mapping(address => bool) private _approvals; // Maps addresses to their approval status
    uint256 private _createdAt; // Timestamp when the settlement was created
    /// @notice Custom errors for the XvPSettlement contract
    /// @dev These errors provide more gas-efficient and descriptive error handling

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

    /// @notice Event emitted when an XvP settlement is approved by a party
    event XvPSettlementApproved(address indexed sender);

    /// @notice Event emitted when an XvP settlement approval is revoked
    event XvPSettlementApprovalRevoked(address indexed sender);

    /// @notice Event emitted when an XvP settlement is claimed
    event XvPSettlementClaimed(address indexed sender);

    /// @notice Event emitted when an XvP settlement is cancelled
    event XvPSettlementCancelled(address indexed sender);

    /// @notice Deploys a new XvPSettlement contract
    /// @dev Sets up the contract with admin role and initializes meta-transaction support
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    /// @param settlementCutoffDate Timestamp after which the settlement expires
    /// @param settlementAutoExecute Whether to auto-execute after all approvals
    /// @param settlementFlows The array of token flows to include in the settlement
    constructor(
        address forwarder,
        uint256 settlementCutoffDate,
        bool settlementAutoExecute,
        Flow[] memory settlementFlows
    )
        ERC2771Context(forwarder)
    {
        _cutoffDate = settlementCutoffDate;
        _autoExecute = settlementAutoExecute;
        _createdAt = block.timestamp;
        if (settlementFlows.length == 0) revert EmptyFlows();

        for (uint256 i = 0; i < settlementFlows.length; i++) {
            Flow memory flow = settlementFlows[i];
            if (flow.asset == address(0)) revert InvalidToken();
            if (flow.from == address(0)) revert ZeroAddress();
            if (flow.to == address(0)) revert ZeroAddress();
            if (flow.amount == 0) revert ZeroAmount();

            // Validate ERC20 token by checking if it has decimals() function
            (bool success, bytes memory result) = flow.asset.staticcall(abi.encodeWithSelector(bytes4(0x313ce567)));
            if (!success || result.length != 32) revert InvalidToken();

            _flows.push(flow);
        }
    }

    function cutoffDate() public view returns (uint256) {
        return _cutoffDate;
    }

    function autoExecute() public view returns (bool) {
        return _autoExecute;
    }

    function claimed() public view returns (bool) {
        return _claimed;
    }

    function cancelled() public view returns (bool) {
        return _cancelled;
    }

    function flows() public view returns (Flow[] memory) {
        return _flows;
    }

    function approvals(address account) public view returns (bool) {
        return _approvals[account];
    }

    function createdAt() public view returns (uint256) {
        return _createdAt;
    }

    /// @notice Approves a XvP settlement for execution
    /// @dev The caller must be a party in the settlement's flows
    /// @return success True if the approval was successful
    function approve() external nonReentrant onlyOpen onlyInvolvedSender returns (bool success) {
        if (_approvals[_msgSender()]) revert SenderAlreadyApprovedSettlement();

        uint256 flowsLength = _flows.length;
        for (uint256 i = 0; i < flowsLength; i++) {
            Flow storage flow = _flows[i];
            if (flow.from == _msgSender()) {
                uint256 currentAllowance = IERC20(flow.asset).allowance(_msgSender(), address(this));
                if (currentAllowance < flow.amount) {
                    revert InsufficientAllowance(flow.asset, _msgSender(), address(this), flow.amount, currentAllowance);
                }
            }
        }

        // Mark as approved
        _approvals[_msgSender()] = true;
        emit XvPSettlementApproved(_msgSender());

        // If auto-execution and all parties approved, execute swap directly
        if (_autoExecute && isFullyApproved()) {
            _executeSettlement();
        }

        return true;
    }

    /// @notice Executes the flows if all approvals are in place
    /// @return success True if execution was successful
    function execute() external nonReentrant onlyOpen returns (bool) {
        return _executeSettlement();
    }

    /// @notice Internal function to execute settlement
    /// @return success True if execution was successful
    function _executeSettlement() private returns (bool) {
        if (!isFullyApproved()) revert XvPSettlementNotApproved();

        for (uint256 i = 0; i < _flows.length; i++) {
            Flow storage flow = _flows[i];
            IERC20(flow.asset).safeTransferFrom(flow.from, flow.to, flow.amount);
        }

        _claimed = true;
        emit XvPSettlementClaimed(_msgSender());

        return true;
    }

    /// @notice Revokes approval for a XvP settlement
    /// @dev The caller must have previously approved the settlement
    /// @return success True if the revocation was successful
    function revokeApproval() external nonReentrant onlyInvolvedSender returns (bool) {
        if (!_approvals[_msgSender()]) revert SenderNotApprovedSettlement();

        _approvals[_msgSender()] = false;
        emit XvPSettlementApprovalRevoked(_msgSender());

        return true;
    }

    function cancel() external nonReentrant onlyUnclaimed onlyInvolvedSender returns (bool) {
        _cancelled = true;

        emit XvPSettlementCancelled(_msgSender());
        return true;
    }

    /// @notice Checks if all parties have approved the settlement
    /// @return approved True if all parties have approved
    function isFullyApproved() public view returns (bool) {
        // Check all unique "from" addresses for approval
        for (uint256 i = 0; i < _flows.length; i++) {
            address from = _flows[i].from;
            if (!_approvals[from]) {
                return false;
            }
        }

        return true;
    }

    /// @notice Modifier to check if a settlement is open
    modifier onlyOpen() {
        if (_claimed) revert XvPSettlementAlreadyClaimed();
        if (_cancelled) revert XvPSettlementAlreadyCancelled();
        if (block.timestamp >= _cutoffDate) revert XvPSettlementExpired();
        _;
    }

    /// @notice Modifier to check if a settlement is unclaimed
    modifier onlyUnclaimed() {
        if (_claimed) revert XvPSettlementAlreadyClaimed();
        _;
    }

    /// @notice Modifier to check if the sender is involved in a settlement
    modifier onlyInvolvedSender() {
        bool involved = false;
        for (uint256 i = 0; i < _flows.length; i++) {
            if (_flows[i].from == _msgSender()) {
                involved = true;
                break;
            }
        }
        if (!involved) revert SenderNotInvolvedInSettlement();
        _;
    }
}
