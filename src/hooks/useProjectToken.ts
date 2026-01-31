/**
 * Hook para interactuar con el contrato ProjectToken (ERC-20)
 *
 * TODO: Implementar funciones:
 *
 * LECTURA:
 * - balanceOf: Obtener balance de una direccion
 * - allowance: Obtener cantidad aprobada para un spender
 * - totalSupply: Supply total del token
 *
 * ESCRITURA:
 * - transfer: Enviar tokens P2P
 * - approve: Aprobar spender (necesario antes de comprar/pujar)
 * - transferFrom: Transfer con allowance (usado por marketplace)
 *
 * TIEMPO REAL:
 * - Suscribirse a eventos Transfer para actualizar balance
 * - useWatchContractEvent de wagmi
 */
export function useProjectToken() {
  // TODO: Implementar con wagmi useReadContract, useWriteContract, useWatchContractEvent

  return {
    // Lectura
    // balance,
    // allowance,

    // Escritura
    // transfer,
    // approve,

    // Estados
    // isLoading,
    // error,
  };
}
