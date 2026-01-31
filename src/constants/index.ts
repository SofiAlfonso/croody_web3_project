/**
 * Constantes de la aplicacion
 */

// Chain IDs
export const CHAIN_IDS = {
  LOCALHOST: 31337,
  SEPOLIA: 11155111,
  MAINNET: 1,
} as const;

// Duraciones de subasta predefinidas (en segundos)
export const AUCTION_DURATIONS = {
  ONE_DAY: 86400,
  THREE_DAYS: 259200,
  SEVEN_DAYS: 604800,
} as const;

// Comision del marketplace (en basis points, 250 = 2.5%)
export const MARKETPLACE_FEE_BPS = 250;

// IPFS Gateway
export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

// Links de navegacion
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explorar" },
  { href: "/create", label: "Crear" },
] as const;
