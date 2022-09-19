import {loadFixture, time} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {BigNumber} from "ethers";
import {ethers} from "hardhat";
import {deployNTTFixture, IPassportNTTFixture} from "../shared/fixture";
import {ICredential} from "../shared/ICredential";
import {UtilsTest} from "../shared/Utils";

export async function passportRevoke(): Promise<void> {
  context("#revoke", async () => {
    let fixture: IPassportNTTFixture;
    beforeEach(async function () {
      // We use loadFixture to run this setup once, snapshot that state,
      // and reset Hardhat Network to that snapshopt in every test.
      fixture = await loadFixture(deployNTTFixture);
    });

    it("Should revoke an existing not revoked credential ID", async function () {
      const holderAddress = await fixture.accountE.getAddress();
      const tokenId = fixture.credentialID;

      await expect(
        fixture.passportNTT.connect(fixture.teamMemberA).revoke(tokenId)
      )
        .to.emit(fixture.passportNTT, "Revoked")
        .withArgs(holderAddress, tokenId);
      const credential: ICredential = await fixture.passportNTT.getCredential(
        tokenId
      );
      expect(credential.tokenId).to.be.equal(tokenId);
      expect(credential.holder).to.be.equal(holderAddress);
      expect(credential.issuer).to.be.equal(
        await fixture.teamMemberA.getAddress()
      );
      expect(credential.revoked).to.be.true;
    });
    it("Should revert if revoke an inexistent Credential", async function () {
      const credentialID = UtilsTest.getRandomAmount();
      await expect(
        fixture.passportNTT.connect(fixture.teamMemberA).revoke(credentialID)
      ).to.revertedWith("ERC4671: invalid token ID");
    });

    it("Should revert if revoke a credential ID already revoked", async function () {
      const holderAddress = await fixture.accountE.getAddress();
      const credentialID = fixture.revokedCredentialID;
      await expect(
        fixture.passportNTT.connect(fixture.teamMemberA).revoke(credentialID)
      ).to.revertedWith("Credential is already revoked");
    });
    it("Should revert if an non TEAM_ROLE account revoke a credential ID", async function () {
      const holderAddress = await fixture.accountA.getAddress();
      const credentialID = fixture.credentialID;

      await expect(
        fixture.passportNTT.connect(fixture.accountB).revoke(credentialID)
      ).to.revertedWith(
        `AccessControl: account ${(
          await fixture.accountB.getAddress()
        ).toLowerCase()} is missing role ${fixture.TEAM_ROLE}`
      );
    });
  });
}
