// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ImplementationAuthority } from "@onchainid/contracts/proxy/ImplementationAuthority.sol";

contract SMARTIdentityImplementationAuthority is ImplementationAuthority {
    constructor(address implementation) ImplementationAuthority(implementation) { }
}
