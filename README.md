# NFT Marketplace

Mini-plataforma Web3 tipo eBay donde los usuarios tienen una billetera con token propio, NFTs y un sistema de subastas.

## Stack Tecnologico

### Frontend

| Tecnologia | Version | Por que la usamos |
|------------|---------|-------------------|
| **Next.js** | 16 | Framework de React con App Router, SSR y routing basado en archivos. Nos permite estructurar las paginas de la DApp de forma clara y tener buen rendimiento de carga |
| **React** | 19 | Libreria base para construir la interfaz con componentes reutilizables y manejo de estado reactivo |
| **TypeScript** | 5 | Tipado estatico para evitar errores en tiempo de desarrollo, especialmente util al trabajar con tipos de blockchain (addresses, uint256, etc.) |
| **Tailwind CSS** | 4 | Framework de estilos utilitario que permite prototipar rapido sin escribir CSS aparte |

### Web3 / Blockchain

| Tecnologia | Version | Por que la usamos |
|------------|---------|-------------------|
| **Solidity** | 0.8.24 | Lenguaje estandar para escribir smart contracts en Ethereum. Tiene la mayor comunidad, documentacion y herramientas disponibles |
| **Hardhat** | 2.19 | Entorno de desarrollo que nos permite compilar, probar y desplegar los contratos desde un solo lugar. Incluye red local para pruebas sin gastar gas real |
| **OpenZeppelin** | 5.0 | Libreria de contratos auditados y probados (ERC-20, ERC-721, ReentrancyGuard). Nos evita escribir logica critica de seguridad desde cero |
| **Wagmi + Viem** | - | SDK para conectar el frontend con la blockchain: leer datos de contratos, enviar transacciones y escuchar eventos |
| **RainbowKit** | - | Componente que maneja la conexion de wallets externas (MetaMask, WalletConnect) con una interfaz lista para usar |

### Backend y almacenamiento

| Tecnologia | Uso | Por que la usamos |
|------------|-----|-------------------|
| **Firebase / Supabase** | Base de datos para perfiles de usuario y datos off-chain | Necesitamos almacenar informacion que no va en la blockchain (perfiles, preferencias, historial de actividad). Ambas opciones ofrecen auth, base de datos y hosting sin necesidad de levantar un servidor propio |
| **IPFS** | Almacenamiento de metadata e imagenes de NFTs | Los archivos de los NFTs no van en la blockchain porque seria muy costoso en gas. IPFS es descentralizado y gratuito |

### Infraestructura

| Tecnologia | Uso |
|------------|-----|
| **Ethereum Sepolia Testnet** | Red de pruebas donde desplegamos los contratos. Funciona igual que Mainnet pero sin costos reales |
| **Vercel** | Deploy del frontend (Next.js se despliega nativamente en Vercel) |

## Features

### Wallet Digital
- **Token propio**: ProjectToken (ERC-20) como moneda del marketplace
- **Balance en tiempo real**: Actualizacion automatica del saldo
- **Transferencias P2P**: Enviar tokens a otros usuarios
- **Ver NFTs**: Lista de NFTs que posee el usuario
- **Enviar NFTs**: Transferir NFTs directamente a otras direcciones

### NFTs (ERC-721)
- **Ver coleccion**: Explorar NFTs disponibles
- **Transferir**: Enviar NFTs a otros usuarios

### Marketplace con Subastas
- **Compra directa**: Comprar NFTs a precio fijo (pago con ProjectToken)
- **Subastas tipo eBay**: Sistema de pujas con tiempo limite
- **Finalizacion automatica**: Al terminar la subasta, el NFT cambia de dueno y el vendedor recibe los tokens

---

## Estructura del Proyecto

```text
croody_web3_project/
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── README.md
├── public/                      # Assets estaticos (imagenes, icons, etc.)
├── src/
│   ├── app/                     # Rutas y paginas (Next.js App Router)
│   ├── components/              # Componentes UI reutilizables
│   ├── hooks/                   # Custom hooks (wallet, contracts, estado)
│   ├── lib/                     # Config Web3, ABIs, utilidades
│   └── styles/                  # Estilos globales/tema
├── contracts/
│   ├── hardhat.config.ts        # Configuracion de Hardhat
│   ├── package.json
│   ├── tsconfig.json
│   ├── contracts/               # Smart contracts Solidity
│   │   ├── NFTCollection.sol
│   │   ├── NFTMarketplace.sol
│   │   └── ...
│   ├── scripts/                 # Scripts de deploy/migraciones
│   └── test/                    # Tests de contratos
└── .next/                       # Build/cache generado por Next.js
```

**Referencias rapidas:**
- Frontend: [src/app](src/app), [src/components](src/components), [src/hooks](src/hooks), [src/lib](src/lib), [src/styles](src/styles)
- Contratos: [contracts/contracts/NFTCollection.sol](contracts/contracts/NFTCollection.sol), [contracts/contracts/NFTMarketplace.sol](contracts/contracts/NFTMarketplace.sol), [contracts/hardhat.config.ts](contracts/hardhat.config.ts)
- Config principal: [next.config.ts](next.config.ts), [package.json](package.json), [tsconfig.json](tsconfig.json)

---

## Arquitectura del Sistema

### Vista General

```text
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                   │
│  UI (App Router) + Hooks + Estado + Wallet Connection       │
└──────────────────────────────┬───────────────────────────────┘
                               │ wagmi/viem + RainbowKit
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                   BLOCKCHAIN (Sepolia/Local)                │
│  ProjectToken (ERC-20) + NFTCollection (ERC-721) + Market   │
└──────────────────────────────┬───────────────────────────────┘
                               │ tokenURI / metadata
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                 ALMACENAMIENTO OFF-CHAIN                    │
│   IPFS (imagenes + metadata) + Firebase/Supabase (perfiles) │
└──────────────────────────────────────────────────────────────┘
```

### Relacion entre Smart Contracts

```text
┌─────────────────────────────────────────────────────────────────┐
│                      NFTMarketplace                              │
│  (Contrato Central - Orquesta todas las operaciones)            │
└─────────────────────────────────────────────────────────────────┘
          │                                        │
          │ transferFrom()                         │ transferFrom()
          │ (mueve tokens)                         │ (mueve NFTs)
          ▼                                        ▼
┌──────────────────────┐              ┌──────────────────────┐
│    ProjectToken      │              │    NFTCollection     │
│      (ERC-20)        │              │      (ERC-721)       │
│                      │              │                      │
│  Moneda de pago      │              │  Coleccionables      │
│  del marketplace     │              │  digitales           │
└──────────────────────┘              └──────────────────────┘
```

### Flujo de Datos - Compra Directa

```text
┌────────┐         ┌────────────┐         ┌─────────────┐         ┌────────┐
│Comprador│        │ProjectToken│         │NFTMarketplace│        │Vendedor│
└────┬───┘         └─────┬──────┘         └──────┬──────┘         └───┬────┘
     │                   │                       │                    │
     │  1. approve()     │                       │                    │
     │──────────────────>│                       │                    │
     │                   │                       │                    │
     │  2. buyItem()     │                       │                    │
     │──────────────────────────────────────────>│                    │
     │                   │                       │                    │
     │                   │  3. transferFrom()    │                    │
     │                   │<──────────────────────│                    │
     │                   │     (tokens)          │                    │
     │                   │─────────────────────────────────────────>  │
     │                   │                       │                    │
     │                   │                       │  4. transferFrom() │
     │<─────────────────────────────────────────────────────────────  │
     │                   │                       │      (NFT)         │
     │                   │                       │                    │
```

### Flujo de Datos - Subasta

```text
┌────────┐    ┌────────┐    ┌────────────┐    ┌─────────────┐    ┌────────┐
│Vendedor│    │Pujador1│    │ProjectToken│    │NFTMarketplace│   │Pujador2│
└───┬────┘    └───┬────┘    └─────┬──────┘    └──────┬──────┘    └───┬────┘
    │             │               │                  │               │
    │ 1. createAuction()         │                  │               │
    │───────────────────────────────────────────────>               │
    │             │               │                  │               │
    │             │ 2. approve()  │                  │               │
    │             │──────────────>│                  │               │
    │             │               │                  │               │
    │             │ 3. placeBid() │                  │               │
    │             │──────────────────────────────────>               │
    │             │               │                  │               │
    │             │               │  4. hold tokens  │               │
    │             │               │<─────────────────│               │
    │             │               │                  │               │
    │             │               │                  │  5. approve() │
    │             │               │<─────────────────────────────────│
    │             │               │                  │               │
    │             │               │                  │  6. placeBid()│
    │             │               │                  │<──────────────│
    │             │               │                  │   (mayor)     │
    │             │               │                  │               │
    │             │  7. refund    │                  │               │
    │             │<──────────────────────────────────               │
    │             │   (tokens)    │                  │               │
    │             │               │                  │               │
    │             │               │     [TIEMPO TERMINA]             │
    │             │               │                  │               │
    │  8. tokens  │               │  9. endAuction() │               │
    │<───────────────────────────────────────────────────────────────│
    │             │               │                  │               │
    │             │               │                  │  10. NFT      │
    │             │               │                  │──────────────>│
```

### Componentes del Frontend

- **Layout global** ([src/app](src/app)): estructura base, navbar/footer y providers.
- **Paginas de marketplace** ([src/app](src/app)): listado de NFTs, detalle, compra y subastas.
- **Componentes UI** ([src/components](src/components)): cards de NFT, formularios, tablas de pujas, botones de accion.
- **Hooks Web3** ([src/hooks](src/hooks)): conexion de wallet, lectura de balances, llamados a contratos y manejo de tx.
- **Capa de utilidades** ([src/lib](src/lib)): ABIs, direcciones de contratos, helpers de formato y configuracion wagmi/viem.
- **Estilos** ([src/styles](src/styles)): tema visual y estilos globales.

### Mapa de Navegacion

```text
/ (Home)
├─ /marketplace
│  ├─ /marketplace/[listingId]      # Detalle y compra directa
│  └─ /marketplace/create           # Listar NFT
├─ /auctions
│  ├─ /auctions/[auctionId]         # Detalle y pujas
│  └─ /auctions/create              # Crear subasta
├─ /wallet                          # Balance, transferencias, NFTs propios
├─ /collection                      # Explorar NFTs (ERC-721)
└─ /profile                         # Perfil/historial (off-chain)
```

> Nota: ajusta los paths exactos segun las rutas reales definidas en [src/app](src/app).

---
<!-- ...existing code... -->
