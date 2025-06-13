// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Interface imports
import { ISMART } from "../interface/ISMART.sol";
import { ISMARTIdentityRegistry } from "../interface/ISMARTIdentityRegistry.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

// Base modules
import { AbstractAddressListComplianceModule } from "./AbstractAddressListComplianceModule.sol";

/// @title Abstract Base for Identity-Specific Compliance Modules
/// @author SettleMint Tokenization Services
/// @notice This abstract contract extends `AbstractAddressListComplianceModule` to provide common functionalities
/// for compliance modules that base their rules on investor identity contracts.
abstract contract AbstractIdentityComplianceModule is AbstractAddressListComplianceModule {
    constructor(address _trustedForwarder) AbstractAddressListComplianceModule(_trustedForwarder) { }

    function _getIdentity(address _token, address _user) internal view returns (bool hasIdentity, IIdentity identity) {
        ISMARTIdentityRegistry identityRegistry = ISMART(_token).identityRegistry();
        hasIdentity = identityRegistry.contains(_user);
        if (!hasIdentity) {
            return (false, IIdentity(address(0)));
        }
        identity = identityRegistry.identity(_user);
        return (true, identity);
    }

    function _setIdentityInGlobalList(address _identity, bool _inList) internal {
        _setAddressInGlobalList(_identity, _inList);
    }

    function _isIdentityInGlobalList(address _identity) internal view returns (bool) {
        return _isAddressInGlobalList(_identity);
    }

    function _getGlobalIdentitiesList() internal view returns (address[] memory) {
        return _getGlobalAddressesList();
    }
}
