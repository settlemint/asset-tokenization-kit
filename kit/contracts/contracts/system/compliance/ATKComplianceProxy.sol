// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ATKSystemProxy } from "../ATKSystemProxy.sol";
import { IATKSystem } from "../IATKSystem.sol";
import { ATKComplianceImplementation } from "./ATKComplianceImplementation.sol";
import { ComplianceImplementationNotSet } from "../ATKSystemErrors.sol";

/// @title SMART Compliance Proxy Contract
/// @author SettleMint Tokenization Services
/// @notice This contract acts as an upgradeable proxy for the main SMART Compliance functionality.
/// @dev This proxy follows a pattern where the logic contract (implementation) can be changed without altering
/// the address that users and other contracts interact with. This is crucial for fixing bugs or adding features
/// to the compliance system post-deployment.
/// The address of the actual logic contract (`SMARTComplianceImplementation`) is retrieved from a central
/// `IATKSystem` contract. This means the `IATKSystem` contract governs which version of the compliance logic is
/// active.
/// This proxy inherits from `SMARTSystemProxy`.
contract ATKComplianceProxy is ATKSystemProxy {
    /// @notice Constructor for the `SMARTComplianceProxy`.
    /// @dev This function is called only once when the proxy contract is deployed.
    /// Its primary responsibilities are:
    /// 1. Store the `systemAddress` (handled by `ATKSystemProxy` constructor).
    /// 2. Retrieve the initial compliance logic implementation address from the `IATKSystem` contract.
    /// 3. Ensure the retrieved implementation address is not the zero address.
    /// 4. Initialize the logic contract: It makes a `delegatecall` to the `initialize` function of the
    /// `ATKComplianceImplementation` contract via `_performInitializationDelegatecall`.
    /// @param systemAddress The address of the `IATKSystem` contract. This system contract is responsible for
    /// providing the address of the actual compliance logic (implementation) contract.
    /// @param initialAdmins The addresses of the initial admins.
    constructor(address systemAddress, address[] memory initialAdmins) ATKSystemProxy(systemAddress) {
        IATKSystem system_ = _getSystem();

        address implementation = _getSpecificImplementationAddress(system_);

        // Prepare the data for the delegatecall to the implementation's initialize function.
        // This calls ATKComplianceImplementation.initialize().
        bytes memory data = abi.encodeWithSelector(ATKComplianceImplementation.initialize.selector, initialAdmins);

        _performInitializationDelegatecall(implementation, data);
    }

    /// @dev Retrieves the implementation address for the Compliance module from the `IATKSystem` contract.
    /// @dev Reverts with `ComplianceImplementationNotSet` if the implementation address is zero.
    /// @param system The `IATKSystem` contract instance.
    /// @return The address of the `ATKComplianceImplementation` contract.
    /// @inheritdoc ATKSystemProxy
    function _getSpecificImplementationAddress(IATKSystem system) internal view override returns (address) {
        address implementation = system.complianceImplementation();
        if (implementation == address(0)) {
            revert ComplianceImplementationNotSet();
        }
        return implementation;
    }
}
