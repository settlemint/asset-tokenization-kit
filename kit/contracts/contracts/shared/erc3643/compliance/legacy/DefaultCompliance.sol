// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { BasicCompliance } from "./BasicCompliance.sol";

contract DefaultCompliance is BasicCompliance {
    /**
     *  @dev See {ICompliance-transferred}.
     */
    // solhint-disable-next-line no-empty-blocks
    function transferred(address _from, address _to, uint256 _value) external override { }

    /**
     *  @dev See {ICompliance-created}.
     */
    // solhint-disable-next-line no-empty-blocks
    function created(address _to, uint256 _value) external override { }

    /**
     *  @dev See {ICompliance-destroyed}.
     */
    // solhint-disable-next-line no-empty-blocks
    function destroyed(address _from, uint256 _value) external override { }

    /**
     *  @dev See {ICompliance-canTransfer}.
     */
    function canTransfer(
        address, /*_from*/
        address, /*_to*/
        uint256 /*_value*/
    )
        external
        pure
        override
        returns (bool)
    {
        return true;
    }
}
