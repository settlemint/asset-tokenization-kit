// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ISMARTIdentityRegistryStorage } from "../../smart/interface/ISMARTIdentityRegistryStorage.sol";

interface IATKIdentityRegistryStorage is ISMARTIdentityRegistryStorage {
    function initialize(address systemAddress, address initialAdmin) external;
}
