// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base modules
import { AbstractAddressListComplianceModule } from "./AbstractAddressListComplianceModule.sol";

// Interface imports
import { ISMARTComplianceModule } from "../interface/ISMARTComplianceModule.sol";

/// @title Address Block-List Compliance Module
/// @author SettleMint Tokenization Services
/// @notice This compliance module restricts token transfers *to* specific wallet addresses.
contract AddressBlockListComplianceModule is AbstractAddressListComplianceModule {
    bytes32 public constant override typeId = keccak256("AddressBlockListComplianceModule");

    event GlobalBlockedAddressesUpdated(address[] addresses, bool indexed blocked);

    constructor(address _trustedForwarder) AbstractAddressListComplianceModule(_trustedForwarder) { }

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

    function isGloballyBlocked(address _addr) public view virtual returns (bool) {
        return _isAddressInGlobalList(_addr);
    }

    function getGlobalBlockedAddresses() external view virtual returns (address[] memory) {
        return _getGlobalAddressesList();
    }

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

    function name() external pure virtual override returns (string memory) {
        return "Address BlockList Compliance Module";
    }
}
