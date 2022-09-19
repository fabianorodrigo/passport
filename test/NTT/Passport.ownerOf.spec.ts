import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";
import {deployNTTFixture, IPassportNTTFixture} from "../shared/fixture";
import {UtilsTest} from "../shared/Utils";

export async function passportOwnerOf(): Promise<void> {
  context("#ownerOf", async () => {
    let fixture: IPassportNTTFixture;
    beforeEach(async function () {
      // We use loadFixture to run this setup once, snapshot that state,
      // and reset Hardhat Network to that snapshopt in every test.
      fixture = await loadFixture(deployNTTFixture);
    });

    it("Should return ownerOf NTT", async function () {
      const tokenId = await fixture.credentialID;
      expect(await fixture.passportNTT.ownerOf(tokenId)).to.be.equal(
        await fixture.accountE.getAddress()
      );
    });
    it("Should revert if get ownerOf inexistent credentialID", async function () {
      const credentialID = UtilsTest.getRandomAmount();
      await expect(fixture.passportNTT.ownerOf(credentialID)).to.revertedWith(
        "ERC4671: invalid token ID"
      );
    });
  });
}
