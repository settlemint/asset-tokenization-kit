// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base modules
import { AbstractComplianceModule } from "./AbstractComplianceModule.sol";

// Interface imports

/// @title Abstract Base for Address-List-Based Compliance Modules
/// @author SettleMint
/// @notice This abstract contract extends `AbstractComplianceModule` to provide common functionalities
/// for compliance modules that base their rules on a managed list of wallet addresses.
/// @dev Key features:
/// - **Stateless Design**: Modules are pure logic units. All address lists come from external configuration.
/// - **Standardized Parameters**: The `_params` data is expected to be `abi.encode(address[] memory addresses)`.
/// - **Helper Functions**: Provides `_decodeParams` to easily decode the address list from `_params`.
abstract contract AbstractAddressListComplianceModule is AbstractComplianceModule {

    /// @notice Initializes the address list compliance module with a trusted forwarder
    /// @param _trustedForwarder Address of the trusted forwarder for meta transactions
    constructor(address _trustedForwarder) AbstractComplianceModule(_trustedForwarder) { }

    /// @notice Validates the parameters for address list-based compliance
    /// @dev Validates the parameters for address list-based compliance, expecting an array of addresses.
    /// @param _params The ABI-encoded parameters, expected to be `(address[])`.
    function validateParameters(bytes calldata _params) public view virtual override {
        abi.decode(_params, (address[]));
    }

    /// @notice Decodes the ABI-encoded parameters into an array of addresses
    /// @dev Decodes the ABI-encoded parameters into an array of addresses.
    /// @param _params The ABI-encoded parameters.
    /// @return additionalAddresses An array of addresses extracted from the parameters.
    function _decodeParams(bytes calldata _params) internal pure returns (address[] memory additionalAddresses) {
        return abi.decode(_params, (address[]));
    }
}