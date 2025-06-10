// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";

interface IATKIdentity is IIdentity {
    function initialize(address initialManagementKey) external;
}
