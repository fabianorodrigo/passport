import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";
import {deployNTTFixture, IPassportNTTFixture} from "../shared/fixture";
import {ICredential} from "../shared/ICredential";
import {UtilsTest} from "../shared/Utils";

export async function passportGetCredential(): Promise<void> {
  context("#getCredential", async () => {
    let fixture: IPassportNTTFixture;
    beforeEach(async function () {
      // We use loadFixture to run this setup once, snapshot that state,
      // and reset Hardhat Network to that snapshopt in every test.
      fixture = await loadFixture(deployNTTFixture);
    });

    it("Should return NTT Credential", async function () {
      const tokenId = fixture.credentialID;
      const credential: ICredential = await fixture.passportNTT.getCredential(
        tokenId
      );
      expect(credential.tokenId).to.be.equal(tokenId);
      expect(credential.holder).to.be.equal(
        await fixture.accountE.getAddress()
      );
      expect(credential.issuer).to.be.equal(
        await fixture.teamMemberA.getAddress()
      );
      expect(credential.revoked).to.be.false;
    });
    it("Should return revoked NTT Credential", async function () {
      const tokenId = fixture.revokedCredentialID;
      const credential: ICredential = await fixture.passportNTT.getCredential(
        tokenId
      );
      expect(credential.tokenId).to.be.equal(tokenId);
      expect(credential.holder).to.be.equal(
        await fixture.accountE.getAddress()
      );
      expect(credential.issuer).to.be.equal(
        await fixture.teamMemberA.getAddress()
      );
      expect(credential.revoked).to.be.true;
    });

    it("Should revert if get inexistent Credential", async function () {
      const credentialID = UtilsTest.getRandomAmount();
      await expect(
        fixture.passportNTT.getCredential(credentialID)
      ).to.revertedWith("ERC4671: invalid token ID");
    });
  });
}
