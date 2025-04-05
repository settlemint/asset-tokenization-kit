// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { IProxy } from "./interface/IProxy.sol";
import { ITREXImplementationAuthority } from "./authority/ITREXImplementationAuthority.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ZeroAddress } from "../errors/InvalidArgumentErrors.sol";
import { InvalidImplementationAuthority } from "../errors/CommonErrors.sol";
import { ImplementationAuthoritySet } from "../events/CommonEvents.sol";

/// Errors

/// @dev Thrown when called by other than the current implementation authority.
error OnlyCurrentImplementationAuthorityCanCall();

abstract contract AbstractProxy is IProxy, Initializable {
    /**
     *  @dev See {IProxy-setImplementationAuthority}.
     */
    function setImplementationAuthority(address _newImplementationAuthority) external override {
        require(msg.sender == getImplementationAuthority(), OnlyCurrentImplementationAuthorityCanCall());
        require(_newImplementationAuthority != address(0), ZeroAddress());
        require(
            (ITREXImplementationAuthority(_newImplementationAuthority)).getTokenImplementation() != address(0)
                && (ITREXImplementationAuthority(_newImplementationAuthority)).getCTRImplementation() != address(0)
                && (ITREXImplementationAuthority(_newImplementationAuthority)).getIRImplementation() != address(0)
                && (ITREXImplementationAuthority(_newImplementationAuthority)).getIRSImplementation() != address(0)
                && (ITREXImplementationAuthority(_newImplementationAuthority)).getMCImplementation() != address(0)
                && (ITREXImplementationAuthority(_newImplementationAuthority)).getTIRImplementation() != address(0),
            InvalidImplementationAuthority()
        );
        _storeImplementationAuthority(_newImplementationAuthority);
        emit ImplementationAuthoritySet(_newImplementationAuthority);
    }

    /**
     *  @dev See {IProxy-getImplementationAuthority}.
     */
    function getImplementationAuthority() public view override returns (address) {
        address implemAuth;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            implemAuth := sload(0x821f3e4d3d679f19eacc940c87acf846ea6eae24a63058ea750304437a62aafc)
        }
        return implemAuth;
    }

    /**
     *  @dev store the implementationAuthority contract address using the ERC-3643 implementation slot in storage
     *  the slot storage is the result of `keccak256("ERC-3643.proxy.beacon")`
     */
    function _storeImplementationAuthority(address implementationAuthority) internal {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            sstore(0x821f3e4d3d679f19eacc940c87acf846ea6eae24a63058ea750304437a62aafc, implementationAuthority)
        }
    }
}
