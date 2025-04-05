// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import "../BasicCompliance.sol";

/**
 *  this feature allows to put a supply limit on the token
 *  If an agent tries to mint more tokens than the maximum threshold, the minting will fail
 */
abstract contract SupplyLimit is BasicCompliance {
    /// supply limit variable
    uint256 public supplyLimit;

    /**
     *  this event is emitted when the supply limit has been set.
     *  `_limit` is the max amount of tokens in circulation.
     */
    event SupplyLimitSet(uint256 _limit);

    /**
     *  @dev sets supply limit.
     *  Supply limit has to be smaller or equal to the actual supply.
     *  @param _limit max amount of tokens to be created
     *  Only the owner of the Compliance smart contract can call this function
     *  emits an `SupplyLimitSet` event
     */
    function setSupplyLimit(uint256 _limit) external onlyOwner {
        supplyLimit = _limit;
        emit SupplyLimitSet(_limit);
    }

    /**
     *  @dev check on the compliance status of a transaction.
     *  This check always returns true, real check is done at the creation action level
     */
    function complianceCheckOnSupplyLimit(
        address, /*_from*/
        address, /*_to*/
        uint256 /*_value*/
    )
        public
        pure
        returns (bool)
    {
        return true;
    }

    /**
     *  @dev state update of the compliance feature post-transfer.
     *  this compliance feature doesn't require state update post-transfer
     *  @param _from the address of the transfer sender
     *  @param _to the address of the transfer receiver
     *  @param _value the amount of tokens that `_from` sent to `_to`
     *  internal function, can be called only from the functions of the Compliance smart contract
     */
    // solhint-disable-next-line no-empty-blocks
    function _transferActionOnSupplyLimit(address _from, address _to, uint256 _value) internal { }

    /**
     *  @dev state update of the compliance feature post-minting.
     *  reverts if the post-minting supply is higher than the max supply
     *  internal function, can be called only from the functions of the Compliance smart contract
     */
    function _creationActionOnSupplyLimit(address, /*_to*/ uint256 /*_value*/ ) internal view {
        require(tokenBound.totalSupply() <= supplyLimit, "cannot mint more tokens");
    }

    /**
     *  @dev state update of the compliance feature post-burning.
     *  this compliance feature doesn't require state update post-burning
     *  @param _from the wallet address on which tokens burnt
     *  @param _value the amount of tokens burnt from `_from` wallet
     *  internal function, can be called only from the functions of the Compliance smart contract
     */
    // solhint-disable-next-line no-empty-blocks
    function _destructionActionOnSupplyLimit(address _from, uint256 _value) internal { }
}
