import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts...");

  // TODO: Implementar deployment
  //
  // ORDEN DE DEPLOYMENT:
  // 1. Deploy ProjectToken (ERC-20)
  //    - Configurar supply inicial
  //
  // 2. Deploy NFTCollection (ERC-721)
  //    - Configurar nombre y simbolo
  //
  // 3. Deploy NFTMarketplace
  //    - Pasar address del ProjectToken como payment token
  //    - Configurar comision de la plataforma
  //
  // 4. (Opcional) Mint tokens iniciales para testing
  //
  // 5. Guardar addresses en archivo de configuracion
  //    - Para que el frontend pueda usarlos

  console.log("Deployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
