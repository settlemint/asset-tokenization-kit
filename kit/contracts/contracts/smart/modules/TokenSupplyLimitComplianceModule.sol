// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base modules
import { AbstractComplianceModule } from "./AbstractComplianceModule.sol";
import { ISMART } from "../interface/ISMART.sol";
import { ISMARTIdentityRegistry } from "../interface/ISMARTIdentityRegistry.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { IERC3643TrustedIssuersRegistry } from "../interface/ERC-3643/IERC3643TrustedIssuersRegistry.sol";
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";
import { ATKTopics } from "../../system/ATKTopics.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

/// @title Token Supply Limit Compliance Module
/// @author SettleMint
/// @notice Restricts total token supply based on jurisdictional caps (e.g., MiCA's €8M limit)
/// @dev Tracks minted tokens and enforces limits based on lifetime, fixed period, or rolling period caps.
///      Supports both token-amount-based limits and base-currency-equivalent limits using on-chain price claims.
///      This module is essential for regulatory compliance in jurisdictions with specific issuance caps.
/// @custom:security-contact security@settlemint.com
contract TokenSupplyLimitComplianceModule is AbstractComplianceModule {
    /// @notice Maximum period length for rolling windows (730 days = 2 years)
    /// @dev This defines the fixed circular buffer size to prevent unbounded storage growth
    uint256 private constant MAX_PERIOD_LENGTH = 730;

    /// @notice Precomputed topic ID for the base price claim to avoid an external registry call
    uint256 private constant BASE_PRICE_TOPIC_ID = uint256(keccak256(abi.encodePacked(ATKTopics.TOPIC_BASE_PRICE)));

    /// @notice Unique type identifier for this compliance module
    /// @dev Used by the compliance system to identify and manage module instances
    // solhint-disable-next-line const-name-snakecase, use-natspec
    bytes32 public constant override typeId = keccak256("TokenSupplyLimitComplianceModule");

    /// @notice Configuration parameters for supply limit enforcement
    /// @dev This struct defines how supply limits are calculated and enforced for a token
    struct SupplyLimitConfig {
        /// @notice Maximum allowed supply (logical whole numbers)
        /// @dev Must be greater than zero. Always use whole numbers regardless of decimals:
        ///      - When useBasePrice=false: Whole token count (e.g., 1000 = 1000 tokens)
        ///      - When useBasePrice=true: Whole currency amount (e.g., 8000000 = €8M or $8M)
        ///      The module automatically handles decimal conversions internally.
        ///      For MiCA compliance, simply specify 8000000 for the €8M limit.
        uint256 maxSupply;
        /// @notice Length of tracking period in days (0 = lifetime cap, >0 = periodic cap)
        /// @dev If 0, tracks total lifetime supply. If >0, creates fixed or rolling periods of specified length
        uint256 periodLength;
        /// @notice Whether to use rolling window (true) or fixed periods (false)
        /// @dev Only applicable when periodLength > 0. Rolling windows track the last N days, fixed periods reset at intervals
        bool rolling;
        /// @notice Whether to convert token amounts to base currency using price claims
        /// @dev When true, token amounts are converted using basePriceTopicId claims for regulatory calculation
        ///      Conversion happens once at issuance time and the converted value is stored permanently
        bool useBasePrice;
        /// @notice Whether to track globally across all tokens for this issuer
        /// @dev When true, sums supply across all tokens using this module (issuer-wide caps)
        bool global;
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
        /// @notice Daily supply amounts for rolling window tracking (fixed MAX_PERIOD_LENGTH circular buffer)
        /// @dev Always maps (day % MAX_PERIOD_LENGTH) to supply amount, regardless of actual period length
        mapping(uint256 => uint256) dailySupply;
        /// @notice Track which actual day each buffer slot represents to detect stale data
        /// @dev Maps buffer index to the actual day number it represents
        mapping(uint256 => uint256) bufferDayMapping;
    }

    /// @notice Mapping from token address to supply tracker
    /// @dev Stores individual tracking data for each token that uses this compliance module
    mapping(address => SupplyTracker) private supplyTrackers;

    /// @notice Global supply tracker for issuer-wide tracking across all tokens
    /// @dev Used when config.global is true to enforce limits across all tokens
    SupplyTracker private globalSupplyTracker;

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
    ) external override onlyTokenOrCompliance(_token) {
        SupplyLimitConfig memory config = abi.decode(_params, (SupplyLimitConfig));

        // Store raw amounts for precise tracking, convert only at limit check time
        uint256 rawAmount;
        if (config.useBasePrice) {
            // Convert to raw base currency amount (preserve precision)
            rawAmount = _convertToRawBaseCurrency(_token, _value);
        } else {
            // Store raw token amount directly
            rawAmount = _value;
        }

        // Update both token-specific and global trackers with raw amounts
        _updateTracker(supplyTrackers[_token], rawAmount, config);
        _updateTracker(globalSupplyTracker, rawAmount, config);
    }

    /// @inheritdoc AbstractComplianceModule
    /// @notice Tracks burned tokens to reduce tracked supply limits
    /// @dev Called after tokens are burned to update supply tracking. Updates the appropriate
    ///      tracking mechanism based on configuration (lifetime, fixed period, or rolling window).
    /// @param _token The address of the token being burned
    /// @param _value The amount of tokens being burned
    /// @param _params ABI-encoded SupplyLimitConfig containing the compliance configuration
    function destroyed(
        address _token,
        address, /* _from - unused */
        uint256 _value,
        bytes calldata _params
    ) external override onlyTokenOrCompliance(_token) {
        SupplyLimitConfig memory config = abi.decode(_params, (SupplyLimitConfig));

        // Convert to same raw amount format used in created() for precise tracking
        uint256 rawAmount;
        if (config.useBasePrice) {
            // Convert to raw base currency amount (preserve precision)
            rawAmount = _convertToRawBaseCurrency(_token, _value);
        } else {
            // Use raw token amount directly
            rawAmount = _value;
        }

        // Update both token-specific and global trackers with raw amounts
        _subtractFromTracker(supplyTrackers[_token], rawAmount, config);
        _subtractFromTracker(globalSupplyTracker, rawAmount, config);
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

        // Convert the new amount to same format as stored in trackers
        uint256 newRawAmount;
        if (config.useBasePrice) {
            // Convert to raw base currency amount
            newRawAmount = _convertToRawBaseCurrency(_token, _value);
        } else {
            // Use raw token amount
            newRawAmount = _value;
        }

        // Get current raw supply and convert both to whole units for comparison
        uint256 currentRawSupply;
        if (config.global) {
            currentRawSupply = _getCurrentRawSupply(address(0), config);
        } else {
            currentRawSupply = _getCurrentRawSupply(_token, config);
        }

        // Convert config limit to raw precision for exact comparison
        uint256 rawLimit = _convertConfigLimitToRawAmount(config.maxSupply, _token, config);

        if (currentRawSupply + newRawAmount > rawLimit) {
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
        // We limit rolling periods to MAX_PERIOD_LENGTH days (2 years) to prevent excessive gas costs that could
        // make transactions fail due to block gas limits. This covers all realistic regulatory scenarios:
        // - MiCA: 365 days (12 months)
        // - Most jurisdictions: ≤ 24 months for rolling caps
        // - Corporate programs: Typically annual cycles
        // Gas cost grows linearly: 365 days ≈ 73K gas, MAX_PERIOD_LENGTH days ≈ 146K gas (acceptable)
        if (config.rolling && config.periodLength > MAX_PERIOD_LENGTH) {
            revert InvalidParameters("Rolling window cannot exceed 730 days (2 years) to prevent gas limit issues");
        }
    }

    // --- Internal Functions ---

    /// @notice Updates a supply tracker with the given amount based on configuration
    /// @dev Handles lifetime, fixed period, and rolling window tracking modes
    /// @param tracker The storage reference to the tracker to update
    /// @param amount The already-converted amount to add to tracking
    /// @param config The supply limit configuration
    function _updateTracker(
        SupplyTracker storage tracker,
        uint256 amount,
        SupplyLimitConfig memory config
    ) private {
        if (config.periodLength == 0) {
            // Lifetime cap
            tracker.totalSupply += amount;
        } else if (config.rolling) {
            // True rolling window tracking - use fixed MAX_PERIOD_LENGTH circular buffer
            uint256 currentDay = block.timestamp / 1 days;

            // Always use fixed MAX_PERIOD_LENGTH circular buffer regardless of actual period length
            uint256 bufferIndex = currentDay % MAX_PERIOD_LENGTH;

            // Check if this buffer slot contains stale data from a previous cycle
            if (tracker.bufferDayMapping[bufferIndex] != currentDay) {
                // Clear stale data and start fresh for this day
                tracker.dailySupply[bufferIndex] = amount;
                tracker.bufferDayMapping[bufferIndex] = currentDay;
            } else {
                // Same day, accumulate
                tracker.dailySupply[bufferIndex] += amount;
            }
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

    /// @notice Subtracts burned tokens from a supply tracker based on configuration
    /// @dev Handles lifetime, fixed period, and rolling window tracking modes for burns
    /// @param tracker The storage reference to the tracker to update
    /// @param amount The already-converted amount to subtract from tracking
    /// @param config The supply limit configuration
    function _subtractFromTracker(
        SupplyTracker storage tracker,
        uint256 amount,
        SupplyLimitConfig memory config
    ) private {
        if (config.periodLength == 0) {
            // Lifetime cap - simply subtract from total, but don't go below zero
            if (tracker.totalSupply >= amount) {
                tracker.totalSupply -= amount;
            } else {
                tracker.totalSupply = 0;
            }
        } else if (config.rolling) {
            // True rolling window tracking - subtract from current day's bucket
            uint256 currentDay = block.timestamp / 1 days;

            // Always use fixed MAX_PERIOD_LENGTH circular buffer regardless of actual period length
            uint256 bufferIndex = currentDay % MAX_PERIOD_LENGTH;

            // Only subtract if this day has data and matches current day
            if (tracker.bufferDayMapping[bufferIndex] == currentDay) {
                if (tracker.dailySupply[bufferIndex] >= amount) {
                    tracker.dailySupply[bufferIndex] -= amount;
                } else {
                    tracker.dailySupply[bufferIndex] = 0;
                }
            }
            // If burning on a day with no tracked supply, ignore (can't burn what wasn't minted)
        } else {
            // Fixed period tracking
            // Only subtract if we're in an active period
            if (tracker.periodStart != 0 &&
                block.timestamp - tracker.periodStart < config.periodLength * 1 days) {
                if (tracker.totalSupply >= amount) {
                    tracker.totalSupply -= amount;
                } else {
                    tracker.totalSupply = 0;
                }
            }
            // If burning outside an active period, ignore (can't burn what wasn't minted in this period)
        }
    }

    /// @notice Calculates the current tracked raw supply based on the configuration type
    /// @dev Implements different calculation methods based on configuration:
    ///      - Lifetime: returns total cumulative supply
    ///      - Fixed period: returns supply for current period (0 if new period not yet started)
    ///      - Rolling window: sums supply for the last N days using fixed MAX_PERIOD_LENGTH circular buffer
    /// @param _token The token address to check supply for (address(0) for global tracking)
    /// @param config The supply limit configuration defining tracking method
    /// @return The current supply amount in raw units (tokens or currency with full precision)
    function _getCurrentRawSupply(
        address _token,
        SupplyLimitConfig memory config
    ) private view returns (uint256) {
        // Use global tracker if _token is address(0) or config specifies global tracking
        SupplyTracker storage tracker = (_token == address(0) || config.global)
            ? globalSupplyTracker
            : supplyTrackers[_token];

        if (config.periodLength == 0) {
            // Lifetime cap
            return tracker.totalSupply;
        } else if (config.rolling) {
            // True rolling window - sum last N days from fixed MAX_PERIOD_LENGTH circular buffer
            uint256 currentDay = block.timestamp / 1 days;
            uint256 daysInPeriod = config.periodLength;
            uint256 sum = 0;

            // Gas optimization: cache storage reads for dailySupply and bufferDayMapping
            mapping(uint256 => uint256) storage dailySupplyRef = tracker.dailySupply;
            mapping(uint256 => uint256) storage bufferDayMappingRef = tracker.bufferDayMapping;

            // Sum from fixed MAX_PERIOD_LENGTH circular buffer, going back N days
            for (uint256 i = 0; i < daysInPeriod;) {
                // Prevent underflow in day calculation
                if (currentDay < i) {
                    break;
                }

                uint256 dayToCheck = currentDay - i;
                // Always use fixed MAX_PERIOD_LENGTH buffer
                uint256 bufferIndex = dayToCheck % MAX_PERIOD_LENGTH;

                // Only include data if the buffer slot actually represents the day we're checking
                if (bufferDayMappingRef[bufferIndex] == dayToCheck) {
                    sum += dailySupplyRef[bufferIndex];
                }

                // Gas optimization: unchecked increment
                unchecked {
                    ++i;
                }
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

    /// @notice Converts raw token amount to raw base currency equivalent using on-chain price claims
    /// @dev Retrieves price data from the token's identity claims and performs currency conversion.
    ///      The base price claim must contain (priceAmount, currencyCode, priceDecimals) data.
    ///      Conversion formula: (_tokenAmount * priceAmount) / 10^tokenDecimals
    ///      This converts from raw token units to raw currency units (preserving price decimals).
    /// @param _token The token address whose identity contains the price claim
    /// @param _tokenAmount The raw token amount (including decimals) to convert
    /// @return The equivalent amount in raw base currency units (with price decimals)
    /// @custom:throws ComplianceCheckFailed when token has no identity, no price claim, or invalid claim data
    function _convertToRawBaseCurrency(
        address _token,
        uint256 _tokenAmount
    ) private view returns (uint256) {
        // Ensure the token implements ISMART via ERC165
        bool supportsSmart;
        try IERC165(_token).supportsInterface(type(ISMART).interfaceId) returns (bool ok) {
            supportsSmart = ok;
        } catch {
            supportsSmart = false;
        }
        if (!supportsSmart) {
            revert ComplianceCheckFailed("Token does not implement ISMART");
        }

        ISMART smartToken = ISMART(_token);


        // Get token's identity
        IIdentity tokenIdentity = IIdentity(smartToken.onchainID());
        if (address(tokenIdentity) == address(0)) {
            revert ComplianceCheckFailed("Token has no identity");
        }

        // Get registries
        ISMARTIdentityRegistry registry = ISMARTIdentityRegistry(smartToken.identityRegistry());

        // Get claim IDs for base price topic
        bytes32[] memory claimIds = tokenIdentity.getClaimIdsByTopic(BASE_PRICE_TOPIC_ID);
        if (claimIds.length == 0) {
            revert ComplianceCheckFailed("Token has no base price claim");
        }

        IERC3643TrustedIssuersRegistry issuersRegistry = registry.issuersRegistry();
        IClaimIssuer[] memory trustedIssuers = issuersRegistry.getTrustedIssuersForClaimTopic(BASE_PRICE_TOPIC_ID);

        // Check each claim against the list of trusted issuers
        for (uint256 i = 0; i < claimIds.length;) {
            // Get claim details
            (uint256 foundClaimTopic,, address issuer, bytes memory sig, bytes memory data,) =
                tokenIdentity.getClaim(claimIds[i]);

            // Verify the claim topic matches (should always be true due to getClaimIdsByTopic)
            if (foundClaimTopic == BASE_PRICE_TOPIC_ID) {
                // Check if the issuer is trusted for this topic
                for (uint256 j = 0; j < trustedIssuers.length;) {
                    if (address(trustedIssuers[j]) == issuer) {
                        // Verify the claim is valid with the trusted issuer
                        bool valid;
                        // Protect against malicious issuers reverting
                        try trustedIssuers[j].isClaimValid(tokenIdentity, BASE_PRICE_TOPIC_ID, sig, data) returns (bool ok) {
                            valid = ok;
                        } catch {
                            valid = false;
                        }
                        if (valid) {
                            (uint256 priceAmount,, uint8 priceDecimals) = abi.decode(data, (uint256, string, uint8));

                            // Get token decimals to convert token amount
                            uint8 tokenDecimals = IERC20Metadata(_token).decimals();

                            // Always normalize to 18 decimals for consistent base currency tracking
                            // Formula: (_tokenAmount * priceAmount * 10^18) / (10^tokenDecimals * 10^priceDecimals)
                            // This ensures all base currency amounts have exactly 18 decimals for global tracking
                            // 18 decimals is more than sufficient for fiat currencies (USD, EUR typically need 2-4 decimals)
                            return Math.mulDiv(_tokenAmount * 1e18, priceAmount, 10 ** uint256(tokenDecimals) * 10 ** uint256(priceDecimals));
                        }
                        break; // Found the issuer, no need to check others for this claim
                    }
                    unchecked {
                        ++j;
                    }
                }
            }

            unchecked {
                ++i;
            }
        }

        revert ComplianceCheckFailed("No valid base price claim found");
    }

    /// @notice Converts config limit (whole units) to raw amount for precise comparison
    /// @dev For basePrice mode: multiplies by 18 decimals. For token mode: multiplies by token decimals
    /// @param _configLimit The limit from config in whole units (tokens or currency)
    /// @param _token The token address to get decimals from
    /// @param config The configuration to determine conversion type
    /// @return The equivalent raw amount with maximum precision
    function _convertConfigLimitToRawAmount(
        uint256 _configLimit,
        address _token,
        SupplyLimitConfig memory config
    ) private view returns (uint256) {
        if (config.useBasePrice) {
            // For base price mode, we normalize all base currency to 18 decimals
            // Convert whole currency units to raw 18-decimal currency
            return _configLimit * 1e18;
        } else {
            // For token mode, multiply by token decimals
            uint8 tokenDecimals = IERC20Metadata(_token).decimals();
            return _configLimit * (10 ** uint256(tokenDecimals));
        }
    }
}