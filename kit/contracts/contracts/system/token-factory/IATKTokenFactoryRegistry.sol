// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

interface IATKTokenFactoryRegistry is IAccessControl {
    event TokenFactoryCreated(
        address indexed sender,
        string name,
        bytes32 typeId,
        address proxyAddress,
        address implementationAddress,
        uint256 timestamp
    );

    event TokenFactoryImplementationUpdated(
        address indexed sender, bytes32 indexed factoryTypeHash, address indexed newImplementation
    );

    function createTokenFactory(
        string calldata name,
        address factoryImplementation,
        address tokenImplementation
    )
        external
        returns (address);

    function setTokenFactoryImplementation(bytes32 factoryTypeHash, address implementation) external;

    function tokenFactoryProxy(bytes32 factoryTypeHash) external view returns (address);

    function initialize(address initialAdmin, address systemAddress) external;
}
