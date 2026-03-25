// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProjectToken
 * @dev Token ERC-20 nativo del ecosistema Croody (CRD)
 *
 * Funciones heredadas de ERC20:
 * - transfer(address to, uint256 amount)
 * - approve(address spender, uint256 amount)
 * - transferFrom(address from, address to, uint256 amount)
 * - balanceOf(address account)
 * - allowance(address owner, address spender)
 */
contract ProjectToken is ERC20, Ownable {
    constructor() ERC20("Croody Token", "CRD") {
        _mint(address(this), 1_000_000 * 10 ** decimals());
    }

    //ToDo: Define how to distribute tokens to users (e.g., through a faucet, rewards, etc.)
    function distribute(address to, uint256 amount) external onlyOwner {
        require(balanceOf(address(this)) >= amount, "Fondos insuficientes");
        _transfer(address(this), to, amount);
    }
}
