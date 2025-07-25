// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base modules
import { AbstractAddressListComplianceModule } from "./AbstractAddressListComplianceModule.sol";

// Interface imports

/// @title Address Block-List Compliance Module
/// @author SettleMint
/// @notice This compliance module restricts token transfers *to* specific wallet addresses.
contract AddressBlockListComplianceModule is AbstractAddressListComplianceModule {
    /// @notice Unique type identifier for this compliance module
    bytes32 public constant TYPE_ID = keccak256("AddressBlockListComplianceModule");

    /// @notice Returns a unique identifier for the type of this contract.
    /// @dev This identifier is used to distinguish this compliance module type from others in the system.
    /// @return The unique type identifier for the AddressBlockListComplianceModule.
    function typeId() external pure override returns (bytes32) {
        return TYPE_ID;
    }

    /// @notice Emitted when addresses are added to or removed from the global block list
    /// @param addresses Array of addresses being updated
    /// @param blocked True if addresses are being blocked, false if being unblocked
    event GlobalBlockedAddressesUpdated(address[] addresses, bool indexed blocked);

    /// @notice Initializes the compliance module with a trusted forwarder
    /// @param _trustedForwarder Address of the trusted forwarder for meta transactions
    constructor(address _trustedForwarder) AbstractAddressListComplianceModule(_trustedForwarder) { }

    /// @notice Sets or unsets multiple addresses in the global block list
    /// @param _addresses Array of addresses to update
    /// @param _block True to block the addresses, false to unblock them
    function setGlobalBlockedAddresses(
        address[] calldata _addresses,
        bool _block
    )
        external
        onlyRole(GLOBAL_LIST_MANAGER_ROLE)
    {
        uint256 addressesLength = _addresses.length;
        for (uint256 i = 0; i < addressesLength;) {
            _setAddressInGlobalList(_addresses[i], _block);
            unchecked {
                ++i;
            }
        }
        emit GlobalBlockedAddressesUpdated(_addresses, _block);
    }

    /// @notice Checks if an address is globally blocked
    /// @param _addr The address to check
    /// @return True if the address is globally blocked, false otherwise
    function isGloballyBlocked(address _addr) public view virtual returns (bool) {
        return _isAddressInGlobalList(_addr);
    }

    /// @notice Retrieves all globally blocked addresses
    /// @return Array of globally blocked addresses
    function getGlobalBlockedAddresses() external view virtual returns (address[] memory) {
        return _getGlobalAddressesList();
    }

    /// @notice Checks if a transfer is compliant based on the receiver's address block status
    /// @param _to The receiver address being checked
    /// @param _params Encoded array of additional blocked addresses for this token
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
        if (isGloballyBlocked(_to)) {
            revert ComplianceCheckFailed("Receiver address globally blocked");
        }

        address[] memory additionalBlockedAddresses = _decodeParams(_params);
        uint256 additionalBlockedAddressesLength = additionalBlockedAddresses.length;
        for (uint256 i = 0; i < additionalBlockedAddressesLength;) {
            if (additionalBlockedAddresses[i] == _to) {
                revert ComplianceCheckFailed("Receiver address blocked for token");
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
