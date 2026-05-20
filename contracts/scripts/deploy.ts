import { ethers } from "hardhat";
import * as fs from "node:fs";
import * as path from "node:path";

async function main() {
  console.log("Deploying contracts...");

  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const network = await ethers.provider.getNetwork();
  const isLocalhost = network.chainId === 31337n;
  const ownerA = isLocalhost ? signers[1] : deployer;
  const ownerB = isLocalhost ? signers[2] : deployer;

  const nftCollectionFactory = await ethers.getContractFactory("NFTCollection");
  const nftCollection = await nftCollectionFactory.deploy(deployer.address);
  await nftCollection.waitForDeployment();

  const nftCollectionAddress = await nftCollection.getAddress();

  const projectTokenFactory = await ethers.getContractFactory("ProjectToken");
  const projectToken = await projectTokenFactory.deploy();
  await projectToken.waitForDeployment();

  const projectTokenAddress = await projectToken.getAddress();

  const marketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
  const marketplace = await marketplaceFactory.deploy(projectTokenAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();

  const seedURIs = [
    "ipfs://bafkreifakecroody001/metadata.json",
    "ipfs://bafkreifakecroody002/metadata.json",
    "ipfs://bafkreifakecroody003/metadata.json",
    "ipfs://bafkreifakecroody004/metadata.json",
  ];

  const mintPlan = [
    { to: deployer.address, uri: seedURIs[0] },
    { to: deployer.address, uri: seedURIs[1] },
    { to: ownerA.address, uri: seedURIs[2] },
    { to: ownerB.address, uri: seedURIs[3] },
  ];

  for (const mint of mintPlan) {
    const tx = await nftCollection.mintTo(mint.to, mint.uri);
    await tx.wait();
  }

  // Distribute initial CRD tokens for testing
  const initialCRD = ethers.parseEther("10000"); // 10,000 CRD each
  console.log("Distributing 10,000 CRD to test accounts...");
  await (await projectToken.distribute(deployer.address, initialCRD)).wait();
  await (await projectToken.distribute(ownerA.address, initialCRD)).wait();
  await (await projectToken.distribute(ownerB.address, initialCRD)).wait();

  const deploymentData = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    ownerA: ownerA.address,
    ownerB: ownerB.address,
    contracts: {
      nftCollection: nftCollectionAddress,
      projectToken: projectTokenAddress,
      nftMarketplace: marketplaceAddress,
    },
  };

  const artifactsDir = path.resolve(__dirname, "..", "deployments");
  fs.mkdirSync(artifactsDir, { recursive: true });
  const networkFile = path.join(artifactsDir, "localhost.json");
  fs.writeFileSync(networkFile, JSON.stringify(deploymentData, null, 2));

  const frontendArtifact = path.resolve(
    __dirname,
    "..",
    "..",
    "src",
    "lib",
    "deployed-addresses.json",
  );
  fs.writeFileSync(frontendArtifact, JSON.stringify(deploymentData, null, 2));

  console.log("NFTCollection deployed at:", nftCollectionAddress);
  console.log("ProjectToken deployed at:", projectTokenAddress);
  console.log("NFTMarketplace deployed at:", marketplaceAddress);
  console.log("Deployment artifacts written to:");
  console.log("-", networkFile);
  console.log("-", frontendArtifact);

  console.log("Deployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
