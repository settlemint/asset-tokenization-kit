// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @title DvPSwap - A contract for atomic swaps between tokens using HTLC
/// @notice This contract enables Delivery vs Payment (DvP) settlement between digital securities and digital cash
/// using Hashed Timelock Contract (HTLC) logic to ensure atomicity.
/// @dev Inherits from multiple OpenZeppelin contracts to provide comprehensive security features,
/// meta-transactions support, and role-based access control.
/// @custom:security-contact support@settlemint.com
contract DvPSwap is ReentrancyGuard, Pausable, AccessControl, ERC2771Context, Ownable {
    using SafeERC20 for IERC20;

    /// @notice Role identifier for addresses that can pause/unpause the contract
    /// @dev Keccak256 hash of "PAUSER_ROLE"
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice Default maximum duration for a swap
    /// @dev Swaps older than this can be automatically expired
    uint256 public constant DEFAULT_MAX_DURATION = 7 days;

    /// @notice Status of a DvP swap
    /// @dev Defines the possible states for a DvP swap
    enum DvPSwapStatus {
        PENDING_CREATION,       // Initial state when swap is being created
        OPEN,                   // Swap is created and tokens are locked, waiting for counterparty
        CLAIMED,                // Tokens have been claimed by the counterparty
        REFUNDED,               // Tokens have been refunded to the original sender
        EXPIRED,                // Swap has expired without being claimed
        CANCELLED,              // Swap was cancelled before counterparty action
        FAILED,                 // Transaction failed due to execution error
        INVALID,                // Swap parameters or state is invalid
        AWAITING_APPROVAL,      // Waiting for approval from counterparty
        AWAITING_CLAIM_SECRET   // Secret ready to be revealed for claim
    }

    /// @notice DvP swap data structure
    /// @dev Stores all information about a DvP swap
    struct DvPSwap {
        address creator;            // Address that created the swap
        address sender;             // Address of the token sender
        address receiver;           // Address of the token receiver
        address tokenToSend;        // Address of the token being sent
        address tokenToReceive;     // Address of the token being received
        uint256 amountToSend;       // Amount of tokens being sent
        uint256 amountToReceive;    // Amount of tokens being received
        uint256 timelock;           // Timestamp after which the swap can be refunded
        bytes32 hashlock;           // Hash of the secret used to claim the swap
        DvPSwapStatus status;       // Current status of the swap
        uint256 createdAt;          // Timestamp when the swap was created
        uint256 maxDuration;        // Maximum lifetime of the swap
    }

    /// @notice Custom errors for the DvPSwap contract
    /// @dev These errors provide more gas-efficient and descriptive error handling
    error InvalidDvPSwapParameters();
    error DvPSwapNotFound();
    error DvPSwapAlreadyExists();
    error InvalidTimelock();
    error InvalidDvPSwapStatus();
    error DvPSwapExpired();
    error HashCheckFailed();
    error NotAuthorized();
    error ZeroAmount();
    error ZeroAddress();
    error TimelockedFunds();
    error MaxDurationExceeded();
    error FailedExecution(string reason);

    /// @notice Maps swap ID to swap details
    /// @dev Stores all swaps by their unique ID
    mapping(bytes32 => DvPSwap) private _dvpSwaps;

    /// @notice Maps swap ID to a boolean indicating if the swap exists
    /// @dev Used to quickly check if a swap ID is valid
    mapping(bytes32 => bool) public dvpSwapExists;

    /// @notice Event emitted when a new DvP swap is created
    /// @param dvpSwapId Unique identifier for the swap
    /// @param sender Address sending the tokens
    /// @param receiver Address receiving the tokens
    /// @param tokenToSend Address of the token being sent
    /// @param tokenToReceive Address of the token being received
    /// @param amountToSend Amount of tokens being sent
    /// @param amountToReceive Amount of tokens being received
    /// @param timelock Timestamp after which the swap can be refunded
    /// @param hashlock Hash of the secret used to claim the swap
    event DvPSwapCreated(
        bytes32 indexed dvpSwapId,
        address indexed sender,
        address indexed receiver,
        address tokenToSend,
        address tokenToReceive,
        uint256 amountToSend,
        uint256 amountToReceive,
        uint256 timelock,
        bytes32 hashlock
    );

    /// @notice Event emitted when a DvP swap's status changes
    /// @param dvpSwapId Unique identifier for the swap
    /// @param status New status of the swap
    event DvPSwapStatusChanged(bytes32 indexed dvpSwapId, DvPSwapStatus status);

    /// @notice Event emitted when tokens are claimed from a DvP swap
    /// @param dvpSwapId Unique identifier for the swap
    /// @param receiver Address that claimed the tokens
    /// @param secret Secret used to claim the tokens
    event DvPSwapClaimed(bytes32 indexed dvpSwapId, address indexed receiver, bytes32 secret);

    /// @notice Event emitted when a DvP swap is refunded
    /// @param dvpSwapId Unique identifier for the swap
    /// @param sender Address that received the refund
    event DvPSwapRefunded(bytes32 indexed dvpSwapId, address indexed sender);

    /// @notice Event emitted when tokens are locked in the contract
    /// @param dvpSwapId Unique identifier for the swap
    /// @param tokenAddress Address of the token that was locked
    /// @param amount Amount of tokens locked
    /// @param timestamp Time when the tokens were locked
    event TokensLocked(
        bytes32 indexed dvpSwapId,
        address tokenAddress,
        uint256 amount,
        uint256 timestamp
    );

    /// @notice Deploys a new DvPSwap contract
    /// @dev Sets up the contract with admin and pauser roles and initializes meta-transaction support
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    constructor(address forwarder) ERC2771Context(forwarder) Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(PAUSER_ROLE, _msgSender());
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
    /// @dev Only callable by addresses with PAUSER_ROLE
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @notice Unpauses swap operations
    /// @dev Only callable by addresses with PAUSER_ROLE
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /// @notice Creates a new DvP atomic swap
    /// @dev Locks the sender's tokens in the contract until claimed or refunded
    /// @param receiver Address that will receive the locked tokens
    /// @param tokenToSend Address of the token being sent
    /// @param tokenToReceive Address of the token the sender wants to receive
    /// @param amountToSend Amount of tokens to send
    /// @param amountToReceive Amount of tokens to receive
    /// @param timelock Timestamp after which the swap can be refunded
    /// @param hashlock Hash of the secret that will be used to claim the tokens
    /// @return dvpSwapId Unique identifier for the created swap
    function createDvPSwap(
        address receiver,
        address tokenToSend,
        address tokenToReceive,
        uint256 amountToSend,
        uint256 amountToReceive,
        uint256 timelock,
        bytes32 hashlock
    ) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (bytes32 dvpSwapId) 
    {
        // Validate parameters
        if (receiver == address(0)) revert ZeroAddress();
        if (tokenToSend == address(0)) revert ZeroAddress();
        if (tokenToReceive == address(0)) revert ZeroAddress();
        if (amountToSend == 0) revert ZeroAmount();
        if (amountToReceive == 0) revert ZeroAmount();
        if (timelock <= block.timestamp) revert InvalidTimelock();
        if (hashlock == bytes32(0)) revert InvalidDvPSwapParameters();

        // Generate swap ID
        dvpSwapId = keccak256(
            abi.encodePacked(
                _msgSender(),
                receiver,
                tokenToSend,
                tokenToReceive,
                amountToSend,
                amountToReceive,
                timelock,
                hashlock
            )
        );

        // Ensure swap doesn't already exist
        if (dvpSwapExists[dvpSwapId]) revert DvPSwapAlreadyExists();

        // Create swap
        _dvpSwaps[dvpSwapId] = DvPSwap({
            creator: _msgSender(),
            sender: _msgSender(),
            receiver: receiver,
            tokenToSend: tokenToSend,
            tokenToReceive: tokenToReceive,
            amountToSend: amountToSend,
            amountToReceive: amountToReceive,
            timelock: timelock,
            hashlock: hashlock,
            status: DvPSwapStatus.PENDING_CREATION,
            createdAt: block.timestamp,
            maxDuration: block.timestamp + DEFAULT_MAX_DURATION
        });

        dvpSwapExists[dvpSwapId] = true;
        
        // Transfer tokens from sender to this contract
        IERC20(tokenToSend).safeTransferFrom(_msgSender(), address(this), amountToSend);
        
        // Emit token locking event
        emit TokensLocked(dvpSwapId, tokenToSend, amountToSend, block.timestamp);
        
        // Update status to OPEN after successful token transfer
        _dvpSwaps[dvpSwapId].status = DvPSwapStatus.OPEN;
        
        emit DvPSwapCreated(
            dvpSwapId,
            _msgSender(),
            receiver,
            tokenToSend,
            tokenToReceive,
            amountToSend,
            amountToReceive,
            timelock,
            hashlock
        );
        
        emit DvPSwapStatusChanged(dvpSwapId, DvPSwapStatus.OPEN);
        
        return dvpSwapId;
    }

    /// @notice Claims tokens from a DvP swap by revealing the secret
    /// @dev The counterparty (receiver) calls this to complete their side of the swap
    /// @param dvpSwapId Unique identifier of the swap
    /// @param secret The secret that hashes to the hashlock
    /// @return bool True if the claim was successful
    function claimDvPSwap(bytes32 dvpSwapId, bytes32 secret) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (bool) 
    {
        // Verify swap exists
        if (!dvpSwapExists[dvpSwapId]) revert DvPSwapNotFound();
        
        DvPSwap storage swap = _dvpSwaps[dvpSwapId];
        
        // Check if swap is expired due to max duration
        if (block.timestamp > swap.maxDuration) revert DvPSwapExpired();
        
        // Verify swap is open or awaiting claim
        if (swap.status != DvPSwapStatus.OPEN && 
            swap.status != DvPSwapStatus.AWAITING_CLAIM_SECRET && 
            swap.status != DvPSwapStatus.AWAITING_APPROVAL) revert InvalidDvPSwapStatus();
        
        // Verify timelock hasn't expired
        if (block.timestamp >= swap.timelock) revert DvPSwapExpired();
        
        // Verify the secret matches the hashlock
        if (keccak256(abi.encodePacked(secret)) != swap.hashlock) revert HashCheckFailed();
        
        // Verify caller is the intended receiver
        if (_msgSender() != swap.receiver) revert NotAuthorized();
        
        // Transfer the counter tokens from receiver to the original sender
        IERC20(swap.tokenToReceive).safeTransferFrom(_msgSender(), swap.sender, swap.amountToReceive);
        
        // Transfer the locked tokens to the receiver
        IERC20(swap.tokenToSend).safeTransfer(swap.receiver, swap.amountToSend);
        
        // Update swap status
        swap.status = DvPSwapStatus.CLAIMED;
        
        emit DvPSwapClaimed(dvpSwapId, swap.receiver, secret);
        emit DvPSwapStatusChanged(dvpSwapId, DvPSwapStatus.CLAIMED);
        
        return true;
    }

    /// @notice Refunds tokens to the original sender if the timelock has expired
    /// @dev Only the original sender can refund after the timelock has expired
    /// @param dvpSwapId Unique identifier of the swap
    /// @return bool True if the refund was successful
    function refundDvPSwap(bytes32 dvpSwapId) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (bool) 
    {
        // Verify swap exists
        if (!dvpSwapExists[dvpSwapId]) revert DvPSwapNotFound();
        
        DvPSwap storage swap = _dvpSwaps[dvpSwapId];
        
        // Verify swap is in an active state
        if (swap.status != DvPSwapStatus.OPEN && 
            swap.status != DvPSwapStatus.AWAITING_APPROVAL && 
            swap.status != DvPSwapStatus.AWAITING_CLAIM_SECRET) revert InvalidDvPSwapStatus();
        
        // Verify timelock has expired or max duration exceeded
        bool timelockExpired = block.timestamp >= swap.timelock;
        bool maxDurationExpired = block.timestamp > swap.maxDuration;
        
        if (!timelockExpired && !maxDurationExpired) revert TimelockedFunds();
        
        // Verify caller is the original sender
        if (_msgSender() != swap.sender) revert NotAuthorized();
        
        // Transfer the locked tokens back to the sender
        IERC20(swap.tokenToSend).safeTransfer(swap.sender, swap.amountToSend);
        
        // Update swap status
        swap.status = DvPSwapStatus.REFUNDED;
        
        emit DvPSwapRefunded(dvpSwapId, swap.sender);
        emit DvPSwapStatusChanged(dvpSwapId, DvPSwapStatus.REFUNDED);
        
        return true;
    }

    /// @notice Cancels a DvP swap if it's still in PENDING_CREATION status
    /// @dev Only the creator can cancel a swap in this status
    /// @param dvpSwapId Unique identifier of the swap
    /// @return bool True if the cancellation was successful
    function cancelDvPSwap(bytes32 dvpSwapId) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (bool) 
    {
        // Verify swap exists
        if (!dvpSwapExists[dvpSwapId]) revert DvPSwapNotFound();
        
        DvPSwap storage swap = _dvpSwaps[dvpSwapId];
        
        // Verify swap is in a cancellable state
        if (swap.status != DvPSwapStatus.PENDING_CREATION) revert InvalidDvPSwapStatus();
        
        // Verify caller is the creator
        if (_msgSender() != swap.creator) revert NotAuthorized();
        
        // Update swap status
        swap.status = DvPSwapStatus.CANCELLED;
        
        emit DvPSwapStatusChanged(dvpSwapId, DvPSwapStatus.CANCELLED);
        
        return true;
    }
    
    /// @notice Expires a DvP swap that has exceeded its maximum duration
    /// @dev Can be called by anyone to clean up abandoned swaps
    /// @param dvpSwapId Unique identifier of the swap
    /// @return bool True if the swap was expired
    function expireDvPSwap(bytes32 dvpSwapId) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (bool) 
    {
        // Verify swap exists
        if (!dvpSwapExists[dvpSwapId]) revert DvPSwapNotFound();
        
        DvPSwap storage swap = _dvpSwaps[dvpSwapId];
        
        // Verify swap is in a state that can be expired
        if (swap.status != DvPSwapStatus.OPEN && 
            swap.status != DvPSwapStatus.AWAITING_APPROVAL && 
            swap.status != DvPSwapStatus.AWAITING_CLAIM_SECRET) revert InvalidDvPSwapStatus();
        
        // Check if max duration is exceeded
        if (block.timestamp <= swap.maxDuration) revert MaxDurationExceeded();
        
        // Return tokens to sender
        IERC20(swap.tokenToSend).safeTransfer(swap.sender, swap.amountToSend);
        
        // Update swap status
        swap.status = DvPSwapStatus.EXPIRED;
        
        emit DvPSwapStatusChanged(dvpSwapId, DvPSwapStatus.EXPIRED);
        
        return true;
    }

    /// @notice Gets details of a DvP swap
    /// @dev Returns all information about a specific swap
    /// @param dvpSwapId Unique identifier of the swap
    /// @return DvPSwap struct containing all swap details
    function getDvPSwap(bytes32 dvpSwapId) 
        external 
        view 
        returns (DvPSwap memory) 
    {
        if (!dvpSwapExists[dvpSwapId]) revert DvPSwapNotFound();
        return _dvpSwaps[dvpSwapId];
    }

    /// @notice Checks if a secret matches a DvP swap's hashlock
    /// @dev Utility function to verify a secret without claiming the swap
    /// @param dvpSwapId Unique identifier of the swap
    /// @param secret The secret to check against the hashlock
    /// @return bool True if the secret matches the hashlock
    function checkDvPSwapSecret(bytes32 dvpSwapId, bytes32 secret) 
        external 
        view 
        returns (bool) 
    {
        if (!dvpSwapExists[dvpSwapId]) revert DvPSwapNotFound();
        DvPSwap storage swap = _dvpSwaps[dvpSwapId];
        return keccak256(abi.encodePacked(secret)) == swap.hashlock;
    }
    
    /// @notice Checks if a DvP swap is expired due to max duration
    /// @dev Returns true if the swap has exceeded its maximum duration
    /// @param dvpSwapId Unique identifier of the swap
    /// @return bool True if the swap is expired
    function isDvPSwapExpired(bytes32 dvpSwapId) 
        external 
        view 
        returns (bool) 
    {
        if (!dvpSwapExists[dvpSwapId]) return false;
        DvPSwap storage swap = _dvpSwaps[dvpSwapId];
        return block.timestamp > swap.maxDuration;
    }

    /// @notice Requests approval from the counterparty for the DvP swap
    /// @dev Sets the swap status to AWAITING_APPROVAL
    /// @param dvpSwapId Unique identifier of the swap
    /// @return bool True if the status was updated successfully
    function requestDvPSwapApproval(bytes32 dvpSwapId) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (bool) 
    {
        // Verify swap exists
        if (!dvpSwapExists[dvpSwapId]) revert DvPSwapNotFound();
        
        DvPSwap storage swap = _dvpSwaps[dvpSwapId];
        
        // Verify swap is in OPEN state
        if (swap.status != DvPSwapStatus.OPEN) revert InvalidDvPSwapStatus();
        
        // Verify caller is the sender
        if (_msgSender() != swap.sender) revert NotAuthorized();
        
        // Update swap status
        swap.status = DvPSwapStatus.AWAITING_APPROVAL;
        
        emit DvPSwapStatusChanged(dvpSwapId, DvPSwapStatus.AWAITING_APPROVAL);
        
        return true;
    }

    /// @notice Indicates the secret is ready for claiming
    /// @dev Sets the swap status to AWAITING_CLAIM_SECRET
    /// @param dvpSwapId Unique identifier of the swap
    /// @return bool True if the status was updated successfully
    function notifyDvPSwapSecretReady(bytes32 dvpSwapId) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (bool) 
    {
        // Verify swap exists
        if (!dvpSwapExists[dvpSwapId]) revert DvPSwapNotFound();
        
        DvPSwap storage swap = _dvpSwaps[dvpSwapId];
        
        // Verify swap is in OPEN or AWAITING_APPROVAL state
        if (swap.status != DvPSwapStatus.OPEN && 
            swap.status != DvPSwapStatus.AWAITING_APPROVAL) revert InvalidDvPSwapStatus();
        
        // Verify caller is the sender
        if (_msgSender() != swap.sender) revert NotAuthorized();
        
        // Update swap status
        swap.status = DvPSwapStatus.AWAITING_CLAIM_SECRET;
        
        emit DvPSwapStatusChanged(dvpSwapId, DvPSwapStatus.AWAITING_CLAIM_SECRET);
        
        return true;
    }

    /// @notice Marks a DvP swap as failed
    /// @dev Sets the swap status to FAILED and returns any locked tokens
    /// @param dvpSwapId Unique identifier of the swap
    /// @param reason Reason for the failure
    /// @return bool True if the status was updated successfully
    function markDvPSwapFailed(bytes32 dvpSwapId, string calldata reason) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (bool) 
    {
        // Verify swap exists
        if (!dvpSwapExists[dvpSwapId]) revert DvPSwapNotFound();
        
        DvPSwap storage swap = _dvpSwaps[dvpSwapId];
        
        // Verify caller is either sender, receiver, or admin
        bool isAuthorizedActor = (_msgSender() == swap.sender || 
                                 _msgSender() == swap.receiver || 
                                 hasRole(DEFAULT_ADMIN_ROLE, _msgSender()));
        
        if (!isAuthorizedActor) revert NotAuthorized();
        
        // Verify swap is in an active state
        if (swap.status == DvPSwapStatus.CLAIMED || 
            swap.status == DvPSwapStatus.REFUNDED || 
            swap.status == DvPSwapStatus.EXPIRED ||
            swap.status == DvPSwapStatus.CANCELLED || 
            swap.status == DvPSwapStatus.FAILED ||
            swap.status == DvPSwapStatus.INVALID) revert InvalidDvPSwapStatus();
        
        // Return tokens to sender if they are locked
        if (swap.status == DvPSwapStatus.OPEN || 
            swap.status == DvPSwapStatus.AWAITING_APPROVAL || 
            swap.status == DvPSwapStatus.AWAITING_CLAIM_SECRET) {
            IERC20(swap.tokenToSend).safeTransfer(swap.sender, swap.amountToSend);
        }
        
        // Update swap status
        swap.status = DvPSwapStatus.FAILED;
        
        emit DvPSwapStatusChanged(dvpSwapId, DvPSwapStatus.FAILED);
        
        return true;
    }

    /// @notice Marks a DvP swap as invalid
    /// @dev Sets the swap status to INVALID and returns any locked tokens
    /// @param dvpSwapId Unique identifier of the swap
    /// @param reason Reason for being invalid
    /// @return bool True if the status was updated successfully
    function markDvPSwapInvalid(bytes32 dvpSwapId, string calldata reason) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (bool) 
    {
        // Verify swap exists
        if (!dvpSwapExists[dvpSwapId]) revert DvPSwapNotFound();
        
        DvPSwap storage swap = _dvpSwaps[dvpSwapId];
        
        // Verify caller is either sender, receiver, or admin
        bool isAuthorizedActor = (_msgSender() == swap.sender || 
                                 _msgSender() == swap.receiver || 
                                 hasRole(DEFAULT_ADMIN_ROLE, _msgSender()));
        
        if (!isAuthorizedActor) revert NotAuthorized();
        
        // Verify swap is in an active state
        if (swap.status == DvPSwapStatus.CLAIMED || 
            swap.status == DvPSwapStatus.REFUNDED || 
            swap.status == DvPSwapStatus.EXPIRED ||
            swap.status == DvPSwapStatus.CANCELLED || 
            swap.status == DvPSwapStatus.FAILED ||
            swap.status == DvPSwapStatus.INVALID) revert InvalidDvPSwapStatus();
        
        // Return tokens to sender if they are locked
        if (swap.status == DvPSwapStatus.OPEN || 
            swap.status == DvPSwapStatus.AWAITING_APPROVAL || 
            swap.status == DvPSwapStatus.AWAITING_CLAIM_SECRET) {
            IERC20(swap.tokenToSend).safeTransfer(swap.sender, swap.amountToSend);
        }
        
        // Update swap status
        swap.status = DvPSwapStatus.INVALID;
        
        emit DvPSwapStatusChanged(dvpSwapId, DvPSwapStatus.INVALID);
        
        return true;
    }
} 