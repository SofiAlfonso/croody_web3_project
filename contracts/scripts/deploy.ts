import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts...");

  // TODO: Implementar deployment
  // 1. Deploy NFTCollection
  // 2. Deploy NFTMarketplace
  // 3. Configurar permisos si es necesario
  // 4. Guardar addresses en archivo de configuracion

  console.log("Deployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
