// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base modules
import { AbstractComplianceModule } from "./AbstractComplianceModule.sol";
import { ISMART } from "../interface/ISMART.sol";
import { ISMARTIdentityRegistry } from "../interface/ISMARTIdentityRegistry.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

/// @title Token Supply Limit Compliance Module
/// @author SettleMint
/// @notice Restricts total token supply based on jurisdictional caps (e.g., MiCA's €8M limit)
/// @dev Tracks minted tokens and enforces limits based on lifetime, fixed period, or rolling period caps.
///      Supports both token-amount-based limits and base-currency-equivalent limits using on-chain price claims.
///      This module is essential for regulatory compliance in jurisdictions with specific issuance caps.
/// @custom:security-contact security@settlemint.com
contract SMARTTokenSupplyLimitComplianceModule is AbstractComplianceModule {
    /// @notice Unique type identifier for this compliance module
    /// @dev Used by the compliance system to identify and manage module instances
    // solhint-disable-next-line const-name-snakecase, use-natspec
    bytes32 public constant override typeId = keccak256("SMARTTokenSupplyLimitComplianceModule");

    /// @notice Configuration parameters for supply limit enforcement
    /// @dev This struct defines how supply limits are calculated and enforced for a token
    struct SupplyLimitConfig {
        /// @notice Maximum allowed supply (in tokens or base currency equivalent)
        /// @dev Must be greater than zero. For MiCA compliance, this would typically be €8,000,000 equivalent
        uint256 maxSupply;
        /// @notice Length of tracking period in days (0 = lifetime cap, >0 = periodic cap)
        /// @dev If 0, tracks total lifetime supply. If >0, creates fixed or rolling periods of specified length
        uint256 periodLength;
        /// @notice Whether to use rolling window (true) or fixed periods (false)
        /// @dev Only applicable when periodLength > 0. Rolling windows track the last N days, fixed periods reset at intervals
        bool rolling;
        /// @notice Whether to convert token amounts to base currency using price claims
        /// @dev When true, token amounts are converted using basePriceTopicId claims for regulatory calculation
        bool useBasePrice;
        /// @notice Topic ID for base price claims (required when useBasePrice is true)
        /// @dev References the claim topic containing price data in format (amount, currencyCode, decimals)
        // TODO should we keep this? or can we access it differently?
        uint256 basePriceTopicId;
    }

    /// @notice Internal tracking data for a specific token's supply limits
    /// @dev Maintains state for different types of supply tracking (lifetime, fixed period, rolling window)
    struct SupplyTracker {
        /// @notice Total cumulative supply for lifetime caps or current period supply for fixed periods
        /// @dev For lifetime caps: never resets. For fixed periods: current period amount
        uint256 totalSupply;
        /// @notice Timestamp when the current period started (used for fixed periods only)
        /// @dev Used to determine if enough time has passed to start a new fixed period
        uint256 periodStart;
        /// @notice Daily supply amounts for rolling window tracking
        /// @dev Maps day number (block.timestamp / 1 days) to supply amount added on that day
        mapping(uint256 => uint256) dailySupply;
    }

    /// @notice Mapping from token address to supply tracker
    /// @dev Stores individual tracking data for each token that uses this compliance module
    mapping(address => SupplyTracker) private supplyTrackers;

    // --- Constructor ---

    /// @notice Initializes the TokenSupplyLimitComplianceModule
    /// @dev Sets up the module with meta-transaction support via trusted forwarder
    /// @param _trustedForwarder Address of the trusted forwarder for meta transactions (can be zero address if not used)
    constructor(address _trustedForwarder) AbstractComplianceModule(_trustedForwarder) { }

    // --- Functions ---

    /// @inheritdoc AbstractComplianceModule
    /// @notice Tracks newly minted tokens against configured supply limits
    /// @dev Called after tokens are created to update supply tracking. Updates the appropriate
    ///      tracking mechanism based on configuration (lifetime, fixed period, or rolling window).
    /// @param _token The address of the token being minted
    /// @param _value The amount of tokens being minted
    /// @param _params ABI-encoded SupplyLimitConfig containing the compliance configuration
    function created(
        address _token,
        address, /* _to - unused */
        uint256 _value,
        bytes calldata _params
    ) external override {
        SupplyLimitConfig memory config = abi.decode(_params, (SupplyLimitConfig));

        uint256 amount = _value;
        if (config.useBasePrice) {
            amount = _convertToBaseCurrency(_token, _value, config.basePriceTopicId);
        }

        SupplyTracker storage tracker = supplyTrackers[_token];

        if (config.periodLength == 0) {
            // Lifetime cap
            tracker.totalSupply += amount;
        } else if (config.rolling) {
            // True rolling window tracking - track by day
            uint256 currentDay = block.timestamp / 1 days;
            tracker.dailySupply[currentDay] += amount;
        } else {
            // Fixed period tracking
            bool shouldStartNewPeriod = false;

            if (tracker.periodStart == 0) {
                // First time using this module for this token
                shouldStartNewPeriod = true;
            // solhint-disable-next-line gas-strict-inequalities
            } else if (block.timestamp - tracker.periodStart >= config.periodLength * 1 days) {
                // Current period has expired
                shouldStartNewPeriod = true;
            }

            if (shouldStartNewPeriod) {
                // Reset for new period
                tracker.periodStart = block.timestamp;
                tracker.totalSupply = amount;
            } else {
                // Same period, accumulate
                tracker.totalSupply += amount;
            }
        }
    }

    /// @inheritdoc AbstractComplianceModule
    /// @notice Checks if minting new tokens would exceed supply limits
    /// @dev Only validates mint operations (when _from == address(0)). Regular transfers are not restricted.
    ///      Calculates current supply based on configuration and checks if adding _value would exceed maxSupply.
    /// @param _token The address of the token being transferred/minted
    /// @param _from The address tokens are being transferred from (address(0) for mints)
    /// @param _value The amount of tokens being transferred/minted
    /// @param _params ABI-encoded SupplyLimitConfig containing the compliance configuration
    /// @custom:throws ComplianceCheckFailed when the mint would exceed the configured supply limit
    function canTransfer(
        address _token,
        address _from,
        address, /* _to - unused */
        uint256 _value,
        bytes calldata _params
    ) external view override {
        // Only check for mints (from == address(0))
        if (_from != address(0)) {
            return;
        }

        SupplyLimitConfig memory config = abi.decode(_params, (SupplyLimitConfig));

        uint256 amount = _value;
        if (config.useBasePrice) {
            amount = _convertToBaseCurrency(_token, _value, config.basePriceTopicId);
        }

        uint256 currentSupply = _getCurrentSupply(_token, config);

        if (currentSupply + amount > config.maxSupply) {
            revert ComplianceCheckFailed("Token supply would exceed configured limit");
        }
    }

    /// @notice Returns the human-readable name of this compliance module
    /// @dev Used for display purposes in compliance management interfaces
    /// @return The descriptive name of the compliance module
    function name() external pure override returns (string memory) {
        return "Token Supply Limit Compliance Module";
    }

    /// @notice Validates configuration parameters before module deployment
    /// @dev Ensures all required parameters are properly set and within acceptable ranges.
    ///      This prevents deployment with invalid configurations that could cause runtime failures.
    /// @param _params ABI-encoded SupplyLimitConfig struct to validate
    /// @custom:throws InvalidParameters when configuration parameters are invalid or inconsistent
    function validateParameters(bytes calldata _params) external pure override {
        SupplyLimitConfig memory config = abi.decode(_params, (SupplyLimitConfig));

        if (config.maxSupply == 0) {
            revert InvalidParameters("Maximum supply must be greater than zero");
        }

        if (config.rolling && config.periodLength == 0) {
            revert InvalidParameters("Rolling window requires periodLength > 0");
        }

        // WHY: Rolling windows require iterating through daily supply data (up to periodLength iterations).
        // We limit rolling periods to 730 days (2 years) to prevent excessive gas costs that could
        // make transactions fail due to block gas limits. This covers all realistic regulatory scenarios:
        // - MiCA: 365 days (12 months)
        // - Most jurisdictions: ≤ 24 months for rolling caps
        // - Corporate programs: Typically annual cycles
        // Gas cost grows linearly: 365 days ≈ 73K gas, 730 days ≈ 146K gas (acceptable)
        if (config.rolling && config.periodLength > 730) {
            revert InvalidParameters("Rolling window cannot exceed 730 days (2 years) to prevent gas limit issues");
        }

        if (config.useBasePrice && config.basePriceTopicId == 0) {
            revert InvalidParameters("Base price topic ID required when useBasePrice is true");
        }
    }

    // --- Internal Functions ---

    /// @notice Calculates the current tracked supply based on the configuration type
    /// @dev Implements different calculation methods based on configuration:
    ///      - Lifetime: returns total cumulative supply
    ///      - Fixed period: returns supply for current period (0 if new period not yet started)
    ///      - Rolling window: sums supply for the last N days (true rolling window)
    /// @param _token The token address to check supply for
    /// @param config The supply limit configuration defining tracking method
    /// @return The current supply amount in the same units as maxSupply
    function _getCurrentSupply(
        address _token,
        SupplyLimitConfig memory config
    ) private view returns (uint256) {
        SupplyTracker storage tracker = supplyTrackers[_token];

        if (config.periodLength == 0) {
            // Lifetime cap
            return tracker.totalSupply;
        } else if (config.rolling) {
            // True rolling window - sum last N days
            uint256 currentDay = block.timestamp / 1 days;
            uint256 daysInPeriod = config.periodLength;
            uint256 sum = 0;

            for (uint256 i = 0; i < daysInPeriod; ++i) {
                sum += tracker.dailySupply[currentDay - i];
            }

            return sum;
        } else {
            // Fixed period tracking
            if (tracker.periodStart == 0) {
                // No tracking data yet for this token
                return 0;
            // solhint-disable-next-line gas-strict-inequalities
            } else if (block.timestamp - tracker.periodStart >= config.periodLength * 1 days) {
                // We're in a new period that hasn't been initialized yet
                return 0;
            } else {
                // We're in the current tracked period
                return tracker.totalSupply;
            }
        }
    }

    /// @notice Converts token amount to base currency equivalent using on-chain price claims
    /// @dev Retrieves price data from the token's identity claims and performs currency conversion.
    ///      The base price claim must contain (amount, currencyCode, decimals) data.
    ///      Conversion formula: (_amount * basePrice) / (10 ** decimals)
    /// @param _token The token address whose identity contains the price claim
    /// @param _amount The token amount to convert to base currency
    /// @param _basePriceTopicId The topic ID for base price claims in the token's identity
    /// @return The equivalent amount in base currency units
    /// @custom:throws ComplianceCheckFailed when token has no identity, no price claim, or invalid claim data
    function _convertToBaseCurrency(
        address _token,
        uint256 _amount,
        uint256 _basePriceTopicId
    ) private view returns (uint256) {
        ISMART smartToken = ISMART(_token);
        ISMARTIdentityRegistry registry = ISMARTIdentityRegistry(smartToken.identityRegistry());

        // Get token's identity
        IIdentity tokenIdentity = registry.identity(_token);
        if (address(tokenIdentity) == address(0)) {
            revert ComplianceCheckFailed("Token has no identity");
        }

        // Get claim IDs for base price topic
        bytes32[] memory claimIds = tokenIdentity.getClaimIdsByTopic(_basePriceTopicId);
        if (claimIds.length == 0) {
            revert ComplianceCheckFailed("Token has no base price claim");
        }

        // Get the first valid base price claim
        for (uint256 i = 0; i < claimIds.length; ++i) {
            try tokenIdentity.getClaim(claimIds[i]) returns (
                uint256 topic,
                uint256, // scheme
                address, // issuer
                bytes memory, // signature
                bytes memory data,
                string memory // uri
            ) {
                if (topic == _basePriceTopicId && data.length > 0) {
                    // Decode base price claim (amount, currencyCode, decimals)
                    (uint256 basePrice, , uint8 decimals) = abi.decode(data, (uint256, string, uint8));

                    // Convert token amount to base currency
                    // basePrice is the price per token with decimals precision
                    return (_amount * basePrice) / (10 ** decimals);
                }
            } catch {
                // Continue to next claim if this one fails
                continue;
            }
        }

        revert ComplianceCheckFailed("No valid base price claim found");
    }
}