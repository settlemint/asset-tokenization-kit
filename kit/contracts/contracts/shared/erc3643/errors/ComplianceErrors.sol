// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

/// @dev Thrown when address is not a token bound to compliance contract.
error AddressNotATokenBoundToComplianceContract();

/// @dev Thrown when compliance is already bound.
error ComplianceAlreadyBound();

/// @dev Thrown when compliance is not bound.
error ComplianceNotBound();

/// @dev Thrown when coompliance is not suitable for binding to module.
/// @param module Address of the module.
error ComplianceNotSuitableForBindingToModule(address module);

/// @dev Thrown when exchange already tagged.
/// @param _exchangeID ONCHAINID of the exchange.
error ONCHAINIDAlreadyTaggedAsExchange(address _exchangeID);

/// @dev Thrown when exchange is not tagged.
/// @param _exchangeID ONCHAINID of the exchange.
error ONCHAINIDNotTaggedAsExchange(address _exchangeID);

/// @dev Thrown when call by otther than bound compliance.
error OnlyBoundComplianceCanCall();

/// @dev Thrown when call by other than compliance contract.
error OnlyComplianceContractCanCall();
