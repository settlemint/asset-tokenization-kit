// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base modules
import { AbstractCountryComplianceModule } from "./AbstractCountryComplianceModule.sol";

// Interface imports
import { ISMARTComplianceModule } from "../interface/ISMARTComplianceModule.sol"; // Needed for @inheritdoc

/// @title Country Allow-List Compliance Module
/// @author SettleMint
/// @notice This compliance module restricts token transfers *to* users unless their registered country is on an
/// approved list.
/// @dev It inherits from `AbstractCountryComplianceModule` and implements a country-based allow-list logic.
/// The module combines two sources for the allow-list:
/// 1. **Global Allow-List**: A list of country codes maintained within this specific module instance.
///    This list can be managed by addresses holding the `GLOBAL_LIST_MANAGER_ROLE` (inherited from
/// `AbstractCountryComplianceModule`).
/// 2. **Token-Specific Allow-List**: An additional list of country codes provided via the `_params` argument when this
/// module
///    is registered with a particular `ISMART` token. The format for these parameters is `abi.encode(uint16[] memory
/// additionalAllowedCountries)`.
/// A transfer *to* a recipient is PERMITTED if:
///    - The recipient has no identity registered in the token's `ISMARTIdentityRegistry`, or their country code is 0.
///      (In this case, the module cannot determine the country, so it defaults to allowing the transfer).
///    - OR the recipient's registered country code is present in this module instance's global allow-list.
///    - OR the recipient's registered country code is present in the token-specific list of allowed countries passed
/// via `_params`.
/// If none of these conditions are met, the `canTransfer` function will revert with a `ComplianceCheckFailed` error,
/// effectively blocking the transfer.
/// @custom:parameters The `_params` data for this module should be ABI-encoded as a dynamic array of `uint16` country
/// codes:
///                   `abi.encode(uint16[] memory additionalAllowedCountries)`. These are countries allowed *in
/// addition* to the global list for a specific token.
contract CountryAllowListComplianceModule is AbstractCountryComplianceModule {
    /// @notice Unique type identifier for this compliance module
    bytes32 public constant TYPE_ID = keccak256("CountryAllowListComplianceModule");

    /// @notice Returns a unique identifier for the type of this contract.
    /// @dev This identifier is used to distinguish this compliance module type from others in the system.
    /// @return The unique type identifier for the CountryAllowListComplianceModule.
    function typeId() external pure override returns (bytes32) {
        return TYPE_ID;
    }

    // --- Events ---
    /// @notice Emitted when one or more countries are added to or removed from this module instance's global
    /// allow-list.
    /// @param countries An array of country codes (ISO 3166-1 numeric) that were updated.
    /// @param allowed A boolean indicating whether the specified `countries` were added (`true`) to or removed
    /// (`false`) from the global allow-list.
    event GlobalAllowedCountriesUpdated(uint16[] countries, bool indexed allowed);

    // --- Constructor ---
    /// @notice Constructor for the `CountryAllowListComplianceModule`.
    /// @dev When a contract inheriting from `CountryAllowListComplianceModule` is deployed, this constructor is called.
    /// It calls the constructor of `AbstractCountryComplianceModule` with the `_trustedForwarder` address.
    /// @param _trustedForwarder Address of the trusted forwarder for meta transactions
    constructor(address _trustedForwarder) AbstractCountryComplianceModule(_trustedForwarder) { }

    // --- Global Allow List Management (Manager Role Only) ---

    /// @notice Adds or removes multiple countries from this module instance's global allow-list.
    /// @dev This function can only be called by addresses that have been granted the `GLOBAL_LIST_MANAGER_ROLE` for
    /// this module instance.
    /// It iterates through the `_countries` array and sets their status in the global country list.
    /// When adding countries, they are added to both the mapping and the enumerable array.
    /// When removing countries, they are removed from both the mapping and the array using the swap-and-pop technique.
    /// @param _countries An array of country codes (ISO 3166-1 numeric) to be added or removed.
    /// @param _allow If `true`, the specified `_countries` will be added to the global allow-list (or updated if
    /// already present).
    ///               If `false`, the specified `_countries` will be removed from the global allow-list.
    function setGlobalAllowedCountries(
        uint16[] calldata _countries,
        bool _allow
    )
        external
        virtual
        onlyRole(GLOBAL_LIST_MANAGER_ROLE) // Ensures only authorized managers can call this
    {
        uint256 countriesLength = _countries.length;
        for (uint256 i = 0; i < countriesLength;) {
            _setCountryInGlobalList(_countries[i], _allow);
            unchecked {
                ++i;
            }
        }
        emit GlobalAllowedCountriesUpdated(_countries, _allow);
    }

    // --- Views ---

    /// @notice Checks if a specific country code is present in this module instance's global allow-list.
    /// @param _country The country code (ISO 3166-1 numeric) to check.
    /// @return True if the country is part of the global allow-list for this module instance, false otherwise
    function isGloballyAllowed(uint16 _country) public view virtual returns (bool) {
        return _isCountryInGlobalList(_country);
    }

    /// @notice Returns an array of all globally allowed country codes for this module instance.
    /// @dev This function provides a way to enumerate all countries that are currently allowed in the global
    /// allow-list.
    /// It's useful for administrative purposes, auditing, or for front-ends that need to display the current list of
    /// allowed countries.
    /// @return An array of `uint16` country codes representing all globally allowed countries.
    /// The array will be empty if no countries are currently in the global allow-list.
    function getGlobalAllowedCountries() external view virtual returns (uint16[] memory) {
        return _getGlobalCountriesList();
    }

    // --- Compliance Check --- (ISMARTComplianceModule Implementation)

    /// @inheritdoc ISMARTComplianceModule
    /// @notice Determines if a transfer to a recipient is allowed based on their country's presence in the combined
    /// allow-lists.
    /// @dev This function implements the core compliance logic for the `CountryAllowListComplianceModule`.
    /// It is called by the `SMARTComplianceImplementation` before a token transfer.
    /// The logic is as follows:
    /// 1. Retrieve the recipient's (`_to`) country code using `_getUserCountry` (from
    /// `AbstractCountryComplianceModule`).
    /// 2. If the recipient has no identity or their country code is 0, the transfer is allowed (return without
    /// reverting).
    ///    This is because the module cannot enforce an allow-list if the country is unknown.
    /// 3. If the recipient's country is in this module's global allow-list (checked via `isGloballyAllowed`),
    /// the transfer is allowed.
    /// 4. If not globally allowed, decode the token-specific `additionalAllowedCountries` from `_params` (using
    /// `_decodeParams`).
    /// 5. Check if the recipient's country is present in this `additionalAllowedCountries` list. If yes, the transfer
    /// is allowed.
    /// 6. If none of the above conditions are met (i.e., recipient has a known country, and it's not in the global
    /// list, and it's not in the token-specific list),
    ///    the function reverts with `ComplianceCheckFailed("Receiver country not in allowlist")`.
    /// @param _token Address of the `ISMART` token contract for which the compliance check is being performed.
    /// @param _to Address of the recipient whose country is being checked against the allow-list.
    /// @param _params ABI-encoded `uint16[]` of additional country codes allowed specifically for this `_token`,
    ///                in addition to the module's global allow-list.
    function canTransfer(
        address _token,
        address, /* _from - unused */
        address _to,
        uint256, /* _value - unused */
        bytes calldata _params
    )
        external
        view
        virtual
        override // Overrides canTransfer from AbstractCountryComplianceModule
    {
        (bool hasIdentity, uint16 receiverCountry) = _getUserCountry(_token, _to);

        // Condition 1: If no identity is found for the receiver, or their country code is 0 (unknown/not set),
        // this module cannot enforce an allow-list based on country. Therefore, the transfer is implicitly allowed by
        // this module.
        if (!hasIdentity || receiverCountry == 0) {
            return; // Allow transfer
        }

        // Condition 2: Check if the receiver's country is in this module instance's global allow-list.
        if (isGloballyAllowed(receiverCountry)) {
            return; // Allowed due to being in the global list for this module instance.
        }

        // Condition 3: If not in the global list, check the token-specific additional allowed countries provided in
        // _params.
        uint16[] memory additionalAllowedCountries = _decodeParams(_params); // Decodes abi.encode(uint16[])
        uint256 additionalAllowedCountriesLength = additionalAllowedCountries.length;
        for (uint256 i = 0; i < additionalAllowedCountriesLength;) {
            if (additionalAllowedCountries[i] == receiverCountry) {
                return; // Allowed due to being in the token-specific list for this token.
            }
            unchecked {
                ++i;
            }
        }

        // If none of the above conditions for allowing the transfer were met, the receiver's country is not in any
        // applicable allow-list.
        // Therefore, the compliance check fails, and the transfer should be blocked.
        revert ComplianceCheckFailed("Receiver country not in allowlist");
    }

    // --- Module Info --- (ISMARTComplianceModule Implementation)

    /// @inheritdoc ISMARTComplianceModule
    /// @notice Returns the human-readable name of this compliance module.
    /// @return The string "Country AllowList Compliance Module".
    function name() external pure virtual override returns (string memory) {
        return "Country AllowList Compliance Module";
    }
}
