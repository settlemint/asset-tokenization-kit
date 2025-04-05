// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { IdentityProxy } from "../proxy/IdentityProxy.sol";
import { IIdFactory } from "./IIdFactory.sol";
import { IERC734 } from "../interface/IERC734.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

error ZeroAddressNotAllowed();
error AlreadyAFactory();
error NotAFactory();
error EmptyString();
error SaltAlreadyTaken();
error WalletAlreadyLinked();
error EmptyKeysList();
error WalletInManagementKeys();
error TokenAlreadyLinked();
error WalletNotLinked();
error NewWalletAlreadyLinked();
error TokenAddress();
error MaxWalletsExceeded(uint256 max);
error CannotUnlinkSender();
error OnlyLinkedWalletCanUnlink();
error OnlyFactoryOrOwnerCanCall();

contract IdFactory is IIdFactory, Ownable {
    mapping(address => bool) private _tokenFactories;

    // address of the _implementationAuthority contract making the link to the implementation contract
    address private immutable _implementationAuthority;

    // as it is not possible to deploy 2 times the same contract address, this mapping allows us to check which
    // salt is taken and which is not
    mapping(string => bool) private _saltTaken;

    // ONCHAINID of the wallet owner
    mapping(address => address) private _userIdentity;

    // wallets currently linked to an ONCHAINID
    mapping(address => address[]) private _wallets;

    // ONCHAINID of the token
    mapping(address => address) private _tokenIdentity;

    // token linked to an ONCHAINID
    mapping(address => address) private _tokenAddress;

    // setting
    constructor(address implementationAuthority_) Ownable(_msgSender()) {
        if (implementationAuthority_ == address(0)) revert ZeroAddressNotAllowed();
        _implementationAuthority = implementationAuthority_;
    }

    /**
     *  @dev See {IdFactory-addTokenFactory}.
     */
    function addTokenFactory(address _factory) external override onlyOwner {
        if (_factory == address(0)) revert ZeroAddressNotAllowed();
        if (isTokenFactory(_factory)) revert AlreadyAFactory();
        _tokenFactories[_factory] = true;
        emit TokenFactoryAdded(_factory);
    }

    /**
     *  @dev See {IdFactory-removeTokenFactory}.
     */
    function removeTokenFactory(address _factory) external override onlyOwner {
        if (_factory == address(0)) revert ZeroAddressNotAllowed();
        if (!isTokenFactory(_factory)) revert NotAFactory();
        _tokenFactories[_factory] = false;
        emit TokenFactoryRemoved(_factory);
    }

    /**
     *  @dev See {IdFactory-createIdentity}.
     */
    function createIdentity(address _wallet, string memory _salt) external override onlyOwner returns (address) {
        if (_wallet == address(0)) revert ZeroAddressNotAllowed();
        if (keccak256(abi.encode(_salt)) == keccak256(abi.encode(""))) revert EmptyString();

        string memory oidSalt = string.concat("OID", _salt);
        if (_saltTaken[oidSalt]) revert SaltAlreadyTaken();
        if (_userIdentity[_wallet] != address(0)) revert WalletAlreadyLinked();

        address identity = _deployIdentity(oidSalt, _implementationAuthority, _wallet);
        _saltTaken[oidSalt] = true;
        _userIdentity[_wallet] = identity;
        _wallets[identity].push(_wallet);
        emit WalletLinked(_wallet, identity);
        return identity;
    }

    /**
     *  @dev See {IdFactory-createIdentityWithManagementKeys}.
     */
    function createIdentityWithManagementKeys(
        address _wallet,
        string memory _salt,
        bytes32[] memory _managementKeys
    )
        external
        override
        onlyOwner
        returns (address)
    {
        if (_wallet == address(0)) revert ZeroAddressNotAllowed();
        if (keccak256(abi.encode(_salt)) == keccak256(abi.encode(""))) revert EmptyString();

        string memory oidSalt = string.concat("OID", _salt);
        if (_saltTaken[oidSalt]) revert SaltAlreadyTaken();
        if (_userIdentity[_wallet] != address(0)) revert WalletAlreadyLinked();
        if (_managementKeys.length == 0) revert EmptyKeysList();

        address identity = _deployIdentity(oidSalt, _implementationAuthority, address(this));

        for (uint256 i = 0; i < _managementKeys.length; i++) {
            if (_managementKeys[i] == keccak256(abi.encode(_wallet))) {
                revert WalletInManagementKeys();
            }
            IERC734(identity).addKey(_managementKeys[i], 1, 1);
        }

        IERC734(identity).removeKey(keccak256(abi.encode(address(this))), 1);

        _saltTaken[oidSalt] = true;
        _userIdentity[_wallet] = identity;
        _wallets[identity].push(_wallet);
        emit WalletLinked(_wallet, identity);

        return identity;
    }

    /**
     *  @dev See {IdFactory-createTokenIdentity}.
     */
    function createTokenIdentity(
        address _token,
        address _tokenOwner,
        string memory _salt
    )
        external
        override
        returns (address)
    {
        if (!isTokenFactory(msg.sender) && msg.sender != owner()) revert OnlyFactoryOrOwnerCanCall();
        if (_token == address(0)) revert ZeroAddressNotAllowed();
        if (_tokenOwner == address(0)) revert ZeroAddressNotAllowed();
        if (keccak256(abi.encode(_salt)) == keccak256(abi.encode(""))) revert EmptyString();

        string memory tokenIdSalt = string.concat("Token", _salt);
        if (_saltTaken[tokenIdSalt]) revert SaltAlreadyTaken();
        if (_tokenIdentity[_token] != address(0)) revert TokenAlreadyLinked();

        address identity = _deployIdentity(tokenIdSalt, _implementationAuthority, _tokenOwner);
        _saltTaken[tokenIdSalt] = true;
        _tokenIdentity[_token] = identity;
        _tokenAddress[identity] = _token;
        emit TokenLinked(_token, identity);
        return identity;
    }

    /**
     *  @dev See {IdFactory-linkWallet}.
     */
    function linkWallet(address _newWallet) external override {
        if (_newWallet == address(0)) revert ZeroAddressNotAllowed();
        if (_userIdentity[msg.sender] == address(0)) revert WalletNotLinked();
        if (_userIdentity[_newWallet] != address(0)) revert NewWalletAlreadyLinked();
        if (_tokenIdentity[_newWallet] != address(0)) revert TokenAddress();

        address identity = _userIdentity[msg.sender];
        if (_wallets[identity].length >= 101) revert MaxWalletsExceeded(101);

        _userIdentity[_newWallet] = identity;
        _wallets[identity].push(_newWallet);
        emit WalletLinked(_newWallet, identity);
    }

    /**
     *  @dev See {IdFactory-unlinkWallet}.
     */
    function unlinkWallet(address _oldWallet) external override {
        if (_oldWallet == address(0)) revert ZeroAddressNotAllowed();
        if (_oldWallet == msg.sender) revert CannotUnlinkSender();
        if (_userIdentity[msg.sender] != _userIdentity[_oldWallet]) revert OnlyLinkedWalletCanUnlink();

        address _identity = _userIdentity[_oldWallet];
        delete _userIdentity[_oldWallet];
        uint256 length = _wallets[_identity].length;
        for (uint256 i = 0; i < length; i++) {
            if (_wallets[_identity][i] == _oldWallet) {
                _wallets[_identity][i] = _wallets[_identity][length - 1];
                _wallets[_identity].pop();
                break;
            }
        }
        emit WalletUnlinked(_oldWallet, _identity);
    }

    /**
     *  @dev See {IdFactory-getIdentity}.
     */
    function getIdentity(address _wallet) external view override returns (address) {
        if (_tokenIdentity[_wallet] != address(0)) {
            return _tokenIdentity[_wallet];
        } else {
            return _userIdentity[_wallet];
        }
    }

    /**
     *  @dev See {IdFactory-isSaltTaken}.
     */
    function isSaltTaken(string calldata _salt) external view override returns (bool) {
        return _saltTaken[_salt];
    }

    /**
     *  @dev See {IdFactory-getWallets}.
     */
    function getWallets(address _identity) external view override returns (address[] memory) {
        return _wallets[_identity];
    }

    /**
     *  @dev See {IdFactory-getToken}.
     */
    function getToken(address _identity) external view override returns (address) {
        return _tokenAddress[_identity];
    }

    /**
     *  @dev See {IdFactory-isTokenFactory}.
     */
    function isTokenFactory(address _factory) public view override returns (bool) {
        return _tokenFactories[_factory];
    }

    /**
     *  @dev See {IdFactory-implementationAuthority}.
     */
    function implementationAuthority() public view override returns (address) {
        return _implementationAuthority;
    }

    // deploy function with create2 opcode call
    // returns the address of the contract created
    function _deploy(string memory salt, bytes memory bytecode) private returns (address) {
        bytes32 saltBytes = bytes32(keccak256(abi.encodePacked(salt)));
        address addr;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            let encoded_data := add(0x20, bytecode) // load initialization code.
            let encoded_size := mload(bytecode) // load init code's length.
            addr := create2(0, encoded_data, encoded_size, saltBytes)
            if iszero(extcodesize(addr)) { revert(0, 0) }
        }
        emit Deployed(addr);
        return addr;
    }

    // function used to deploy an identity using CREATE2
    function _deployIdentity(
        string memory _salt,
        address implementationAuthority_,
        address _wallet
    )
        private
        returns (address)
    {
        bytes memory _code = type(IdentityProxy).creationCode;
        bytes memory _constructData = abi.encode(implementationAuthority_, _wallet);
        bytes memory bytecode = abi.encodePacked(_code, _constructData);
        return _deploy(_salt, bytecode);
    }
}
