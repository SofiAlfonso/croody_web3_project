// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProjectToken
 * @author Croody Team
 * @notice Token ERC-20 nativo del ecosistema Croody (CRD)
 *
 * Funciones heredadas de ERC20:
 * - transfer(address to, uint256 amount)
 * - approve(address spender, uint256 amount)
 * - transferFrom(address from, address to, uint256 amount)
 * - balanceOf(address account)
 * - allowance(address owner, address spender)
 */
contract ProjectToken is ERC20, Ownable {
    error InsufficientFunds();

    constructor() ERC20("Croody Token", "CRD") {
        _mint(address(this), 1_000_000 * 10 ** decimals());
    }

    /// @notice Distribuye tokens CRD a un usuario
    /// @param to Dirección del destinatario
    /// @param amount Cantidad de tokens a distribuir
    //ToDo: Define how to distribute tokens to users (e.g., through a faucet, rewards, etc.)
    function distribute(address to, uint256 amount) external onlyOwner {
        if (balanceOf(address(this)) < amount) revert InsufficientFunds();
        _transfer(address(this), to, amount);
    }
}
