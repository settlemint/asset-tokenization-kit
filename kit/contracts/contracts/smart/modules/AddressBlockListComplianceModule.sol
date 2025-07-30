// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base modules
import { AbstractAddressListComplianceModule } from "./AbstractAddressListComplianceModule.sol";

// Interface imports

/// @title Address Block-List Compliance Module
/// @author SettleMint
/// @notice This compliance module restricts token transfers *to* specific wallet addresses.
/// @dev The module uses a token-specific list of blocked addresses provided via the `_params` argument.
/// A transfer is blocked if the recipient address is in the token-specific block list.
/// @custom:parameters The `_params` data should be ABI-encoded as: `abi.encode(address[] memory blockedAddresses)`.
contract AddressBlockListComplianceModule is AbstractAddressListComplianceModule {
    /// @notice Unique type identifier for this compliance module
    bytes32 public constant TYPE_ID = keccak256("AddressBlockListComplianceModule");

    /// @notice Returns a unique identifier for the type of this contract.
    /// @dev This identifier is used to distinguish this compliance module type from others in the system.
    /// @return The unique type identifier for the AddressBlockListComplianceModule.
    function typeId() external pure override returns (bytes32) {
        return TYPE_ID;
    }


    /// @notice Initializes the compliance module with a trusted forwarder
    /// @param _trustedForwarder Address of the trusted forwarder for meta transactions
    constructor(address _trustedForwarder) AbstractAddressListComplianceModule(_trustedForwarder) { }


    /// @notice Checks if a transfer is compliant based on the receiver's address block status
    /// @param _to The receiver address being checked
    /// @param _params Encoded array of blocked addresses for this token
    // solhint-disable-next-line use-natspec
    function canTransfer(
        address, /* _token - unused */
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
        address[] memory blockedAddresses = _decodeParams(_params);
        uint256 blockedAddressesLength = blockedAddresses.length;
        for (uint256 i = 0; i < blockedAddressesLength;) {
            if (blockedAddresses[i] == _to) {
                revert ComplianceCheckFailed("Receiver address blocked");
            }
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Returns the human-readable name of this compliance module
    /// @return The name of the compliance module
    function name() external pure virtual override returns (string memory) {
        return "Address BlockList Compliance Module";
    }
}
