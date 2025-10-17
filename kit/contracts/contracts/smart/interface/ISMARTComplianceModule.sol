// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IWithTypeIdentifier } from "./IWithTypeIdentifier.sol";

/// @title ISMARTComplianceModule Interface
/// @author SettleMint
/// @notice This interface defines the standard functions that all individual compliance modules within the SMART
/// protocol
///         must implement. Compliance modules are specialized contracts that enforce specific rules or actions
///         related to token transfers, minting, and burning. They are managed by a central `ISMARTCompliance` contract.
/// @dev Each compliance module can be thought of as a pluggable rule set. For example, one module might enforce
///      KYC/AML checks, another might restrict transfers to certain geographic locations, and yet another might
///      impose daily transfer limits. This modular design allows for flexible and extensible compliance frameworks.
///      This interface inherits from IERC165 for contract interface detection (supportsInterface).
interface ISMARTComplianceModule is IERC165, IWithTypeIdentifier {
    // --- Custom Errors ---

    /// @notice Emitted when a compliance check performed by the `canTransfer` function fails.
    /// @dev This error indicates that a proposed token transfer, mint, or burn operation violates
    ///      the rules enforced by this specific compliance module.
    /// @param reason A descriptive string explaining why the compliance check failed (e.g., "Sender not allow listed",
    /// "Transfer exceeds daily limit").
    error ComplianceCheckFailed(string reason);

    /// @notice Emitted by the `validateParameters` function if the provided configuration parameters are invalid for
    /// this module.
    /// @dev This error signals that the data supplied to configure or update the module is malformed, out of expected
    /// range,
    ///      or otherwise unsuitable for the module's intended operation.
    /// @param reason A descriptive string explaining why the parameters are considered invalid (e.g., "Invalid country
    /// code format", "Limit parameter cannot be zero").
    error InvalidParameters(string reason);

    // --- Core Functions ---

    /**
     * @notice Checks if a potential token transfer (including mints and burns) complies with the rules of this module.
     * @dev This is a critical view-only function called by the main `ISMARTCompliance` contract before any token
     * movement.
     *      It MUST NOT modify the contract state. If the proposed action is non-compliant, this function MUST revert,
     *      ideally with the `ComplianceCheckFailed` error, providing a reason for the failure.
     *      For mint operations, `_from` will be `address(0)`.
     *      For burn/redeem operations, `_to` will be `address(0)`.
     * @param _token The address of the ISMART token contract for which this compliance check is being performed.
     * @param _from The address of the account initiating the transfer (sender). For token minting, this will be the
     * zero address (`address(0)`).
     * @param _to The address of the account receiving the transfer (recipient). For token burning/redeeming, this will
     * be the zero address (`address(0)`).
     * @param _value The amount of tokens involved in the potential transfer.
     * @param _params Token-specific configuration parameters that were set for this module instance when it was added
     * to the token.
     *                These parameters allow the module's behavior to be tailored for different tokens or scenarios.
     */
    function canTransfer(address _token, address _from, address _to, uint256 _value, bytes calldata _params)
        external
        view;

    /**
     * @notice Called by the main `ISMARTCompliance` contract immediately AFTER a token transfer has successfully
     * occurred.
     * @dev This function allows the compliance module to react to a completed transfer. It CAN modify the module's
     * state,
     *      for example, to update usage counters, record transaction details, or adjust dynamic limits.
     *      This function is part of the post-transfer hook mechanism.
     * @param _token The address of the ISMART token contract where the transfer occurred.
     * @param _from The address of the account that sent the tokens.
     * @param _to The address of the account that received the tokens.
     * @param _value The amount of tokens that were transferred.
     * @param _params Token-specific configuration parameters for this module instance.
     */
    function transferred(address _token, address _from, address _to, uint256 _value, bytes calldata _params) external;

    /**
     * @notice Called by the main `ISMARTCompliance` contract immediately AFTER a token mint operation has successfully
     * occurred.
     * @dev This function allows the compliance module to react to a completed mint. It CAN modify the module's state.
     *      For example, it could update total supply trackers specific to this module or log minting events.
     *      This is part of the post-creation hook mechanism.
     * @param _token The address of the ISMART token contract where tokens were minted.
     * @param _to The address of the account that received the newly minted tokens.
     * @param _value The amount of tokens that were minted.
     * @param _params Token-specific configuration parameters for this module instance.
     */
    function created(address _token, address _to, uint256 _value, bytes calldata _params) external;

    /**
     * @notice Called by the main `ISMARTCompliance` contract immediately AFTER a token burn or redeem operation has
     * successfully occurred.
     * @dev This function allows the compliance module to react to a completed burn/redeem. It CAN modify the module's
     * state.
     *      For instance, it might update records related to token destruction or adjust available quotas.
     *      This is part of the post-destruction hook mechanism.
     * @param _token The address of the ISMART token contract from which tokens were burned.
     * @param _from The address of the account whose tokens were burned.
     * @param _value The amount of tokens that were burned.
     * @param _params Token-specific configuration parameters for this module instance.
     */
    function destroyed(address _token, address _from, uint256 _value, bytes calldata _params) external;

    /**
     * @notice Validates the format and content of ABI-encoded configuration parameters intended for this module.
     * @dev This view-only function is called by the ISMART token contract when a compliance module is first added
     *      (via `addComplianceModule`) or when its existing parameters are updated (via
     * `setParametersForComplianceModule`).
     *      It MUST NOT modify the contract state. If the provided `_params` are not valid or correctly formatted for
     * this
     *      specific module, this function MUST revert, ideally with the `InvalidParameters` error.
     *      The module itself is responsible for defining what constitutes valid parameters.
     * @param _params The ABI-encoded byte string containing the configuration parameters to be validated.
     */
    function validateParameters(bytes calldata _params) external view;

    /**
     * @notice Returns a human-readable name for the compliance module.
     * @dev This function MUST be a `pure` function, meaning it does not read from or modify the contract state.
     *      The name helps identify the module's purpose (e.g., "KYC Module", "Country Restriction Module").
     * @return A string representing the name of the compliance module.
     */
    function name() external pure returns (string memory);
}
