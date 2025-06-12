// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Base modules
import { AbstractComplianceModule } from "./AbstractComplianceModule.sol";

// Interface imports
import { ISMARTComplianceModule } from "../interface/ISMARTComplianceModule.sol";

/// @title Abstract Base for Address-List-Based Compliance Modules
/// @author SettleMint Tokenization Services
/// @notice This abstract contract extends `AbstractComplianceModule` to provide common functionalities
/// for compliance modules that base their rules on a managed list of wallet addresses.
abstract contract AbstractAddressListComplianceModule is AbstractComplianceModule {
    bytes32 public constant GLOBAL_LIST_MANAGER_ROLE = keccak256("GLOBAL_LIST_MANAGER_ROLE");

    mapping(address => bool) internal _globalAddresses;
    address[] internal _globalAddressesList;
    mapping(address => uint256) internal _globalAddressesIndex;

    constructor(address _trustedForwarder) AbstractComplianceModule(_trustedForwarder) {
        _grantRole(GLOBAL_LIST_MANAGER_ROLE, _msgSender());
    }

    function validateParameters(bytes calldata _params) public view virtual override {
        abi.decode(_params, (address[]));
    }

    function _decodeParams(bytes calldata _params) internal pure returns (address[] memory additionalAddresses) {
        return abi.decode(_params, (address[]));
    }

    function _setAddressInGlobalList(address _addr, bool _inList) internal {
        bool wasInList = _globalAddresses[_addr];
        _globalAddresses[_addr] = _inList;

        if (_inList && !wasInList) {
            _globalAddressesList.push(_addr);
            _globalAddressesIndex[_addr] = _globalAddressesList.length;
        } else if (!_inList && wasInList) {
            _removeAddressFromGlobalArray(_addr);
        }
    }

    function _removeAddressFromGlobalArray(address _addr) internal {
        uint256 indexPlusOne = _globalAddressesIndex[_addr];
        if (indexPlusOne == 0) return;

        uint256 index = indexPlusOne - 1;
        uint256 lastIndex = _globalAddressesList.length - 1;

        if (index != lastIndex) {
            address lastAddress = _globalAddressesList[lastIndex];
            _globalAddressesList[index] = lastAddress;
            _globalAddressesIndex[lastAddress] = indexPlusOne;
        }

        _globalAddressesList.pop();
        delete _globalAddressesIndex[_addr];
    }

    function _isAddressInGlobalList(address _addr) internal view returns (bool) {
        return _globalAddresses[_addr];
    }

    function _getGlobalAddressesList() internal view returns (address[] memory) {
        return _globalAddressesList;
    }
}
