const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const contractConfigPath = path.join(__dirname, "../../frontend/src/config/contract.js");
  const content = fs.readFileSync(contractConfigPath, "utf8");
  const addressMatch = content.match(/export const CONTRACT_ADDRESS = '(0x[a-fA-F0-9]{40})'/);
  
  if (!addressMatch) {
    throw new Error("Could not find CONTRACT_ADDRESS in frontend config");
  }
  
  const contractAddress = addressMatch[1];
  console.log(`Using MatchStake contract at: ${contractAddress}`);
  
  const MatchStake = await ethers.getContractAt("MatchStake", contractAddress);
  
  try {
    const matchIds = await MatchStake.getAllMatchIds();
    console.log(`Found match IDs: ${matchIds.join(", ")}`);
    
    for (const id of matchIds) {
      const match = await MatchStake.getMatch(id);
      console.log(`Match #${id}: ${match.homeTeam} vs ${match.awayTeam} (Resolved: ${match.resolved}, Result: ${match.result})`);
    }
  } catch (e) {
    console.error("Error reading matches:", e.message);
  }
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
