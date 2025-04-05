// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

interface IProxy {
    /// functions

    function setImplementationAuthority(address _newImplementationAuthority) external;

    function getImplementationAuthority() external view returns (address);
}
