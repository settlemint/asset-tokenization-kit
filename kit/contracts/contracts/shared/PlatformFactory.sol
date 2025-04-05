// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { Identity } from "./onchainid/Identity.sol";
import { ImplementationAuthority } from "./onchainid/proxy/ImplementationAuthority.sol";
import { IdFactory } from "./onchainid/factory/IdFactory.sol";
import { TREXFactory } from "./erc3643/factory/TREXFactory.sol";
import { TREXGateway } from "./erc3643/factory/TREXGateway.sol";

contract PlatformFactory {
    bool public isInitialized;

    error PlatformFactoryAlreadyInitialized();

    function createPlatform(
        address platformAdmin_,
        address tokenImplementationAuthority_
    )
        external
        returns (TREXGateway gateway)
    {
        require(!isInitialized, PlatformFactoryAlreadyInitialized());
        isInitialized = true;
        Identity identity = new Identity(platformAdmin_, true);
        ImplementationAuthority identityImplementationAuthority = new ImplementationAuthority(address(identity));
        IdFactory identityFactory = new IdFactory(address(identityImplementationAuthority));
        // Factory
        TREXFactory factory = new TREXFactory(tokenImplementationAuthority_, address(identityFactory));
        identityFactory.addTokenFactory(address(factory));

        // Gateway
        gateway = new TREXGateway(address(factory), true);
        gateway.addAgent(platformAdmin_);
        factory.transferOwnership(address(gateway));
    }
}
