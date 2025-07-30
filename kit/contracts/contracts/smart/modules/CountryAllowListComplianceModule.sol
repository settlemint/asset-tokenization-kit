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
/// The module uses a token-specific list of allowed country codes provided via the `_params` argument when this
/// module is registered with a particular `ISMART` token. The format for these parameters is `abi.encode(uint16[] memory
/// allowedCountries)`.
/// A transfer *to* a recipient is PERMITTED if:
///    - The recipient has no identity registered in the token's `ISMARTIdentityRegistry`, or their country code is 0.
///      (In this case, the module cannot determine the country, so it defaults to allowing the transfer).
///    - OR the recipient's registered country code is present in the token-specific list of allowed countries passed
/// via `_params`.
/// If none of these conditions are met, the `canTransfer` function will revert with a `ComplianceCheckFailed` error,
/// effectively blocking the transfer.
/// @custom:parameters The `_params` data for this module should be ABI-encoded as a dynamic array of `uint16` country
/// codes:
///                   `abi.encode(uint16[] memory allowedCountries)`. These are the countries allowed for a specific token.
contract CountryAllowListComplianceModule is AbstractCountryComplianceModule {
    /// @notice Unique type identifier for this compliance module
    bytes32 public constant TYPE_ID = keccak256("CountryAllowListComplianceModule");

    /// @notice Returns a unique identifier for the type of this contract.
    /// @dev This identifier is used to distinguish this compliance module type from others in the system.
    /// @return The unique type identifier for the CountryAllowListComplianceModule.
    function typeId() external pure override returns (bytes32) {
        return TYPE_ID;
    }


    // --- Constructor ---
    /// @notice Constructor for the `CountryAllowListComplianceModule`.
    /// @dev When a contract inheriting from `CountryAllowListComplianceModule` is deployed, this constructor is called.
    /// It calls the constructor of `AbstractCountryComplianceModule` with the `_trustedForwarder` address.
    /// @param _trustedForwarder Address of the trusted forwarder for meta transactions
    constructor(address _trustedForwarder) AbstractCountryComplianceModule(_trustedForwarder) { }


    // --- Compliance Check --- (ISMARTComplianceModule Implementation)

    /// @inheritdoc ISMARTComplianceModule
    /// @notice Determines if a transfer to a recipient is allowed based on their country's presence in the allow-list.
    /// @dev This function implements the core compliance logic for the `CountryAllowListComplianceModule`.
    /// It is called by the `SMARTComplianceImplementation` before a token transfer.
    /// The logic is as follows:
    /// 1. Retrieve the recipient's (`_to`) country code using `_getUserCountry` (from
    /// `AbstractCountryComplianceModule`).
    /// 2. If the recipient has no identity or their country code is 0, the transfer is allowed (return without
    /// reverting).
    ///    This is because the module cannot enforce an allow-list if the country is unknown.
    /// 3. Decode the token-specific `allowedCountries` from `_params` (using `_decodeParams`).
    /// 4. Check if the recipient's country is present in this `allowedCountries` list. If yes, the transfer
    /// is allowed.
    /// 5. If the recipient has a known country and it's not in the token-specific list,
    ///    the function reverts with `ComplianceCheckFailed("Receiver country not in allowlist")`.
    /// @param _token Address of the `ISMART` token contract for which the compliance check is being performed.
    /// @param _to Address of the recipient whose country is being checked against the allow-list.
    /// @param _params ABI-encoded `uint16[]` of country codes allowed specifically for this `_token`.
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

        // Condition 2: Check the token-specific allowed countries provided in _params.
        uint16[] memory allowedCountries = _decodeParams(_params); // Decodes abi.encode(uint16[])
        uint256 allowedCountriesLength = allowedCountries.length;
        for (uint256 i = 0; i < allowedCountriesLength;) {
            if (allowedCountries[i] == receiverCountry) {
                return; // Allowed due to being in the token-specific list for this token.
            }
            unchecked {
                ++i;
            }
        }

        // If none of the above conditions for allowing the transfer were met, the receiver's country is not in the
        // allow-list.
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
