const { ethers, network } = require("hardhat");

async function main() {
  console.log("Deploying contracts to", network.name, "...\n");
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // 1. Deploy MatchStake
  const MatchStake = await ethers.getContractFactory("MatchStake");
  const matchStake = await MatchStake.deploy();
  await matchStake.waitForDeployment();
  const matchStakeAddress = await matchStake.getAddress();
  console.log("MatchStake deployed to:", matchStakeAddress);

  // 2. Deploy PredictionNFT
  const PredictionNFT = await ethers.getContractFactory("PredictionNFT");
  const predictionNFT = await PredictionNFT.deploy(matchStakeAddress);
  await predictionNFT.waitForDeployment();
  const nftAddress = await predictionNFT.getAddress();
  console.log("PredictionNFT deployed to:", nftAddress);

  // 3. Link them
  const txLink = await matchStake.setPredictionNFT(nftAddress);
  await txLink.wait();
  console.log("PredictionNFT linked to MatchStake contract successfully.");

  // 4. Seed Matches
  const matches = [
    { home: "Mexico", away: "Canada", kickoff: Math.floor(Date.now() / 1000) + 86400 * 22 },
    { home: "USA", away: "Morocco", kickoff: Math.floor(Date.now() / 1000) + 86400 * 23 },
    { home: "Argentina", away: "Japan", kickoff: Math.floor(Date.now() / 1000) + 86400 * 24 },
    { home: "Brazil", away: "South Korea", kickoff: Math.floor(Date.now() / 1000) + 86400 * 24 },
    { home: "France", away: "Germany", kickoff: Math.floor(Date.now() / 1000) + 86400 * 25 },
    { home: "England", away: "Spain", kickoff: Math.floor(Date.now() / 1000) + 86400 * 25 },
  ];

  console.log("\nSeeding matches...");
  for (const m of matches) {
    const tx = await matchStake.createMatch(m.home, m.away, m.kickoff);
    await tx.wait();
    console.log("  " + m.home + " vs " + m.away);
  }

  // 5. Seed a demo Squad to make it easy to test on-chain squads
  console.log("\nSeeding initial demo Squads...");
  try {
    const txSquad = await matchStake.createSquad("X LAYER GIANTS");
    await txSquad.wait();
    console.log("  Squad 'X LAYER GIANTS' created successfully.");
  } catch (e) {
    console.log("  Failed to seed squad (probably not deployer's first time or other error):", e.message);
  }

  console.log("\nDone! Contract configuration ready.");
  console.log("==========================================");
  console.log("MatchStake:", matchStakeAddress);
  console.log("PredictionNFT:", nftAddress);
  console.log("==========================================");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
