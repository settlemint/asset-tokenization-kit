// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { IERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { IERC5267 } from "@openzeppelin/contracts/interfaces/IERC5267.sol";
import { NoncesUpgradeable } from "../utils/NoncesUpgradeable.sol";
import { MessageHashUtils } from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

error ERC2612ExpiredSignature(uint256 deadline);
error ERC2612InvalidSigner(address signer, address owner);

abstract contract TokenPermit is IERC20Permit, IERC5267, NoncesUpgradeable {
    bytes32 private constant _PERMIT_TYPEHASH =
        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

    bytes32 private constant _TYPE_HASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    /// @inheritdoc IERC20Permit
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    )
        external
    {
        require(block.timestamp <= deadline, ERC2612ExpiredSignature(deadline));

        bytes32 structHash = keccak256(abi.encode(_PERMIT_TYPEHASH, owner, spender, value, _useNonce(owner), deadline));

        bytes32 hash = MessageHashUtils.toTypedDataHash(_domainSeparatorV4(), structHash);

        address signer = ECDSA.recover(hash, v, r, s);
        require(signer == owner, ERC2612InvalidSigner(signer, owner));

        _approve(owner, spender, value);
    }

    /// @inheritdoc IERC20Permit
    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /// @inheritdoc IERC5267
    function eip712Domain()
        external
        view
        virtual
        returns (
            bytes1 _fields,
            string memory _name,
            string memory _version,
            uint256 _chainId,
            address _verifyingContract,
            bytes32 _salt,
            uint256[] memory _extensions
        )
    {
        return (
            hex"0f", // 01111
            name(),
            version(),
            block.chainid,
            address(this),
            bytes32(0),
            new uint256[](0)
        );
    }

    /// @inheritdoc IERC20Permit
    function nonces(address owner) public view override(IERC20Permit, NoncesUpgradeable) returns (uint256) {
        return super.nonces(owner);
    }

    /// @dev Implemented in Token.sol
    function name() public view virtual returns (string memory);

    /// @dev Implemented in Token.sol
    function version() public view virtual returns (string memory);

    /// @dev Implemented in Token.sol
    function _approve(address _owner, address _spender, uint256 _value) internal virtual;

    // @dev Returns the domain separator for the current chain.
    function _domainSeparatorV4() internal view returns (bytes32) {
        return keccak256(
            abi.encode(_TYPE_HASH, keccak256(bytes(name())), keccak256(bytes(version())), block.chainid, address(this))
        );
    }
}
