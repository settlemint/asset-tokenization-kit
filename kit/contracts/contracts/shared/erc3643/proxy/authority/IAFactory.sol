// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { TREXImplementationAuthority } from "./TREXImplementationAuthority.sol";
import { IIAFactory, ImplementationAuthorityDeployed } from "./IIAFactory.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ITREXFactory } from "../../factory/ITREXFactory.sol";
import { ITREXImplementationAuthority } from "./ITREXImplementationAuthority.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract IAFactory is IIAFactory, IERC165 {
    /// variables

    /// address of the trex factory
    address private _trexFactory;

    /// mapping allowing to know if an IA was deployed by the factory or not
    mapping(address => bool) private _deployedByFactory;

    /// Errors

    error OnlyReferenceIACanDeploy();

    /// functions

    constructor(address trexFactory) {
        _trexFactory = trexFactory;
    }

    /**
     *  @dev See {IIAFactory-deployIA}.
     */
    function deployIA(address _token) external override returns (address) {
        require(ITREXFactory(_trexFactory).getImplementationAuthority() == msg.sender, OnlyReferenceIACanDeploy());
        TREXImplementationAuthority _newIA = new TREXImplementationAuthority(
            false, ITREXImplementationAuthority(msg.sender).getTREXFactory(), address(this)
        );
        _newIA.fetchVersion(ITREXImplementationAuthority(msg.sender).getCurrentVersion());
        _newIA.useTREXVersion(ITREXImplementationAuthority(msg.sender).getCurrentVersion());
        Ownable(_newIA).transferOwnership(Ownable(_token).owner());
        _deployedByFactory[address(_newIA)] = true;
        emit ImplementationAuthorityDeployed(address(_newIA));
        return address(_newIA);
    }

    /**
     *  @dev See {IIAFactory-deployedByFactory}.
     */
    function deployedByFactory(address _ia) external view override returns (bool) {
        return _deployedByFactory[_ia];
    }

    /**
     *  @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public pure virtual override returns (bool) {
        return interfaceId == type(IIAFactory).interfaceId || interfaceId == type(IERC165).interfaceId;
    }
}
