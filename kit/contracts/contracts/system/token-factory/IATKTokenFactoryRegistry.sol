// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title IATKTokenFactoryRegistry
 * @author SettleMint
 * @notice Interface for the ATK Token Factory Registry, managing token factory deployments
 * @dev This registry tracks and manages different types of token factories (Bond, Equity, Fund, etc.)
 *      within the ATK ecosystem. Each factory type is identified by a unique type hash and can be
 *      upgraded independently through its implementation address.
 */
interface IATKTokenFactoryRegistry is IAccessControl, IERC165 {
    event TokenFactoryRegistered(
        address indexed sender,
        string name,
        bytes32 typeId,
        address proxyAddress,
        address implementationAddress,
        address tokenImplementationAddress,
        bytes4[] tokenImplementationInterfaces,
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

    function initialize(address initialAdmin, address systemAddress) external;
}
