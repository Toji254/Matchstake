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
  console.log(`Simulating createRoom on MatchStake contract at: ${contractAddress}`);
  
  const MatchStake = await ethers.getContractAt("MatchStake", contractAddress);
  const [signer] = await ethers.getSigners();
  console.log(`Using signer address: ${signer.address}`);
  
  try {
    const matchId = 1n;
    const minStake = ethers.parseEther("0.01");
    const maxStake = ethers.parseEther("1");
    const maxMembers = 10n;
    
    console.log(`Parameters:\n  matchId: ${matchId}\n  minStake: ${minStake.toString()} wei\n  maxStake: ${maxStake.toString()} wei\n  maxMembers: ${maxMembers}`);
    
    // Check if match exists
    const match = await MatchStake.getMatch(matchId);
    console.log(`Match info:\n  homeTeam: "${match.homeTeam}"\n  awayTeam: "${match.awayTeam}"\n  kickoffTime: ${match.kickoffTime}\n  resolved: ${match.resolved}`);
    
    console.log("Simulating transaction...");
    const tx = await MatchStake.createRoom.staticCall(matchId, minStake, maxStake, maxMembers, {
      from: signer.address
    });
    console.log("Simulation SUCCESS! Returned:", tx);
  } catch (e) {
    console.error("Simulation FAILED!");
    console.error("Error Code:", e.code);
    console.error("Error Message:", e.message);
    if (e.data) {
      console.error("Error Data:", e.data);
    }
  }
}

main().catch((e) => {
  console.error("SCRIPT ERROR:", e.message);
  process.exit(1);
});
