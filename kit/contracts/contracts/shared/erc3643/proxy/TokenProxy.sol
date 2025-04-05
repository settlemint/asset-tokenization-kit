// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { AbstractProxy } from "./AbstractProxy.sol";
import { ZeroAddress, EmptyString, DecimalsOutOfRange } from "../errors/InvalidArgumentErrors.sol";
import { InitializationFailed } from "../errors/CommonErrors.sol";
import { ImplementationAuthoritySet } from "../events/CommonEvents.sol";
import { ITREXImplementationAuthority } from "./authority/ITREXImplementationAuthority.sol";

contract TokenProxy is AbstractProxy {
    constructor(
        address implementationAuthority,
        address _identityRegistry,
        address _compliance,
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        // _onchainID can be 0 address if the token has no ONCHAINID, ONCHAINID can be set later by the token Owner
        address _onchainID
    ) {
        require(
            implementationAuthority != address(0) && _identityRegistry != address(0) && _compliance != address(0),
            ZeroAddress()
        );
        require(
            keccak256(abi.encode(_name)) != keccak256(abi.encode(""))
                && keccak256(abi.encode(_symbol)) != keccak256(abi.encode("")),
            EmptyString()
        );
        require(0 <= _decimals && _decimals <= 18, DecimalsOutOfRange(_decimals));
        _storeImplementationAuthority(implementationAuthority);
        emit ImplementationAuthoritySet(implementationAuthority);

        address logic = (ITREXImplementationAuthority(getImplementationAuthority())).getTokenImplementation();

        // solhint-disable-next-line avoid-low-level-calls
        (bool success,) = logic.delegatecall(
            abi.encodeWithSignature(
                "init(address,address,string,string,uint8,address)",
                _identityRegistry,
                _compliance,
                _name,
                _symbol,
                _decimals,
                _onchainID
            )
        );
        require(success, InitializationFailed());
    }

    // solhint-disable-next-line no-complex-fallback
    fallback() external payable {
        address logic = (ITREXImplementationAuthority(getImplementationAuthority())).getTokenImplementation();

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
        address logic = (ITREXImplementationAuthority(getImplementationAuthority())).getTokenImplementation();

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
