/**
 * Funciones utilitarias
 */

/**
 * Truncar address para mostrar
 * 0x1234...5678
 */
export function truncateAddress(address: string): string {
  // TODO: Implementar
  return address;
}

/**
 * Formatear precio en ETH
 */
export function formatEth(wei: bigint): string {
  // TODO: Implementar con viem formatEther
  return "";
}

/**
 * Convertir IPFS URI a URL HTTP
 * ipfs://... -> https://gateway.pinata.cloud/ipfs/...
 */
export function ipfsToHttp(uri: string): string {
  // TODO: Implementar
  return uri;
}

/**
 * Validar que es una address valida
 */
export function isValidAddress(address: string): boolean {
  // TODO: Implementar con viem isAddress
  return false;
}
