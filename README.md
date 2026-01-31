# NFT Marketplace

Plataforma de marketplace de NFTs tipo eBay construida con Next.js, Solidity y Hardhat.

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

- **Crear/Mintear NFTs**: Los usuarios pueden crear sus propios NFTs
- **Compra Directa**: Comprar NFTs a precio fijo
- **Subastas**: Sistema de pujas tipo eBay con temporizador

---

## Estructura del Proyecto

```
nft-marketplace/
├── contracts/              # Smart Contracts (Hardhat)
│   ├── contracts/          # Archivos .sol
│   ├── scripts/            # Scripts de deployment
│   └── test/               # Tests de contratos
│
├── src/
│   ├── app/                # Paginas (Next.js App Router)
│   ├── components/         # Componentes React
│   ├── hooks/              # Custom hooks Web3
│   ├── lib/                # Utilidades y configuracion
│   ├── types/              # TypeScript types
│   └── constants/          # Constantes (addresses, etc.)
│
└── public/                 # Archivos estaticos
```

---

## Instalacion

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd nft-marketplace
```

### 2. Instalar dependencias del frontend

```bash
npm install
```

### 3. Instalar dependencias de contratos

```bash
cd contracts
npm install
cd ..
```

### 4. Configurar variables de entorno

```bash
# En la raiz del proyecto
cp .env.example .env.local

# En la carpeta contracts
cp contracts/.env.example contracts/.env
```

### 5. Compilar contratos

```bash
cd contracts
npx hardhat compile
```

### 6. Ejecutar tests de contratos

```bash
cd contracts
npx hardhat test
```

### 7. Iniciar servidor de desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Smart Contracts

### NFTCollection.sol
Contrato ERC-721 para crear y gestionar NFTs.

**Funciones principales:**
- `mint(address to, string tokenURI)` - Crear nuevo NFT
- `tokenURI(uint256 tokenId)` - Obtener metadata del NFT
- `approve(address to, uint256 tokenId)` - Aprobar transferencia

### NFTMarketplace.sol
Contrato principal del marketplace.

**Funciones principales:**
- `listItem(address nft, uint256 tokenId, uint256 price)` - Listar NFT a precio fijo
- `buyItem(address nft, uint256 tokenId)` - Comprar NFT
- `createAuction(address nft, uint256 tokenId, uint256 startPrice, uint256 duration)` - Crear subasta
- `placeBid(uint256 auctionId)` - Hacer puja
- `endAuction(uint256 auctionId)` - Finalizar subasta

---

## Paginas del Frontend

| Ruta | Descripcion |
|------|-------------|
| `/` | Pagina principal con NFTs destacados |
| `/explore` | Explorar todos los NFTs |
| `/create` | Crear/Mintear nuevo NFT |
| `/nft/[id]` | Detalle de un NFT |
| `/auction/[id]` | Detalle de una subasta |
| `/profile/[address]` | Perfil de usuario |

---

## Componentes Principales

### Layout
- `Header.tsx` - Navbar con boton de conectar wallet
- `Footer.tsx` - Footer del sitio
- `Sidebar.tsx` - Navegacion lateral

### NFT
- `NFTCard.tsx` - Tarjeta de NFT
- `NFTGrid.tsx` - Grid de NFTs
- `NFTDetails.tsx` - Vista detallada
- `CreateNFTForm.tsx` - Formulario de creacion

### Marketplace
- `ListingCard.tsx` - Tarjeta de listing
- `BuyButton.tsx` - Boton de compra
- `PriceDisplay.tsx` - Mostrar precio en ETH

### Auction
- `AuctionCard.tsx` - Tarjeta de subasta
- `BidForm.tsx` - Formulario para pujar
- `BidHistory.tsx` - Historial de pujas
- `AuctionTimer.tsx` - Cuenta regresiva

---

## Hooks Personalizados

| Hook | Descripcion |
|------|-------------|
| `useNFTMarketplace` | Interactuar con el contrato del marketplace |
| `useNFTCollection` | Interactuar con el contrato de NFTs |
| `useAuction` | Gestionar subastas |
| `useIPFS` | Subir archivos a IPFS |

---

## Redes Soportadas

| Red | Chain ID | Uso |
|-----|----------|-----|
| Localhost | 31337 | Desarrollo local |
| Sepolia | 11155111 | Testnet |
| Ethereum | 1 | Mainnet |

---

## Scripts Disponibles

### Frontend
```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de produccion
npm run start     # Iniciar build
npm run lint      # Ejecutar linter
```

### Contracts
```bash
npx hardhat compile              # Compilar contratos
npx hardhat test                 # Ejecutar tests
npx hardhat node                 # Nodo local
npx hardhat run scripts/deploy.ts --network localhost  # Deploy local
npx hardhat run scripts/deploy.ts --network sepolia    # Deploy testnet
```

---

## Variables de Entorno

### Frontend (.env.local)
```
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=   # ID de WalletConnect
NEXT_PUBLIC_MARKETPLACE_ADDRESS=          # Address del marketplace
NEXT_PUBLIC_NFT_COLLECTION_ADDRESS=       # Address de la coleccion
```

### Contracts (.env)
```
PRIVATE_KEY=                # Private key para deploy
ETHERSCAN_API_KEY=          # Para verificar contratos
SEPOLIA_RPC_URL=            # RPC de Sepolia
MAINNET_RPC_URL=            # RPC de Mainnet
```

---

## Licencia

MIT
"# croody_web3_project" 
