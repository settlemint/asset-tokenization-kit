pragma solidity ^0.8.28;

import { AbstractATKSystemProxy } from "../AbstractATKSystemProxy.sol";
import { IATKSystem } from "../IATKSystem.sol";
import { ATKSystemAccessManagerImplementation } from "./ATKSystemAccessManagerImplementation.sol";
import { SystemAccessManagerImplementationNotSet } from "../ATKSystemErrors.sol";

contract ATKSystemAccessManagerProxy is AbstractATKSystemProxy {
    constructor(address systemAddress, address[] memory initialAdmins) AbstractATKSystemProxy(systemAddress) {
        IATKSystem system_ = _getSystem();

        address implementation = _getSpecificImplementationAddress(system_);
        bytes memory data =
            abi.encodeWithSelector(ATKSystemAccessManagerImplementation.initialize.selector, initialAdmins);

        _performInitializationDelegatecall(implementation, data);
    }

    function _getSpecificImplementationAddress(IATKSystem system) internal view override returns (address) {
        address implementation = system.systemAccessManagerImplementation();
        if (implementation == address(0)) {
            revert SystemAccessManagerImplementationNotSet();
        }
        return implementation;
    }
}
