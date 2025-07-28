// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base modules
import { AbstractIdentityComplianceModule } from "./AbstractIdentityComplianceModule.sol";

// Interface imports
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

/// @title Identity Allow-List Compliance Module
/// @author SettleMint
/// @notice This compliance module restricts token transfers *to* users unless their identity is on an approved list.
contract IdentityAllowListComplianceModule is AbstractIdentityComplianceModule {
    /// @notice Unique type identifier for this compliance module
    bytes32 public constant TYPE_ID = keccak256("IdentityAllowListComplianceModule");

    /// @notice Returns a unique identifier for the type of this contract.
    /// @dev This identifier is used to distinguish this compliance module type from others in the system.
    /// @return The unique type identifier for the IdentityAllowListComplianceModule.
    function typeId() external pure override returns (bytes32) {
        return TYPE_ID;
    }

    /// @notice Emitted when identities are added to or removed from the global allow list
    /// @param identityAddresses Array of identity addresses being updated
    /// @param allowed True if identities are being allowed, false if being removed from allowlist
    event GlobalAllowedIdentitiesUpdated(address[] identityAddresses, bool indexed allowed);

    /// @notice Initializes the compliance module with a trusted forwarder
    /// @param _trustedForwarder Address of the trusted forwarder for meta transactions
    constructor(address _trustedForwarder) AbstractIdentityComplianceModule(_trustedForwarder) { }

    /// @notice Sets or unsets multiple identity addresses in the global allow list
    /// @param _identityAddresses Array of identity addresses to update
    /// @param _allow True to allow the identities, false to remove them from allowlist
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

    /// @notice Checks if an identity address is globally allowed
    /// @param _identityAddress The identity address to check
    /// @return True if the identity is globally allowed, false otherwise
    function isGloballyAllowed(address _identityAddress) public view virtual returns (bool) {
        return _isIdentityInGlobalList(_identityAddress);
    }

    /// @notice Retrieves all globally allowed identity addresses
    /// @return Array of globally allowed identity addresses
    function getGlobalAllowedIdentities() external view virtual returns (address[] memory) {
        return _getGlobalIdentitiesList();
    }

    /// @notice Checks if a transfer is compliant based on the receiver's identity allowlist status
    /// @param _token The token contract address
    /// @param _to The receiver address whose identity is being checked
    /// @param _params Encoded array of additional allowed identity addresses for this token
    // solhint-disable-next-line use-natspec
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

    /// @notice Returns the human-readable name of this compliance module
    /// @return The name of the compliance module
    function name() external pure virtual override returns (string memory) {
        return "Identity AllowList Compliance Module";
    }
}
