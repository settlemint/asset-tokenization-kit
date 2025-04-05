// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

/// @dev Thrown when account already has role.
error AccountAlreadyHasRole();

/// @dev Thrown when account doesn't have role.
error AccountDoesNotHaveRole();

/// @dev Thrown when caller doesn't have agent role.
error CallerDoesNotHaveAgentRole();

/// @dev Thrown when sender is not admin.
error SenderIsNotAdmin();

/// @dev Thrown when sender is not claim registry manager.
error SenderIsNotClaimRegistryManager();

/// @dev Thrown when sender is not comp^liance manager.
error SenderIsNotComplianceManager();

/// @dev Thrown when sender is not complikance setter.
error SenderIsNotComplianceSetter();

/// @dev Thrown when sender is not freezer.
error SenderIsNotFreezer();

/// @dev Thrown when sender is not issuer registry manager.
error SenderIsNotIssuersRegistryManager();

/// @dev Thrown when sender is not recovery agent.
error SenderIsNotRecoveryAgent();

/// @dev Thrown when sender is not registry address setter.
error SenderIsNotRegistryAddressSetter();

/// @dev Thrown when sender is not supply modifier.
error SenderIsNotSupplyModifier();

/// @dev Thrown when sender is not token information manager.
error SenderIsNotTokenInformationManager();

/// @dev Thrown when sender is not transfer manager.
error SenderIsNotTransferManager();

/// @dev Thrown when sender is not whitelist manager.
error SenderIsNotWhiteListManager();
