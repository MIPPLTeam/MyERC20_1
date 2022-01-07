// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Refundable is Context{

    /**
     * @dev Emitted when refundETH is made by `account`.
     */
    event RefundedETH(address account);

    /**
     * @dev Emitted when refundToken is made by `account`.
     */
    event RefundedToken(address account);

    function _refundETH( address payable recipient, uint256 amount ) 
        internal
        returns (bool success)
    {
        require(address(this).balance != 0, "refundETH: No trapped ETH");
        require(address(this).balance >= amount, "refundETH: Not enough ETH to transfer");
        recipient.transfer(amount);
        emit RefundedETH(_msgSender());
        return true;
    }

    function _refundToken(address tokenAddress, address recipient, uint256 amount) 
        internal
        returns (bool success)
    {
        ERC20 token = ERC20(tokenAddress);
        require(token.balanceOf(address(this)) != 0, "refundToken: No trapped tokens");
        require(token.balanceOf(address(this)) >= amount, "refundToken: Not enouth tokens to transfer");
        token.transfer(recipient, amount);
        emit RefundedToken(_msgSender());
        return true;
    }    
}