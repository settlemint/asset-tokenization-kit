// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

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

    /// @notice Status of a swap
    /// @dev Defines the possible states for a swap
    enum SwapStatus {
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

    /// @notice Swap data structure
    /// @dev Stores all information about a swap
    struct Swap {
        address creator;            // Address that created the swap
        address sender;             // Address of the token sender
        address receiver;           // Address of the token receiver
        address tokenToSend;        // Address of the token being sent
        address tokenToReceive;     // Address of the token being received
        uint256 amountToSend;       // Amount of tokens being sent
        uint256 amountToReceive;    // Amount of tokens being received
        uint256 timelock;           // Timestamp after which the swap can be refunded
        bytes32 hashlock;           // Hash of the secret used to claim the swap
        SwapStatus status;          // Current status of the swap
        uint256 createdAt;          // Timestamp when the swap was created
        uint256 maxDuration;        // Maximum lifetime of the swap
    }

    /// @notice Custom errors for the DvPSwap contract
    /// @dev These errors provide more gas-efficient and descriptive error handling
    error InvalidSwapParameters();
    error SwapNotFound();
    error SwapAlreadyExists();
    error InvalidTimelock();
    error InvalidSwapStatus();
    error SwapExpired();
    error HashCheckFailed();
    error NotAuthorized();
    error ZeroAmount();
    error ZeroAddress();
    error TimelockedFunds();
    error MaxDurationExceeded();
    error FailedExecution(string reason);

    /// @notice Maps swap ID to swap details
    /// @dev Stores all swaps by their unique ID
    mapping(bytes32 => Swap) private _swaps;

    /// @notice Maps swap ID to a boolean indicating if the swap exists
    /// @dev Used to quickly check if a swap ID is valid
    mapping(bytes32 => bool) public swapExists;

    /// @notice Event emitted when a new swap is created
    /// @param swapId Unique identifier for the swap
    /// @param sender Address sending the tokens
    /// @param receiver Address receiving the tokens
    /// @param tokenToSend Address of the token being sent
    /// @param tokenToReceive Address of the token being received
    /// @param amountToSend Amount of tokens being sent
    /// @param amountToReceive Amount of tokens being received
    /// @param timelock Timestamp after which the swap can be refunded
    /// @param hashlock Hash of the secret used to claim the swap
    event SwapCreated(
        bytes32 indexed swapId,
        address indexed sender,
        address indexed receiver,
        address tokenToSend,
        address tokenToReceive,
        uint256 amountToSend,
        uint256 amountToReceive,
        uint256 timelock,
        bytes32 hashlock
    );

    /// @notice Event emitted when a swap's status changes
    /// @param swapId Unique identifier for the swap
    /// @param status New status of the swap
    event SwapStatusChanged(bytes32 indexed swapId, SwapStatus status);

    /// @notice Event emitted when tokens are claimed from a swap
    /// @param swapId Unique identifier for the swap
    /// @param receiver Address that claimed the tokens
    /// @param secret Secret used to claim the tokens
    event SwapClaimed(bytes32 indexed swapId, address indexed receiver, bytes32 secret);

    /// @notice Event emitted when a swap is refunded
    /// @param swapId Unique identifier for the swap
    /// @param sender Address that received the refund
    event SwapRefunded(bytes32 indexed swapId, address indexed sender);

    /// @notice Event emitted when tokens are locked in the contract
    /// @param swapId Unique identifier for the swap
    /// @param tokenAddress Address of the token that was locked
    /// @param amount Amount of tokens locked
    /// @param timestamp Time when the tokens were locked
    event TokensLocked(
        bytes32 indexed swapId,
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

    /// @notice Creates a new atomic swap
    /// @dev Locks the sender's tokens in the contract until claimed or refunded
    /// @param receiver Address that will receive the locked tokens
    /// @param tokenToSend Address of the token being sent
    /// @param tokenToReceive Address of the token the sender wants to receive
    /// @param amountToSend Amount of tokens to send
    /// @param amountToReceive Amount of tokens to receive
    /// @param timelock Timestamp after which the swap can be refunded
    /// @param hashlock Hash of the secret that will be used to claim the tokens
    /// @return swapId Unique identifier for the created swap
    function createSwap(
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
        returns (bytes32 swapId) 
    {
        // Validate parameters
        if (receiver == address(0)) revert ZeroAddress();
        if (tokenToSend == address(0)) revert ZeroAddress();
        if (tokenToReceive == address(0)) revert ZeroAddress();
        if (amountToSend == 0) revert ZeroAmount();
        if (amountToReceive == 0) revert ZeroAmount();
        if (timelock <= block.timestamp) revert InvalidTimelock();
        if (hashlock == bytes32(0)) revert InvalidSwapParameters();

        // Generate swap ID
        swapId = keccak256(
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
        if (swapExists[swapId]) revert SwapAlreadyExists();

        // Create swap
        _swaps[swapId] = Swap({
            creator: _msgSender(),
            sender: _msgSender(),
            receiver: receiver,
            tokenToSend: tokenToSend,
            tokenToReceive: tokenToReceive,
            amountToSend: amountToSend,
            amountToReceive: amountToReceive,
            timelock: timelock,
            hashlock: hashlock,
            status: SwapStatus.PENDING_CREATION,
            createdAt: block.timestamp,
            maxDuration: block.timestamp + DEFAULT_MAX_DURATION
        });

        swapExists[swapId] = true;
        
        // Transfer tokens from sender to this contract
        IERC20(tokenToSend).safeTransferFrom(_msgSender(), address(this), amountToSend);
        
        // Emit token locking event
        emit TokensLocked(swapId, tokenToSend, amountToSend, block.timestamp);
        
        // Update status to OPEN after successful token transfer
        _swaps[swapId].status = SwapStatus.OPEN;
        
        emit SwapCreated(
            swapId,
            _msgSender(),
            receiver,
            tokenToSend,
            tokenToReceive,
            amountToSend,
            amountToReceive,
            timelock,
            hashlock
        );
        
        emit SwapStatusChanged(swapId, SwapStatus.OPEN);
        
        return swapId;
    }

    /// @notice Claims tokens from a swap by revealing the secret
    /// @dev The counterparty (receiver) calls this to complete their side of the swap
    /// @param swapId Unique identifier of the swap
    /// @param secret The secret that hashes to the hashlock
    /// @return bool True if the claim was successful
    function claimSwap(bytes32 swapId, bytes32 secret) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (bool) 
    {
        // Verify swap exists
        if (!swapExists[swapId]) revert SwapNotFound();
        
        Swap storage swap = _swaps[swapId];
        
        // Check if swap is expired due to max duration
        if (block.timestamp > swap.maxDuration) revert SwapExpired();
        
        // Verify swap is open or awaiting claim
        if (swap.status != SwapStatus.OPEN && 
            swap.status != SwapStatus.AWAITING_CLAIM_SECRET && 
            swap.status != SwapStatus.AWAITING_APPROVAL) revert InvalidSwapStatus();
        
        // Verify timelock hasn't expired
        if (block.timestamp >= swap.timelock) revert SwapExpired();
        
        // Verify the secret matches the hashlock
        if (keccak256(abi.encodePacked(secret)) != swap.hashlock) revert HashCheckFailed();
        
        // Verify caller is the intended receiver
        if (_msgSender() != swap.receiver) revert NotAuthorized();
        
        // Transfer the counter tokens from receiver to the original sender
        IERC20(swap.tokenToReceive).safeTransferFrom(_msgSender(), swap.sender, swap.amountToReceive);
        
        // Transfer the locked tokens to the receiver
        IERC20(swap.tokenToSend).safeTransfer(swap.receiver, swap.amountToSend);
        
        // Update swap status
        swap.status = SwapStatus.CLAIMED;
        
        emit SwapClaimed(swapId, swap.receiver, secret);
        emit SwapStatusChanged(swapId, SwapStatus.CLAIMED);
        
        return true;
    }

    /// @notice Refunds tokens to the original sender if the timelock has expired
    /// @dev Only the original sender can refund after the timelock has expired
    /// @param swapId Unique identifier of the swap
    /// @return bool True if the refund was successful
    function refundSwap(bytes32 swapId) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (bool) 
    {
        // Verify swap exists
        if (!swapExists[swapId]) revert SwapNotFound();
        
        Swap storage swap = _swaps[swapId];
        
        // Verify swap is in an active state
        if (swap.status != SwapStatus.OPEN && 
            swap.status != SwapStatus.AWAITING_APPROVAL && 
            swap.status != SwapStatus.AWAITING_CLAIM_SECRET) revert InvalidSwapStatus();
        
        // Verify timelock has expired or max duration exceeded
        bool timelockExpired = block.timestamp >= swap.timelock;
        bool maxDurationExpired = block.timestamp > swap.maxDuration;
        
        if (!timelockExpired && !maxDurationExpired) revert TimelockedFunds();
        
        // Verify caller is the original sender
        if (_msgSender() != swap.sender) revert NotAuthorized();
        
        // Transfer the locked tokens back to the sender
        IERC20(swap.tokenToSend).safeTransfer(swap.sender, swap.amountToSend);
        
        // Update swap status
        swap.status = SwapStatus.REFUNDED;
        
        emit SwapRefunded(swapId, swap.sender);
        emit SwapStatusChanged(swapId, SwapStatus.REFUNDED);
        
        return true;
    }

    /// @notice Cancels a swap if it's still in PENDING_CREATION status
    /// @dev Only the creator can cancel a swap in this status
    /// @param swapId Unique identifier of the swap
    /// @return bool True if the cancellation was successful
    function cancelSwap(bytes32 swapId) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (bool) 
    {
        // Verify swap exists
        if (!swapExists[swapId]) revert SwapNotFound();
        
        Swap storage swap = _swaps[swapId];
        
        // Verify swap is in a cancellable state
        if (swap.status != SwapStatus.PENDING_CREATION) revert InvalidSwapStatus();
        
        // Verify caller is the creator
        if (_msgSender() != swap.creator) revert NotAuthorized();
        
        // Update swap status
        swap.status = SwapStatus.CANCELLED;
        
        emit SwapStatusChanged(swapId, SwapStatus.CANCELLED);
        
        return true;
    }
    
    /// @notice Expires a swap that has exceeded its maximum duration
    /// @dev Can be called by anyone to clean up abandoned swaps
    /// @param swapId Unique identifier of the swap
    /// @return bool True if the swap was expired
    function expireSwap(bytes32 swapId) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (bool) 
    {
        // Verify swap exists
        if (!swapExists[swapId]) revert SwapNotFound();
        
        Swap storage swap = _swaps[swapId];
        
        // Verify swap is in a state that can be expired
        if (swap.status != SwapStatus.OPEN && 
            swap.status != SwapStatus.AWAITING_APPROVAL && 
            swap.status != SwapStatus.AWAITING_CLAIM_SECRET) revert InvalidSwapStatus();
        
        // Check if max duration is exceeded
        if (block.timestamp <= swap.maxDuration) revert MaxDurationExceeded();
        
        // Return tokens to sender
        IERC20(swap.tokenToSend).safeTransfer(swap.sender, swap.amountToSend);
        
        // Update swap status
        swap.status = SwapStatus.EXPIRED;
        
        emit SwapStatusChanged(swapId, SwapStatus.EXPIRED);
        
        return true;
    }

    /// @notice Gets details of a swap
    /// @dev Returns all information about a specific swap
    /// @param swapId Unique identifier of the swap
    /// @return Swap struct containing all swap details
    function getSwap(bytes32 swapId) 
        external 
        view 
        returns (Swap memory) 
    {
        if (!swapExists[swapId]) revert SwapNotFound();
        return _swaps[swapId];
    }

    /// @notice Checks if a secret matches a swap's hashlock
    /// @dev Utility function to verify a secret without claiming the swap
    /// @param swapId Unique identifier of the swap
    /// @param secret The secret to check against the hashlock
    /// @return bool True if the secret matches the hashlock
    function checkSecret(bytes32 swapId, bytes32 secret) 
        external 
        view 
        returns (bool) 
    {
        if (!swapExists[swapId]) revert SwapNotFound();
        Swap storage swap = _swaps[swapId];
        return keccak256(abi.encodePacked(secret)) == swap.hashlock;
    }
    
    /// @notice Checks if a swap is expired due to max duration
    /// @dev Returns true if the swap has exceeded its maximum duration
    /// @param swapId Unique identifier of the swap
    /// @return bool True if the swap is expired
    function isSwapExpired(bytes32 swapId) 
        external 
        view 
        returns (bool) 
    {
        if (!swapExists[swapId]) return false;
        Swap storage swap = _swaps[swapId];
        return block.timestamp > swap.maxDuration;
    }

    /// @notice Requests approval from the counterparty for the swap
    /// @dev Sets the swap status to AWAITING_APPROVAL
    /// @param swapId Unique identifier of the swap
    /// @return bool True if the status was updated successfully
    function requestApproval(bytes32 swapId) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (bool) 
    {
        // Verify swap exists
        if (!swapExists[swapId]) revert SwapNotFound();
        
        Swap storage swap = _swaps[swapId];
        
        // Verify swap is in OPEN state
        if (swap.status != SwapStatus.OPEN) revert InvalidSwapStatus();
        
        // Verify caller is the sender
        if (_msgSender() != swap.sender) revert NotAuthorized();
        
        // Update swap status
        swap.status = SwapStatus.AWAITING_APPROVAL;
        
        emit SwapStatusChanged(swapId, SwapStatus.AWAITING_APPROVAL);
        
        return true;
    }

    /// @notice Indicates the secret is ready for claiming
    /// @dev Sets the swap status to AWAITING_CLAIM_SECRET
    /// @param swapId Unique identifier of the swap
    /// @return bool True if the status was updated successfully
    function notifySecretReady(bytes32 swapId) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (bool) 
    {
        // Verify swap exists
        if (!swapExists[swapId]) revert SwapNotFound();
        
        Swap storage swap = _swaps[swapId];
        
        // Verify swap is in OPEN or AWAITING_APPROVAL state
        if (swap.status != SwapStatus.OPEN && 
            swap.status != SwapStatus.AWAITING_APPROVAL) revert InvalidSwapStatus();
        
        // Verify caller is the sender
        if (_msgSender() != swap.sender) revert NotAuthorized();
        
        // Update swap status
        swap.status = SwapStatus.AWAITING_CLAIM_SECRET;
        
        emit SwapStatusChanged(swapId, SwapStatus.AWAITING_CLAIM_SECRET);
        
        return true;
    }

    /// @notice Marks a swap as failed
    /// @dev Sets the swap status to FAILED and returns any locked tokens
    /// @param swapId Unique identifier of the swap
    /// @param reason Reason for the failure
    /// @return bool True if the status was updated successfully
    function markSwapFailed(bytes32 swapId, string calldata reason) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (bool) 
    {
        // Verify swap exists
        if (!swapExists[swapId]) revert SwapNotFound();
        
        Swap storage swap = _swaps[swapId];
        
        // Verify caller is either sender, receiver, or admin
        bool isAuthorizedActor = (_msgSender() == swap.sender || 
                                 _msgSender() == swap.receiver || 
                                 hasRole(DEFAULT_ADMIN_ROLE, _msgSender()));
        
        if (!isAuthorizedActor) revert NotAuthorized();
        
        // Verify swap is in an active state
        if (swap.status == SwapStatus.CLAIMED || 
            swap.status == SwapStatus.REFUNDED || 
            swap.status == SwapStatus.EXPIRED ||
            swap.status == SwapStatus.CANCELLED || 
            swap.status == SwapStatus.FAILED ||
            swap.status == SwapStatus.INVALID) revert InvalidSwapStatus();
        
        // Return tokens to sender if they are locked
        if (swap.status == SwapStatus.OPEN || 
            swap.status == SwapStatus.AWAITING_APPROVAL || 
            swap.status == SwapStatus.AWAITING_CLAIM_SECRET) {
            IERC20(swap.tokenToSend).safeTransfer(swap.sender, swap.amountToSend);
        }
        
        // Update swap status
        swap.status = SwapStatus.FAILED;
        
        emit SwapStatusChanged(swapId, SwapStatus.FAILED);
        
        return true;
    }

    /// @notice Marks a swap as invalid
    /// @dev Sets the swap status to INVALID and returns any locked tokens
    /// @param swapId Unique identifier of the swap
    /// @param reason Reason for being invalid
    /// @return bool True if the status was updated successfully
    function markSwapInvalid(bytes32 swapId, string calldata reason) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (bool) 
    {
        // Verify swap exists
        if (!swapExists[swapId]) revert SwapNotFound();
        
        Swap storage swap = _swaps[swapId];
        
        // Verify caller is either sender, receiver, or admin
        bool isAuthorizedActor = (_msgSender() == swap.sender || 
                                 _msgSender() == swap.receiver || 
                                 hasRole(DEFAULT_ADMIN_ROLE, _msgSender()));
        
        if (!isAuthorizedActor) revert NotAuthorized();
        
        // Verify swap is in an active state
        if (swap.status == SwapStatus.CLAIMED || 
            swap.status == SwapStatus.REFUNDED || 
            swap.status == SwapStatus.EXPIRED ||
            swap.status == SwapStatus.CANCELLED || 
            swap.status == SwapStatus.FAILED ||
            swap.status == SwapStatus.INVALID) revert InvalidSwapStatus();
        
        // Return tokens to sender if they are locked
        if (swap.status == SwapStatus.OPEN || 
            swap.status == SwapStatus.AWAITING_APPROVAL || 
            swap.status == SwapStatus.AWAITING_CLAIM_SECRET) {
            IERC20(swap.tokenToSend).safeTransfer(swap.sender, swap.amountToSend);
        }
        
        // Update swap status
        swap.status = SwapStatus.INVALID;
        
        emit SwapStatusChanged(swapId, SwapStatus.INVALID);
        
        return true;
    }
} 