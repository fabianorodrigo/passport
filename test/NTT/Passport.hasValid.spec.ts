import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";
import {deployNTTFixture, IPassportNTTFixture} from "../shared/fixture";
import {UtilsTest} from "../shared/Utils";

export async function passportHasValid(): Promise<void> {
  context("#hasValid", async () => {
    let fixture: IPassportNTTFixture;
    beforeEach(async function () {
      // We use loadFixture to run this setup once, snapshot that state,
      // and reset Hardhat Network to that snapshopt in every test.
      fixture = await loadFixture(deployNTTFixture);
    });

    it("Should return hasValid = TRUE if holder has only one and valid credential", async function () {
      const holderAddress = await fixture.accountA.getAddress();
      const credentialID = UtilsTest.getRandomAmount();
      await fixture.passportNTT
        .connect(fixture.teamMemberA)
        .mint(holderAddress, credentialID);
      expect(await fixture.passportNTT.hasValid(holderAddress)).to.be.true;
    });

    it("Should return hasValid = TRUE if holder has revoked, expired and valid credentials", async function () {
      const holderAddress = await fixture.accountE.getAddress();
      expect(await fixture.passportNTT.hasValid(holderAddress)).to.be.true;
    });
    it("Should return hasValid = FALSE if holder has only revoked and expired credentials", async function () {
      const holderAddress = await fixture.accountE.getAddress();
      const tokenId = await fixture.credentialID;
      await fixture.passportNTT.connect(fixture.teamMemberA).revoke(tokenId);
      expect(await fixture.passportNTT.hasValid(holderAddress)).to.be.false;
    });
    it("Should return hasValid = FALSE if holder has no credentials", async function () {
      const tokenId = await fixture.revokedCredentialID;
      expect(await fixture.passportNTT.isValid(tokenId)).to.be.false;
    });
  });
}
