// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base modules
import { AbstractIdentityComplianceModule } from "./AbstractIdentityComplianceModule.sol";

// Interface imports
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

/// @title Identity Block-List Compliance Module
/// @author SettleMint
/// @notice This compliance module restricts token transfers *to* users if their identity is on a prohibited list.
contract IdentityBlockListComplianceModule is AbstractIdentityComplianceModule {
    /// @notice Unique type identifier for this compliance module
    bytes32 public constant TYPE_ID = keccak256("IdentityBlockListComplianceModule");

    /// @notice Returns a unique identifier for the type of this contract.
    /// @dev This identifier is used to distinguish this compliance module type from others in the system.
    /// @return The unique type identifier for the IdentityBlockListComplianceModule.
    function typeId() external pure override returns (bytes32) {
        return TYPE_ID;
    }

    /// @notice Emitted when identities are added to or removed from the global block list
    /// @param identityAddresses Array of identity addresses being updated
    /// @param blocked True if identities are being blocked, false if being unblocked
    event GlobalBlockedIdentitiesUpdated(address[] identityAddresses, bool indexed blocked);

    /// @notice Initializes the compliance module with a trusted forwarder
    /// @param _trustedForwarder Address of the trusted forwarder for meta transactions
    constructor(address _trustedForwarder) AbstractIdentityComplianceModule(_trustedForwarder) { }

    /// @notice Sets or unsets multiple identity addresses in the global block list
    /// @param _identityAddresses Array of identity addresses to update
    /// @param _block True to block the identities, false to unblock them
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

    /// @notice Checks if an identity address is globally blocked
    /// @param _identityAddress The identity address to check
    /// @return True if the identity is globally blocked, false otherwise
    function isGloballyBlocked(address _identityAddress) public view virtual returns (bool) {
        return _isIdentityInGlobalList(_identityAddress);
    }

    /// @notice Retrieves all globally blocked identity addresses
    /// @return Array of globally blocked identity addresses
    function getGlobalBlockedIdentities() external view virtual returns (address[] memory) {
        return _getGlobalIdentitiesList();
    }

    /// @notice Checks if a transfer is compliant based on the receiver's identity block status
    /// @param _token The token contract address
    /// @param _to The receiver address whose identity is being checked
    /// @param _params Encoded array of additional blocked identity addresses for this token
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

    /// @notice Returns the human-readable name of this compliance module
    /// @return The name of the compliance module
    function name() external pure virtual override returns (string memory) {
        return "Identity BlockList Compliance Module";
    }
}
