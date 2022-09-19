import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";
import {deployNTTFixture, IPassportNTTFixture} from "../shared/fixture";
import {UtilsTest} from "../shared/Utils";

export async function passportIsValid(): Promise<void> {
  context("#isValid", async () => {
    let fixture: IPassportNTTFixture;
    beforeEach(async function () {
      // We use loadFixture to run this setup once, snapshot that state,
      // and reset Hardhat Network to that snapshopt in every test.
      fixture = await loadFixture(deployNTTFixture);
    });

    it("Should return isValid = TRUE if credential not revoked", async function () {
      const tokenId = await fixture.credentialID;
      expect(await fixture.passportNTT.isValid(tokenId)).to.be.true;
    });
    it("Should return isValid = FALSE if credential revoked", async function () {
      const tokenId = await fixture.revokedCredentialID;
      expect(await fixture.passportNTT.isValid(tokenId)).to.be.false;
    });

    it("Should revert if inexistent credentialID", async function () {
      const credentialID = UtilsTest.getRandomAmount();
      await expect(fixture.passportNTT.isValid(credentialID)).to.revertedWith(
        "ERC4671: invalid token ID"
      );
    });
  });
}
