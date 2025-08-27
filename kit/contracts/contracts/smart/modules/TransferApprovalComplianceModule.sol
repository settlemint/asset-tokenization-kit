// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base modules
import { AbstractComplianceModule } from "./AbstractComplianceModule.sol";
import { ISMART } from "../interface/ISMART.sol";
import { ISMARTIdentityRegistry } from "../interface/ISMARTIdentityRegistry.sol";

// Struct imports
import { ExpressionNode } from "../interface/structs/ExpressionNode.sol";
import { SMARTComplianceModuleParamPair } from "../interface/structs/SMARTComplianceModuleParamPair.sol";

/// @title Transfer Approval Compliance Module
/// @author SettleMint
/// @notice Enforces pre-approved, identity-bound transfers with explicit on-chain authorization
/// @dev This module requires explicit approval before transfers can execute. Approvals are bound to
///      identities (not wallet addresses) and can be configured as one-time use with expiry times.
///      Supports exemptions for specific identity claims (e.g., QII, professional investor).
///      Essential for regulated securities where issuers or licensed intermediaries must control
///      secondary sales and prevent circumvention of compliance requirements.
/// @custom:security-contact security@settlemint.com
contract TransferApprovalComplianceModule is AbstractComplianceModule {
    /// @notice Unique type identifier for this compliance module
    /// @dev Used by the compliance system to identify and manage module instances
    bytes32 public constant override typeId = keccak256("TransferApprovalComplianceModule");

    // --- Custom Errors ---

    /// @notice Error thrown when module is not found in token's compliance modules
    error ModuleNotFound();

    /// @notice Error thrown when both parties don't have registered identities
    error IdentitiesRequired();

    /// @notice Error thrown when transfer requires pre-approval from authorized identity
    error ApprovalRequired();

    /// @notice Error thrown when transfer approval has expired
    error ApprovalExpired();

    /// @notice Error thrown when transfer approval has already been used
    error ApprovalAlreadyUsed();

    /// @notice Error thrown when caller doesn't have a registered identity
    error CallerMustHaveIdentity();

    /// @notice Error thrown when caller is not an authorized approval authority
    error UnauthorizedApprover();

    /// @notice Error thrown when no approval found to revoke or caller not authorized
    error NoApprovalToRevoke();

    /// @notice Configuration parameters for transfer approval enforcement
    /// @dev This struct defines how transfer approvals are managed for a token
    struct Config {
        /// @notice Identity addresses allowed to grant approvals for this token
        address[] approvalAuthorities;
        /// @notice Whether exemptions based on identity claims are allowed
        bool allowExemptions;
        /// @notice Expression defining exemption logic (e.g., [TOPIC_QII])
        ExpressionNode[] exemptionExpression;
        /// @notice Default expiry for approvals in seconds
        uint256 approvalExpiry;
        /// @notice Whether approvals are single-use (one-time execution)
        bool oneTimeUse; // set to true for regulatory compliance
    }

    /// @notice Approval record for identity-bound transfer authorizations
    struct ApprovalRecord {
        /// @notice Timestamp when approval expires
        uint256 expiry;
        /// @notice Whether this approval has been used (for one-time use approvals)
        bool used;
        /// @notice Identity address that granted this approval
        address approverIdentity;
    }

    /// @notice Stores approval records for specific transfer requests
    /// @dev Maps from (token, fromIdentity, toIdentity, value) to approval record
    mapping(address => mapping(address => mapping(address => mapping(uint256 => ApprovalRecord))))
        private approvals;


    // --- Events ---

    /// @notice Emitted when a transfer is pre-approved
    /// @param token The token address for which the transfer was approved
    /// @param fromIdentity The identity address from which tokens will be transferred
    /// @param toIdentity The identity address to which tokens will be transferred
    /// @param value The amount of tokens approved for transfer
    /// @param approverIdentity The identity address that provided the approval
    /// @param expiry The timestamp when this approval expires
    event TransferApproved(
        address indexed token,
        address indexed fromIdentity,
        address indexed toIdentity,
        uint256 value,
        address approverIdentity,
        uint256 expiry
    );

    /// @notice Emitted when a transfer approval is consumed (used)
    /// @param token The token address for which the approval was consumed
    /// @param fromIdentity The identity address from which tokens were transferred
    /// @param toIdentity The identity address to which tokens were transferred
    /// @param value The amount of tokens for which approval was consumed
    /// @param approverIdentity The identity address that originally provided the approval
    event TransferApprovalConsumed(
        address indexed token,
        address indexed fromIdentity,
        address indexed toIdentity,
        uint256 value,
        address approverIdentity
    );

    /// @notice Emitted when a transfer approval is revoked
    /// @param token The token address for which the approval was revoked
    /// @param fromIdentity The identity address from which tokens were to be transferred
    /// @param toIdentity The identity address to which tokens were to be transferred
    /// @param value The amount of tokens for which approval was revoked
    /// @param approverIdentity The identity address that revoked the approval
    event TransferApprovalRevoked(
        address indexed token,
        address indexed fromIdentity,
        address indexed toIdentity,
        uint256 value,
        address approverIdentity
    );

    // --- Constructor ---

    /// @notice Initializes the TransferApprovalComplianceModule
    /// @dev Sets up the module with meta-transaction support via trusted forwarder
    /// @param _trustedForwarder Address of the trusted forwarder for meta transactions (can be zero address if not used)
    constructor(address _trustedForwarder) AbstractComplianceModule(_trustedForwarder) { }

    // --- Functions ---

    /// @inheritdoc AbstractComplianceModule
    /// @notice Validates that a transfer has the required pre-approval or qualifies for exemption
    /// @dev Checks if the transfer tuple (fromIdentity, toIdentity, token, amount) exists in the
    ///      approval registry or if the recipient qualifies for exemption via identity claims
    /// @param _token The address of the token being transferred
    /// @param _from The address from which tokens are being transferred
    /// @param _to The address to which tokens are being transferred
    /// @param _value The amount of tokens being transferred
    /// @param _params ABI-encoded Config containing the compliance configuration
    /// @custom:throws ComplianceCheckFailed when the transfer lacks required approval or exemption
    function canTransfer(
        address _token,
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _params
    )
        external
        view
        override
    {
        // Skip validation for burns and mints
        if (_to == address(0) || _from == address(0)) {
            return;
        }

        Config memory config = abi.decode(_params, (Config));

        // Check for exemptions first (if enabled) - check the wallet address, not identity
        if (config.allowExemptions && _qualifiesForExemption(_token, _to, config.exemptionExpression)) {
            return; // Transfer allowed due to exemption
        }

        // Get identities for from and to addresses
        address fromIdentity = _getIdentityAddress(_token, _from);
        address toIdentity = _getIdentityAddress(_token, _to);

        // If either party doesn't have an identity, block the transfer
        if (fromIdentity == address(0) || toIdentity == address(0)) {
            revert IdentitiesRequired();
        }

        // Check if there's a valid approval for this transfer
        ApprovalRecord storage record = approvals[_token][fromIdentity][toIdentity][_value];

        // Verify approval exists and is valid
        if (record.expiry == 0) {
            revert ApprovalRequired();
        }

        // Check if approval has expired
        if (block.timestamp > record.expiry) {
            revert ApprovalExpired();
        }

        // Check if approval has already been used (for one-time use)
        if (config.oneTimeUse && record.used) {
            revert ApprovalAlreadyUsed();
        }

        // All checks passed - transfer is approved
    }

    /// @inheritdoc AbstractComplianceModule
    /// @notice Consumes approval for completed transfer (marks as used for one-time approvals)
    /// @dev Called after tokens are transferred to consume the approval if it was one-time use
    /// @param _token The address of the token being transferred
    /// @param _from The address from which tokens were transferred
    /// @param _to The address to which tokens were transferred
    /// @param _value The amount of tokens transferred
    /// @param _params ABI-encoded Config containing the compliance configuration
    function transferred(
        address _token,
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _params
    )
        external
        override
        onlyTokenOrCompliance(_token)
    {
        // Skip for burns and mints
        if (_from == address(0) || _to == address(0)) {
            return;
        }

        Config memory config = abi.decode(_params, (Config));

        // Only process if one-time use is enabled
        if (!config.oneTimeUse) {
            return;
        }

        // Get identities for from and to addresses
        address fromIdentity = _getIdentityAddress(_token, _from);
        address toIdentity = _getIdentityAddress(_token, _to);

        // Skip if either party doesn't have an identity
        if (fromIdentity == address(0) || toIdentity == address(0)) {
            return;
        }

        // Mark the approval as used if it exists
        ApprovalRecord storage record = approvals[_token][fromIdentity][toIdentity][_value];
        if (record.expiry > 0 && !record.used) {
            record.used = true;
            emit TransferApprovalConsumed(_token, fromIdentity, toIdentity, _value, record.approverIdentity);
        }
    }



    /// @notice Returns the human-readable name of this compliance module
    /// @dev Used for display purposes in compliance management interfaces
    /// @return The descriptive name of the compliance module
    function name() external pure override returns (string memory) {
        return "Transfer Approval Compliance Module";
    }

    /// @notice Validates configuration parameters before module deployment
    /// @dev Ensures all required parameters are properly set and within acceptable ranges
    /// @param _params ABI-encoded Config struct to validate
    /// @custom:throws InvalidParameters when configuration parameters are invalid
    function validateParameters(bytes calldata _params) external pure override {
        Config memory config = abi.decode(_params, (Config));

        // Must have at least one approval authority
        if (config.approvalAuthorities.length == 0) {
            revert InvalidParameters("Must specify at least one approval authority");
        }

        // Validate that approval authorities are not zero addresses and are registered identities
        for (uint256 i = 0; i < config.approvalAuthorities.length; ++i) {
            if (config.approvalAuthorities[i] == address(0)) {
                revert InvalidParameters("Approval authorities cannot be zero address");
            }
        }

        // Check for duplicate approval authorities
        if (config.approvalAuthorities.length > 1) {
            for (uint256 i = 0; i < config.approvalAuthorities.length - 1; ++i) {
                for (uint256 j = i + 1; j < config.approvalAuthorities.length; ++j) {
                    if (config.approvalAuthorities[i] == config.approvalAuthorities[j]) {
                        revert InvalidParameters("Duplicate approval authorities are not allowed");
                    }
                }
            }
        }

        // Approval expiry must be reasonable (not zero, not too long)
        if (config.approvalExpiry == 0) {
            revert InvalidParameters("Approval expiry must be greater than zero");
        }

        // Maximum 1 year expiry to prevent indefinite approvals
        if (config.approvalExpiry > 365 days) {
            revert InvalidParameters("Approval expiry cannot exceed 365 days");
        }
    }

    /// @notice Pre-approves a specific identity-to-identity transfer
    /// @dev Allows an authorized identity to approve a future transfer. The approval is specific
    ///      to the exact transfer parameters and bound to identities, not wallet addresses.
    /// @param _token The token address for the transfer to approve
    /// @param _fromIdentity The identity address from which tokens will be transferred
    /// @param _toIdentity The identity address to which tokens will be transferred
    /// @param _value The amount of tokens to approve for transfer
    /// @custom:throws ComplianceCheckFailed when the caller is not an authorized approval authority
    function approveTransfer(
        address _token,
        address _fromIdentity,
        address _toIdentity,
        uint256 _value
    )
        external
    {
        // Get the module configuration from the token
        bytes memory params = _getModuleParameters(_token);
        Config memory config = abi.decode(params, (Config));

        // Get the caller's identity address
        address callerIdentity = _getIdentityAddress(_token, _msgSender());
        if (callerIdentity == address(0)) {
            revert CallerMustHaveIdentity();
        }

        // Check if caller is an authorized approval authority
        bool isAuthorized = false;
        for (uint256 i = 0; i < config.approvalAuthorities.length; ++i) {
            if (config.approvalAuthorities[i] == callerIdentity) {
                isAuthorized = true;
                break;
            }
        }

        if (!isAuthorized) {
            revert UnauthorizedApprover();
        }

        // Calculate expiry timestamp
        uint256 expiry = block.timestamp + config.approvalExpiry;

        // Store the approval
        approvals[_token][_fromIdentity][_toIdentity][_value] = ApprovalRecord({
            expiry: expiry,
            used: false,
            approverIdentity: callerIdentity
        });

        emit TransferApproved(_token, _fromIdentity, _toIdentity, _value, callerIdentity, expiry);
    }

    /// @notice Revokes a previously granted transfer approval
    /// @dev Allows an approval authority to revoke their previously granted approval
    /// @param _token The token address for the transfer approval to revoke
    /// @param _fromIdentity The identity address from which tokens were to be transferred
    /// @param _toIdentity The identity address to which tokens were to be transferred
    /// @param _value The amount of tokens for which to revoke approval
    function revokeApproval(
        address _token,
        address _fromIdentity,
        address _toIdentity,
        uint256 _value
    )
        external
    {
        // Get the caller's identity address
        address callerIdentity = _getIdentityAddress(_token, _msgSender());
        if (callerIdentity == address(0)) {
            revert CallerMustHaveIdentity();
        }

        ApprovalRecord storage record = approvals[_token][_fromIdentity][_toIdentity][_value];

        // Check if approval exists and was granted by the caller
        if (record.expiry == 0 || record.approverIdentity != callerIdentity) {
            revert NoApprovalToRevoke();
        }

        // Clear the approval
        delete approvals[_token][_fromIdentity][_toIdentity][_value];

        emit TransferApprovalRevoked(_token, _fromIdentity, _toIdentity, _value, callerIdentity);
    }

    /// @notice Checks if a specific transfer has been approved
    /// @dev Public view function to check approval status
    /// @param _token The token address
    /// @param _fromIdentity The identity address from which tokens would be transferred
    /// @param _toIdentity The identity address to which tokens would be transferred
    /// @param _value The amount of tokens
    /// @return approval The approval record containing expiry, used status, and approver identity
    function getApproval(
        address _token,
        address _fromIdentity,
        address _toIdentity,
        uint256 _value
    )
        external
        view
        returns (ApprovalRecord memory approval)
    {
        return approvals[_token][_fromIdentity][_toIdentity][_value];
    }


    // --- Internal Functions ---

    /// @notice Gets the module parameters for this module from the token's compliance modules list
    /// @dev Retrieves the configuration that was set when this module was added to the token
    /// @param _token The token address
    /// @return The encoded parameters for this module
    function _getModuleParameters(address _token) private view returns (bytes memory) {
        ISMART smartToken = ISMART(_token);
        SMARTComplianceModuleParamPair[] memory modules = smartToken.complianceModules();

        // Find this module in the list and return its parameters
        for (uint256 i = 0; i < modules.length; i++) {
            if (modules[i].module == address(this)) {
                return modules[i].params;
            }
        }

        // This should never happen if the module is properly configured
        revert ModuleNotFound();
    }

    /// @notice Gets the identity contract address for a wallet address
    /// @dev Looks up the identity associated with a wallet address via the identity registry
    /// @param _token The token address (used to get identity registry)
    /// @param _wallet The wallet address to look up
    /// @return The identity contract address, or address(0) if not found
    function _getIdentityAddress(address _token, address _wallet) private view returns (address) {
        ISMART smartToken = ISMART(_token);
        ISMARTIdentityRegistry identityRegistry = ISMARTIdentityRegistry(smartToken.identityRegistry());

        if (!identityRegistry.contains(_wallet)) {
            return address(0);
        }

        return address(identityRegistry.identity(_wallet));
    }

    /// @notice Checks if a wallet qualifies for transfer exemption
    /// @dev Uses the identity registry to evaluate the exemption expression against the wallet
    /// @param _token The token address (used to get identity registry)
    /// @param _wallet The wallet address to check
    /// @param exemptionExpression The ExpressionNode array defining exemption requirements
    /// @return True if the wallet qualifies for exemption
    function _qualifiesForExemption(
        address _token,
        address _wallet,
        ExpressionNode[] memory exemptionExpression
    )
        private
        view
        returns (bool)
    {
        // Empty exemption expression means no exemptions
        if (exemptionExpression.length == 0) {
            return false;
        }

        // Get the identity registry from the token
        ISMART smartToken = ISMART(_token);
        ISMARTIdentityRegistry identityRegistry = ISMARTIdentityRegistry(smartToken.identityRegistry());

        // Check if the wallet is in the registry and has the required claims
        if (!identityRegistry.contains(_wallet)) {
            return false;
        }

        // Use the identity registry to evaluate the exemption expression against the wallet
        try identityRegistry.isVerified(_wallet, exemptionExpression) returns (bool result) {
            return result;
        } catch {
            return false;
        }
    }
}