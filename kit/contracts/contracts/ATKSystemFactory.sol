// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { SMARTSystemFactory } from "smart-protocol/contracts/system/SMARTSystemFactory.sol";

contract ATKSystemFactory is SMARTSystemFactory {
    constructor(
        address complianceImplementation_,
        address identityRegistryImplementation_,
        address identityRegistryStorageImplementation_,
        address trustedIssuersRegistryImplementation_,
        address identityFactoryImplementation_,
        address identityImplementation_,
        address tokenIdentityImplementation_,
        address forwarder_
    )
        SMARTSystemFactory(
            complianceImplementation_,
            identityRegistryImplementation_,
            identityRegistryStorageImplementation_,
            trustedIssuersRegistryImplementation_,
            identityFactoryImplementation_,
            identityImplementation_,
            tokenIdentityImplementation_,
            forwarder_
        )
    { }
}
