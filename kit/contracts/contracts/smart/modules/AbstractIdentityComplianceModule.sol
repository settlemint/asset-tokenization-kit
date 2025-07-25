// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Interface imports
import { ISMART } from "../interface/ISMART.sol";
import { ISMARTIdentityRegistry } from "../interface/ISMARTIdentityRegistry.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

// Base modules
import { AbstractAddressListComplianceModule } from "./AbstractAddressListComplianceModule.sol";

/// @title Abstract Base for Identity-Specific Compliance Modules
/// @author SettleMint
/// @notice This abstract contract extends `AbstractAddressListComplianceModule` to provide common functionalities
/// for compliance modules that base their rules on investor identity contracts.
abstract contract AbstractIdentityComplianceModule is AbstractAddressListComplianceModule {
    /// @notice Initializes the identity compliance module with a trusted forwarder
    /// @param _trustedForwarder Address of the trusted forwarder for meta transactions
    constructor(address _trustedForwarder) AbstractAddressListComplianceModule(_trustedForwarder) { }

    /// @notice Retrieves a user's identity contract from the token's identity registry
    /// @param _token The token contract address
    /// @param _user The user address to check
    /// @return hasIdentity True if the user has a registered identity
    /// @return identity The user's identity contract interface
    function _getIdentity(address _token, address _user) internal view returns (bool hasIdentity, IIdentity identity) {
        ISMARTIdentityRegistry identityRegistry = ISMART(_token).identityRegistry();
        hasIdentity = identityRegistry.contains(_user);
        if (!hasIdentity) {
            return (false, IIdentity(address(0)));
        }
        identity = identityRegistry.identity(_user);
        return (true, identity);
    }

    /// @notice Sets or removes an identity address in the global list
    /// @param _identity The identity address to update
    /// @param _inList True to add the identity, false to remove it
    function _setIdentityInGlobalList(address _identity, bool _inList) internal {
        _setAddressInGlobalList(_identity, _inList);
    }

    /// @notice Checks if an identity address is in the global list
    /// @param _identity The identity address to check
    /// @return True if the identity is in the global list
    function _isIdentityInGlobalList(address _identity) internal view returns (bool) {
        return _isAddressInGlobalList(_identity);
    }

    /// @notice Returns all identity addresses in the global list
    /// @return Array of identity addresses in the global list
    function _getGlobalIdentitiesList() internal view returns (address[] memory) {
        return _getGlobalAddressesList();
    }
}
