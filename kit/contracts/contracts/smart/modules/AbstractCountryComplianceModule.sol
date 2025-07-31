// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports

// Interface imports
import { ISMART } from "../interface/ISMART.sol";
import { ISMARTIdentityRegistry } from "../interface/ISMARTIdentityRegistry.sol";
import { ISMARTComplianceModule } from "../interface/ISMARTComplianceModule.sol"; // Needed for @inheritdoc

// Base modules
import { AbstractComplianceModule } from "./AbstractComplianceModule.sol";

/// @title Abstract Base for Country-Specific Compliance Modules
/// @author SettleMint
/// @notice This abstract contract extends `AbstractComplianceModule` to provide common functionalities
/// specifically for compliance modules that base their rules on investor country codes (ISO 3166-1 numeric).
/// @dev Key features and conventions introduced by this module:
/// - **Inheritance**: Builds upon `AbstractComplianceModule`, inheriting its basic structure.
/// - **Country-Specific Logic**: Designed for child contracts that will implement rules like country allow-lists or
/// block-lists within their `canTransfer` function.
/// - **Standardized Parameters**: It defines a standard way for token contracts to pass country lists to these modules.
///   The `_params` data for `canTransfer` and `validateParameters` is expected to be `abi.encode(uint16[] memory
/// countryCodes)`.
/// - **Stateless Design**: Modules are pure logic units. All country lists come from external configuration.
/// - **Helper Functions**: Provides `_decodeParams` to easily decode the country list from `_params` and
///   `_getUserCountry` to fetch an investor's country from the `ISMARTIdentityRegistry` associated with a given
/// `ISMART` token.
/// Inheriting contracts still need to implement `canTransfer` (with country-specific logic), `name`, and may override
/// other hooks from `AbstractComplianceModule`.
abstract contract AbstractCountryComplianceModule is AbstractComplianceModule {
    // --- Constructor ---
    /// @notice Constructor for the abstract country compliance module.
    /// @dev When a contract inheriting from `AbstractCountryComplianceModule` is deployed,
    /// it simply calls the parent constructor to initialize ERC2771Context support.
    /// As modules are now stateless, no additional setup is needed.
    /// @param _trustedForwarder Address of the trusted forwarder for meta transactions
    constructor(address _trustedForwarder) AbstractComplianceModule(_trustedForwarder) { }

    // --- Parameter Validation --- (Standard for Country Modules)

    /// @inheritdoc ISMARTComplianceModule
    /// @notice Validates that the provided parameters (`_params`) conform to the expected format for country-based
    /// modules.
    /// @dev This function overrides `validateParameters` from `AbstractComplianceModule`.
    /// It specifically checks if `_params` can be successfully decoded as a dynamic array of `uint16` (country codes).
    /// If the decoding fails (i.e., `_params` are not in the format `abi.encode(uint16[])`), the function will revert.
    /// Note: This function *only* validates the format of `_params`. It does *not* validate the individual country
    /// codes within the array
    /// (e.g., checking if they are valid ISO 3166-1 numeric codes). Such specific validation might be done by the
    /// concrete module if needed.
    /// @param _params The ABI-encoded parameters to validate. Expected to be `abi.encode(uint16[] memory
    /// countryCodes)`.
    function validateParameters(bytes calldata _params) public view virtual override {
        // Attempt to decode parameters as an array of uint16 (country codes).
        // If _params is not correctly ABI-encoded as `uint16[]`, this abi.decode call will revert.
        abi.decode(_params, (uint16[]));
        // If decoding is successful, the format is considered valid by this abstract module.
    }

    // --- Internal Helper Functions for Parameter Decoding ---

    /// @notice Decodes the ABI-encoded country list parameters into a `uint16[]` array.
    /// @dev This is a helper function for concrete modules to easily extract the token-specific list of country codes
    /// from the `_params` data they receive in `canTransfer` or other functions.
    /// It assumes that `validateParameters` has already been successfully called (e.g., by the
    /// `SMARTComplianceImplementation` contract
    /// before these parameters were associated with a token), so it doesn't re-check the format here.
    /// @param _params The ABI-encoded parameters, expected to be `abi.encode(uint16[] memory countryCodes)`.
    /// @return additionalCountries A dynamic array of `uint16` representing country codes.
    function _decodeParams(bytes calldata _params) internal pure returns (uint16[] memory additionalCountries) {
        // Assumes _params are already validated to be decodable as uint16[].
        return abi.decode(_params, (uint16[]));
    }

    /// @notice Retrieves a user's registered country code from the identity registry associated with a specific
    /// `ISMART` token.
    /// @dev This helper function is crucial for country-based compliance checks.
    /// It first gets the address of the `ISMARTIdentityRegistry` linked to the given `_token` (via
    /// `ISMART(_token).identityRegistry()`).
    /// Then, it checks if the `_user` has an identity registered in that specific registry
    /// (`identityRegistry.contains(_user)`).
    /// If an identity exists, it fetches the user's country code (`identityRegistry.investorCountry(_user)`).
    /// @param _token Address of the `ISMART` token contract. The compliance module uses this to find the correct
    /// identity registry.
    /// @param _user Address of the user (e.g., sender or receiver of a transfer) whose country needs to be checked.
    /// @return hasIdentity A boolean indicating `true` if the user has a registered identity in the token's registry,
    /// `false` otherwise.
    /// @return country The user's registered country code (as a `uint16` ISO 3166-1 numeric value). Returns `0` if the
    /// user has no identity
    ///                 or if the country code is not set or is explicitly zero in the registry.
    function _getUserCountry(address _token, address _user) internal view returns (bool hasIdentity, uint16 country) {
        // Obtain the ISMARTIdentityRegistry instance associated with the specific ISMART token.
        ISMARTIdentityRegistry identityRegistry = ISMART(_token).identityRegistry();

        // Check if the user is known to this specific identity registry.
        hasIdentity = identityRegistry.contains(_user);
        if (!hasIdentity) {
            // If the user has no identity in this registry, return false and country code 0.
            return (false, 0);
        }

        // If the user has an identity, retrieve their registered investor country code.
        country = identityRegistry.investorCountry(_user);
        return (true, country);
    }
}
