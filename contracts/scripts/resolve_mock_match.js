const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const matchId = process.env.MATCH_ID;
  const homeScore = parseInt(process.env.HOME_SCORE || "2");
  const awayScore = parseInt(process.env.AWAY_SCORE || "1");

  if (!matchId) {
    throw new Error("MATCH_ID environment variable is required");
  }

  const contractConfigPath = path.join(__dirname, "../../frontend/src/config/contract.js");
  const content = fs.readFileSync(contractConfigPath, "utf8");
  const addressMatch = content.match(/export const CONTRACT_ADDRESS = '(0x[a-fA-F0-9]{40})'/);
  
  if (!addressMatch) {
    throw new Error("Could not find CONTRACT_ADDRESS in frontend config");
  }
  
  const contractAddress = addressMatch[1];
  console.log(`Using MatchStake contract at: ${contractAddress}`);
  
  const MatchStake = await ethers.getContractAt("MatchStake", contractAddress);
  console.log(`Resolving match ID ${matchId} with score ${homeScore}-${awayScore}...`);
  
  const tx = await MatchStake.resolveMatch(BigInt(matchId), homeScore, awayScore);
  console.log(`TX_HASH:${tx.hash}`);
  await tx.wait();
  
  console.log(`SUCCESS:Resolved match ID ${matchId}`);
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
