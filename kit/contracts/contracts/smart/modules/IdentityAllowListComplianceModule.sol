// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base modules
import { AbstractIdentityComplianceModule } from "./AbstractIdentityComplianceModule.sol";

// Interface imports
import { ISMARTComplianceModule } from "../interface/ISMARTComplianceModule.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

/// @title Identity Allow-List Compliance Module
/// @author SettleMint Tokenization Services
/// @notice This compliance module restricts token transfers *to* users unless their identity is on an approved list.
contract IdentityAllowListComplianceModule is AbstractIdentityComplianceModule {
    bytes32 public constant override typeId = keccak256("IdentityAllowListComplianceModule");

    event GlobalAllowedIdentitiesUpdated(address[] identityAddresses, bool indexed allowed);

    constructor(address _trustedForwarder) AbstractIdentityComplianceModule(_trustedForwarder) { }

    function setGlobalAllowedIdentities(
        address[] calldata _identityAddresses,
        bool _allow
    )
        external
        onlyRole(GLOBAL_LIST_MANAGER_ROLE)
    {
        uint256 identityAddressesLength = _identityAddresses.length;
        for (uint256 i = 0; i < identityAddressesLength;) {
            _setIdentityInGlobalList(_identityAddresses[i], _allow);
            unchecked {
                ++i;
            }
        }
        emit GlobalAllowedIdentitiesUpdated(_identityAddresses, _allow);
    }

    function isGloballyAllowed(address _identityAddress) public view virtual returns (bool) {
        return _isIdentityInGlobalList(_identityAddress);
    }

    function getGlobalAllowedIdentities() external view virtual returns (address[] memory) {
        return _getGlobalIdentitiesList();
    }

    function canTransfer(
        address _token,
        address, /* _from - unused */
        address _to,
        uint256, /* _value - unused */
        bytes calldata _params
    )
        external
        view
        virtual
        override
    {
        (bool hasIdentity, IIdentity receiverIdentity) = _getIdentity(_token, _to);

        if (!hasIdentity || address(receiverIdentity) == address(0)) {
            revert ComplianceCheckFailed("Receiver identity unknown");
        }

        if (isGloballyAllowed(address(receiverIdentity))) {
            return;
        }

        address[] memory additionalAllowedIdentities = _decodeParams(_params);
        uint256 additionalAllowedIdentitiesLength = additionalAllowedIdentities.length;
        for (uint256 i = 0; i < additionalAllowedIdentitiesLength;) {
            if (additionalAllowedIdentities[i] == address(receiverIdentity)) {
                return;
            }
            unchecked {
                ++i;
            }
        }

        revert ComplianceCheckFailed("Receiver identity not in allowlist");
    }

    function name() external pure virtual override returns (string memory) {
        return "Identity AllowList Compliance Module";
    }
}
