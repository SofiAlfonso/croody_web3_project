# NFT Marketplace

Mini-plataforma Web3 tipo eBay donde los usuarios tienen una billetera con token propio, NFTs y un sistema de subastas.

## Stack Tecnologico

| Tecnologia | Uso |
|------------|-----|
| Next.js 14 | Frontend con App Router |
| Solidity | Smart Contracts |
| Hardhat | Desarrollo y testing de contratos |
| RainbowKit | Conexion de wallet |
| wagmi + viem | Interaccion con blockchain |
| Tailwind CSS | Estilos |
| TypeScript | Tipado estatico |

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
nft-marketplace/
├── contracts/                    # Smart Contracts (Hardhat)
│   ├── contracts/
│   │   ├── ProjectToken.sol      # Token ERC-20 propio
│   │   ├── NFTCollection.sol     # Coleccion ERC-721
│   │   ├── NFTMarketplace.sol    # Marketplace + Subastas
│   │   └── interfaces/
│   ├── scripts/
│   │   └── deploy.ts
│   └── test/
│
├── src/
│   ├── app/                      # Paginas (Next.js App Router)
│   │   ├── page.tsx              # Home
│   │   ├── wallet/               # Billetera del usuario
│   │   ├── explore/              # Explorar NFTs
│   │   ├── create/               # Crear NFT
│   │   ├── nft/[id]/             # Detalle NFT
│   │   ├── auction/[id]/         # Detalle subasta
│   │   └── profile/[address]/    # Perfil usuario
│   │
│   ├── components/
│   │   ├── layout/               # Header, Footer, Sidebar
│   │   ├── wallet/               # TokenBalance, SendTokenForm, SendNFTModal, MyNFTsGrid
│   │   ├── nft/                  # NFTCard, NFTGrid, NFTDetails, CreateNFTForm
│   │   ├── marketplace/          # ListingCard, BuyButton, PriceDisplay
│   │   ├── auction/              # AuctionCard, BidForm, BidHistory, AuctionTimer
│   │   └── ui/                   # Button, Input, Modal, Card
│   │
│   ├── hooks/
│   │   ├── useProjectToken.ts    # Balance, transfer, approve
│   │   ├── useNFTCollection.ts   # Mint, transfer, ownerOf
│   │   ├── useNFTMarketplace.ts  # Listings, compras
│   │   ├── useAuction.ts         # Subastas, pujas
│   │   ├── useWallet.ts          # Estado consolidado de wallet
│   │   └── useIPFS.ts            # Subir archivos a IPFS
│   │
│   ├── lib/                      # wagmi config, contracts, utils
│   ├── types/                    # TypeScript types
│   └── constants/
│
└── public/
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
git clone <repo-url>
cd nft-marketplace
npm install
```

### 2. Instalar dependencias de contratos

```bash
cd contracts
npm install
cd ..
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
cp contracts/.env.example contracts/.env
```

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
| `/` | Home con NFTs destacados |
| `/wallet` | Billetera: balance, enviar tokens, mis NFTs |
| `/explore` | Explorar todos los NFTs |
| `/create` | Crear/Mintear nuevo NFT |
| `/nft/[id]` | Detalle de NFT con opcion de compra |
| `/auction/[id]` | Detalle de subasta con pujas |
| `/profile/[address]` | Perfil de usuario |

---

## Hooks

| Hook | Descripcion |
|------|-------------|
| `useProjectToken` | Balance, transfer, approve del token ERC-20 |
| `useNFTCollection` | Mint, transfer, ownerOf de NFTs |
| `useNFTMarketplace` | Crear listings, comprar NFTs |
| `useAuction` | Crear subastas, pujar, finalizar |
| `useWallet` | Estado consolidado (tokens + NFTs + conexion) |
| `useIPFS` | Subir imagenes y metadata a IPFS |

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
