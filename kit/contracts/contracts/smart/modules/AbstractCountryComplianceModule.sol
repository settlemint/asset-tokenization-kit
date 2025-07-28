// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
// AccessControl is inherited from AbstractComplianceModule

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
/// - **Inheritance**: Builds upon `AbstractComplianceModule`, inheriting its `AccessControl` and basic structure.
/// - **Country-Specific Logic**: Designed for child contracts that will implement rules like country allow-lists or
/// block-lists within their `canTransfer` function.
/// - **Standardized Parameters**: It defines a standard way for token contracts to pass country lists to these modules.
///   The `_params` data for `canTransfer` and `validateParameters` is expected to be `abi.encode(uint16[] memory
/// countryCodes)`.
/// - **Global List Management Role**: Introduces `GLOBAL_LIST_MANAGER_ROLE`. Concrete modules inheriting from this can
/// use this role
///   to manage a shared, module-instance-specific list of countries (e.g., a global allow-list or block-list for that
/// deployed module instance).
/// - **Enumerable Country Lists**: Provides common infrastructure for managing enumerable country lists with O(1)
/// additions and removals.
/// - **Helper Functions**: Provides `_decodeParams` to easily decode the country list from `_params` and
///   `_getUserCountry` to fetch an investor's country from the `ISMARTIdentityRegistry` associated with a given
/// `ISMART` token.
/// Inheriting contracts still need to implement `canTransfer` (with country-specific logic), `name`, and may override
/// other hooks from `AbstractComplianceModule`.
abstract contract AbstractCountryComplianceModule is AbstractComplianceModule {
    // --- Roles ---
    /// @notice Role identifier for addresses authorized to manage a global list of countries within a specific instance
    /// of a derived country compliance module.
    /// @dev This role is intended for administrative control over a shared list (e.g., a global allowlist or blocklist)
    /// that is maintained by the concrete module instance itself, separate from token-specific parameter lists.
    /// For example, an admin with this role could add or remove countries from the module's general blocklist.
    /// The role is `keccak256("GLOBAL_LIST_MANAGER_ROLE")`.
    bytes32 public constant GLOBAL_LIST_MANAGER_ROLE = keccak256("GLOBAL_LIST_MANAGER_ROLE");

    /// @notice Emitted when a country is added to or removed from the global list
    /// @dev Emitted when a country is added to or removed from the global list.
    /// @param country The country code being updated.
    /// @param inList True if the country was added, false if it was removed.
    event GlobalCountryListChange(uint16 indexed country, bool indexed inList);

    // --- State Variables for Enumerable Country List Management ---
    /// @notice Stores the global country list for this specific module instance (meaning depends on concrete
    /// implementation).
    /// @dev This mapping holds country codes (ISO 3166-1 numeric) as keys and a boolean status as the value.
    /// The boolean meaning depends on the concrete implementation (e.g., true = allowed in allow-list, true = blocked
    /// in block-list).
    /// This list is managed by users with the `GLOBAL_LIST_MANAGER_ROLE` via functions in concrete modules.
    mapping(uint16 country => bool status) internal _globalCountries;

    /// @notice An array storing all global country codes for enumeration purposes.
    /// @dev This array allows for iterating over all countries in the global list, which is useful for administrative
    /// tasks, data export, or informational queries. It is managed in conjunction with `_globalCountriesIndex`
    /// to allow for efficient addition and removal (O(1) for removal using the swap-and-pop technique).
    uint16[] public globalCountriesList;

    /// @notice Mapping from a country code to its index (plus one) in the `_globalCountriesList` array.
    /// @dev This mapping is a crucial optimization for removing a country from the `_globalCountriesList` array.
    /// Instead of iterating through the array to find the country to remove (which would be O(n) complexity),
    /// this mapping provides the index directly (O(1) lookup).
    /// We store `index + 1` because the default value for a mapping entry is 0. If we stored the actual 0-based index,
    /// we wouldn't be able to distinguish between a country at index 0 and a country that is not in the array.
    /// So, a value of `0` here means the country is not in `_globalCountriesList`. A value of `1` means it's at index
    /// `0`, etc.
    mapping(uint16 country => uint256 indexPlusOne) internal _globalCountriesIndex;

    // --- Constructor ---
    /// @notice Constructor for the abstract country compliance module.
    /// @dev When a contract inheriting from `AbstractCountryComplianceModule` is deployed:
    /// 1. The `AbstractComplianceModule` constructor is called, granting the deployer the `DEFAULT_ADMIN_ROLE`.
    /// 2. This constructor additionally grants the deployer the `GLOBAL_LIST_MANAGER_ROLE` for this specific module
    /// instance.
    /// This allows the deployer to initially manage both general module settings (via `DEFAULT_ADMIN_ROLE`) and any
    /// global country lists the module might implement.
    /// @param _trustedForwarder Address of the trusted forwarder for meta transactions
    constructor(address _trustedForwarder) AbstractComplianceModule(_trustedForwarder) {
        _grantRole(GLOBAL_LIST_MANAGER_ROLE, _msgSender());
    }

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

    // --- Internal Helper Functions for Global Country List Management ---

    /// @notice Internal function to set a country's status in the global list and manage the enumerable array.
    /// @dev This function handles both adding and removing countries from the global list:
    /// - When adding (`_inList = true`): Adds to mapping and array if not already present
    /// - When removing (`_inList = false`): Removes from mapping and array if currently present
    /// Uses the swap-and-pop technique for efficient O(1) array removal.
    /// @param _country The country code to add or remove.
    /// @param _inList True to add the country to the global list, false to remove it.
    function _setCountryInGlobalList(uint16 _country, bool _inList) internal {
        bool wasInList = _globalCountries[_country];
        if (wasInList == _inList) {
            return;
        }

        _globalCountries[_country] = _inList;

        if (_inList) {
            // Adding a new country to the list
            globalCountriesList.push(_country);
            _globalCountriesIndex[_country] = globalCountriesList.length; // Store index + 1
        } else {
            // Removing a country from the list
            _removeCountryFromGlobalArray(_country);
        }
        emit GlobalCountryListChange(_country, _inList);
    }

    /// @notice Internal function to remove a country code from the `_globalCountriesList` array using the swap-and-pop
    /// technique.
    /// @dev This function ensures O(1) removal complexity by:
    /// 1. Finding the index of the country to remove using `_globalCountriesIndex`
    /// 2. Swapping the country to remove with the last country in the array
    /// 3. Updating the index mapping for the swapped country
    /// 4. Removing the last element from the array
    /// 5. Clearing the index mapping for the removed country
    /// @param _country The country code to remove from the array.
    function _removeCountryFromGlobalArray(uint16 _country) internal {
        uint256 indexPlusOne = _globalCountriesIndex[_country];
        if (indexPlusOne == 0) return; // Country not in array, nothing to remove

        uint256 index = indexPlusOne - 1; // Convert to 0-based index
        uint256 lastIndex = globalCountriesList.length - 1;

        if (index != lastIndex) {
            // Move the last country to the position of the country being removed
            uint16 lastCountry = globalCountriesList[lastIndex];
            globalCountriesList[index] = lastCountry;
            _globalCountriesIndex[lastCountry] = indexPlusOne; // Update index for moved country
        }

        // Remove the last element and clear the index mapping
        globalCountriesList.pop();
        delete _globalCountriesIndex[_country];
    }

    /// @notice Internal view function to check if a country is in the global list.
    /// @param _country The country code to check.
    /// @return True if the country is in the global list, false otherwise.
    function _isCountryInGlobalList(uint16 _country) internal view returns (bool) {
        return _globalCountries[_country];
    }

    /// @notice Internal view function to get all countries in the global list.
    /// @return An array of all country codes currently in the global list.
    function _getGlobalCountriesList() internal view returns (uint16[] memory) {
        return globalCountriesList;
    }
}
