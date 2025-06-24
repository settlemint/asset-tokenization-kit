// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

interface IATKSystemAddonRegistry is IAccessControl {
    event SystemAddonRegistered(
        address indexed sender,
        string name,
        bytes32 typeId,
        address proxyAddress,
        address implementation,
        bytes initializationData,
        uint256 timestamp
    );

    event AddonImplementationUpdated(
        address indexed sender, bytes32 indexed addonTypeHash, address indexed newImplementation
    );

    function registerSystemAddon(
        string calldata name,
        address implementation,
        bytes calldata initializationData
    )
        external
        returns (address proxyAddress);

    function setAddonImplementation(bytes32 addonTypeHash, address implementation) external;

    function addon(bytes32 addonTypeHash) external view returns (address);

    function initialize(address initialAdmin, address systemAddress) external;
}
