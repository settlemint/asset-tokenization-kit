// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import { IATKXvPSettlement } from "./IATKXvPSettlement.sol";

/// @title ATKXvPSettlementImplementation - A contract for cross-value proposition settlements
/// @author SettleMint
/// @notice This contract facilitates atomic swaps between parties with multiple token flows.
/// Parties can approve the settlement, and once all parties are approved, the settlement can be executed.
/// @dev This contract supports:
/// - **Multi-party settlements**: Any number of participants with different tokens
/// - **Atomic execution**: All transfers happen together or none at all
/// - **Per-sender approvals**: Each party approves the entire settlement once
/// - **Expiration mechanism**: Settlements expire after a cutoff date
/// - **Cancellation**: Any involved sender can cancel before execution
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

    /// @notice Hashlock that must be satisfied before executing local transfers when external flows are present
    bytes32 private _hashlock;

    /// @notice Tracks whether the HTLC secret has been revealed
    bool private _secretRevealed;

    /// @notice Tracks if the settlement contains any external flows
    bool private _hasExternalFlows;

    /// @notice Whether the settlement has been executed
    bool private _executed;

    /// @notice Whether the settlement has been cancelled
    bool private _cancelled;

    /// @notice Array of all flows that need to be executed in this settlement
    Flow[] private _flows;

    /// @notice Mapping to track which addresses have approved the settlement
    /// @dev sender address => isApproved
    mapping(address => bool) private _approvals;

    /// @notice The timestamp when this settlement was created (in seconds since epoch)
    uint256 private _createdAt;

    /// @notice The name of this settlement
    string private _name;

    /// @notice Modifier to check if a settlement is open
    modifier onlyOpen() {
        if (_executed) revert XvPSettlementAlreadyExecuted();
        if (_cancelled) revert XvPSettlementAlreadyCancelled();
        if (block.timestamp > _cutoffDate - 1) revert XvPSettlementExpired();
        _;
    }

    /// @notice Modifier to check if a settlement is not executed
    modifier onlyNotExecuted() {
        if (_executed) revert XvPSettlementAlreadyExecuted();
        _;
    }

    /// @notice Modifier to check if the sender is involved in a settlement
    modifier onlyInvolvedSender() {
        bool involved = false;
        for (uint256 i = 0; i < _flows.length; ++i) {
            if (_flows[i].from == _msgSender()) {
                involved = true;
                break;
            }
        }
        if (!involved) revert SenderNotInvolvedInSettlement();
        _;
    }

    /// @notice Constructor that disables initializers to prevent implementation contract initialization
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address forwarder) ERC2771ContextUpgradeable(forwarder) {
        _disableInitializers();
    }

    /// @notice Initializes the ATKXvPSettlementImplementation contract for proxy usage
    /// @dev Replaces constructor for upgradeable pattern
    /// @param settlementName The name of this settlement
    /// @param settlementCutoffDate Timestamp after which the settlement expires
    /// @param settlementAutoExecute Whether to auto-execute after all approvals
    /// @param settlementFlows Array of token flows for this settlement
    function initialize(
        string calldata settlementName,
        uint256 settlementCutoffDate,
        bool settlementAutoExecute,
        Flow[] calldata settlementFlows,
        bytes32 settlementHashlock
    )
        external
        initializer
    {
        __ReentrancyGuard_init();
        __ERC165_init();

        _name = settlementName;
        _cutoffDate = settlementCutoffDate;
        _autoExecute = settlementAutoExecute;
        _hashlock = settlementHashlock;
        _secretRevealed = false;
        _hasExternalFlows = false;
        _createdAt = block.timestamp;
        if (settlementFlows.length == 0) revert EmptyFlows();

        for (uint256 i = 0; i < settlementFlows.length; ++i) {
            Flow memory flow = settlementFlows[i];
            if (flow.asset == address(0)) revert InvalidToken();
            if (flow.from == address(0)) revert ZeroAddress();
            if (flow.to == address(0)) revert ZeroAddress();
            if (flow.amount == 0) revert ZeroAmount();

            if (flow.externalChainId == 0) {
                // Validate ERC20 token by checking if it has decimals() function
                (bool success, bytes memory result) = flow.asset.staticcall(abi.encodeWithSelector(bytes4(0x313ce567)));
                if (!success || result.length != 32) revert InvalidToken();
            } else {
                if (flow.externalChainId == block.chainid) {
                    revert InvalidExternalChainId(flow.externalChainId);
                }
                _hasExternalFlows = true;
            }

            _flows.push(flow);
        }

        if (_hasExternalFlows && _hashlock == bytes32(0)) {
            revert HashlockRequired();
        }
    }

    /// @notice Returns the cutoff date after which the settlement expires
    /// @return The cutoff date timestamp in seconds since epoch
    function cutoffDate() public view returns (uint256) {
        return _cutoffDate;
    }

    /// @notice Returns whether the settlement should auto-execute when all approvals are received
    /// @return True if auto-execute is enabled, false otherwise
    function autoExecute() public view returns (bool) {
        return _autoExecute;
    }

    /// @notice Returns whether the settlement has been executed
    /// @return True if the settlement has been executed, false otherwise
    function executed() public view returns (bool) {
        return _executed;
    }

    /// @notice Returns the hashlock guarding the settlement
    /// @return The keccak256 hashlock value
    function hashlock() public view returns (bytes32) {
        return _hashlock;
    }

    /// @notice Returns whether the settlement contains external flows
    /// @return True if at least one flow targets an external chain
    function hasExternalFlows() public view returns (bool) {
        return _hasExternalFlows;
    }

    /// @notice Returns whether the settlement secret has been revealed
    /// @return True if the secret has been revealed
    function secretRevealed() public view returns (bool) {
        return _secretRevealed;
    }

    /// @notice Returns whether the settlement has been cancelled
    /// @return True if the settlement has been cancelled, false otherwise
    function cancelled() public view returns (bool) {
        return _cancelled;
    }

    /// @notice Returns all flows in the settlement
    /// @return Array of all flows defined in the settlement
    function flows() public view returns (Flow[] memory) {
        return _flows;
    }

    /// @notice Returns whether an account has approved the settlement
    /// @param account The account to check approvals for
    /// @return True if the account has approved the settlement, false otherwise
    function approvals(address account) public view returns (bool) {
        return _approvals[account];
    }

    /// @notice Returns the timestamp when the settlement was created
    /// @return The creation timestamp in seconds since epoch
    function createdAt() public view returns (uint256) {
        return _createdAt;
    }

    /// @notice Returns the name of the settlement
    /// @return The settlement name as a string
    function name() public view returns (string memory) {
        return _name;
    }

    /// @notice Approves a XvP settlement for execution
    /// @dev The caller must be a party in the settlement's flows
    /// @return success True if the approval was successful
    function approve() external nonReentrant onlyOpen onlyInvolvedSender returns (bool success) {
        if (_approvals[_msgSender()]) revert SenderAlreadyApprovedSettlement();

        uint256 flowsLength = _flows.length;
        for (uint256 i = 0; i < flowsLength; ++i) {
            Flow storage flow = _flows[i];
            if (flow.from == _msgSender() && flow.externalChainId == 0) {
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
        _maybeAutoExecute();

        return true;
    }

    /// @notice Executes the flows if all approvals are in place
    /// @return True if execution was successful
    function execute() external nonReentrant onlyOpen returns (bool) {
        return _executeSettlement();
    }

    /// @notice Internal function to execute settlement
    /// @return success True if execution was successful
    function _executeSettlement() private returns (bool) {
        if (!isFullyApproved()) revert XvPSettlementNotApproved();
        if (!_hashlockSatisfied()) revert SecretNotRevealed();

        for (uint256 i = 0; i < _flows.length; ++i) {
            Flow storage flow = _flows[i];
            if (flow.externalChainId != 0) {
                continue;
            }
            IERC20(flow.asset).safeTransferFrom(flow.from, flow.to, flow.amount);
        }

        _executed = true;
        emit XvPSettlementExecuted(_msgSender());

        return true;
    }

    /// @notice Revokes approval for a XvP settlement
    /// @dev The caller must have previously approved the settlement
    /// @return True if the revocation was successful
    function revokeApproval() external nonReentrant onlyInvolvedSender returns (bool) {
        if (!_approvals[_msgSender()]) revert SenderNotApprovedSettlement();

        _approvals[_msgSender()] = false;
        emit XvPSettlementApprovalRevoked(_msgSender());

        return true;
    }

    /// @notice Cancels the settlement
    /// @dev The caller must be involved in the settlement and it must not be executed yet
    /// @return True if the cancellation was successful
    function cancel() external nonReentrant onlyNotExecuted onlyInvolvedSender returns (bool) {
        _cancelled = true;

        emit XvPSettlementCancelled(_msgSender());
        return true;
    }

    /// @notice Reveals the HTLC secret to unlock execution for settlements with external flows
    /// @param secret The secret preimage whose keccak256 hash must match the hashlock
    /// @return True if the secret was accepted
    function revealSecret(bytes calldata secret) external nonReentrant onlyOpen returns (bool) {
        if (!_hasExternalFlows) revert HashlockRevealNotRequired();
        if (_hashlock == bytes32(0)) revert HashlockRequired();
        if (_secretRevealed) revert SecretAlreadyRevealed();
        if (keccak256(secret) != _hashlock) revert InvalidSecret();

        _secretRevealed = true;

        emit XvPSettlementSecretRevealed(_msgSender(), secret);

        _maybeAutoExecute();
        return true;
    }

    /// @notice Determines whether both approvals and hashlock gate are satisfied for execution
    /// @return True if no external gating is active or the secret has been revealed
    function _hashlockSatisfied() private view returns (bool) {
        return !_hasExternalFlows || _secretRevealed;
    }

    /// @notice Executes the settlement automatically when conditions are met
    function _maybeAutoExecute() private {
        if (_autoExecute && isFullyApproved() && _hashlockSatisfied()) {
            _executeSettlement();
        }
    }

    /// @notice Checks if all parties have approved the settlement
    /// @return approved True if all parties have approved
    function isFullyApproved() public view returns (bool) {
        // Check all unique "from" addresses for approval
        for (uint256 i = 0; i < _flows.length; ++i) {
            address from = _flows[i].from;
            if (_flows[i].externalChainId != 0) {
                continue;
            }
            if (!_approvals[from]) {
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
