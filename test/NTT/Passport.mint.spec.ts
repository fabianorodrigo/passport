import {loadFixture, time} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {BigNumber} from "ethers";
import {ethers} from "hardhat";
import {deployNTTFixture, IPassportNTTFixture} from "../shared/fixture";
import {ICredential} from "../shared/ICredential";
import {UtilsTest} from "../shared/Utils";

export async function passportMint(): Promise<void> {
  context("#mint", async () => {
    let fixture: IPassportNTTFixture;
    beforeEach(async function () {
      // We use loadFixture to run this setup once, snapshot that state,
      // and reset Hardhat Network to that snapshopt in every test.
      fixture = await loadFixture(deployNTTFixture);
    });

    it("Should mint a credential ID that was not minted yet", async function () {
      const holderAddress = await fixture.accountA.getAddress();
      const credentialID = UtilsTest.getRandomAmount();

      await expect(
        fixture.passportNTT
          .connect(fixture.teamMemberA)
          .mint(holderAddress, credentialID)
      )
        .to.emit(fixture.passportNTT, "Minted")
        .withArgs(holderAddress, credentialID);
      expect(await fixture.passportNTT.ownerOf(credentialID)).to.be.equal(
        holderAddress
      );
      expect(await fixture.passportNTT.balanceOf(holderAddress)).to.be.equal(
        ethers.constants.One
      );
      const credential: ICredential = await fixture.passportNTT.getCredential(
        credentialID
      );
      expect(credential.tokenId).to.be.equal(credentialID);
      expect(credential.holder).to.be.equal(holderAddress);
      expect(credential.issuer).to.be.equal(
        await fixture.teamMemberA.getAddress()
      );
      expect(credential.issueDate).to.be.equal(
        BigNumber.from(await time.latest())
      );
      expect(credential.revoked).to.be.equal(false);
    });
    it("Should revert if mint to a zero address holder", async function () {
      const credentialID = UtilsTest.getRandomAmount();
      await expect(
        fixture.passportNTT
          .connect(fixture.teamMemberA)
          .mint(ethers.constants.AddressZero, credentialID)
      ).to.revertedWith("ERC4671: mint to the zero address");
    });
    it("Should revert if mint a credential ID already minted to the same address", async function () {
      const holderAddress = await fixture.accountE.getAddress();
      const credentialID = fixture.credentialID;
      await expect(
        fixture.passportNTT
          .connect(fixture.teamMemberA)
          .mint(holderAddress, credentialID)
      ).to.revertedWith("Cannot mint an assigned token");
    });
    it("Should revert if mint a credential ID already minted to another address", async function () {
      const holderAddress = await fixture.accountA.getAddress();
      const credentialID = fixture.credentialID;
      await expect(
        fixture.passportNTT
          .connect(fixture.teamMemberA)
          .mint(holderAddress, credentialID)
      ).to.revertedWith("Cannot mint an assigned token");
    });

    it("Should revert if an non TEAM_ROLE account mint a credential ID", async function () {
      const holderAddress = await fixture.accountA.getAddress();
      const credentialID = UtilsTest.getRandomAmount();

      await expect(
        fixture.passportNTT
          .connect(fixture.accountB)
          .mint(holderAddress, credentialID)
      ).to.revertedWith(
        `AccessControl: account ${(
          await fixture.accountB.getAddress()
        ).toLowerCase()} is missing role ${fixture.TEAM_ROLE}`
      );
    });
  });
}
