// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";
import { ISMARTIdentityRegistry } from "../../contracts/smart/interface/ISMARTIdentityRegistry.sol";
import { IATKIdentityFactory } from "../../contracts/system/identity-factory/IATKIdentityFactory.sol";
import { ISMARTTrustedIssuersRegistry } from
    "../../contracts/smart/interface/ISMARTTrustedIssuersRegistry.sol";

contract IdentityUtils is Test {
    address internal _platformAdmin;
    IATKIdentityFactory internal _identityFactory;
    ISMARTIdentityRegistry internal _identityRegistry;
    ISMARTTrustedIssuersRegistry internal _trustedIssuersRegistry;

    constructor(
        address platformAdmin_,
        IATKIdentityFactory identityFactory_,
        ISMARTIdentityRegistry identityRegistry_,
        ISMARTTrustedIssuersRegistry trustedIssuersRegistry_
    ) {
        _platformAdmin = platformAdmin_;
        _identityFactory = identityFactory_;
        _identityRegistry = identityRegistry_;
        _trustedIssuersRegistry = trustedIssuersRegistry_;
    }

    /**
     * @notice Creates a basic identity contract.
     * @param walletAddress_ The wallet address to associate with the identity.
     * @return The address of the newly created identity contract.
     */
    function createIdentity(address walletAddress_) public returns (address) {
        vm.startPrank(_platformAdmin);
        address identity = _identityFactory.createIdentity(walletAddress_, new bytes32[](0));
        vm.stopPrank();
        return identity;
    }

    /**
     * @notice Creates an identity for a client and registers it.
     * @param clientWalletAddress_ The client's wallet address.
     * @param countryCode_ The country code for the client.
     * @return The address of the newly created and registered identity contract.
     */
    function createClientIdentity(address clientWalletAddress_, uint16 countryCode_) public returns (address) {
        // Create the identity using the factory
        address identity = createIdentity(clientWalletAddress_);

        // Register the identity in the registry
        vm.startPrank(_platformAdmin);

        _identityRegistry.registerIdentity(clientWalletAddress_, IIdentity(identity), countryCode_);
        vm.stopPrank();

        return identity;
    }

    /**
     * @notice Creates an identity for a claim issuer and adds it to the trusted registry.
     * @param issuerWalletAddress_ The issuer's wallet address.
     * @param claimTopics The claim topics the issuer is trusted for.
     * @return The address of the newly created and registered issuer identity contract.
     */
    function createIssuerIdentity(
        address issuerWalletAddress_,
        uint256[] memory claimTopics
    )
        public
        returns (address)
    {
        // Create the identity using the factory
        address issuerIdentityAddr = createIdentity(issuerWalletAddress_);

        vm.startPrank(_platformAdmin);
        // IMPORTANT: Cast the *identity address* to IClaimIssuer for the registry
        _trustedIssuersRegistry.addTrustedIssuer(IClaimIssuer(issuerIdentityAddr), claimTopics);
        vm.stopPrank();

        return issuerIdentityAddr; // Return the created identity address
    }

    function updateIssuerClaimTopics(address issuerWalletAddress_, uint256[] memory claimTopics) public {
        address issuerIdentityAddr = getIdentity(issuerWalletAddress_);
        vm.startPrank(_platformAdmin);
        _trustedIssuersRegistry.updateIssuerClaimTopics(IClaimIssuer(issuerIdentityAddr), claimTopics);
        vm.stopPrank();
    }

    function recoverIdentity(address lostWallet, address newWallet, address identityAddress) public {
        vm.startPrank(_platformAdmin);
        _identityRegistry.recoverIdentity(lostWallet, newWallet, identityAddress);
        vm.stopPrank();
    }

    function getIdentity(address _wallet) public view returns (address) {
        return _identityFactory.getIdentity(_wallet);
    }

    function getIdentityFromRegistry(address _wallet) public view returns (IIdentity) {
        return _identityRegistry.identity(_wallet);
    }
}
