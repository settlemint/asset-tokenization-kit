// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { SMARTSystemProxy } from "../SMARTSystemProxy.sol";
import { ISMARTSystem } from "../ISMARTSystem.sol";
import { SMARTComplianceImplementation } from "./SMARTComplianceImplementation.sol";
import { ComplianceImplementationNotSet } from "../SMARTSystemErrors.sol";

/// @title SMART Compliance Proxy Contract
/// @author SettleMint Tokenization Services
/// @notice This contract acts as an upgradeable proxy for the main SMART Compliance functionality.
/// @dev This proxy follows a pattern where the logic contract (implementation) can be changed without altering
/// the address that users and other contracts interact with. This is crucial for fixing bugs or adding features
/// to the compliance system post-deployment.
/// The address of the actual logic contract (`SMARTComplianceImplementation`) is retrieved from a central
/// `ISMARTSystem` contract. This means the `ISMARTSystem` contract governs which version of the compliance logic is
/// active.
/// This proxy inherits from `SMARTSystemProxy`.
contract SMARTComplianceProxy is SMARTSystemProxy {
    /// @notice Constructor for the `SMARTComplianceProxy`.
    /// @dev This function is called only once when the proxy contract is deployed.
    /// Its primary responsibilities are:
    /// 1. Store the `systemAddress` (handled by `SMARTSystemProxy` constructor).
    /// 2. Retrieve the initial compliance logic implementation address from the `ISMARTSystem` contract.
    /// 3. Ensure the retrieved implementation address is not the zero address.
    /// 4. Initialize the logic contract: It makes a `delegatecall` to the `initialize` function of the
    /// `SMARTComplianceImplementation` contract via `_performInitializationDelegatecall`.
    /// @param systemAddress The address of the `ISMARTSystem` contract. This system contract is responsible for
    /// providing the address of the actual compliance logic (implementation) contract.
    constructor(address systemAddress) SMARTSystemProxy(systemAddress) {
        ISMARTSystem system_ = _getSystem();

        address implementation = _getSpecificImplementationAddress(system_);

        // Prepare the data for the delegatecall to the implementation's initialize function.
        // This calls SMARTComplianceImplementation.initialize().
        bytes memory data = abi.encodeWithSelector(SMARTComplianceImplementation.initialize.selector);

        _performInitializationDelegatecall(implementation, data);
    }

    /// @dev Retrieves the implementation address for the Compliance module from the `ISMARTSystem` contract.
    /// @dev Reverts with `ComplianceImplementationNotSet` if the implementation address is zero.
    /// @param system The `ISMARTSystem` contract instance.
    /// @return The address of the `SMARTComplianceImplementation` contract.
    /// @inheritdoc SMARTSystemProxy
    function _getSpecificImplementationAddress(ISMARTSystem system) internal view override returns (address) {
        address implementation = system.complianceImplementation();
        if (implementation == address(0)) {
            revert ComplianceImplementationNotSet();
        }
        return implementation;
    }
}
