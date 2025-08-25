// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base modules
import { AbstractComplianceModule } from "./AbstractComplianceModule.sol";
import { ISMART } from "../interface/ISMART.sol";
import { ISMARTIdentityRegistry } from "../interface/ISMARTIdentityRegistry.sol";

// Struct imports
import { ExpressionNode } from "../interface/structs/ExpressionNode.sol";

/// @title Investor Count Compliance Module
/// @author SettleMint
/// @notice Restricts the number of unique investors who can hold tokens based on jurisdictional limits
/// @dev Tracks unique investors (addresses with balance > 0) and enforces both global and per-country limits.
///      Uses ExpressionNode filtering to ensure only investors meeting specific compliance requirements
///      are counted toward the limits. This module is essential for regulatory compliance in
///      jurisdictions with investor count restrictions (e.g., private placements, security offerings).
/// @custom:security-contact security@settlemint.com
contract InvestorCountComplianceModule is AbstractComplianceModule {
    /// @notice Unique type identifier for this compliance module
    /// @dev Used by the compliance system to identify and manage module instances
    // solhint-disable-next-line const-name-snakecase, use-natspec
    bytes32 public constant override typeId = keccak256("InvestorCountComplianceModule");

    /// @notice Configuration parameters for investor count enforcement
    /// @dev This struct defines how investor limits are calculated and enforced for a token
    struct InvestorCountConfig {
        /// @notice Maximum total investors across all countries (0 = no global limit)
        /// @dev When > 0, enforces a total cap regardless of country. This is checked
        ///      AFTER country-specific limits. Set to 0 to only use country-specific limits.
        ///      Example: maxInvestors=1000 with US=500, EU=300 means max 1000 total,
        ///      but US capped at 500 and EU at 300 within that total.
        uint256 maxInvestors;
        /// @notice Whether to track globally across all tokens for this issuer
        /// @dev When true, counts investors across all tokens using this module (issuer-wide caps)
        bool global;
        /// @notice Country-specific investor limits passed as arrays for initialization
        /// @dev Arrays must have matching lengths. Used to populate the storage mapping on first use.
        ///      Format: countryCodes[i] corresponds to countryLimits[i]
        uint16[] countryCodes;
        uint256[] countryLimits;
        /// @notice ExpressionNode array for filtering which investors count toward the limit
        /// @dev Only investors who satisfy this expression are counted. Empty array means all investors count.
        ///      Uses postfix notation for logical expressions (e.g., KYC AND AML requirements)
        ExpressionNode[] topicFilter;
    }

    /// @notice Internal tracking data for investor counts
    /// @dev Maintains state for tracking unique investors and their countries
    struct InvestorTracker {
        /// @notice Set of all current investors (balance > 0)
        mapping(address => bool) investors;
        /// @notice Current total count of unique investors
        uint256 currentCount;
        /// @notice Per-country investor counts
        mapping(uint16 => uint256) countryInvestorCounts;
        /// @notice Country code for each investor
        mapping(address => uint16) investorCountry;
        /// @notice Country-specific limits (initialized from config)
        mapping(uint16 => uint256) maxInvestorsPerCountry;
    }

    /// @notice Mapping from token address to investor tracker
    /// @dev Stores individual tracking data for each token that uses this compliance module
    mapping(address => InvestorTracker) private investorTrackers;

    /// @notice Global investor tracker for issuer-wide tracking across all tokens
    /// @dev Used when config.global is true to enforce limits across all tokens
    InvestorTracker private globalInvestorTracker;

    // --- Constructor ---

    /// @notice Initializes the InvestorCountComplianceModule
    /// @dev Sets up the module with meta-transaction support via trusted forwarder
    /// @param _trustedForwarder Address of the trusted forwarder for meta transactions (can be zero address if not
    /// used)
    constructor(address _trustedForwarder) AbstractComplianceModule(_trustedForwarder) { }

    // --- Functions ---

    /// @inheritdoc AbstractComplianceModule
    /// @notice Tracks newly transferred tokens to update investor counts
    /// @dev Called after tokens are transferred to track new investors. Only counts
    ///      investors who satisfy the topicFilter expression requirements.
    /// @param _token The address of the token being transferred
    /// @param _to The address receiving the tokens
    /// @param _params ABI-encoded InvestorCountConfig containing the compliance configuration
    function transferred(
        address _token,
        address _from,
        address _to,
        uint256, /* _value - unused */
        bytes calldata _params
    )
        external
        override
        onlyTokenOrCompliance(_token)
    {
        InvestorCountConfig memory config = abi.decode(_params, (InvestorCountConfig));

        // Handle investor removal (when _from sells all tokens)
        if (_from != address(0) && ISMART(_token).balanceOf(_from) == 0) {
            _removeInvestor(_token, _from, config);
        }

        // Handle investor addition (when _to receives their first tokens)
        if (_to != address(0) && ISMART(_token).balanceOf(_to) > 0 && !_isExistingInvestor(_token, _to, config)) {
            _addInvestor(_token, _to, config);
        }
    }

    /// @inheritdoc AbstractComplianceModule
    /// @notice Tracks newly minted tokens to update investor counts
    /// @dev Called after tokens are created to track new investors. Only counts
    ///      investors who satisfy the topicFilter expression requirements.
    /// @param _token The address of the token being minted
    /// @param _to The address receiving the minted tokens
    /// @param _params ABI-encoded InvestorCountConfig containing the compliance configuration
    function created(
        address _token,
        address _to,
        uint256, /* _value - unused */
        bytes calldata _params
    )
        external
        override
        onlyTokenOrCompliance(_token)
    {
        InvestorCountConfig memory config = abi.decode(_params, (InvestorCountConfig));

        // Add investor if they now hold tokens for the first time
        if (_to != address(0) && ISMART(_token).balanceOf(_to) > 0 && !_isExistingInvestor(_token, _to, config)) {
            _addInvestor(_token, _to, config);
        }
    }

    /// @inheritdoc AbstractComplianceModule
    /// @notice Tracks burned tokens to update investor counts
    /// @dev Called after tokens are burned to track investor removals when their balance reaches zero.
    /// @param _token The address of the token being burned
    /// @param _from The address whose tokens are being burned
    /// @param _params ABI-encoded InvestorCountConfig containing the compliance configuration
    function destroyed(
        address _token,
        address _from,
        uint256, /* _value - unused */
        bytes calldata _params
    )
        external
        override
        onlyTokenOrCompliance(_token)
    {
        InvestorCountConfig memory config = abi.decode(_params, (InvestorCountConfig));

        // Remove investor if they no longer hold any tokens
        if (_from != address(0) && ISMART(_token).balanceOf(_from) == 0) {
            _removeInvestor(_token, _from, config);
        }
    }

    /// @inheritdoc AbstractComplianceModule
    /// @notice Checks if a transfer would exceed investor count limits
    /// @dev Validates transfers that would result in new investors. Only counts investors
    ///      who satisfy the topicFilter expression requirements toward the limit.
    /// @param _token The address of the token being transferred
    /// @param _to The address receiving the tokens
    /// @param _params ABI-encoded InvestorCountConfig containing the compliance configuration
    /// @custom:throws ComplianceCheckFailed when the transfer would exceed the configured investor limit
    function canTransfer(
        address _token,
        address, /* _from - unused */
        address _to,
        uint256, /* _value - unused */
        bytes calldata _params
    )
        external
        view
        override
    {
        // Skip validation for burns (to == address(0))
        if (_to == address(0)) {
            return;
        }

        InvestorCountConfig memory config = abi.decode(_params, (InvestorCountConfig));

        // Skip if recipient already holds tokens (not a new investor)
        if (ISMART(_token).balanceOf(_to) > 0) {
            return;
        }

        // Skip if recipient doesn't satisfy topic filter
        if (!_satisfiesTopicFilter(_token, _to, config.topicFilter)) {
            return;
        }

        // Get investor's country
        uint16 investorCountry = _getInvestorCountry(_token, _to);

        // Check country-specific limit first
        uint256 countryLimit = _getCountryLimit(_token, investorCountry, config);
        if (countryLimit > 0) {
            uint256 currentCountryCount = _getCountryInvestorCount(_token, investorCountry, config);
            if (currentCountryCount == countryLimit) {
                revert ComplianceCheckFailed("Adding investor would exceed country-specific investor limit");
            }
        }

        // Check global limit (total across all countries)
        // Note: maxInvestors = 0 means no global limit, only country-specific limits apply
        if (config.maxInvestors > 0) {
            uint256 currentCount = _getCurrentInvestorCount(_token, config);
            if (currentCount == config.maxInvestors) {
                revert ComplianceCheckFailed("Adding investor would exceed maximum total investor limit");
            }
        }
    }

    /// @notice Returns the human-readable name of this compliance module
    /// @dev Used for display purposes in compliance management interfaces
    /// @return The descriptive name of the compliance module
    function name() external pure override returns (string memory) {
        return "Investor Count Compliance Module";
    }

    /// @notice Validates configuration parameters before module deployment
    /// @dev Ensures all required parameters are properly set and within acceptable ranges.
    /// @param _params ABI-encoded InvestorCountConfig struct to validate
    /// @custom:throws InvalidParameters when configuration parameters are invalid
    function validateParameters(bytes calldata _params) external pure override {
        InvestorCountConfig memory config = abi.decode(_params, (InvestorCountConfig));

        // Must have either global limit or country limits
        if (config.maxInvestors == 0 && config.countryCodes.length == 0) {
            revert InvalidParameters("Must specify either global limit or country-specific limits");
        }

        // Check for duplicate country codes
        if (config.countryCodes.length > 1) {
            for (uint256 i = 0; i < config.countryCodes.length - 1; ++i) {
                for (uint256 j = i + 1; j < config.countryCodes.length; ++j) {
                    if (config.countryCodes[i] == config.countryCodes[j]) {
                        revert InvalidParameters("Duplicate country codes are not allowed");
                    }
                }
            }
        }

        // Validate country limit arrays match
        if (config.countryCodes.length != config.countryLimits.length) {
            revert InvalidParameters("Country codes and limits arrays must have same length");
        }

        // Validate country limits are non-zero
        for (uint256 i = 0; i < config.countryLimits.length; ++i) {
            if (config.countryLimits[i] == 0) {
                revert InvalidParameters("Country limits must be greater than zero");
            }
        }
    }

    /// @notice Returns the current investor count for a token
    /// @dev Public view function to check current investor count without gas cost
    /// @param _token The token address to check
    /// @param _global Whether to return global count across all tokens
    /// @return The current number of investors
    function getCurrentInvestorCount(address _token, bool _global) external view returns (uint256) {
        InvestorCountConfig memory config;
        config.global = _global;
        return _getCurrentInvestorCount(_token, config);
    }

    /// @notice Returns the current investor count for a specific country
    /// @dev Public view function to check country-specific investor count
    /// @param _token The token address to check
    /// @param _country The country code to check
    /// @param _global Whether to check global tracking
    /// @return The current number of investors from the specified country
    function getCountryInvestorCount(address _token, uint16 _country, bool _global) external view returns (uint256) {
        if (_global) {
            return globalInvestorTracker.countryInvestorCounts[_country];
        } else {
            return investorTrackers[_token].countryInvestorCounts[_country];
        }
    }

    /// @notice Checks if an address is currently counted as an investor
    /// @dev Public view function to check investor status
    /// @param _token The token address to check (ignored if _global is true)
    /// @param _investor The investor address to check
    /// @param _global Whether to check global tracking
    /// @return True if the address is currently counted as an investor
    function isInvestor(address _token, address _investor, bool _global) external view returns (bool) {
        if (_global) {
            return globalInvestorTracker.investors[_investor];
        } else {
            return investorTrackers[_token].investors[_investor];
        }
    }

    // --- Internal Functions ---

    /// @notice Checks if an address is already tracked as an investor
    /// @dev Checks the appropriate tracker based on config
    /// @param _token The token address
    /// @param _investor The investor address to check
    /// @param config The compliance configuration
    /// @return True if already tracked as investor
    function _isExistingInvestor(
        address _token,
        address _investor,
        InvestorCountConfig memory config
    )
        private
        view
        returns (bool)
    {
        if (config.global) {
            return globalInvestorTracker.investors[_investor];
        } else {
            return investorTrackers[_token].investors[_investor];
        }
    }

    /// @notice Adds an investor to tracking if they satisfy the topic filter
    /// @dev Updates both token-specific and global trackers based on configuration
    /// @param _token The token address
    /// @param _investor The investor address to potentially add
    /// @param config The compliance configuration
    function _addInvestor(address _token, address _investor, InvestorCountConfig memory config) private {
        // Only add if investor satisfies the topic filter
        if (!_satisfiesTopicFilter(_token, _investor, config.topicFilter)) {
            return;
        }

        // Get investor's country
        uint16 investorCountry = _getInvestorCountry(_token, _investor);

        // Update the appropriate tracker(s)
        _updateTracker(investorTrackers[_token], _investor, investorCountry, true, config);
        if (config.global) {
            _updateTracker(globalInvestorTracker, _investor, investorCountry, true, config);
        }
    }

    /// @notice Removes an investor from tracking
    /// @dev Updates both token-specific and global trackers based on configuration
    /// @param _token The token address
    /// @param _investor The investor address to remove
    /// @param config The compliance configuration
    function _removeInvestor(address _token, address _investor, InvestorCountConfig memory config) private {
        // Get investor's country using a helper function for clarity
        uint16 investorCountry = _getStoredInvestorCountry(_token, _investor, config);

        // Update the appropriate tracker(s)
        _updateTracker(investorTrackers[_token], _investor, investorCountry, false, config);
        if (config.global) {
            _updateTracker(globalInvestorTracker, _investor, investorCountry, false, config);
        }
    }

    /// @notice Helper function to retrieve an investor's stored country code for removal
    /// @dev Looks up country from token tracker first, then global tracker if needed
    /// @param _token The token address
    /// @param _investor The investor address
    /// @param config The compliance configuration
    /// @return The stored country code for the investor
    function _getStoredInvestorCountry(
        address _token,
        address _investor,
        InvestorCountConfig memory config
    )
        private
        view
        returns (uint16)
    {
        // First try to get country from token-specific tracker
        uint16 investorCountry = investorTrackers[_token].investorCountry[_investor];

        // If not found and global tracking is enabled, check global tracker
        if (investorCountry == 0 && config.global) {
            investorCountry = globalInvestorTracker.investorCountry[_investor];
        }

        return investorCountry;
    }

    /// @notice Updates a tracker with investor addition or removal
    /// @dev Handles the core logic for tracking investors and their countries
    /// @param tracker The storage reference to the tracker to update
    /// @param _investor The investor address
    /// @param _country The investor's country code
    /// @param _isAddition True for addition, false for removal
    /// @param config The compliance configuration
    function _updateTracker(
        InvestorTracker storage tracker,
        address _investor,
        uint16 _country,
        bool _isAddition,
        InvestorCountConfig memory config
    )
        private
    {
        // Initialize all country limits on first use if they haven't been set yet
        _initializeCountryLimits(tracker, config);

        if (_isAddition && !tracker.investors[_investor]) {
            // Add new investor
            tracker.investors[_investor] = true;
            tracker.investorCountry[_investor] = _country;
            ++tracker.currentCount;
            if (_country > 0) {
                ++tracker.countryInvestorCounts[_country];
            }
        } else if (!_isAddition && tracker.investors[_investor]) {
            // Remove existing investor
            tracker.investors[_investor] = false;
            delete tracker.investorCountry[_investor];
            --tracker.currentCount;
            if (_country > 0 && tracker.countryInvestorCounts[_country] > 0) {
                --tracker.countryInvestorCounts[_country];
            }
        }
    }

    /// @notice Gets the current investor count
    /// @dev Returns the total count from the appropriate tracker
    /// @param _token The token address
    /// @param config The compliance configuration
    /// @return The current investor count
    function _getCurrentInvestorCount(
        address _token,
        InvestorCountConfig memory config
    )
        private
        view
        returns (uint256)
    {
        if (config.global) {
            return globalInvestorTracker.currentCount;
        } else {
            return investorTrackers[_token].currentCount;
        }
    }

    /// @notice Gets the current investor count for a specific country
    /// @dev Returns the country count from the appropriate tracker
    /// @param _token The token address
    /// @param _country The country code
    /// @param config The compliance configuration
    /// @return The current investor count for the country
    function _getCountryInvestorCount(
        address _token,
        uint16 _country,
        InvestorCountConfig memory config
    )
        private
        view
        returns (uint256)
    {
        if (config.global) {
            return globalInvestorTracker.countryInvestorCounts[_country];
        } else {
            return investorTrackers[_token].countryInvestorCounts[_country];
        }
    }

    /// @notice Gets the country limit for a specific country
    /// @dev Returns the limit from tracker or config
    /// @param _token The token address
    /// @param _country The country code
    /// @param config The compliance configuration
    /// @return The investor limit for the country (0 = no limit)
    function _getCountryLimit(
        address _token,
        uint16 _country,
        InvestorCountConfig memory config
    )
        private
        view
        returns (uint256)
    {
        InvestorTracker storage tracker = config.global ? globalInvestorTracker : investorTrackers[_token];

        // Check if limit was set during initialization
        uint256 limit = tracker.maxInvestorsPerCountry[_country];
        if (limit > 0) {
            return limit;
        }

        // Otherwise check config for limit
        for (uint256 i = 0; i < config.countryCodes.length; ++i) {
            if (config.countryCodes[i] == _country) {
                return config.countryLimits[i];
            }
        }

        return 0; // No limit for this country
    }

    /// @notice Initializes country limits for a tracker if not already done
    /// @dev Sets all country limits from config to avoid lazy initialization inconsistencies
    /// @param tracker The storage reference to the tracker to initialize
    /// @param config The compliance configuration containing country codes and limits
    function _initializeCountryLimits(InvestorTracker storage tracker, InvestorCountConfig memory config) private {
        // Only initialize if we have country limits configured and they haven't been set yet
        if (config.countryCodes.length > 0) {
            // Check if already initialized by testing the first country code
            if (config.countryCodes.length > 0 && tracker.maxInvestorsPerCountry[config.countryCodes[0]] == 0) {
                // Initialize all country limits at once
                for (uint256 i = 0; i < config.countryCodes.length; ++i) {
                    tracker.maxInvestorsPerCountry[config.countryCodes[i]] = config.countryLimits[i];
                }
            }
        }
    }

    /// @notice Gets an investor's country code from the identity registry
    /// @dev Retrieves country from the identity registry
    /// @param _token The token address (used to get identity registry)
    /// @param _investor The investor address
    /// @return The country code (0 if not found)
    function _getInvestorCountry(address _token, address _investor) private view returns (uint16) {
        ISMART smartToken = ISMART(_token);
        ISMARTIdentityRegistry identityRegistry = ISMARTIdentityRegistry(smartToken.identityRegistry());

        // Check if investor is registered
        if (!identityRegistry.contains(_investor)) {
            return 0;
        }

        return identityRegistry.investorCountry(_investor);
    }

    /// @notice Checks if an investor satisfies the topic filter requirements
    /// @dev Uses the identity registry to evaluate the ExpressionNode array
    /// @param _token The token address (used to get identity registry)
    /// @param _investor The investor address to check
    /// @param topicFilter The ExpressionNode array defining requirements
    /// @return True if the investor satisfies the filter (only investors with identities can satisfy filters)
    function _satisfiesTopicFilter(
        address _token,
        address _investor,
        ExpressionNode[] memory topicFilter
    )
        private
        view
        returns (bool)
    {
        // Get the identity registry from the token
        ISMART smartToken = ISMART(_token);
        ISMARTIdentityRegistry identityRegistry = ISMARTIdentityRegistry(smartToken.identityRegistry());

        // First check if investor has an identity - investors without identities are never counted
        if (!identityRegistry.contains(_investor)) {
            return false;
        }

        // Empty filter means all investors with identities are counted
        if (topicFilter.length == 0) {
            return true;
        }

        // Use the identity registry to evaluate the expression
        return identityRegistry.isVerified(_investor, topicFilter);
    }
}
