// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base modules
import { AbstractCountryComplianceModule } from "./AbstractCountryComplianceModule.sol";

// Interface imports
import { ISMARTComplianceModule } from "../interface/ISMARTComplianceModule.sol"; // Needed for @inheritdoc

/// @title Country Block-List Compliance Module
/// @author SettleMint Tokenization Services
/// @notice This compliance module restricts token transfers *to* users if their registered country is on a prohibited
/// list (block-list).
/// @dev It inherits from `AbstractCountryComplianceModule` and implements a country-based block-list logic.
/// The module combines two sources for the block-list:
/// 1. **Global Block-List**: A list of country codes maintained within this specific module instance.
///    This list can be managed by addresses holding the `GLOBAL_LIST_MANAGER_ROLE` (inherited from
/// `AbstractCountryComplianceModule`).
/// 2. **Token-Specific Block-List**: An additional list of country codes provided via the `_params` argument when this
/// module
///    is registered with a particular `ISMART` token. The format for these parameters is `abi.encode(uint16[] memory
/// additionalBlockedCountries)`.
/// A transfer *to* a recipient is BLOCKED (i.e., `canTransfer` reverts) if:
///    - The recipient has a registered identity in the token's `ISMARTIdentityRegistry` AND their country code is known
/// (not 0),
///    - AND the recipient's registered country code is present in this module instance's global block-list,
///    - OR the recipient's registered country code is present in the token-specific list of blocked countries passed
/// via `_params`.
/// If the recipient has no identity or their country code is 0, the transfer is implicitly ALLOWED by this module
/// because it cannot determine if they are from a blocked country.
/// Similarly, if their known country is not on any block-list, the transfer is allowed.
/// @custom:parameters The `_params` data for this module should be ABI-encoded as a dynamic array of `uint16` country
/// codes:
///                   `abi.encode(uint16[] memory additionalBlockedCountries)`. These are countries blocked *in
/// addition* to the global list for a specific token.
contract CountryBlockListComplianceModule is AbstractCountryComplianceModule {
    bytes32 public constant override typeId = keccak256("CountryBlockListComplianceModule");

    // --- Events ---
    /// @notice Emitted when one or more countries are added to or removed from this module instance's global
    /// block-list.
    /// @param countries An array of country codes (ISO 3166-1 numeric) that were updated.
    /// @param blocked A boolean indicating whether the specified `countries` were added (`true`) to or removed
    /// (`false`) from the global block-list.
    event GlobalBlockedCountriesUpdated(uint16[] countries, bool indexed blocked);

    // --- Constructor ---
    /// @notice Constructor for the `CountryBlockListComplianceModule`.
    /// @dev When a contract inheriting from `CountryBlockListComplianceModule` is deployed, this constructor is called.
    /// It calls the constructor of `AbstractCountryComplianceModule` with the `_trustedForwarder` address.
    constructor(address _trustedForwarder) AbstractCountryComplianceModule(_trustedForwarder) { }

    // --- Global Block List Management (Manager Role Only) ---

    /// @notice Adds or removes multiple countries from this module instance's global block-list.
    /// @dev This function can only be called by addresses that have been granted the `GLOBAL_LIST_MANAGER_ROLE` for
    /// this module instance.
    /// It iterates through the `_countries` array and sets their status in the global country list.
    /// When adding countries, they are added to both the mapping and the enumerable array.
    /// When removing countries, they are removed from both the mapping and the array using the swap-and-pop technique.
    /// @param _countries An array of country codes (ISO 3166-1 numeric) to be added or removed.
    /// @param _block If `true`, the specified `_countries` will be added to the global block-list (or updated if
    /// already present).
    ///               If `false`, the specified `_countries` will be removed from the global block-list.
    function setGlobalBlockedCountries(
        uint16[] calldata _countries,
        bool _block
    )
        external
        virtual
        onlyRole(GLOBAL_LIST_MANAGER_ROLE) // Ensures only authorized managers can call this
    {
        uint256 countriesLength = _countries.length;
        for (uint256 i = 0; i < countriesLength;) {
            _setCountryInGlobalList(_countries[i], _block);
            unchecked {
                ++i;
            }
        }
        emit GlobalBlockedCountriesUpdated(_countries, _block);
    }

    // --- Views ---

    /// @notice Checks if a specific country code is present in this module instance's global block-list.
    /// @param _country The country code (ISO 3166-1 numeric) to check.
    /// @return `true` if the `_country` is part of the global block-list for this module instance, `false` otherwise.
    function isGloballyBlocked(uint16 _country) public view virtual returns (bool) {
        return _isCountryInGlobalList(_country);
    }

    /// @notice Returns an array of all globally blocked country codes for this module instance.
    /// @dev This function provides a way to enumerate all countries that are currently blocked in the global
    /// block-list.
    /// It's useful for administrative purposes, auditing, or for front-ends that need to display the current list of
    /// blocked countries.
    /// @return An array of `uint16` country codes representing all globally blocked countries.
    /// The array will be empty if no countries are currently in the global block-list.
    function getGlobalBlockedCountries() external view virtual returns (uint16[] memory) {
        return _getGlobalCountriesList();
    }

    // --- Compliance Check --- (ISMARTComplianceModule Implementation)

    /// @inheritdoc ISMARTComplianceModule
    /// @notice Determines if a transfer to a recipient should be blocked based on their country's presence in the
    /// combined block-lists.
    /// @dev This function implements the core compliance logic for the `CountryBlockListComplianceModule`.
    /// It is called by the `SMARTComplianceImplementation` before a token transfer.
    /// The logic is as follows:
    /// 1. Retrieve the recipient's (`_to`) country code using `_getUserCountry` (from
    /// `AbstractCountryComplianceModule`).
    /// 2. If the recipient has no identity or their country code is 0 (unknown), the transfer is allowed by this module
    /// (return without reverting).
    ///    This is because the module cannot enforce a block-list if the country is unknown.
    /// 3. If the recipient's country is in this module's global block-list (checked via `isGloballyBlocked`),
    ///    the transfer is blocked, and the function reverts with `ComplianceCheckFailed("Receiver country globally
    /// blocked")`.
    /// 4. If not globally blocked, decode the token-specific `additionalBlockedCountries` from `_params` (using
    /// `_decodeParams`).
    /// 5. Check if the recipient's country is present in this `additionalBlockedCountries` list. If yes,
    ///    the transfer is blocked, and the function reverts with `ComplianceCheckFailed("Receiver country blocked for
    /// token")`.
    /// 6. If the recipient's country is known and not found in any block-list, the transfer is allowed by this module
    /// (function completes without reverting).
    /// @param _token Address of the `ISMART` token contract for which the compliance check is being performed.
    /// @param _to Address of the recipient whose country is being checked against the block-list.
    /// @param _params ABI-encoded `uint16[]` of additional country codes blocked specifically for this `_token`,
    ///                in addition to the module's global block-list.
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

        // Condition 1: Only apply block-list if identity and country are known.
        // If no identity or country is 0, this module cannot determine if they are blocked, so it allows the transfer.
        if (!hasIdentity || receiverCountry == 0) {
            return; // Allow transfer as country cannot be determined for blocking.
        }

        // Condition 2: Check if the receiver's country is in this module instance's global block-list.
        if (isGloballyBlocked(receiverCountry)) {
            revert ComplianceCheckFailed("Receiver country globally blocked");
        }

        // Condition 3: If not in the global list, check the token-specific additional blocked countries provided in
        // _params.
        uint16[] memory additionalBlockedCountries = _decodeParams(_params); // Decodes abi.encode(uint16[])
        uint256 additionalBlockedCountriesLength = additionalBlockedCountries.length;
        for (uint256 i = 0; i < additionalBlockedCountriesLength;) {
            if (additionalBlockedCountries[i] == receiverCountry) {
                revert ComplianceCheckFailed("Receiver country blocked for token");
            }
            unchecked {
                ++i;
            }
        }

        // If the country is known and not found in either the global or token-specific block-list, the transfer is
        // allowed by this module.
    }

    // --- Module Info --- (ISMARTComplianceModule Implementation)

    /// @inheritdoc ISMARTComplianceModule
    /// @notice Returns the human-readable name of this compliance module.
    /// @return The string "Country BlockList Compliance Module".
    function name() external pure virtual override returns (string memory) {
        return "Country BlockList Compliance Module";
    }
}
