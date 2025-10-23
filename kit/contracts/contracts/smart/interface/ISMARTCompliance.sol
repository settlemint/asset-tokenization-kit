// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { SMARTComplianceModuleParamPair } from "./structs/SMARTComplianceModuleParamPair.sol";

/// @title ISMART Compliance Oracle Interface
/// @author SettleMint
/// @notice This interface defines the functions for a central compliance contract designed to work with SMART tokens.
/// Its primary role is to determine the legality of token operations (transfers, mints, burns) by orchestrating checks
/// across one or more registered compliance modules.
/// @dev The main compliance contract acts as a gateway or an oracle for compliance decisions.
/// It typically holds a list of active compliance modules and their specific parameters for a given token.
/// - `canTransfer`: A view function to pre-check if an operation is allowed.
/// - `transferred`, `created`, `destroyed`: Hooks called by the token *after* an operation has successfully occurred,
/// allowing modules to update state or log.
/// - Module Validation: Functions to validate compliance modules before they are added to a token's configuration.
/// This contract itself usually doesn't implement specific rules but delegates them to individual
/// `ISMARTComplianceModule` contracts.
/// This interface extends IERC165 for interface detection support.
interface ISMARTCompliance is IERC165 {
    // --- Errors ---
    /// @notice Error indicating that a provided address is not a valid compliance module.
    /// @dev This error is typically reverted when a contract address provided as a compliance module
    /// does not correctly implement the `ISMARTComplianceModule` interface, or if the interface check fails.
    error InvalidModule();

    /// @notice Error indicating that a provided address is not a valid compliance module.
    /// @dev This error is typically reverted when a contract address provided as a compliance module
    /// does not correctly implement the `ISMARTComplianceModule` interface, or if the interface check fails.
    error ZeroAddressNotAllowed();

    /// @notice Error thrown when a hook is invoked by a caller different from the `_token` parameter.
    /// @dev Used by `transferred`, `created`, and `destroyed` to enforce token-only invocation of hooks.
    /// @param sender The actual `msg.sender` that attempted to call the hook function.
    /// @param expectedToken The `_token` address that is expected to be the caller.
    error UnauthorizedCaller(address sender, address expectedToken);

    /// @notice Checks if a potential token operation (transfer, mint, or burn) is compliant with all configured rules.
    /// @dev This function MUST be a `view` function (it should not modify state).
    ///      It is called by the `ISMART` token contract *before* executing an operation.
    ///      The implementation should iterate through all active compliance modules associated with the `_token`,
    ///      calling each module's `canTransfer` function with the operation details and module-specific parameters.
    ///      If any module indicates non-compliance (e.g., by reverting), this `canTransfer` function should also
    /// revert.
    ///      If all modules permit the operation, it returns `true`.
    /// @param _token The address of the `ISMART` token contract initiating the compliance check.
    /// @param _from The address of the token sender. For mint operations, this will be `address(0)`.
    /// @param _to The address of the token recipient. For burn operations, this will be `address(0)`.
    /// @param _amount The quantity of tokens involved in the potential operation.
    /// @return isCompliant `true` if the operation is compliant with all rules, otherwise the function should revert.
    function canTransfer(
        address _token,
        address _from,
        address _to,
        uint256 _amount
    )
        external
        view
        returns (bool isCompliant);

    /// @notice Hook function called by the `ISMART` token contract *after* a token transfer has successfully occurred.
    /// @dev This function CAN modify state. It is intended for compliance modules that need to update their internal
    /// state
    ///      (e.g., transaction counters, volume trackers) or log information post-transfer.
    ///      The implementation should only be callable by the `_token` contract it is associated with.
    ///      It typically iterates through active compliance modules and calls their `transferred` hook.
    /// @param _token The address of the `ISMART` token contract where the transfer occurred.
    /// @param _from The address of the token sender.
    /// @param _to The address of the token recipient.
    /// @param _amount The quantity of tokens that were transferred.
    function transferred(address _token, address _from, address _to, uint256 _amount) external;

    /// @notice Hook function called by the `ISMART` token contract *after* new tokens have been successfully minted.
    /// @dev This function CAN modify state. It allows compliance modules to react to minting events.
    ///      The implementation should only be callable by the `_token` contract.
    ///      It typically iterates through active compliance modules and calls their `created` hook.
    /// @param _token The address of the `ISMART` token contract where the mint occurred.
    /// @param _to The address that received the newly minted tokens.
    /// @param _amount The quantity of tokens that were minted.
    function created(address _token, address _to, uint256 _amount) external;

    /// @notice Hook function called by the `ISMART` token contract *after* tokens have been successfully burned
    /// (destroyed).
    /// @dev This function CAN modify state. It allows compliance modules to react to burn events.
    ///      The implementation should only be callable by the `_token` contract.
    ///      It typically iterates through active compliance modules and calls their `destroyed` hook.
    /// @param _token The address of the `ISMART` token contract where the burn occurred.
    /// @param _from The address from which tokens were burned.
    /// @param _amount The quantity of tokens that were burned.
    function destroyed(address _token, address _from, uint256 _amount) external;

    // --- Compliance Module Validation (Views) ---

    /// @notice Validates a single potential compliance module and its proposed parameters.
    /// @dev This function is a `view` function and MUST NOT modify state.
    ///      It is typically called by an `ISMART` token contract (or a factory) when attempting to add a new compliance
    /// module
    ///      or update an existing module's parameters for that token.
    ///      The validation steps usually include:
    ///      1. Checking if `_module` is a non-zero address.
    ///      2. Verifying that the `_module` contract implements the `ISMARTComplianceModule` interface (e.g., via
    /// ERC165 `supportsInterface`).
    ///      3. Calling the `_module.validateParameters(_params)` function to ensure the provided `_params` are valid
    /// for that specific module.
    ///      If any validation step fails, this function should revert (e.g., `_module.validateParameters` itself might
    /// revert with `InvalidParameters`).
    /// @param _module The address of the compliance module contract to be validated.
    /// @param _params The ABI-encoded parameters to be validated against the `_module`.
    function isValidComplianceModule(address _module, bytes calldata _params) external view;

    /// @notice Validates an array of compliance module and parameter pairs.
    /// @dev This function is a `view` function and MUST NOT modify state.
    ///      It iterates through each `SMARTComplianceModuleParamPair` in the `_pairs` array
    ///      and calls `isValidComplianceModule` for each pair.
    ///      If any pair in the array fails validation (i.e., `isValidComplianceModule` reverts), this entire function
    /// call should revert.
    ///      This is useful for validating a complete set of modules and parameters in a single call, for instance, when
    /// initializing a token.
    /// @param _pairs An array of `SMARTComplianceModuleParamPair` structs, each containing a module address and its
    /// parameters.
    function areValidComplianceModules(SMARTComplianceModuleParamPair[] calldata _pairs) external view;
}
