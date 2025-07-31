// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title SMARTComplianceModuleParamPair
/// @author SettleMint
/// @notice This struct represents a key-value pair, specifically designed to link a compliance module
///         (identified by its Ethereum address) with its configuration parameters (encoded as bytes).
/// @dev This structure is crucial for initializing or updating compliance modules within the SMART protocol.
///      The `module` field stores the address of the compliance module contract.
///      The `params` field stores the abi-encoded parameters required by the specific module for its setup or
/// operation.
///      For example, a module might require a list of allowed countries, which would be encoded and stored in `params`.
struct SMARTComplianceModuleParamPair {
    /// @notice The Ethereum address of the compliance module contract.
    /// @dev This address points to a deployed contract that implements compliance logic (e.g., KYC checks, country
    /// restrictions).
    address module;
    /// @notice The ABI-encoded configuration parameters for the specified compliance module.
    /// @dev These parameters are specific to each module. For instance, they could include settings like
    ///      allow listed addresses, country codes, or operational flags. The module itself is responsible for
    ///      decoding and interpreting these parameters.
    bytes params;
}
