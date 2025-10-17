// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base modules
import { AbstractCountryComplianceModule } from "./AbstractCountryComplianceModule.sol";

// Interface imports
import { ISMARTComplianceModule } from "../interface/ISMARTComplianceModule.sol"; // Needed for @inheritdoc

/// @title Country Block-List Compliance Module
/// @author SettleMint
/// @notice This compliance module restricts token transfers *to* users if their registered country is on a prohibited
/// list (block-list) or if their identity/country is unknown.
/// @dev It inherits from `AbstractCountryComplianceModule` and implements a country-based block-list logic.
/// The module uses a token-specific list of blocked country codes provided via the `_params` argument when this
/// module is registered with a particular `ISMART` token. The format for these parameters is `abi.encode(uint16[]
/// memory
/// blockedCountries)`.
/// A transfer *to* a recipient is BLOCKED (i.e., `canTransfer` reverts) if:
///    - The recipient has no identity registered in the token's `ISMARTIdentityRegistry`, or their country code is 0
///      (unknown), OR
///    - The recipient has a registered identity AND their country code is known (not 0) AND their country code is
///      present in the token-specific list of blocked countries passed via `_params`.
/// A transfer *to* a recipient is ALLOWED only if:
///    - The recipient has a registered identity AND their country code is known (not 0) AND their country code is
///      NOT present in the token-specific list of blocked countries.
/// @custom:parameters The `_params` data for this module should be ABI-encoded as a dynamic array of `uint16` country
/// codes:
///                   `abi.encode(uint16[] memory blockedCountries)`. These are the countries blocked for a specific
/// token.
contract CountryBlockListComplianceModule is AbstractCountryComplianceModule {
    /// @notice Unique type identifier for this compliance module
    bytes32 public constant TYPE_ID = keccak256("CountryBlockListComplianceModule");

    /// @notice Returns a unique identifier for the type of this contract.
    /// @dev This identifier is used to distinguish this compliance module type from others in the system.
    /// @return The unique type identifier for the CountryBlockListComplianceModule.
    function typeId() external pure override returns (bytes32) {
        return TYPE_ID;
    }

    // --- Constructor ---
    /// @notice Constructor for the `CountryBlockListComplianceModule`.
    /// @dev When a contract inheriting from `CountryBlockListComplianceModule` is deployed, this constructor is called.
    /// It calls the constructor of `AbstractCountryComplianceModule` with the `_trustedForwarder` address.
    /// @param _trustedForwarder Address of the trusted forwarder for meta transactions
    constructor(address _trustedForwarder) AbstractCountryComplianceModule(_trustedForwarder) { }

    // --- Compliance Check --- (ISMARTComplianceModule Implementation)

    /// @inheritdoc ISMARTComplianceModule
    /// @notice Determines if a transfer to a recipient should be blocked based on their country's presence in the
    /// block-list.
    /// @dev This function implements the core compliance logic for the `CountryBlockListComplianceModule`.
    /// It is called by the `SMARTComplianceImplementation` before a token transfer.
    /// The logic is as follows:
    /// 1. Retrieve the recipient's (`_to`) country code using `_getUserCountry` (from
    /// `AbstractCountryComplianceModule`).
    /// 2. If the recipient has no identity or their country code is 0 (unknown), the function reverts with
    /// `ComplianceCheckFailed("Receiver identity unknown")` because this module requires known identity and country.
    /// 3. Decode the token-specific `blockedCountries` from `_params` (using `_decodeParams`).
    /// 4. Check if the recipient's country is present in this `blockedCountries` list. If yes,
    ///    the transfer is blocked, and the function reverts with `ComplianceCheckFailed("Receiver country blocked")`.
    /// 5. If the recipient's country is known and not found in the block-list, the transfer is allowed by this module
    /// (function completes without reverting).
    /// @param _token Address of the `ISMART` token contract for which the compliance check is being performed.
    /// @param _to Address of the recipient whose country is being checked against the block-list.
    /// @param _params ABI-encoded `uint16[]` of country codes blocked specifically for this `_token`.
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

        // Condition 1: This module requires known identity and country information.
        // If no identity or country is 0, the transfer is blocked.
        if (!hasIdentity || receiverCountry == 0) {
            revert ComplianceCheckFailed("Receiver identity unknown");
        }

        // Condition 2: Check the token-specific blocked countries provided in _params.
        uint16[] memory blockedCountries = _decodeParams(_params); // Decodes abi.encode(uint16[])
        uint256 blockedCountriesLength = blockedCountries.length;
        for (uint256 i = 0; i < blockedCountriesLength;) {
            if (blockedCountries[i] == receiverCountry) {
                revert ComplianceCheckFailed("Receiver country blocked");
            }
            unchecked {
                ++i;
            }
        }

        // If the country is known and not found in the block-list, the transfer is
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
