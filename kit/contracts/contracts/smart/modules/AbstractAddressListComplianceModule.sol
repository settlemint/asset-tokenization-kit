// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base modules
import { AbstractComplianceModule } from "./AbstractComplianceModule.sol";

// Interface imports

/// @title Abstract Base for Address-List-Based Compliance Modules
/// @author SettleMint
/// @notice This abstract contract extends `AbstractComplianceModule` to provide common functionalities
/// for compliance modules that base their rules on a managed list of wallet addresses.
abstract contract AbstractAddressListComplianceModule is AbstractComplianceModule {
    /// @notice Role identifier for managing the global address list
    /// @dev Role identifier for managing the global address list.
    bytes32 public constant GLOBAL_LIST_MANAGER_ROLE = keccak256("GLOBAL_LIST_MANAGER_ROLE");

    /// @notice Emitted when an address is added to or removed from the global list
    /// @dev Emitted when an address is added to or removed from the global list.
    /// @param addr The address being updated.
    /// @param inList True if the address was added, false if it was removed.
    event GlobalAddressListChange(address indexed addr, bool indexed inList);

    /// @dev Mapping from an address to its status in the global list (true if in list).
    mapping(address => bool) internal _globalAddresses;
    /// @notice A dynamic array containing all addresses currently in the global list
    /// @dev A dynamic array containing all addresses currently in the global list.
    address[] public globalAddressesList;
    /// @dev Mapping from an address to its index (plus one) in the `globalAddressesList` array.
    /// A value of 0 indicates the address is not in the list.
    mapping(address => uint256) internal _globalAddressesIndex;

    /// @notice Initializes the address list compliance module with a trusted forwarder
    /// @param _trustedForwarder Address of the trusted forwarder for meta transactions
    constructor(address _trustedForwarder) AbstractComplianceModule(_trustedForwarder) {
        _grantRole(GLOBAL_LIST_MANAGER_ROLE, _msgSender());
    }

    /// @notice Validates the parameters for address list-based compliance
    /// @dev Validates the parameters for address list-based compliance, expecting an array of addresses.
    /// @param _params The ABI-encoded parameters, expected to be `(address[])`.
    function validateParameters(bytes calldata _params) public view virtual override {
        abi.decode(_params, (address[]));
    }

    /// @notice Decodes the ABI-encoded parameters into an array of addresses
    /// @dev Decodes the ABI-encoded parameters into an array of addresses.
    /// @param _params The ABI-encoded parameters.
    /// @return additionalAddresses An array of addresses extracted from the parameters.
    function _decodeParams(bytes calldata _params) internal pure returns (address[] memory additionalAddresses) {
        return abi.decode(_params, (address[]));
    }

    /// @notice Internal function to add or remove an address from the global list
    /// @dev Internal function to add or remove an address from the global list.
    /// @param _addr The address to modify.
    /// @param _inList True to add the address, false to remove it.
    function _setAddressInGlobalList(address _addr, bool _inList) internal {
        bool wasInList = _globalAddresses[_addr];
        if (wasInList == _inList) {
            return;
        }

        _globalAddresses[_addr] = _inList;

        if (_inList) {
            globalAddressesList.push(_addr);
            _globalAddressesIndex[_addr] = globalAddressesList.length;
        } else {
            _removeAddressFromGlobalArray(_addr);
        }

        emit GlobalAddressListChange(_addr, _inList);
    }

    /// @notice Internal function to remove an address from the globalAddressesList array efficiently
    /// @dev Internal function to remove an address from the `globalAddressesList` array efficiently.
    /// @param _addr The address to remove.
    function _removeAddressFromGlobalArray(address _addr) internal {
        uint256 indexPlusOne = _globalAddressesIndex[_addr];
        if (indexPlusOne == 0) return;

        uint256 index = indexPlusOne - 1;
        uint256 lastIndex = globalAddressesList.length - 1;

        if (index != lastIndex) {
            address lastAddress = globalAddressesList[lastIndex];
            globalAddressesList[index] = lastAddress;
            _globalAddressesIndex[lastAddress] = indexPlusOne;
        }

        globalAddressesList.pop();
        delete _globalAddressesIndex[_addr];
    }

    /// @notice Checks if a given address is present in the global list
    /// @dev Checks if a given address is present in the global list.
    /// @param _addr The address to check.
    /// @return bool True if the address is in the global list, false otherwise.
    function _isAddressInGlobalList(address _addr) internal view returns (bool) {
        return _globalAddresses[_addr];
    }

    /// @notice Retrieves the complete list of addresses in the global list
    /// @dev Retrieves the complete list of addresses in the global list.
    /// @return address[] An array containing all addresses in the global list.
    function _getGlobalAddressesList() internal view returns (address[] memory) {
        return globalAddressesList;
    }
}
