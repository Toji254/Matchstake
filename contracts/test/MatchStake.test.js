const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MatchStake", function () {
  let matchStake;
  let owner, alice, bob, charlie;

  beforeEach(async function () {
    [owner, alice, bob, charlie] = await ethers.getSigners();
    const MatchStake = await ethers.getContractFactory("MatchStake");
    matchStake = await MatchStake.deploy();
    await matchStake.waitForDeployment();
  });

  describe("Match Management", function () {
    it("should create a match", async function () {
      await matchStake.createMatch("Argentina", "France", 1749600000);
      const match = await matchStake.getMatch(1);
      expect(match.homeTeam).to.equal("Argentina");
      expect(match.resolved).to.equal(false);
    });

    it("should only allow owner to create matches", async function () {
      await expect(matchStake.connect(alice).createMatch("A", "B", 1749600000)).to.be.revertedWith("Not owner");
    });

    it("should resolve a match", async function () {
      await matchStake.createMatch("Argentina", "France", 1749600000);
      await matchStake.resolveMatch(1, 3, 2);
      const match = await matchStake.getMatch(1);
      expect(match.resolved).to.equal(true);
      expect(match.result).to.equal(1);
    });
  });

  describe("Room & Predictions", function () {
    beforeEach(async function () {
      await matchStake.createMatch("Brazil", "Germany", 1749600000);
      const min = ethers.parseEther("0.01");
      const max = ethers.parseEther("1");
      await matchStake.createRoom(1, min, max, 10);
      await matchStake.connect(alice).joinRoom(1);
      await matchStake.connect(bob).joinRoom(1);
    });

    it("should create room and auto-join creator", async function () {
      const room = await matchStake.getRoom(1);
      expect(room.creator).to.equal(owner.address);
      expect(room.memberCount).to.equal(1n);
    });

    it("should accept prediction with stake", async function () {
      const stake = ethers.parseEther("0.1");
      await matchStake.connect(alice).makePrediction(1, 1, 2, 1, { value: stake });
      const pred = await matchStake.getPrediction(1, alice.address);
      expect(pred.stakeAmount).to.equal(stake);
    });
  });

  describe("Payouts", function () {
    it("should distribute to winners", async function () {
      await matchStake.createMatch("Brazil", "Germany", 1749600000);
      const min = ethers.parseEther("0.01");
      const max = ethers.parseEther("1");
      await matchStake.createRoom(1, min, max, 10);
      await matchStake.connect(alice).joinRoom(1);
      await matchStake.connect(bob).joinRoom(1);

      const stake = ethers.parseEther("0.1");
      await matchStake.connect(alice).makePrediction(1, 1, 3, 1, { value: stake });
      await matchStake.connect(bob).makePrediction(1, 2, 0, 2, { value: stake });

      await matchStake.resolveMatch(1, 3, 1);
      await matchStake.resolveRoom(1);

      const before = await ethers.provider.getBalance(alice.address);
      await matchStake.connect(alice).claimWinnings(1);
      const after = await ethers.provider.getBalance(alice.address);
      expect(after).to.be.gt(before);
    });
  });
});
