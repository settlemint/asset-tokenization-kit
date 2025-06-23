// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base modules
import { AbstractIdentityComplianceModule } from "./AbstractIdentityComplianceModule.sol";

// Interface imports
import { ISMARTComplianceModule } from "../interface/ISMARTComplianceModule.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

/// @title Identity Block-List Compliance Module
/// @author SettleMint Tokenization Services
/// @notice This compliance module restricts token transfers *to* users if their identity is on a prohibited list.
contract IdentityBlockListComplianceModule is AbstractIdentityComplianceModule {
    bytes32 public constant override typeId = keccak256("IdentityBlockListComplianceModule");

    event GlobalBlockedIdentitiesUpdated(address[] identityAddresses, bool indexed blocked);

    constructor(address _trustedForwarder) AbstractIdentityComplianceModule(_trustedForwarder) { }

    function setGlobalBlockedIdentities(
        address[] calldata _identityAddresses,
        bool _block
    )
        external
        onlyRole(GLOBAL_LIST_MANAGER_ROLE)
    {
        uint256 identityAddressesLength = _identityAddresses.length;
        for (uint256 i = 0; i < identityAddressesLength;) {
            _setIdentityInGlobalList(_identityAddresses[i], _block);
            unchecked {
                ++i;
            }
        }
        emit GlobalBlockedIdentitiesUpdated(_identityAddresses, _block);
    }

    function isGloballyBlocked(address _identityAddress) public view virtual returns (bool) {
        return _isIdentityInGlobalList(_identityAddress);
    }

    function getGlobalBlockedIdentities() external view virtual returns (address[] memory) {
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
            return;
        }

        if (isGloballyBlocked(address(receiverIdentity))) {
            revert ComplianceCheckFailed("Receiver identity globally blocked");
        }

        address[] memory additionalBlockedIdentities = _decodeParams(_params);
        uint256 additionalBlockedIdentitiesLength = additionalBlockedIdentities.length;
        for (uint256 i = 0; i < additionalBlockedIdentitiesLength;) {
            if (additionalBlockedIdentities[i] == address(receiverIdentity)) {
                revert ComplianceCheckFailed("Receiver identity blocked for token");
            }
            unchecked {
                ++i;
            }
        }
    }

    function name() external pure virtual override returns (string memory) {
        return "Identity BlockList Compliance Module";
    }
}
