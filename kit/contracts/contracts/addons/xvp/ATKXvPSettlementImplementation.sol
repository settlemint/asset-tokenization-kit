// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import { IATKXvPSettlement } from "./IATKXvPSettlement.sol";

/// @title ATKXvPSettlementImplementation - A contract for cross-value proposition settlements
/// @notice This contract facilitates atomic swaps between parties with multiple token flows.
/// Parties can approve individual flows, and once all flows are approved, the settlement can be executed.
/// @dev This contract supports:
/// - **Multi-party settlements**: Any number of participants with different tokens
/// - **Atomic execution**: All transfers happen together or none at all
/// - **Individual approvals**: Each party approves only their outgoing flows
/// - **Expiration mechanism**: Settlements expire after a cutoff date
/// - **Cancellation**: Any involved party can cancel before execution
/// - **Auto-execution**: Optional automatic execution when all approvals are received
/// @custom:security-contact support@settlemint.com
contract ATKXvPSettlementImplementation is
    IATKXvPSettlement,
    ReentrancyGuardUpgradeable,
    ERC2771ContextUpgradeable,
    ERC165Upgradeable
{
    using SafeERC20 for IERC20;
    using Address for address payable;

    /// @notice The cutoff date after which the settlement expires (in seconds since epoch)
    uint256 private _cutoffDate;

    /// @notice Whether the settlement should auto-execute when all approvals are received
    bool private _autoExecute;

    /// @notice The timestamp when this settlement was created (in seconds since epoch)
    uint256 private _createdAt;

    /// @notice Array of all flows that need to be executed in this settlement
    Flow[] private _flows;

    /// @notice Mapping to track which flows have been approved by their respective 'from' addresses
    /// @dev flowIndex => isApproved
    mapping(uint256 => bool) private _flowApprovals;

    /// @notice Mapping to track which addresses are involved in this settlement (either as sender or receiver)
    /// @dev This is used for access control in cancellation functionality
    mapping(address => bool) private _involvedAddresses;

    SettlementStatus private _status;

    /// @notice Modifier to ensure the settlement is still active and not expired
    modifier onlyActiveSettlement() {
        if (block.timestamp > _cutoffDate) {
            _status = SettlementStatus.EXPIRED;
            emit SettlementExpired();
            revert SettlementExpiredError();
        }
        if (_status != SettlementStatus.ACTIVE) revert SettlementNotActive();
        _;
    }

    /// @notice Modifier to ensure only addresses involved in the settlement can perform certain actions
    modifier onlyInvolved() {
        if (!_involvedAddresses[_msgSender()]) revert NotInvolved();
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address forwarder) ERC2771ContextUpgradeable(forwarder) {
        _disableInitializers();
    }

    /// @notice Initializes the ATKXvPSettlementImplementation contract for proxy usage
    /// @dev Replaces constructor for upgradeable pattern
    /// @param settlementCutoffDate Timestamp after which the settlement expires
    /// @param settlementAutoExecute Whether to auto-execute after all approvals
    /// @param settlementFlows Array of token flows for this settlement
    function initialize(
        uint256 settlementCutoffDate,
        bool settlementAutoExecute,
        Flow[] memory settlementFlows
    )
        external
        initializer
    {
        __ReentrancyGuard_init();
        __ERC165_init();

        _cutoffDate = settlementCutoffDate;
        _autoExecute = settlementAutoExecute;
        _createdAt = block.timestamp;
        if (settlementFlows.length == 0) revert EmptyFlows();

        for (uint256 i = 0; i < settlementFlows.length; i++) {
            Flow memory flow = settlementFlows[i];
            if (flow.asset == address(0)) revert InvalidToken();
            if (flow.from == address(0)) revert ZeroAddress();
            if (flow.to == address(0)) revert ZeroAddress();
            if (flow.from == flow.to) revert SameAddress();
            if (flow.amount == 0) revert ZeroAmount();

            // Validate that the asset address actually points to a token contract
            // by calling decimals() function and ensuring it returns valid data
            (bool success, bytes memory data) = flow.asset.staticcall(abi.encodeWithSignature("decimals()"));
            if (!success || data.length != 32) revert TokenValidationFailed();

            _flows.push(flow);
            _involvedAddresses[flow.from] = true;
            _involvedAddresses[flow.to] = true;
        }

        _status = SettlementStatus.ACTIVE;
    }

    function cutoffDate() public view returns (uint256) {
        return _cutoffDate;
    }

    function autoExecute() public view returns (bool) {
        return _autoExecute;
    }

    function executed() public view returns (bool) {
        return _status == SettlementStatus.EXECUTED;
    }

    function cancelled() public view returns (bool) {
        return _status == SettlementStatus.CANCELLED;
    }

    function flows() public view returns (Flow[] memory) {
        return _flows;
    }

    function approvals(address account) public view returns (bool) {
        for (uint256 i = 0; i < _flows.length; i++) {
            if (_flows[i].from == account) {
                return _flowApprovals[i];
            }
        }
        return false;
    }

    function createdAt() public view returns (uint256) {
        return _createdAt;
    }

    /// @notice Approves a flow for execution
    /// @dev The caller must be a party in the settlement's flows
    /// @param flowIndex The index of the flow to approve
    /// @return success True if the approval was successful
    function approve(uint256 flowIndex)
        external
        nonReentrant
        onlyActiveSettlement
        onlyInvolved
        returns (bool success)
    {
        if (_flowApprovals[flowIndex]) revert AlreadyApproved();

        Flow storage flow = _flows[flowIndex];
        uint256 currentAllowance = IERC20(flow.asset).allowance(flow.from, address(this));
        if (currentAllowance < flow.amount) {
            revert InsufficientAllowance(flow.asset, flow.from, address(this), flow.amount, currentAllowance);
        }

        // Mark as approved
        _flowApprovals[flowIndex] = true;
        emit FlowApproved(flowIndex, flow.from);

        // If auto-execution and all flows approved, execute settlement directly
        if (_autoExecute && isFullyApproved()) {
            _executeSettlement();
        }

        return true;
    }

    /// @notice Executes the flows if all approvals are in place
    /// @return success True if execution was successful
    function execute() external nonReentrant onlyActiveSettlement returns (bool) {
        return _executeSettlement();
    }

    /// @notice Internal function to execute settlement
    /// @return success True if execution was successful
    function _executeSettlement() private returns (bool) {
        if (!isFullyApproved()) revert AllFlowsNotApproved();

        for (uint256 i = 0; i < _flows.length; i++) {
            Flow storage flow = _flows[i];
            IERC20(flow.asset).safeTransferFrom(flow.from, flow.to, flow.amount);
        }

        _status = SettlementStatus.EXECUTED;
        emit SettlementExecuted(_msgSender());

        return true;
    }

    /// @notice Revokes approval for a flow
    /// @dev The caller must have previously approved the flow
    /// @param flowIndex The index of the flow to revoke approval for
    /// @return success True if the revocation was successful
    function revokeApproval(uint256 flowIndex) external nonReentrant onlyInvolved returns (bool success) {
        if (!_flowApprovals[flowIndex]) revert NotApproved();

        _flowApprovals[flowIndex] = false;
        emit FlowApprovalRevoked(flowIndex, _msgSender());

        return true;
    }

    function cancel() external nonReentrant onlyInvolved returns (bool) {
        _status = SettlementStatus.CANCELLED;

        emit SettlementCancelled(_msgSender());
        return true;
    }

    /// @notice Checks if all flows are approved
    /// @return approved True if all flows are approved
    function isFullyApproved() public view returns (bool) {
        for (uint256 i = 0; i < _flows.length; i++) {
            if (!_flowApprovals[i]) {
                return false;
            }
        }
        return true;
    }

    /// @notice Checks if the contract implements an interface
    /// @param interfaceId The interface identifier
    /// @return True if the contract implements the interface
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Upgradeable, IERC165)
        returns (bool)
    {
        return interfaceId == type(IATKXvPSettlement).interfaceId || super.supportsInterface(interfaceId);
    }
}
