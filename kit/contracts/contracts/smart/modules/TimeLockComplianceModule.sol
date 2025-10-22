// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { AbstractComplianceModule } from "./AbstractComplianceModule.sol";
import { ISMART } from "../interface/ISMART.sol";
import { ISMARTIdentityRegistry } from "../interface/ISMARTIdentityRegistry.sol";
import { ExpressionNode } from "../interface/structs/ExpressionNode.sol";

/// @title TimeLockComplianceModule
/// @author SettleMint
/// @notice Enforces minimum holding periods before tokens can be transferred
/// @dev Supports configurable hold periods and optional exemptions via claims.
///      Uses FIFO (First In, First Out) logic to track multiple token batches per user.
///      Needed for jurisdictions like Reg D (6-12 months) or other regulatory lock-ups.
/// @custom:security-contact security@settlemint.com
contract TimeLockComplianceModule is AbstractComplianceModule {
    /// @notice Unique type identifier for this compliance module
    bytes32 public constant TYPE_ID = keccak256("TimeLockComplianceModule");

    /// @notice Configuration parameters for time-lock enforcement
    /// @dev This struct defines how holding periods and exemptions are enforced for a token
    struct TimeLockParams {
        /// @notice Minimum holding period in seconds before tokens can be transferred
        uint256 holdPeriod;
        /// @notice Whether to allow exemptions via identity claims
        bool allowExemptions;
        /// @notice Expression for exemption logic (empty array if no exemptions)
        /// @dev Uses postfix notation for logical expressions (e.g., SECONDARY_SALE_APPROVED)
        ExpressionNode[] exemptionExpression;
    }

    /// @notice Represents a batch of tokens acquired at a specific time
    /// @dev Used to track multiple acquisitions per user for FIFO logic
    struct TokenBatch {
        /// @notice Amount of tokens in this batch
        uint256 amount;
        /// @notice Timestamp when this batch was acquired
        uint256 acquisitionTime;
    }

    /// @notice Maps token address to user address to array of token batches (FIFO order)
    mapping(address => mapping(address => TokenBatch[])) public tokenBatches;

    /// @notice Emitted when tokens are acquired and recorded for lock-up tracking
    /// @param token The token contract address
    /// @param user The user address acquiring tokens
    /// @param amount The amount of tokens acquired
    /// @param timestamp When the tokens were acquired
    event AcquisitionRecorded(address indexed token, address indexed user, uint256 indexed amount, uint256 timestamp);

    /// @notice Emitted when locked tokens become available for transfer
    /// @param token The token contract address
    /// @param user The user address whose tokens are unlocked
    /// @param amount The amount of tokens unlocked
    /// @param timestamp When the tokens were unlocked
    event TokensUnlocked(address indexed token, address indexed user, uint256 indexed amount, uint256 timestamp);

    /// @notice Initialize the TimeLockComplianceModule
    /// @param _trustedForwarder Address of the trusted forwarder for meta transactions
    constructor(address _trustedForwarder) AbstractComplianceModule(_trustedForwarder) { }

    /// @notice Returns the name of the compliance module
    /// @return The descriptive name of this module
    function name() external pure override returns (string memory) {
        return "TimeLock Compliance Module";
    }

    /// @notice Returns the type identifier of the module
    /// @return The unique type identifier for this module
    function typeId() external pure override returns (bytes32) {
        return TYPE_ID;
    }

    /// @notice Validates the configuration parameters
    /// @param _params ABI-encoded TimeLockParams struct
    function validateParameters(bytes calldata _params) external pure override {
        if (_params.length == 0) {
            revert InvalidParameters("Parameters cannot be empty");
        }

        TimeLockParams memory params = abi.decode(_params, (TimeLockParams));

        if (params.holdPeriod == 0) {
            revert InvalidParameters("Hold period must be greater than zero");
        }

        // Maximum reasonable hold period: 10 years (to prevent configuration errors)
        if (params.holdPeriod > 315_360_000) {
            // 10 years in seconds
            revert InvalidParameters("Hold period too long (max 10 years)");
        }
    }

    /// @notice Checks if a transfer is allowed based on holding period requirements
    /// @dev Uses FIFO (First In, First Out) logic - oldest tokens are transferred first
    /// @param _token The token contract address
    /// @param _from The sender address
    /// @param _value The transfer amount
    /// @param _params ABI-encoded TimeLockParams struct
    // solhint-disable-next-line use-natspec
    function canTransfer(
        address _token,
        address _from,
        address, /*_to*/
        uint256 _value,
        bytes calldata _params
    )
        external
        view
        override
    {
        // Allow minting (from zero address)
        if (_from == address(0)) {
            return;
        }

        TimeLockParams memory params = abi.decode(_params, (TimeLockParams));

        // Check for exemption if enabled
        if (params.allowExemptions && _hasExemption(_token, _from, params.exemptionExpression)) {
            return;
        }

        // Check if we have enough unlocked tokens using optimized FIFO logic
        if (!_canRemoveTokensFIFO(_token, _from, _value, params.holdPeriod)) {
            revert ComplianceCheckFailed("Insufficient unlocked tokens available");
        }
    }

    /// @notice Records acquisition timestamp when tokens are transferred
    /// @dev Creates a new batch for the recipient
    /// @param _token The token contract address
    /// @param _from The sender address
    /// @param _to The recipient address
    /// @param _value The transfer amount
    /// @param _params ABI-encoded TimeLockParams struct
    function transferred(
        address _token,
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _params
    )
        external
        override
        onlyTokenOrCompliance(_token)
    {
        // Don't record acquisition for burns (to zero address)
        if (_to == address(0)) {
            return;
        }

        // Remove tokens from sender's batches using FIFO
        if (_from != address(0)) {
            // Skip for minting
            TimeLockParams memory params = abi.decode(_params, (TimeLockParams));

            // Check if sender is exempt
            bool isExempt = params.allowExemptions && _hasExemption(_token, _from, params.exemptionExpression);

            _removeTokensFIFO(_token, _from, _value, params.holdPeriod, isExempt);
        }

        // Add new batch for recipient
        tokenBatches[_token][_to].push(TokenBatch({ amount: _value, acquisitionTime: block.timestamp }));

        emit AcquisitionRecorded(_token, _to, _value, block.timestamp);
    }

    /// @notice Records acquisition timestamp when tokens are minted
    /// @dev Creates a new batch for the recipient
    /// @param _token The token contract address
    /// @param _to The recipient address
    /// @param _value The minted amount
    // solhint-disable-next-line use-natspec
    function created(
        address _token,
        address _to,
        uint256 _value,
        bytes calldata /*_params*/
    )
        external
        override
        onlyTokenOrCompliance(_token)
    {
        // Add new batch for minted tokens
        tokenBatches[_token][_to].push(TokenBatch({ amount: _value, acquisitionTime: block.timestamp }));

        emit AcquisitionRecorded(_token, _to, _value, block.timestamp);
    }

    /// @notice Checks if an address satisfies the exemption expression with verified claims from trusted issuers
    /// @param _token The token contract address
    /// @param _user The user address to check
    /// @param _expression The expression to evaluate for exemption
    /// @return True if user satisfies the exemption expression, false otherwise
    function _hasExemption(
        address _token,
        address _user,
        ExpressionNode[] memory _expression
    )
        internal
        view
        returns (bool)
    {
        // If no expression provided, no exemption
        if (_expression.length == 0) {
            return false;
        }

        try ISMART(_token).identityRegistry() returns (ISMARTIdentityRegistry identityRegistry) {
            if (!identityRegistry.contains(_user)) {
                return false;
            }

            try identityRegistry.isVerified(_user, _expression) returns (bool verified) {
                return verified;
            } catch {
                return false;
            }
        } catch {
            return false;
        }
    }

    /// @notice Checks if we can remove the specified amount of tokens using FIFO logic
    /// @dev Gas-optimized: stops as soon as we have enough unlocked tokens
    /// @param _token The token contract address
    /// @param _user The user address
    /// @param _amount The amount we want to remove
    /// @param _holdPeriod The hold period in seconds
    /// @return canRemove True if we have enough unlocked tokens
    function _canRemoveTokensFIFO(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _holdPeriod
    )
        internal
        view
        returns (bool)
    {
        TokenBatch[] storage batches = tokenBatches[_token][_user];
        uint256 availableTokens = 0;

        for (uint256 i = 0; i < batches.length; ++i) {
            uint256 unlockTime = batches[i].acquisitionTime + _holdPeriod;

            if (block.timestamp > unlockTime) {
                availableTokens += batches[i].amount;

                // Early exit: we have enough unlocked tokens
                if (availableTokens > _amount - 1) {
                    return true;
                }
            } else {
                // Since batches are in FIFO order, once we hit a locked batch,
                // all subsequent batches will also be locked
                break;
            }
        }

        return false; // Not enough unlocked tokens available
    }

    /// @notice Removes tokens from user's batches using FIFO logic during transfers
    /// @param _token The token contract address
    /// @param _user The user address
    /// @param _amount The amount to remove
    /// @param _holdPeriod The hold period for validation
    /// @param _isExempt Whether the user is exempt from time locks
    function _removeTokensFIFO(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _holdPeriod,
        bool _isExempt
    )
        internal
    {
        TokenBatch[] storage batches = tokenBatches[_token][_user];
        uint256 remainingToRemove = _amount;
        uint256 writeIndex = 0;

        for (uint256 readIndex = 0; readIndex < batches.length; ++readIndex) {
            TokenBatch storage batch = batches[readIndex];

            if (remainingToRemove == 0) {
                // Move remaining batches forward to maintain order
                if (writeIndex != readIndex) {
                    batches[writeIndex] = batches[readIndex];
                }
                ++writeIndex;
                continue;
            }

            uint256 unlockTime = batch.acquisitionTime + _holdPeriod;

            // Skip time lock check for exempt users
            if (!_isExempt && block.timestamp < unlockTime + 1) {
                // This is a locked batch - preserve it
                if (writeIndex != readIndex) {
                    batches[writeIndex] = batches[readIndex];
                }
                ++writeIndex;
                continue;
            }

            // Process unlocked batch (or any batch for exempt users)
            if (batch.amount < remainingToRemove + 1) {
                // Remove entire batch
                remainingToRemove -= batch.amount;
                emit TokensUnlocked(_token, _user, batch.amount, block.timestamp);
                // Don't increment writeIndex - this batch is removed
            } else {
                // Partially remove from batch
                batch.amount -= remainingToRemove;
                emit TokensUnlocked(_token, _user, remainingToRemove, block.timestamp);

                // Keep the remaining portion of this batch
                if (writeIndex != readIndex) {
                    batches[writeIndex] = batches[readIndex];
                }
                ++writeIndex;
                remainingToRemove = 0;
            }
        }

        // Remove processed batches from the end
        uint256 batchesToRemove = batches.length - writeIndex;
        for (uint256 i = 0; i < batchesToRemove; ++i) {
            batches.pop();
        }

        // Safety check: ensure we processed exactly what we needed
        if (remainingToRemove != 0) revert ComplianceCheckFailed("Token removal failed");
    }

    /// @notice Returns all token batches for a user
    /// @param _token The token contract address
    /// @param _user The user address
    /// @return An array of token batches
    function getTokenBatches(address _token, address _user) external view returns (TokenBatch[] memory) {
        return tokenBatches[_token][_user];
    }

    /// @notice Returns the total balance across all batches for a user
    /// @param _token The token contract address
    /// @param _user The user address
    /// @return The total amount of tokens across all batches
    function getTotalBalance(address _token, address _user) external view returns (uint256) {
        TokenBatch[] storage batches = tokenBatches[_token][_user];
        uint256 totalBalance = 0;

        for (uint256 i = 0; i < batches.length; ++i) {
            totalBalance += batches[i].amount;
        }

        return totalBalance;
    }

    /// @notice Returns the available (unlocked) token balance for a user
    /// @param _token The token contract address
    /// @param _user The user address
    /// @param _params ABI-encoded TimeLockParams struct
    /// @return The amount of unlocked tokens
    function getAvailableBalance(
        address _token,
        address _user,
        bytes calldata _params
    )
        external
        view
        returns (uint256)
    {
        TimeLockParams memory params = abi.decode(_params, (TimeLockParams));

        // Check for exemption if enabled
        if (params.allowExemptions && _hasExemption(_token, _user, params.exemptionExpression)) {
            // If exempt, all tokens are available - calculate total balance inline
            TokenBatch[] storage exemptBatches = tokenBatches[_token][_user];
            uint256 totalBalance = 0;
            for (uint256 i = 0; i < exemptBatches.length; ++i) {
                totalBalance += exemptBatches[i].amount;
            }
            return totalBalance;
        }

        // Calculate available tokens using FIFO logic
        TokenBatch[] storage batches = tokenBatches[_token][_user];
        uint256 availableTokens = 0;

        for (uint256 i = 0; i < batches.length; ++i) {
            uint256 unlockTime = batches[i].acquisitionTime + params.holdPeriod;

            if (block.timestamp > unlockTime) {
                availableTokens += batches[i].amount;
            } else {
                // Since batches are in FIFO order, once we hit a locked batch,
                // all subsequent batches will also be locked
                break;
            }
        }

        return availableTokens;
    }

    /// @notice Returns the remaining lock time for the next batch to unlock
    /// @param _token The token contract address
    /// @param _user The user address
    /// @param _params ABI-encoded TimeLockParams struct
    /// @return The remaining lock time in seconds for the next unlock (0 if tokens are available)
    function getRemainingLockTime(
        address _token,
        address _user,
        bytes calldata _params
    )
        external
        view
        returns (uint256)
    {
        TimeLockParams memory params = abi.decode(_params, (TimeLockParams));

        // Check for exemption if enabled
        if (params.allowExemptions && _hasExemption(_token, _user, params.exemptionExpression)) {
            return 0;
        }

        TokenBatch[] storage batches = tokenBatches[_token][_user];
        if (batches.length == 0) {
            return type(uint256).max; // No tokens held
        }

        // Find the first locked batch
        for (uint256 i = 0; i < batches.length; ++i) {
            uint256 unlockTime = batches[i].acquisitionTime + params.holdPeriod;

            if (block.timestamp < unlockTime) {
                return unlockTime - block.timestamp;
            }
        }

        return 0; // All tokens are unlocked
    }
}
