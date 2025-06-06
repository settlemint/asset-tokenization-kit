// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { IIdentity } from "@onchainid/contracts/smart/interface/IIdentity.sol";

interface ISMARTIdentity is IIdentity {
    function initialize(address initialManagementKey) external;
}
