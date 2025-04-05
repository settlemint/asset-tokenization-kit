// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

/// Events

/// @dev Event emitted when a new TREXImplementationAuthority is deployed.
/// @param _ia Address of implementation authority contract.
event ImplementationAuthorityDeployed(address indexed _ia);

interface IIAFactory {
    /// functions

    /**
     *  @dev deploy a new TREXImplementationAuthority smart contract
     *  @param _token the token for which the new IA will be used
     *  function called by the `changeImplementationAuthority` function
     *  can be called only by the reference TREXImplementationAuthority contract
     *  the new contract deployed will contain all the versions from reference IA
     *  the new contract will be set on the same version as the reference IA
     *  ownership of the new IA is transferred to the Owner of the token
     *  emits a `ImplementationAuthorityDeployed` event
     *  returns the address of the IA contract deployed
     */
    function deployIA(address _token) external returns (address);

    /**
     *  @dev function used to know if an IA contract was deployed by the factory or not
     *  @param _ia the address of TREXImplementationAuthority contract
     */
    function deployedByFactory(address _ia) external view returns (bool);
}
