// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

contract MCStorage {
    /// token linked to the compliance contract
    address internal _tokenBound;

    /// Array of modules bound to the compliance
    address[] internal _modules;

    /// Mapping of module binding status
    mapping(address => bool) internal _moduleBound;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     */
    uint256[49] private __gap;
}
