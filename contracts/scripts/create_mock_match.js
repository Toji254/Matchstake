const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const homeTeam = process.env.MATCH_HOME || "Argentina";
  const awayTeam = process.env.MATCH_AWAY || "France";
  const kickoff = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

  const contractConfigPath = path.join(__dirname, "../../frontend/src/config/contract.js");
  const content = fs.readFileSync(contractConfigPath, "utf8");
  const addressMatch = content.match(/export const CONTRACT_ADDRESS = '(0x[a-fA-F0-9]{40})'/);
  
  if (!addressMatch) {
    throw new Error("Could not find CONTRACT_ADDRESS in frontend config");
  }
  
  const contractAddress = addressMatch[1];
  console.log(`Using MatchStake contract at: ${contractAddress}`);
  
  const MatchStake = await ethers.getContractAt("MatchStake", contractAddress);
  console.log(`Creating mock match: ${homeTeam} vs ${awayTeam}...`);
  
  const tx = await MatchStake.createMatch(homeTeam, awayTeam, kickoff);
  console.log(`TX_HASH:${tx.hash}`);
  const receipt = await tx.wait();
  
  let matchId = 0;
  for (const log of receipt.logs) {
    try {
      const parsedLog = MatchStake.interface.parseLog(log);
      if (parsedLog && parsedLog.name === "MatchCreated") {
        matchId = Number(parsedLog.args.matchId);
        break;
      }
    } catch (e) {
      // ignore
    }
  }

  console.log(`SUCCESS:Created match with ID: ${matchId}`);
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
