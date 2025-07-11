// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IATKTokenFactoryRegistry is IAccessControl, IERC165 {
    event TokenFactoryRegistered(
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

    function registerTokenFactory(
        string calldata name,
        address factoryImplementation,
        address tokenImplementation
    )
        external
        returns (address);

    function setTokenFactoryImplementation(bytes32 factoryTypeHash, address implementation) external;

    function tokenFactory(bytes32 factoryTypeHash) external view returns (address);

    function initialize(address initialAdmin, address systemAddress, address systemAccessManager) external;
}
