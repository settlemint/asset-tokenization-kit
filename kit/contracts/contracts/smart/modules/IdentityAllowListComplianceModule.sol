// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base modules
import { AbstractIdentityComplianceModule } from "./AbstractIdentityComplianceModule.sol";

// Interface imports
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

/// @title Identity Allow-List Compliance Module
/// @author SettleMint
/// @notice This compliance module restricts token transfers *to* users unless their identity is on an approved list.
/// @dev The module uses a token-specific list of allowed identity addresses provided via the `_params` argument.
/// A transfer is allowed only if the recipient's identity address is in the token-specific allow list.
/// @custom:parameters The `_params` data should be ABI-encoded as: `abi.encode(address[] memory allowedIdentities)`.
contract IdentityAllowListComplianceModule is AbstractIdentityComplianceModule {
    /// @notice Unique type identifier for this compliance module
    bytes32 public constant TYPE_ID = keccak256("IdentityAllowListComplianceModule");

    /// @notice Returns a unique identifier for the type of this contract.
    /// @dev This identifier is used to distinguish this compliance module type from others in the system.
    /// @return The unique type identifier for the IdentityAllowListComplianceModule.
    function typeId() external pure override returns (bytes32) {
        return TYPE_ID;
    }

    /// @notice Initializes the compliance module with a trusted forwarder
    /// @param _trustedForwarder Address of the trusted forwarder for meta transactions
    constructor(address _trustedForwarder) AbstractIdentityComplianceModule(_trustedForwarder) { }

    /// @notice Checks if a transfer is compliant based on the receiver's identity allowlist status
    /// @param _token The token contract address
    /// @param _to The receiver address whose identity is being checked
    /// @param _params Encoded array of allowed identity addresses for this token
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

        address[] memory allowedIdentities = _decodeParams(_params);
        uint256 allowedIdentitiesLength = allowedIdentities.length;
        for (uint256 i = 0; i < allowedIdentitiesLength;) {
            if (allowedIdentities[i] == address(receiverIdentity)) {
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
