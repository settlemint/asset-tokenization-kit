// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

/**
 * @title IATKIdentity
 * @author SettleMint
 * @notice Interface for ATK Identity contracts representing on-chain identities
 * @dev Extends the OnChainID IIdentity interface to provide ATK-specific initialization.
 *      These identity contracts store claims and keys for identity verification within
 *      the ATK ecosystem.
 */
interface IATKIdentity is IIdentity {
    function initialize(address initialManagementKey) external;
}
