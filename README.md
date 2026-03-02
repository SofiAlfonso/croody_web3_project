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
- **Crear/Mintear**: Los usuarios pueden crear sus propios NFTs
- **Ver coleccion**: Explorar NFTs disponibles
- **Transferir**: Enviar NFTs a otros usuarios

### Marketplace con Subastas
- **Compra directa**: Comprar NFTs a precio fijo (pago con ProjectToken)
- **Subastas tipo eBay**: Sistema de pujas con tiempo limite
- **Finalizacion automatica**: Al terminar la subasta, el NFT cambia de dueno y el vendedor recibe los tokens

---

## Estructura del Proyecto

```
croody_web3_project/
├── contracts/                     # Smart Contracts (Hardhat)
│   ├── contracts/
│   │   ├── ProjectToken.sol       # Token ERC-20
│   │   ├── NFTCollection.sol      # Coleccion ERC-721
│   │   ├── NFTMarketplace.sol     # Marketplace + subastas
│   │   └── interfaces/
│   ├── scripts/
│   │   └── deploy.ts
│   ├── test/
│   ├── hardhat.config.ts
│   └── package.json
├── public/
├── src/
│   ├── app/                       # Paginas (Next.js App Router)
│   │   ├── page.tsx               # Home
│   │   ├── dashboard/page.tsx     # Dashboard principal
│   │   ├── send/page.tsx          # Envio de tokens
│   │   ├── nft/[id]/page.tsx      # Detalle de NFT
│   │   └── auction/[id]/page.tsx  # Detalle de subasta
│   ├── components/
│   │   ├── HomeClient.tsx
│   │   ├── Dashboard.tsx
│   │   ├── SendTokens.tsx
│   │   ├── NftDetail.tsx
│   │   └── AuctionDetail.tsx
│   ├── hooks/
│   │   ├── useWallet.ts
│   │   ├── useNfts.ts
│   │   ├── useAuctions.ts
│   │   ├── useCreateAuction.ts
│   │   ├── usePlaceBid.ts
│   │   ├── useSendTokens.ts
│   │   ├── useTransferNft.ts
│   │   └── useMarketplaceData.ts
│   ├── lib/
│   │   └── mock-data.ts
│   └── styles/
│       └── theme.css
├── package.json
└── README.md
```

---

## Arquitectura del Sistema

### Vista General

```
┌──────────────────────────┐
│      Usuario Web3        │
└─────────────┬────────────┘
              ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Frontend Next.js (App Router)                                       │
│ - / (HomeClient)                                                    │
│ - /dashboard (Dashboard)                                            │
│ - /send, /nft/[id], /auction/[id]                                  │
└──────────────────────────┬───────────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Capa de Hooks                                                       │
│ - useWallet, useNfts, useAuctions                                   │
│ - useCreateAuction, usePlaceBid, useSendTokens, useTransferNft      │
└──────────────────────────┬───────────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Datos                                                               │
│ - Estado mock en src/lib/mock-data.ts                               │
│ - Contratos Solidity en contracts/contracts/                        │
│   (ProjectToken, NFTCollection, NFTMarketplace)                     │
└──────────────────────────────────────────────────────────────────────┘
```

### Relacion entre Smart Contracts

```
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

```
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

```
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

```
┌──────────────────────────────────────────────────────────────────────┐
│ src/components                                                       │
├──────────────────────────────────────────────────────────────────────┤
│ HomeClient.tsx   -> Landing y conexion de wallet                    │
│ Dashboard.tsx    -> Vista principal (balance, NFTs, subastas)       │
│ SendTokens.tsx   -> Flujo de envio de tokens CRD                    │
│ NftDetail.tsx    -> Detalle del NFT + acciones (subastar/transferir)│
│ AuctionDetail.tsx-> Detalle de subasta + puja                       │
└──────────────────────────────────────────────────────────────────────┘
```

### Mapa de Navegacion

```
                 ┌──────────────────────┐
                 │   Home ( / )         │
                 │   HomeClient.tsx     │
                 └──────────┬───────────┘
                            │ Connect Wallet
                            ▼
                 ┌──────────────────────┐
                 │ Dashboard (/dashboard)│
                 │ Dashboard.tsx         │
                 └───────┬──────────────┘
                         │
           ┌─────────────┼──────────────┬──────────────────┐
           ▼             ▼              ▼                  ▼
   /send            /nft/[id]      /auction/[id]      (volver a /)
 SendTokens.tsx     NftDetail.tsx   AuctionDetail.tsx   al desconectar
```

---

## Smart Contracts

### ProjectToken.sol (ERC-20)
Token propio del proyecto usado como moneda de pago.

**Funciones principales:**
- `transfer(address to, uint256 amount)` - Enviar tokens P2P
- `approve(address spender, uint256 amount)` - Aprobar gasto (requerido antes de comprar/pujar)
- `balanceOf(address account)` - Consultar balance

### NFTCollection.sol (ERC-721)
Coleccion de NFTs del marketplace.

**Funciones principales:**
- `mint(address to, string tokenURI)` - Crear nuevo NFT
- `transferFrom(address from, address to, uint256 tokenId)` - Transferir NFT
- `approve(address to, uint256 tokenId)` - Aprobar transferencia

### NFTMarketplace.sol
Marketplace con listings y subastas. **Usa ProjectToken como pago, NO ETH.**

**Listings (precio fijo):**
- `listItem(address nft, uint256 tokenId, uint256 price)` - Listar NFT
- `buyItem(uint256 listingId)` - Comprar (requiere approve de tokens)
- `cancelListing(uint256 listingId)` - Cancelar

**Subastas:**
- `createAuction(address nft, uint256 tokenId, uint256 startPrice, uint256 duration)` - Crear subasta
- `placeBid(uint256 auctionId, uint256 amount)` - Pujar (requiere approve de tokens)
- `endAuction(uint256 auctionId)` - Finalizar (transfiere NFT y tokens)

---

## Flujo de Compra/Subasta

```
COMPRA DIRECTA:
1. Comprador llama approve(marketplace, precio) en ProjectToken
2. Comprador llama buyItem(listingId) en Marketplace
3. Marketplace hace transferFrom de tokens (comprador -> vendedor)
4. Marketplace hace transferFrom de NFT (vendedor -> comprador)

SUBASTA:
1. Vendedor aprueba NFT al marketplace y crea subasta
2. Pujador llama approve(marketplace, cantidad) en ProjectToken
3. Pujador llama placeBid(auctionId, cantidad)
4. Si hay puja anterior, se devuelven tokens al pujador anterior
5. Al terminar tiempo, cualquiera puede llamar endAuction()
6. NFT va al ganador, tokens van al vendedor
```

---

## Instalacion

### 1. Clonar e instalar

```bash
git clone https://github.com/SofiAlfonso/croody_web3_project
cd croody_web3_project
npm install
```

### 2. Instalar dependencias de contratos

```bash
cd contracts
npm install
cd ..
```

### 3. Configurar variables de entorno

> Actualmente no hay archivos `.env.example` en el repo. Crea los archivos manualmente si necesitas llaves/RPC para pruebas en red.

### 4. Compilar y testear contratos

```bash
cd contracts
npx hardhat compile
npx hardhat test
```

### 5. Deploy local (desarrollo)

```bash
# Terminal 1: Nodo local
cd contracts
npx hardhat node

# Terminal 2: Deploy
npx hardhat run scripts/deploy.ts --network localhost
```

### 6. Iniciar frontend

```bash
npm run dev
```

---

## Paginas

| Ruta | Descripcion |
|------|-------------|
| `/` | Home y conexion de wallet |
| `/dashboard` | Panel principal: balance, NFTs y subastas |
| `/send` | Envio de tokens CRD |
| `/nft/[id]` | Detalle de NFT y acciones del owner |
| `/auction/[id]` | Detalle de subasta y pujas |

---

## Hooks

| Hook | Descripcion |
|------|-------------|
| `useWallet` | Estado de conexion de wallet (connect/disconnect) |
| `useNfts` | Lectura de NFTs del usuario y detalle por id (mock) |
| `useAuctions` | Lectura de subastas live, propias y por id (mock) |
| `useCreateAuction` | Crear subasta (placeholder) |
| `usePlaceBid` | Enviar puja (placeholder) |
| `useSendTokens` | Envio de tokens (placeholder) |
| `useTransferNft` | Transferencia de NFT (placeholder) |
| `useMarketplaceData` | Re-export de hooks de `useNfts` y `useAuctions` |

---

## Variables de Entorno

### Frontend (.env.local)
```
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=
NEXT_PUBLIC_PROJECT_TOKEN_ADDRESS=
NEXT_PUBLIC_NFT_COLLECTION_ADDRESS=
NEXT_PUBLIC_MARKETPLACE_ADDRESS=
```

### Contracts (.env)
```
PRIVATE_KEY=
ETHERSCAN_API_KEY=
SEPOLIA_RPC_URL=
```

---

## Seguridad

- **ReentrancyGuard**: Proteccion contra ataques de reentrancia
- **Validaciones**: Owner del NFT, aprobaciones, tiempos de subasta
- **Devolucion de pujas**: Tokens devueltos a pujadores perdedores
- **No ETH directo**: Uso de ERC-20 con approve pattern

---

## Licencia

MIT