// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { AbstractProxy } from "./AbstractProxy.sol";
import { ZeroAddress } from "../errors/InvalidArgumentErrors.sol";
import { InitializationFailed } from "../errors/CommonErrors.sol";
import { ITREXImplementationAuthority } from "./authority/ITREXImplementationAuthority.sol";
import { ImplementationAuthoritySet } from "../events/CommonEvents.sol";

contract IdentityRegistryStorageProxy is AbstractProxy {
    constructor(address implementationAuthority) {
        require(implementationAuthority != address(0), ZeroAddress());
        _storeImplementationAuthority(implementationAuthority);
        emit ImplementationAuthoritySet(implementationAuthority);

        address logic = (ITREXImplementationAuthority(getImplementationAuthority())).getIRSImplementation();

        // solhint-disable-next-line avoid-low-level-calls
        (bool success,) = logic.delegatecall(abi.encodeWithSignature("init()"));
        require(success, InitializationFailed());
    }

    // solhint-disable-next-line no-complex-fallback
    fallback() external payable {
        address logic = (ITREXImplementationAuthority(getImplementationAuthority())).getIRSImplementation();

        // solhint-disable-next-line no-inline-assembly
        assembly {
            calldatacopy(0x0, 0x0, calldatasize())
            let success := delegatecall(sub(gas(), 10000), logic, 0x0, calldatasize(), 0, 0)
            let retSz := returndatasize()
            returndatacopy(0, 0, retSz)
            switch success
            case 0 { revert(0, retSz) }
            default { return(0, retSz) }
        }
    }

    // solhint-disable-next-line no-complex-fallback
    receive() external payable {
        address logic = (ITREXImplementationAuthority(getImplementationAuthority())).getIRSImplementation();

        // solhint-disable-next-line no-inline-assembly
        assembly {
            let success := delegatecall(sub(gas(), 10000), logic, 0, 0, 0, 0)
            let retSz := returndatasize()
            returndatacopy(0, 0, retSz)
            switch success
            case 0 { revert(0, retSz) }
            default { return(0, retSz) }
        }
    }
}
