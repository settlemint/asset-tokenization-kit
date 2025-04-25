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

/// @title DvPSwap - A contract for atomic swaps between ERC20 tokens
/// @notice This contract enables Delivery vs Payment (DvP) settlement between digital securities and digital cash
/// using a multi-flow approval system for atomic execution.
/// @dev Inherits from multiple OpenZeppelin contracts to provide comprehensive security features,
/// meta-transactions support, and role-based access control.
/// @custom:security-contact support@settlemint.com
contract DvPSwap is ReentrancyGuard, Pausable, AccessControl, ERC2771Context {
    using SafeERC20 for IERC20;
    using Address for address payable;

    /// @notice Default maximum duration for a DvP swap
    /// @dev Swaps older than this can be automatically expired
    uint256 public constant DEFAULT_MAX_DURATION = 7 days;

    /// @notice Status of a DvP swap
    /// @dev Defines the possible states for a DvP swap
    enum DvPSwapStatus {
        OPEN,                 // Swap is created and waiting for approvals from all parties
        CLAIMED,              // Swap has been executed successfully
        REFUNDED,             // Swap has been refunded to the original parties
        EXPIRED,              // Swap has expired without being executed
        CANCELLED,            // Swap was cancelled before execution
        FAILED               // Swap failed due to execution error
    }

    /// @notice Flow represents a single token transfer between two parties
    struct Flow {
        address token;        // Address of ERC-20 token
        address from;         // Party sending address
        address to;           // Party receiving address
        uint256 amount;       // Amount of tokens
    }

    /// @notice DvP swap data structure
    /// @dev Stores all information about a DvP swap
    struct DvPSwapData {
        string id;                   // Human-readable identifier for the swap
        address creator;             // Address that created the swap
        uint256 cutoffDate;          // Timestamp after which the swap expires
        Flow[] flows;                // Array of token flows
        mapping(address => bool) approvals;    // Maps addresses to their approval status
        DvPSwapStatus status;        // Current status of the swap
        uint256 createdAt;           // Timestamp when swap was created
        bool isAutoExecuted;         // Whether to auto-execute after all approvals
    }

    /// @notice Custom errors for the DvPSwap contract
    /// @dev These errors provide more gas-efficient and descriptive error handling
    error InvalidDvPSwapParameters();
    error DvPSwapNotFound();
    error DvPSwapAlreadyExists();
    error InvalidDvPSwapStatus();
    error DvPSwapExpired();
    error NotAuthorized();
    error ZeroAmount();
    error ZeroAddress();
    error MaxDurationExceeded();
    error AlreadyApproved();
    error NotApproved();
    error NotInvolved();
    error DvPSwapAlreadyExecuted();
    error DvPSwapNotApproved();
    error InvalidToken();
    error FailedExecution(string reason);
    error InsufficientAllowance(address token, address owner, address spender, uint256 required, uint256 allowed);

    /// @notice Maps DvP swap ID to swap details
    /// @dev Stores all swaps by their unique ID
    mapping(bytes32 => DvPSwapData) private _dvpSwaps;

    /// @notice Maps DvP swap ID to a boolean indicating if the swap exists
    /// @dev Used to quickly check if a swap ID is valid
    mapping(bytes32 => bool) public dvpSwapExists;

    /// @notice Last DvP swap ID counter
    uint256 public dvpSwapIdCounter;

    /// @notice Event emitted when a new DvP swap is created
    /// @param dvpSwapId Unique identifier for the swap
    /// @param creator Address that created the swap
    /// @param id Human-readable identifier for the swap
    /// @param cutoffDate Timestamp after which the swap expires
    event DvPSwapCreated(
        bytes32 indexed dvpSwapId,
        address indexed creator,
        string id,
        uint256 cutoffDate
    );

    /// @notice Event emitted when a flow is added to a DvP swap
    /// @param dvpSwapId Unique identifier for the swap
    /// @param from Address sending the tokens
    /// @param to Address receiving the tokens
    /// @param token Address of the token being transferred
    /// @param amount Amount of tokens being transferred
    event FlowAdded(
        bytes32 indexed dvpSwapId,
        address indexed from,
        address indexed to,
        address token,
        uint256 amount
    );

    /// @notice Event emitted when a DvP swap's status changes
    /// @param dvpSwapId Unique identifier for the swap
    /// @param status New status of the swap
    event DvPSwapStatusChanged(
        bytes32 indexed dvpSwapId,
        DvPSwapStatus status
    );

    /// @notice Event emitted when a DvP swap is approved by a party
    /// @param dvpSwapId Unique identifier for the swap
    /// @param party Address that approved the swap
    event DvPSwapApproved(
        bytes32 indexed dvpSwapId,
        address indexed party
    );

    /// @notice Event emitted when a DvP swap approval is revoked
    /// @param dvpSwapId Unique identifier for the swap
    /// @param party Address that revoked approval
    event DvPSwapApprovalRevoked(
        bytes32 indexed dvpSwapId,
        address indexed party
    );

    /// @notice Event emitted when a DvP swap is executed
    /// @param dvpSwapId Unique identifier for the swap
    /// @param executor Address that executed the swap
    event DvPSwapExecuted(
        bytes32 indexed dvpSwapId,
        address indexed executor
    );

    /// @notice Event emitted when a DvP swap has expired
    /// @param dvpSwapId Unique identifier for the swap
    /// @param timestamp Time when the swap was marked as expired
    event DvPSwapExpiredEvent(
        bytes32 indexed dvpSwapId,
        uint256 timestamp
    );
    
    /// @notice Event emitted when auto-execution fails
    /// @param dvpSwapId Unique identifier for the swap
    /// @param executor Address that triggered the auto-execution
    /// @param reason Reason for the failure
    event DvPSwapAutoExecutionFailed(
        bytes32 indexed dvpSwapId,
        address indexed executor,
        string reason
    );

    /// @notice Deploys a new DvPSwap contract
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

    /// @notice Creates a new DvP swap with specified token flows
    /// @dev Creates a swap with at least one flow, setting the cutoff date and auto-execution flag
    /// @param flows The array of token flows to include in the swap
    /// @param id Human-readable identifier for the swap
    /// @param cutoffDate Timestamp after which the swap expires
    /// @param isAutoExecuted If true, swap executes automatically when all approvals are received
    /// @return dvpSwapId Unique identifier for the created swap
    function createDvPSwap(
        Flow[] memory flows,
        string memory id,
        uint256 cutoffDate,
        bool isAutoExecuted
    ) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (bytes32 dvpSwapId) 
    {
        // Validate parameters
        if (cutoffDate <= block.timestamp) revert InvalidDvPSwapParameters();
        if (flows.length == 0) revert InvalidDvPSwapParameters();
        
        // Generate swap ID
        dvpSwapIdCounter++;
        dvpSwapId = keccak256(
            abi.encodePacked(
                _msgSender(),
                block.timestamp,
                id,
                dvpSwapIdCounter
            )
        );
        
        // Ensure swap doesn't already exist
        if (dvpSwapExists[dvpSwapId]) revert DvPSwapAlreadyExists();
        
        // Create swap
        DvPSwapData storage dvpSwap = _dvpSwaps[dvpSwapId];
        dvpSwap.id = id;
        dvpSwap.creator = _msgSender();
        dvpSwap.cutoffDate = cutoffDate;
        dvpSwap.createdAt = block.timestamp;
        dvpSwap.status = DvPSwapStatus.OPEN;
        dvpSwap.isAutoExecuted = isAutoExecuted;
        
        // Add flows and validate tokens
        for (uint256 i = 0; i < flows.length; i++) {
            Flow memory flow = flows[i];
            if (flow.token == address(0)) revert InvalidToken();
            if (flow.from == address(0)) revert ZeroAddress();
            if (flow.to == address(0)) revert ZeroAddress();
            if (flow.amount == 0) revert ZeroAmount();
            
            // Validate ERC20 token by checking if it has decimals() function
            (bool success, bytes memory result) = flow.token.staticcall(
                abi.encodeWithSelector(bytes4(0x313ce567)) // decimals()
            );
            if (!success || result.length != 32) revert InvalidToken();
            
            dvpSwap.flows.push(flow);
            emit FlowAdded(dvpSwapId, flow.from, flow.to, flow.token, flow.amount);
        }
        
        // Mark swap as exists and set status to OPEN
        dvpSwapExists[dvpSwapId] = true;
        dvpSwap.status = DvPSwapStatus.OPEN;
        
        emit DvPSwapCreated(dvpSwapId, _msgSender(), id, cutoffDate);
        
        return dvpSwapId;
    }

    /// @notice Approves a DvP swap for execution
    /// @dev The caller must be a party in the swap's flows
    /// @param dvpSwapId Unique identifier of the swap
    /// @return success True if the approval was successful
    function approveDvPSwap(bytes32 dvpSwapId) 
        external 
        nonReentrant 
        whenNotPaused 
        checkDvPSwapExists(dvpSwapId)
        checkStatusIsOpenForAction(dvpSwapId)
        checkDvPSwapNotExpired(dvpSwapId)
        checkCallerIsNotApproved(dvpSwapId)
        checkCallerIsInvolvedSender(dvpSwapId)
        returns (bool success) 
    {
        // Verify swap exists - Handled by checkDvPSwapExists modifier
        // if (!dvpSwapExists[dvpSwapId]) revert DvPSwapNotFound();
        
        DvPSwapData storage dvpSwap = _dvpSwaps[dvpSwapId];
        
        // Verify swap state - Handled by checkStatusIsOpenForAction modifier
        // if (dvpSwap.status != DvPSwapStatus.OPEN && 
        //     dvpSwap.status != DvPSwapStatus.AWAITING_APPROVAL) 
        //     revert InvalidDvPSwapStatus();
        
        // Verify swap not expired - Handled by checkDvPSwapNotExpired modifier
        // if (block.timestamp > dvpSwap.cutoffDate) revert DvPSwapExpired();
        
        // Verify caller is not already approved - Handled by checkCallerIsNotApproved modifier
        // if (dvpSwap.approvals[_msgSender()]) revert AlreadyApproved();
        
        // Verify caller is involved in swap - Handled by checkCallerIsInvolvedSender modifier
        // bool isInvolved = false;
        // for (uint256 i = 0; i < dvpSwap.flows.length; i++) {
        //     if (dvpSwap.flows[i].from == _msgSender()) {
        //         isInvolved = true;
        //         break;
        //     }
        // }
        // if (!isInvolved) revert NotInvolved();
        
        // Check allowance for all flows initiated by the caller
        uint256 flowsLength = dvpSwap.flows.length;
        for (uint256 i = 0; i < flowsLength; i++) {
            Flow storage flow = dvpSwap.flows[i];
            if (flow.from == _msgSender()) {
                uint256 currentAllowance = IERC20(flow.token).allowance(_msgSender(), address(this));
                if (currentAllowance < flow.amount) {
                    revert InsufficientAllowance(
                        flow.token, 
                        _msgSender(), 
                        address(this), 
                        flow.amount, 
                        currentAllowance
                    );
                }
            }
        }
        
        // Mark as approved
        dvpSwap.approvals[_msgSender()] = true;
        emit DvPSwapApproved(dvpSwapId, _msgSender());
        
        // If auto-execution and all parties approved, execute swap
        if (dvpSwap.isAutoExecuted && isDvPSwapFullyApproved(dvpSwapId)) {
            try this.executeDvPSwap(dvpSwapId) {
                // Success
            } catch Error(string memory reason) {
                emit DvPSwapAutoExecutionFailed(dvpSwapId, _msgSender(), reason);
            } catch (bytes memory) {
                emit DvPSwapAutoExecutionFailed(dvpSwapId, _msgSender(), "Unknown error");
            }
        }
        
        return true;
    }
    
    /// @notice Checks if all parties have approved the DvP swap
    /// @param dvpSwapId Unique identifier of the swap
    /// @return approved True if all parties have approved
    function isDvPSwapFullyApproved(bytes32 dvpSwapId) public view returns (bool) {
        if (!dvpSwapExists[dvpSwapId]) return false;
        
        DvPSwapData storage dvpSwap = _dvpSwaps[dvpSwapId];
        
        // Check all unique "from" addresses for approval
        for (uint256 i = 0; i < dvpSwap.flows.length; i++) {
            address from = dvpSwap.flows[i].from;
            if (!dvpSwap.approvals[from]) {
                return false;
            }
        }
        
        return true;
    }

    /// @notice Executes a DvP swap if all approvals are in place
    /// @param dvpSwapId Unique identifier of the swap
    /// @return success True if execution was successful
    function executeDvPSwap(bytes32 dvpSwapId) 
        external 
        nonReentrant 
        whenNotPaused 
        checkDvPSwapExists(dvpSwapId)
        checkStatusIsOpenForAction(dvpSwapId)
        checkDvPSwapNotExpired(dvpSwapId)
        checkFullyApproved(dvpSwapId)
        returns (bool) 
    {
        // Verify swap exists - Handled by checkDvPSwapExists
        // if (!dvpSwapExists[dvpSwapId]) revert DvPSwapNotFound();
        
        DvPSwapData storage dvpSwap = _dvpSwaps[dvpSwapId];
        
        // Verify swap state - Handled by checkStatusIsOpenForAction
        // if (dvpSwap.status != DvPSwapStatus.OPEN && 
        //     dvpSwap.status != DvPSwapStatus.AWAITING_APPROVAL) 
        //     revert InvalidDvPSwapStatus();
        
        // Verify swap is not expired - Handled by checkDvPSwapNotExpired
        // if (block.timestamp > dvpSwap.cutoffDate) revert DvPSwapExpired();
        
        // Verify all parties have approved - Handled by checkFullyApproved
        // if (!isDvPSwapFullyApproved(dvpSwapId)) revert DvPSwapNotApproved();
        
        // Execute all token transfers
        for (uint256 i = 0; i < dvpSwap.flows.length; i++) {
            Flow storage flow = dvpSwap.flows[i];
            IERC20(flow.token).safeTransferFrom(flow.from, flow.to, flow.amount);
        }
        
        // Update swap status
        dvpSwap.status = DvPSwapStatus.CLAIMED;
        emit DvPSwapExecuted(dvpSwapId, _msgSender());
        emit DvPSwapStatusChanged(dvpSwapId, DvPSwapStatus.CLAIMED);
        
        return true;
    }

    /// @notice Revokes approval for a DvP swap
    /// @dev The caller must have previously approved the swap
    /// @param dvpSwapId Unique identifier of the swap
    /// @return success True if the revocation was successful
    function revokeDvPSwapApproval(bytes32 dvpSwapId) 
        external 
        nonReentrant 
        whenNotPaused 
        checkDvPSwapExists(dvpSwapId)
        checkStatusIsOpenForAction(dvpSwapId)
        checkCallerIsApproved(dvpSwapId)
        returns (bool) 
    {
        // Verify swap exists - Handled by checkDvPSwapExists
        // if (!dvpSwapExists[dvpSwapId]) revert DvPSwapNotFound();
        
        DvPSwapData storage dvpSwap = _dvpSwaps[dvpSwapId];
        
        // Verify swap state - Handled by checkStatusIsOpenForAction
        // if (dvpSwap.status != DvPSwapStatus.OPEN && 
        //     dvpSwap.status != DvPSwapStatus.AWAITING_APPROVAL) 
        //     revert InvalidDvPSwapStatus();
        
        // Verify caller has approved - Handled by checkCallerIsApproved
        // if (!dvpSwap.approvals[_msgSender()]) revert NotApproved();
        
        // Revoke approval
        dvpSwap.approvals[_msgSender()] = false;
        emit DvPSwapApprovalRevoked(dvpSwapId, _msgSender());
        
        return true;
    }

    /// @notice Expires a DvP swap that has passed its cutoff date
    /// @param dvpSwapId Unique identifier of the swap
    /// @return success True if the expiration was successful
    function expireDvPSwap(bytes32 dvpSwapId) 
        external 
        nonReentrant 
        whenNotPaused 
        checkDvPSwapExists(dvpSwapId)
        checkStatusIsOpenForAction(dvpSwapId)
        checkDvPSwapIsExpired(dvpSwapId)
        returns (bool) 
    {
        // Verify swap exists - Handled by checkDvPSwapExists
        // if (!dvpSwapExists[dvpSwapId]) revert DvPSwapNotFound();
        
        DvPSwapData storage dvpSwap = _dvpSwaps[dvpSwapId];
        
        // Verify swap state - Handled by checkStatusIsOpenForAction
        // if (dvpSwap.status != DvPSwapStatus.OPEN && 
        //     dvpSwap.status != DvPSwapStatus.AWAITING_APPROVAL) 
        //     revert InvalidDvPSwapStatus();
        
        // Verify swap is expired - Handled by checkDvPSwapIsExpired
        // if (block.timestamp <= dvpSwap.cutoffDate) revert InvalidDvPSwapParameters();
        
        // Update swap status
        dvpSwap.status = DvPSwapStatus.EXPIRED;
        emit DvPSwapExpiredEvent(dvpSwapId, block.timestamp);
        emit DvPSwapStatusChanged(dvpSwapId, DvPSwapStatus.EXPIRED);
        
        return true;
    }

    /// @notice Cancels a DvP swap if it's still in creation or open state
    /// @dev Only the creator can cancel a swap in these states
    /// @param dvpSwapId Unique identifier of the swap
    /// @return success True if the cancellation was successful
    function cancelDvPSwap(bytes32 dvpSwapId) 
        external 
        nonReentrant 
        whenNotPaused 
        checkDvPSwapExists(dvpSwapId)
        checkStatusIsOpenForCancel(dvpSwapId)
        checkCallerIsCreator(dvpSwapId)
        returns (bool) 
    {
        // Verify swap exists - Handled by checkDvPSwapExists
        // if (!dvpSwapExists[dvpSwapId]) revert DvPSwapNotFound();
        
        DvPSwapData storage dvpSwap = _dvpSwaps[dvpSwapId];
        
        // Verify swap state - Handled by checkStatusIsOpenForCancel
        // if (dvpSwap.status != DvPSwapStatus.PENDING_CREATION && 
        //     dvpSwap.status != DvPSwapStatus.OPEN) 
        //     revert InvalidDvPSwapStatus();
        
        // Verify caller is the creator - Handled by checkCallerIsCreator
        // if (_msgSender() != dvpSwap.creator) revert NotAuthorized();
        
        // Update swap status
        dvpSwap.status = DvPSwapStatus.CANCELLED;
        emit DvPSwapStatusChanged(dvpSwapId, DvPSwapStatus.CANCELLED);
        
        return true;
    }

    /// @notice Marks a DvP swap as failed
    /// @dev Sets the swap status to FAILED
    /// @param dvpSwapId Unique identifier of the swap
    /// @param reason Reason for the failure
    /// @return success True if the status was updated successfully
    function markDvPSwapFailed(bytes32 dvpSwapId, string calldata reason) 
        external 
        nonReentrant 
        whenNotPaused 
        checkDvPSwapExists(dvpSwapId)
        checkCallerCanMarkFailed(dvpSwapId)
        checkStatusAllowsFailure(dvpSwapId)
        returns (bool) 
    {
        // Verify swap exists - Handled by checkDvPSwapExists
        // if (!dvpSwapExists[dvpSwapId]) revert DvPSwapNotFound();
        
        // DvPSwapData storage dvpSwap = _dvpSwaps[dvpSwapId]; // Already accessed in modifiers
        
        // Verify caller is either involved in swap or admin - Handled by checkCallerCanMarkFailed
        // bool isAuthorized = false;
        // for (uint256 i = 0; i < dvpSwap.flows.length; i++) {
        //     if (dvpSwap.flows[i].from == _msgSender() || 
        //         dvpSwap.flows[i].to == _msgSender()) {
        //         isAuthorized = true;
        //         break;
        //     }
        // }
        // if (!isAuthorized && hasRole(DEFAULT_ADMIN_ROLE, _msgSender())) {
        //     isAuthorized = true;
        // }
        // if (!isAuthorized) revert NotAuthorized();
        
        // Verify swap state allows failure marking - Handled by checkStatusAllowsFailure
        // if (dvpSwap.status == DvPSwapStatus.CLAIMED || 
        //     dvpSwap.status == DvPSwapStatus.EXPIRED ||
        //     dvpSwap.status == DvPSwapStatus.CANCELLED || 
        //     dvpSwap.status == DvPSwapStatus.FAILED ||
        //     dvpSwap.status == DvPSwapStatus.INVALID) 
        //     revert InvalidDvPSwapStatus();
        
        // Update swap status
        _dvpSwaps[dvpSwapId].status = DvPSwapStatus.FAILED;
        emit DvPSwapStatusChanged(dvpSwapId, DvPSwapStatus.FAILED);
        emit DvPSwapAutoExecutionFailed(dvpSwapId, _msgSender(), reason);
        
        return true;
    }

    /// @notice Gets details of a DvP swap
    /// @dev Returns all information about a specific swap
    /// @param dvpSwapId Unique identifier of the swap
    /// @return id Human-readable identifier for the swap
    /// @return creator Address that created the swap
    /// @return cutoffDate Timestamp after which the swap expires
    /// @return status Current status of the swap
    /// @return createdAt Timestamp when the swap was created
    /// @return isAutoExecuted Whether to auto-execute after all approvals
    /// @return flows Array of token flows in the swap
    function getDvPSwap(bytes32 dvpSwapId) 
        external 
        view 
        returns (
            string memory id,
            address creator,
            uint256 cutoffDate,
            DvPSwapStatus status,
            uint256 createdAt,
            bool isAutoExecuted,
            Flow[] memory flows
        ) 
    {
        if (!dvpSwapExists[dvpSwapId]) revert DvPSwapNotFound();
        
        DvPSwapData storage dvpSwap = _dvpSwaps[dvpSwapId];
        
        return (
            dvpSwap.id,
            dvpSwap.creator,
            dvpSwap.cutoffDate,
            dvpSwap.status,
            dvpSwap.createdAt,
            dvpSwap.isAutoExecuted,
            dvpSwap.flows
        );
    }

    /// @notice Checks if a party has approved a DvP swap
    /// @param dvpSwapId Unique identifier of the swap
    /// @param party Address to check approval for
    /// @return approved True if the party has approved the swap
    function isDvPSwapApprovedByParty(bytes32 dvpSwapId, address party) 
        external 
        view 
        returns (bool) 
    {
        if (!dvpSwapExists[dvpSwapId]) revert DvPSwapNotFound();
        return _dvpSwaps[dvpSwapId].approvals[party];
    }

    /// @notice Checks if a DvP swap has expired
    /// @param dvpSwapId Unique identifier of the swap
    /// @return expired True if the swap has expired
    function isDvPSwapExpired(bytes32 dvpSwapId) 
        external 
        view 
        returns (bool) 
    {
        if (!dvpSwapExists[dvpSwapId]) return false;
        return block.timestamp > _dvpSwaps[dvpSwapId].cutoffDate;
    }

    // =========================================================================
    // Modifiers
    // =========================================================================

    /// @dev Modifier to check if a DvP swap exists.
    modifier checkDvPSwapExists(bytes32 dvpSwapId) {
        if (!dvpSwapExists[dvpSwapId]) revert DvPSwapNotFound();
        _;
    }

    /// @dev Modifier to check if a DvP swap has not expired.
    modifier checkDvPSwapNotExpired(bytes32 dvpSwapId) {
        DvPSwapData storage dvpSwap = _dvpSwaps[dvpSwapId];
        if (block.timestamp > dvpSwap.cutoffDate) revert DvPSwapExpired();
        _;
    }

    /// @dev Modifier to check if a DvP swap has expired.
    modifier checkDvPSwapIsExpired(bytes32 dvpSwapId) {
        DvPSwapData storage dvpSwap = _dvpSwaps[dvpSwapId];
        if (block.timestamp <= dvpSwap.cutoffDate) revert InvalidDvPSwapParameters(); // Reusing error for "not expired yet"
        _;
    }

    /// @dev Modifier to check if swap status is OPEN (suitable for actions like approve, execute, revoke, expire).
    modifier checkStatusIsOpenForAction(bytes32 dvpSwapId) {
        DvPSwapData storage dvpSwap = _dvpSwaps[dvpSwapId];
        // Only check for OPEN status
        if (dvpSwap.status != DvPSwapStatus.OPEN) 
            revert InvalidDvPSwapStatus();
        _;
    }

    /// @dev Modifier to check if swap status is OPEN (suitable for cancellation).
    modifier checkStatusIsOpenForCancel(bytes32 dvpSwapId) {
        DvPSwapData storage dvpSwap = _dvpSwaps[dvpSwapId];
        // Only check for OPEN status
        if (dvpSwap.status != DvPSwapStatus.OPEN) 
            revert InvalidDvPSwapStatus();
        _;
    }

    /// @dev Modifier to check if swap status allows marking as failed.
    modifier checkStatusAllowsFailure(bytes32 dvpSwapId) {
        DvPSwapData storage dvpSwap = _dvpSwaps[dvpSwapId];
        if (dvpSwap.status == DvPSwapStatus.CLAIMED || 
            dvpSwap.status == DvPSwapStatus.EXPIRED ||
            dvpSwap.status == DvPSwapStatus.CANCELLED || 
            dvpSwap.status == DvPSwapStatus.FAILED)
            // Removed: dvpSwap.status == DvPSwapStatus.INVALID
            revert InvalidDvPSwapStatus();
        _;
    }

    /// @dev Modifier to check if the caller has not already approved the swap.
    modifier checkCallerIsNotApproved(bytes32 dvpSwapId) {
        DvPSwapData storage dvpSwap = _dvpSwaps[dvpSwapId];
        if (dvpSwap.approvals[_msgSender()]) revert AlreadyApproved();
        _;
    }

    /// @dev Modifier to check if the caller has already approved the swap.
    modifier checkCallerIsApproved(bytes32 dvpSwapId) {
        DvPSwapData storage dvpSwap = _dvpSwaps[dvpSwapId];
        if (!dvpSwap.approvals[_msgSender()]) revert NotApproved();
        _;
    }

    /// @dev Modifier to check if the caller is a sender in any flow.
    modifier checkCallerIsInvolvedSender(bytes32 dvpSwapId) {
        DvPSwapData storage dvpSwap = _dvpSwaps[dvpSwapId];
        bool isInvolved = false;
        for (uint256 i = 0; i < dvpSwap.flows.length; i++) {
            if (dvpSwap.flows[i].from == _msgSender()) {
                isInvolved = true;
                break;
            }
        }
        if (!isInvolved) revert NotInvolved();
        _;
    }

    /// @dev Modifier to check if the caller is involved (sender or receiver) in any flow.
    modifier checkCallerIsInvolvedAny(bytes32 dvpSwapId) {
        DvPSwapData storage dvpSwap = _dvpSwaps[dvpSwapId];
        bool isInvolved = false;
        for (uint256 i = 0; i < dvpSwap.flows.length; i++) {
            if (dvpSwap.flows[i].from == _msgSender() || 
                dvpSwap.flows[i].to == _msgSender()) {
                isInvolved = true;
                break;
            }
        }
        if (!isInvolved) revert NotInvolved();
        _;
    }

    /// @dev Modifier to check if the caller is the creator of the swap.
    modifier checkCallerIsCreator(bytes32 dvpSwapId) {
        DvPSwapData storage dvpSwap = _dvpSwaps[dvpSwapId];
        if (_msgSender() != dvpSwap.creator) revert NotAuthorized();
        _;
    }

    /// @dev Modifier to check if the caller is authorized to mark the swap as failed.
    modifier checkCallerCanMarkFailed(bytes32 dvpSwapId) {
        DvPSwapData storage dvpSwap = _dvpSwaps[dvpSwapId];
        bool isAuthorized = false;
        for (uint256 i = 0; i < dvpSwap.flows.length; i++) {
            if (dvpSwap.flows[i].from == _msgSender() || 
                dvpSwap.flows[i].to == _msgSender()) {
                isAuthorized = true;
                break;
            }
        }
        if (!isAuthorized && hasRole(DEFAULT_ADMIN_ROLE, _msgSender())) {
            isAuthorized = true;
        }
        if (!isAuthorized) revert NotAuthorized();
        _;
    }

    /// @dev Modifier to check if the swap is fully approved by all senders.
    modifier checkFullyApproved(bytes32 dvpSwapId) {
        if (!isDvPSwapFullyApproved(dvpSwapId)) revert DvPSwapNotApproved();
        _;
    }
}
